import db from '../Database/index.js'
import { v4 as uuidv4 } from 'uuid'

export function findEnrollmentsForCourse(courseId) {
  const { enrollment } = db
  return enrollment.filter((e) => e.course === courseId)
}

export function findEnrollmentsForUser(userId) {
  const { enrollment } = db
  return enrollment.filter((e) => e.user === userId)
}

export function findAllEnrollments() {
  return db.enrollment
}

export function enrollUserInCourse(userId, courseId) {
  const { enrollment } = db
  const existing = enrollment.find(
    (e) => e.user === userId && e.course === courseId,
  )
  if (!existing) {
    const newEnrollment = {
      _id: uuidv4(),
      user: userId,
      course: courseId,
    }
    enrollment.push(newEnrollment)
    return newEnrollment
  }
  return existing
}

export function unenrollUserFromCourse(userId, courseId) {
  const { enrollment } = db
  const index = enrollment.findIndex(
    (e) => e.user === userId && e.course === courseId,
  )
  if (index !== -1) {
    const removed = enrollment.splice(index, 1)
    return { status: 'unenrolled', enrollment: removed[0] }
  }
  return { status: 'not found' }
}

export function isUserEnrolledInCourse(userId, courseId) {
  const { enrollment } = db
  return enrollment.some((e) => e.user === userId && e.course === courseId)
}
