import math
import re
import json
import numpy as np
from scipy.sparse import lil_matrix, csr_matrix, vstack
from typing import List, Optional


class TfidfVectorizer:
    def __init__(self, max_features=1024, ngram_range=(1, 3)):
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.vocab = {}
        self.idf = None

    def _tokenize(self, text):
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        words = text.split()
        ngrams = set()
        for n in range(self.ngram_range[0], min(self.ngram_range[1], len(words)) + 1):
            for i in range(len(words) - n + 1):
                ngrams.add(' '.join(words[i:i + n]))
        if not ngrams:
            ngrams.add(text[:64])
        return ngrams

    def fit(self, corpus):
        doc_freq = {}
        for doc in corpus:
            terms = self._tokenize(doc)
            for t in terms:
                doc_freq[t] = doc_freq.get(t, 0) + 1
        sorted_terms = sorted(doc_freq.items(), key=lambda x: -x[1])
        self.vocab = {t: i for i, (t, _) in enumerate(sorted_terms[:self.max_features])}
        n_docs = len(corpus)
        self.idf = np.zeros(len(self.vocab))
        for t, i in self.vocab.items():
            self.idf[i] = math.log((n_docs + 1) / (doc_freq[t] + 1)) + 1
        return self

    def transform(self, corpus):
        matrix = lil_matrix((len(corpus), len(self.vocab)), dtype=np.float32)
        for di, doc in enumerate(corpus):
            terms = self._tokenize(doc)
            tf = {}
            for t in terms:
                if t in self.vocab:
                    tf[self.vocab[t]] = tf.get(self.vocab[t], 0) + 1
            max_tf = max(tf.values()) if tf else 1
            for idx, count in tf.items():
                matrix[di, idx] = (count / max_tf) * self.idf[idx]
        return csr_matrix(matrix)


class LocalVectorStore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1024)
        self.documents = []
        self.doc_vectors = None
        self.fitted = False

    def ingest(self, documents):
        self.documents = documents
        texts = [d.get('content', '') or d.get('text', '') or d.get('description', '') or d.get('name', '') for d in documents]
        if not texts:
            return {'ingested': 0}
        self.vectorizer.fit(texts)
        self.doc_vectors = self.vectorizer.transform(texts)
        self.fitted = True
        return {'ingested': len(documents)}

    def search(self, query, k=10):
        if not self.fitted or self.doc_vectors is None:
            return []
        q_vec = self.vectorizer.transform([query])
        q_norm = q_vec / max(np.linalg.norm(q_vec.toarray()), 1e-10)
        doc_norms = np.array([np.linalg.norm(r.toarray()) for r in self.doc_vectors])
        similarities = []
        for i, dv in enumerate(self.doc_vectors):
            dv_arr = dv.toarray().flatten()
            q_arr = q_norm.toarray().flatten()
            denom = max(np.linalg.norm(dv_arr) * np.linalg.norm(q_arr), 1e-10)
            sim = float(np.dot(dv_arr, q_arr) / denom) if denom > 0 else 0
            if sim > 0:
                doc = self.documents[i]
                similarities.append({
                    'id': doc.get('id', str(i)),
                    'content': doc.get('content', doc.get('text', doc.get('description', doc.get('name', '')))),
                    'metadata': {k: v for k, v in doc.items() if k not in ('content', 'text', 'description')},
                    'score': round(float(sim * 100), 1),
                })
        similarities.sort(key=lambda x: -x['score'])
        return similarities[:k]


_store = LocalVectorStore()


def ingest_documents(documents):
    return _store.ingest(documents)


def search_documents(query, k=10):
    return _store.search(query, k)


def load_from_graph(graph_data):
    docs = []
    for node in graph_data.get('nodes', []):
        attrs = node.get('attributes', {})
        content = f"{node.get('name', node.get('id', ''))} is a {node.get('type', 'unknown')} node. "
        if attrs.get('description'):
            content += attrs['description'] + ' '
        if attrs.get('risk'):
            content += f"Risk score: {attrs['risk']}/100. "
        if attrs.get('creditscore'):
            content += f"Credit score: {attrs['creditscore']}/100. "
        if attrs.get('oee'):
            content += f"OEE: {attrs['oee']}%. "
        if attrs.get('geo'):
            content += f"Location: {attrs['geo']}. "
        if attrs.get('certifications'):
            content += f"Certifications: {attrs['certifications']}. "
        docs.append({
            'id': node.get('id', node.get('name', '')),
            'name': node.get('name', node.get('id', '')),
            'type': node.get('type', 'unknown'),
            'content': content,
        })
    for edge in graph_data.get('edges', []):
        docs.append({
            'id': f"edge:{edge.get('source', '')}->{edge.get('target', '')}",
            'name': f"{edge.get('source', '')} -> {edge.get('target', '')}",
            'type': 'relationship',
            'content': f"{edge.get('source', '')} supplies {edge.get('target', '')}. Edge type: {edge.get('type', 'supply')}.",
        })
    for disruption in graph_data.get('historicalDisruptions', []):
        docs.append({
            'id': disruption.get('id', ''),
            'name': disruption.get('title', disruption.get('name', '')),
            'type': 'historical_disruption',
            'content': f"{disruption.get('title', disruption.get('name', ''))}: {disruption.get('description', '')} (duration: {disruption.get('duration', '')} days, severity: {disruption.get('severity', '')}).",
        })
    return store.ingest(store, docs)

store = _store