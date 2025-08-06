import db from '../Database/index.js'
import { v4 as uuidv4 } from 'uuid'

export function findAllCourses() {
  return db.courses
}

export function findCoursesForEnrolledUser(userId) {
  const { courses, enrollment } = db
  const enrolledCourses = courses.filter((course) =>
    enrollment.some(
      (enrollment) =>
        enrollment.user === userId && enrollment.course === course._id,
    ),
  )
  return enrolledCourses
}

export function createCourse(course) {
  const newCourse = { ...course, _id: course._id || uuidv4() }
  db.courses = [...db.courses, newCourse]
  return newCourse
}

export function deleteCourse(courseId) {
  const { courses, enrollment } = db
  db.courses = courses.filter((course) => course._id !== courseId)
  db.enrollment = enrollment.filter(
    (enrollment) => enrollment.course !== courseId,
  )
  return { status: 'ok' }
}

export function updateCourse(courseId, courseUpdates) {
  const course = db.courses.find((course) => course._id === courseId)
  if (course) {
    Object.assign(course, courseUpdates)
  }
  return course
}

export function isUserEnrolledInCourse(userId, courseId) {
  const { enrollment } = db
  return enrollment.some(
    (enrollment) =>
      enrollment.user === userId && enrollment.course === courseId,
  )
}
