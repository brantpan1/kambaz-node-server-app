import * as dao from './dao.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'

function userIdFromReq(req) {
  return req.user?._id || req.session?.currentUser?._id
}

export default function QuizRoutes(app) {
  app.get(
    '/api/courses/:courseId/quizzes',
    asyncHandler(async (req, res) => {
      const rows = await dao.findQuizzesForCourse(req.params.courseId)
      res.json(rows)
    }),
  )

  app.post(
    '/api/courses/:courseId/quizzes',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const created = await dao.createQuiz({
        ...req.body,
        course: req.params.courseId,
      })
      res.status(201).json(created)
    }),
  )

  app.get(
    '/api/quizzes/:quizId',
    asyncHandler(async (req, res) => {
      const row = await dao.findQuizById(req.params.quizId)
      if (!row) return res.sendStatus(404)
      res.json(row)
    }),
  )

  app.put(
    '/api/quizzes/:quizId',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const updated = await dao.updateQuiz(req.params.quizId, req.body)
      if (!updated) return res.sendStatus(404)
      res.json(updated)
    }),
  )

  app.delete(
    '/api/quizzes/:quizId',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const result = await dao.deleteQuiz(req.params.quizId)
      res.json(result)
    }),
  )

  app.post(
    '/api/quizzes/:quizId/publish',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const updated = await dao.setPublished(
        req.params.quizId,
        !!req.body?.published,
      )
      if (!updated) return res.sendStatus(404)
      res.json(updated)
    }),
  )

  // Questions
  app.get(
    '/api/quizzes/:quizId/questions',
    asyncHandler(async (req, res) => {
      const rows = await dao.findQuestionsByQuiz(req.params.quizId)
      res.json(rows)
    }),
  )

  app.post(
    '/api/quizzes/:quizId/questions',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const created = await dao.createQuestion(req.params.quizId, req.body)
      res.status(201).json(created)
    }),
  )

  app.put(
    '/api/questions/:questionId',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const updated = await dao.updateQuestion(req.params.questionId, req.body)
      if (!updated) return res.sendStatus(404)
      res.json(updated)
    }),
  )

  app.delete(
    '/api/questions/:questionId',
    requireAuth,
    requireRole('FACULTY', 'ADMIN'),
    asyncHandler(async (req, res) => {
      const result = await dao.deleteQuestion(req.params.questionId)
      res.json(result)
    }),
  )

  // Attempts
  app.get(
    '/api/quizzes/:quizId/attempts/last',
    requireAuth,
    asyncHandler(async (req, res) => {
      const uid = userIdFromReq(req)
      if (!uid) return res.sendStatus(401)
      const row = await dao.getLastAttempt(uid, req.params.quizId)
      res.json(row || null)
    }),
  )

  app.post(
    '/api/quizzes/:quizId/attempts',
    requireAuth,
    asyncHandler(async (req, res) => {
      const uid = userIdFromReq(req)
      if (!uid) return res.sendStatus(401)
      const role = req.user?.role || req.session?.currentUser?.role
      if (role && role !== 'STUDENT')
        return res
          .status(403)
          .json({ message: 'Only students can take quizzes' })
      const out = await dao.startAttempt(uid, req.params.quizId)
      res.status(201).json(out)
    }),
  )

  app.post(
    '/api/attempts/:attemptId/submit',
    requireAuth,
    asyncHandler(async (req, res) => {
      const uid = userIdFromReq(req)
      if (!uid) return res.sendStatus(401)
      const out = await dao.submitAttempt(
        uid,
        req.params.attemptId,
        req.body?.answers || [],
      )
      res.json(out)
    }),
  )

  app.get(
    '/api/quizzes/:quizId/attempts',
    requireAuth,
    asyncHandler(async (req, res) => {
      const uid = req.user?._id || req.session?.currentUser?._id
      if (!uid) return res.sendStatus(401)
      const rows = await dao.getAttemptsForUser(uid, req.params.quizId)
      res.json(rows)
    }),
  )

  app.get(
    '/api/attempts/:attemptId',
    requireAuth,
    asyncHandler(async (req, res) => {
      const attempt = await dao.getAttemptById(req.params.attemptId)
      if (!attempt) return res.sendStatus(404)

      const uid = userIdFromReq(req)
      if (!uid) return res.sendStatus(401)

      const role = req.user?.role || req.session?.currentUser?.role
      const isStaff = role === 'FACULTY' || role === 'ADMIN'
      const isOwner = attempt.user?.toString() === uid.toString()

      if (!isStaff && !isOwner) return res.sendStatus(403)

      res.json(attempt)
    }),
  )
}
