import * as dao from './dao.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/auth.js'

export default function assignmentroutes(app) {
  // all assignments in a course
  app.get(
    '/api/courses/:courseid/assignments',
    asyncHandler(async (req, res) => {
      const rows = await dao.findassignmentsforcourse(req.params.courseid)
      res.json(rows)
    }),
  )

  // one assignment
  app.get(
    '/api/assignments/:assignmentid',
    asyncHandler(async (req, res) => {
      const row = await dao.findassignmentbyid(req.params.assignmentid)
      if (!row) return res.sendstatus(404)
      res.json(row)
    }),
  )

  // create
  app.post(
    '/api/courses/:courseid/assignments',
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = { ...req.body, course: req.params.courseid }
      const created = await dao.createassignment(payload)
      res.status(201).json(created)
    }),
  )

  // update
  app.put(
    '/api/assignments/:assignmentid',
    requireAuth,
    asyncHandler(async (req, res) => {
      const updated = await dao.updateassignment(
        req.params.assignmentid,
        req.body,
      )
      if (!updated) return res.sendstatus(404)
      res.json(updated)
    }),
  )

  // delete
  app.delete(
    '/api/assignments/:assignmentid',
    requireAuth,
    asyncHandler(async (req, res) => {
      const result = await dao.deleteassignment(req.params.assignmentid)
      res.json(result)
    }),
  )
}
