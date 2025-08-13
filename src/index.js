import express from 'express'
import cookieParser from 'cookie-parser'

import { env } from './config/env.js'
import { corsMiddleware } from './config/cors.js'
import { sessionMiddleware } from './config/session.js'
import {
  helmetMiddleware,
  compressionMiddleware,
  rateLimiter,
} from './config/security.js'
import { requestLogger } from './config/logging.js'
import { notFound, errorHandler } from './middleware/errors.js'
import { connectMongo } from './config/mongo.js'

import UserRoutes from './Kambaz/Users/routes.js'
import CourseRoutes from './Kambaz/Courses/routes.js'
import EnrollmentRoutes from './Kambaz/Enrollments/routes.js'
import ModuleRoutes from './Kambaz/Modules/routes.js'
import AssignmentRoutes from './Kambaz/Assignments/routes.js'
import Hello from './Hello.js'

const start = async () => {
  await connectMongo()
  app.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`))
}
start().catch((e) => {
  console.error('❌ DB connect failed:', e.message)
  process.exit(1)
})

const app = express()
app.set('trust proxy', 1)

app.use(corsMiddleware)

app.use(helmetMiddleware)
app.use(requestLogger)
app.use(rateLimiter)
app.use(compressionMiddleware)

app.use(express.json())
app.use(cookieParser())
app.use(sessionMiddleware)

app.get('/healthz', (_req, res) => res.json({ ok: true }))

UserRoutes(app)
CourseRoutes(app)
EnrollmentRoutes(app)
ModuleRoutes(app)
AssignmentRoutes(app)
Hello(app)

app.use(notFound)
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})
