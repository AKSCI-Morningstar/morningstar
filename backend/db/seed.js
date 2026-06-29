// =============================================================================
// Seed Script — Load graph data from data-store.json into PostgreSQL
// =============================================================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://morningstar:morningstar@localhost:5432/morningstar'
});

async function seed() {
  const client = await pool.connect();
  try {
    const dataPath = path.join(__dirname, '..', 'data-store.json');
    if (!fs.existsSync(dataPath)) {
      console.log('No data-store.json found. Run the server once to generate it, or provide graph data manually.');
      return;
    }
    const store = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const { nodes, edges } = store.graph;

    // Clear existing
    await client.query('DELETE FROM edges');
    await client.query('DELETE FROM nodes');

    // Insert nodes
    for (const node of nodes) {
      const { id, type, ...attributes } = node;
      const name = id.replace(/_t$/, '');
      await client.query(
        'INSERT INTO nodes (id, name, type, attributes) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET attributes = EXCLUDED.attributes',
        [id, name, type || 'tier', JSON.stringify(attributes)]
      );
    }
    console.log(`  ✓ Seeded ${nodes.length} nodes`);

    // Insert edges
    for (const edge of edges) {
      const { source, target, type, ...attrs } = edge;
      try {
        await client.query(
          'INSERT INTO edges (source_id, target_id, relationship, weight, attributes) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
          [source, target, type || 'supplies', attrs.weight || 1.0, JSON.stringify(attrs)]
        );
      } catch (e) {
        // skip edges referencing missing nodes
      }
    }
    console.log(`  ✓ Seeded ${edges.length} edges`);
    console.log('  ✓ Database seeded successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
