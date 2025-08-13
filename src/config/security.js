import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { env } from './env.js'

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.isProd ? undefined : false,
})
export const compressionMiddleware = compression()
export const rateLimiter = rateLimit({
  windowMs: 60_000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
})
