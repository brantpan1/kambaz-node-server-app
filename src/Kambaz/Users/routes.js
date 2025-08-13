import * as dao from './dao.js'
import * as enrollmentsDao from '../Enrollments/dao.js'
import * as courseDao from '../Courses/dao.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/auth.js'

export default function UserRoutes(app) {
  // create a user (admin/dev use)
  app.post(
    '/api/users',
    asyncHandler(async (req, res) => {
      const created = await dao.createUser(req.body)
      res.status(201).json(created)
    }),
  )

  // list users
  app.get(
    '/api/users',
    asyncHandler(async (_req, res) => {
      const users = await dao.findAllUsers()
      res.json(users)
    }),
  )

  // get user by id
  app.get(
    '/api/users/:userId',
    asyncHandler(async (req, res) => {
      const user = await dao.findUserById(req.params.userId)
      if (!user) return res.sendStatus(404)
      res.json(user)
    }),
  )

  // update user by id
  app.put(
    '/api/users/:userId',
    asyncHandler(async (req, res) => {
      const userId = req.params.userId
      const updated = await dao.updateUser(userId, req.body)
      if (!updated) return res.sendStatus(404)
      if (req.session.currentUser?._id === userId) {
        req.session.currentUser = updated
      }
      res.json(updated)
    }),
  )

  // delete user by id
  app.delete(
    '/api/users/:userId',
    asyncHandler(async (req, res) => {
      const result = await dao.deleteUser(req.params.userId)
      res.json(result)
    }),
  )

  // signup
  app.post(
    '/api/users/signup',
    asyncHandler(async (req, res) => {
      const exists = await dao.findUserByUsername(req.body.username)
      if (exists)
        return res.status(400).json({ message: 'Username already in use' })
      const currentUser = await dao.createUser(req.body)
      req.session.currentUser = currentUser
      res.json(currentUser)
    }),
  )

  // signin
  app.post(
    '/api/users/signin',
    asyncHandler(async (req, res) => {
      const { username, password } = req.body
      const currentUser = await dao.findUserByCredentials(username, password)
      if (!currentUser)
        return res
          .status(401)
          .json({ message: 'Unable to login. Try again later.' })
      req.session.currentUser = currentUser
      res.json(currentUser)
    }),
  )

  // signout
  app.post('/api/users/signout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('sid')
      res.sendStatus(200)
    })
  })

  app.post('/api/users/profile', (req, res) => {
    const currentUser = req.session.currentUser
    if (!currentUser) return res.sendStatus(401)
    res.json(currentUser)
  })

  // sreate a course as the current user + auto-enroll
  app.post(
    '/api/users/current/courses',
    requireAuth,
    asyncHandler(async (req, res) => {
      const currentUser = req.session.currentUser
      const newCourse = await courseDao.createCourse(req.body)
      await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id)
      res.json({ ...newCourse, enrolled: true })
    }),
  )

  // courses for a user
  app.get(
    '/api/users/:userId/courses',
    asyncHandler(async (req, res) => {
      let { userId } = req.params
      if (userId === 'current') {
        const currentUser = req.session.currentUser
        if (!currentUser) return res.sendStatus(401)
        userId = currentUser._id
      }
      const courses = await courseDao.findCoursesForEnrolledUser(userId)
      res.json(courses.map((c) => ({ ...c, enrolled: true })))
    }),
  )
}
