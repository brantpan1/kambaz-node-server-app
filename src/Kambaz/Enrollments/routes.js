import * as enrollmentsDao from './dao.js'
import * as coursesDao from '../Courses/dao.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/auth.js'

export default function EnrollmentRoutes(app) {
  // raw enrollments for a course
  app.get(
    '/api/courses/:courseId/enrollments',
    asyncHandler(async (req, res) => {
      const rows = await enrollmentsDao.findEnrollmentsForCourse(
        req.params.courseId,
      )
      res.json(rows)
    }),
  )

  // current user's enrollments
  app.get(
    '/api/enrollments/current',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.session.currentUser._id
      const rows = await enrollmentsDao.findEnrollmentsForUser(userId)
      res.json(rows)
    }),
  )

  // courses for current user via enrollments
  app.get(
    '/api/enrollments/current/courses',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.session.currentUser._id
      const rows = await enrollmentsDao.findEnrollmentsForUser(userId)
      const ids = rows.map((r) => r.course)
      const courses = ids.length
        ? await coursesDao
            .findAllCourses()
            .then((all) => all.filter((c) => ids.includes(c._id)))
        : []
      res.json(courses)
    }),
  )
}
