import cors from 'cors'
import { env } from './env.js'
const allowlist = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'https://localhost:5173']
export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin || allowlist.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: ${origin} not allowed`))
  },
  credentials: true,
})
