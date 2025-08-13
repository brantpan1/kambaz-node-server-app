import * as courseDao from './dao.js'
import * as usersDao from '../Users/dao.js'
import * as enrollmentsDao from '../Enrollments/dao.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/auth.js'

export default function CourseRoutes(app) {
  // list all courses
  app.get('/api/courses', asyncHandler(async (_req, res) => {
    const courses = await courseDao.findAllCourses()
    res.json(courses)
  }))

  // courses for user 
  app.get('/api/courses/enrolled', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.session.currentUser._id
    const courses = await enrollmentsDao.findEnrolledCoursesForUser(userId)
    res.json(courses)
  }))

  // single course (param route)
  app.get('/api/courses/:courseId', asyncHandler(async (req, res) => {
    const course = await courseDao.findCourseById(req.params.courseId)
    if (!course) return res.sendStatus(404)
    res.json(course)
  }))

  // update course
  app.put('/api/courses/:courseId', asyncHandler(async (req, res) => {
    const updated = await courseDao.updateCourse(req.params.courseId, req.body)
    if (!updated) return res.sendStatus(404)
    res.json(updated)
  }))

  // delete course
  app.delete('/api/courses/:courseId', asyncHandler(async (req, res) => {
    const result = await courseDao.deleteCourse(req.params.courseId)
    res.json(result)
  }))

  // enroll / unenroll current user
  app.post('/api/courses/:courseId/enroll', requireAuth, asyncHandler(async (req, res) => {
    const status = await enrollmentsDao.enrollUserInCourse(req.session.currentUser._id, req.params.courseId)
    res.json(status)
  }))
  app.delete('/api/courses/:courseId/enroll', requireAuth, asyncHandler(async (req, res) => {
    const status = await enrollmentsDao.unenrollUserFromCourse(req.session.currentUser._id, req.params.courseId)
    res.json(status)
  }))

  // roster for a course
  app.get('/api/courses/:courseId/users', asyncHandler(async (req, res) => {
    const enrollments = await enrollmentsDao.findEnrollmentsForCourse(req.params.courseId)
    const userIds = enrollments.map((e) => e.user)
    const users = usersDao.findUsersByIds
      ? await usersDao.findUsersByIds(userIds)
      : (await usersDao.findAllUsers()).filter(u => userIds.includes(u._id))
    res.json(users)
  }))
}

