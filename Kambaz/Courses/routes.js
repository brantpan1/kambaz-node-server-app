import * as dao from './dao.js'
import * as usersDao from '../Users/dao.js'
import * as enrollmentsDao from '../Enrollments/dao.js'

export default function CourseRoutes(app) {
  const findAllCourses = (req, res) => {
    const currentUser = req.session['currentUser']
    const courses = dao.findAllCourses()
    const coursesWithEnrollment = courses.map((course) => ({
      ...course,
      enrolled: currentUser
        ? dao.isUserEnrolledInCourse(currentUser._id, course._id)
        : false,
    }))
    res.json(coursesWithEnrollment)
  }

  const findEnrolledCourses = (req, res) => {
    const currentUser = req.session['currentUser']
    if (!currentUser) {
      res.sendStatus(401)
      return
    }
    const enrolledCourses = dao.findCoursesForEnrolledUser(currentUser._id)
    const coursesWithEnrollment = enrolledCourses.map((course) => ({
      ...course,
      enrolled: true,
    }))
    res.json(coursesWithEnrollment)
  }

  const deleteCourse = (req, res) => {
    const { courseId } = req.params
    const status = dao.deleteCourse(courseId)
    res.send(status)
  }

  const updateCourse = (req, res) => {
    const { courseId } = req.params
    const courseUpdates = req.body
    const status = dao.updateCourse(courseId, courseUpdates)
    res.send(status)
  }

  const enrollInCourse = (req, res) => {
    const currentUser = req.session['currentUser']
    if (!currentUser) {
      res.sendStatus(401)
      return
    }
    const { courseId } = req.params
    const status = enrollmentsDao.enrollUserInCourse(currentUser._id, courseId)
    res.json(status)
  }

  const unenrollFromCourse = (req, res) => {
    const currentUser = req.session['currentUser']
    if (!currentUser) {
      res.sendStatus(401)
      return
    }
    const { courseId } = req.params
    const status = enrollmentsDao.unenrollUserFromCourse(
      currentUser._id,
      courseId,
    )
    res.json(status)
  }

  const findEnrolledUsers = (req, res) => {
    const { courseId } = req.params
    const allUsers = usersDao.findAllUsers()
    const courseEnrollments = enrollmentsDao.findEnrollmentsForCourse(courseId)
    const enrolledUsers = allUsers.filter((p) =>
      courseEnrollments.some((e) => p._id === e.user),
    )
    res.json(enrolledUsers)
  }

  app.get('/api/courses', findAllCourses)
  app.get('/api/courses/:courseId/users', findEnrolledUsers)
  app.get('/api/courses/enrolled', findEnrolledCourses)
  app.delete('/api/courses/:courseId', deleteCourse)
  app.put('/api/courses/:courseId', updateCourse)
  app.post('/api/courses/:courseId/enroll', enrollInCourse)
  app.delete('/api/courses/:courseId/enroll', unenrollFromCourse)
}
