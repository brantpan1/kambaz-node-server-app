import session from 'express-session'
import MongoStore from 'connect-mongo'
import { env } from './env.js'
import 'dotenv/config'

const CROSS_SITE = env.isProd || process.env.CROSS_SITE_COOKIES === 'true'

const mongoUrl = env.MONGODB_URI.includes('${MONGODB_PASS}')
  ? env.MONGODB_URI.replace(
      '${MONGODB_PASS}',
      encodeURIComponent(process.env.MONGODB_PASS || ''),
    )
  : env.MONGODB_URI

export const sessionMiddleware = session({
  name: 'sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl,
    stringify: false,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    httpOnly: true,
    sameSite: CROSS_SITE ? 'none' : 'lax',
    secure: CROSS_SITE,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
})
