const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  port: parseInt(process.env.PORT || '3456', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  database: {
    url: process.env.DATABASE_URL || 'postgres://morningstar:morningstar@localhost:5432/morningstar',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  },

  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    openaiKey: process.env.OPENAI_API_KEY || '',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    groqKey: process.env.GROQ_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    openrouterKey: process.env.OPENROUTER_API_KEY || '',
    bazaarlinkKey: process.env.BAZAARLINK_API_KEY || '',
    bazaarlinkBaseUrl: process.env.BAZAARLINK_BASE_URL || 'https://bazaarlink.ai/api/v1',
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'gpt-4o',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  simulation: {
    host: process.env.SIMULATION_HOST || 'localhost',
    port: parseInt(process.env.SIMULATION_PORT || '8000', 10),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  },

  sessionSecret: process.env.SESSION_SECRET || 'morningstar-session-secret',
  corsOrigin: process.env.CORS_ORIGIN || true,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),

  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
  },

  macro: {
    fredApiKey: process.env.FRED_API_KEY || '',
    eiaApiKey: process.env.EIA_API_KEY || '',
    vesselfinderApiKey: process.env.VESSELFINDER_API_KEY || '',
  },
};
