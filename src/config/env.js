import 'dotenv/config'

const pick = (v, fallback) => (v === undefined || v === '' ? fallback : v)

export const env = {
  NODE_ENV: pick(process.env.NODE_ENV, 'development'),
  PORT: Number(pick(process.env.PORT, 4000)),

  CLIENT_ORIGIN: pick(
    process.env.CLIENT_ORIGIN,
    process.env.NETLIFY_URL || 'http://localhost:5173',
  ),

  NODE_SERVER_DOMAIN: pick(
    process.env.NODE_SERVER_DOMAIN,
    `http://localhost:${pick(process.env.PORT, 4000)}`,
  ),

  SESSION_SECRET: pick(process.env.SESSION_SECRET, 'dev-secret'),
  MONGODB_URI: pick(
    process.env.MONGODB_URI,
    'mongodb://127.0.0.1:27017/kambaz',
  ),

  get isProd() {
    return this.NODE_ENV === 'production'
  },
}
