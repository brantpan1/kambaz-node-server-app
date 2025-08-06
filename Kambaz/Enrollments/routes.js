import * as dao from './dao.js'

export default function EnrollmentRoutes(app) {
  const findEnrollmentsForCourse = (req, res) => {
    const { courseId } = req.params
    const enrollments = dao.findEnrollmentsForCourse(courseId)
    res.json(enrollments)
  }

  const findCurrentUserEnrollments = (req, res) => {
    const currentUser = req.session['currentUser']
    if (!currentUser) {
      res.sendStatus(401)
      return
    }
    const enrollments = dao.findEnrollmentsForUser(currentUser._id)
    res.json(enrollments)
  }

  const findAllEnrollments = (req, res) => {
    const currentUser = req.session['currentUser']
    if (!currentUser || currentUser.role !== 'ADMIN') {
      res.sendStatus(403)
      return
    }
    const enrollments = dao.findAllEnrollments()
    res.json(enrollments)
  }

  app.get('/api/courses/:courseId/enrollments', findEnrollmentsForCourse)
  app.get('/api/enrollments/current', findCurrentUserEnrollments)
  app.get('/api/enrollments', findAllEnrollments)
}
