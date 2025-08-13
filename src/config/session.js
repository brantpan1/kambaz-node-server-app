import session from 'express-session'
import MongoStore from 'connect-mongo'
import { env } from './env.js'
import 'dotenv/config'

const uri = env.MONGODB_URI.replace(
  '${MONGODB_PASS}',
  process.env.MONGODB_PASS || '',
)

export const sessionMiddleware = session({
  name: 'sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: uri,
    stringify: false,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
})
