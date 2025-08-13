import * as dao from './dao.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/auth.js'

export default function ModuleRoutes(app) {
  // list modules for a course
  app.get(
    '/api/courses/:courseId/modules',
    asyncHandler(async (req, res) => {
      const mods = await dao.findModulesForCourse(req.params.courseId)
      res.json(mods)
    }),
  )

  // create a module in a course
  app.post(
    '/api/courses/:courseId/modules',
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = { ...req.body, course: req.params.courseId }
      const created = await dao.createModule(payload)
      res.status(201).json(created)
    }),
  )

  // update a module
  app.put(
    '/api/modules/:moduleId',
    requireAuth,
    asyncHandler(async (req, res) => {
      const updated = await dao.updateModule(req.params.moduleId, req.body)
      if (!updated) return res.sendStatus(404)
      res.json(updated)
    }),
  )

  // delete a module
  app.delete(
    '/api/modules/:moduleId',
    requireAuth,
    asyncHandler(async (req, res) => {
      const result = await dao.deleteModule(req.params.moduleId)
      res.json(result)
    }),
  )

  // lessons
  app.post(
    '/api/modules/:moduleId/lessons',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { moduleId } = req.params
      const { lesson } = req.body
      const result = await dao.addLesson(moduleId, lesson || req.body) // support both shapes
      res.status(201).json(result)
    }),
  )

  app.put(
    '/api/modules/:moduleId/lessons/:lessonId',
    requireAuth,
    asyncHandler(async (req, res) => {
      const updated = await dao.updateLesson(
        req.params.moduleId,
        req.params.lessonId,
        req.body,
      )
      if (!updated) return res.sendStatus(404)
      res.json(updated)
    }),
  )

  app.delete(
    '/api/modules/:moduleId/lessons/:lessonId',
    requireAuth,
    asyncHandler(async (req, res) => {
      const result = await dao.deleteLesson(
        req.params.moduleId,
        req.params.lessonId,
      )
      res.json(result)
    }),
  )
}
