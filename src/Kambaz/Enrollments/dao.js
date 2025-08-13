import { EnrollmentModel } from './model.js'
import { CourseModel } from '../Courses/model.js'

export async function enrollUserInCourse(userId, courseId) {
  if (!userId || !courseId) return { success: false, message: 'Missing ids' }
  await EnrollmentModel.updateOne(
    { user: userId, course: courseId },
    { $setOnInsert: { user: userId, course: courseId } },
    { upsert: true },
  )
  return { success: true }
}

export async function unenrollUserFromCourse(userId, courseId) {
  if (!userId || !courseId) return { success: false, message: 'Missing ids' }
  const res = await EnrollmentModel.deleteOne({
    user: userId,
    course: courseId,
  })
  return { success: res.deletedCount > 0 }
}

export async function findEnrollmentsForCourse(courseId) {
  if (!courseId) return []
  return EnrollmentModel.find({ course: courseId }).lean()
}

export async function findEnrollmentsForUser(userId) {
  if (!userId) return []
  return EnrollmentModel.find({ user: userId }).lean()
}

export async function findEnrolledCoursesForUser(userId) {
  if (!userId) return []
  const courseIds = await EnrollmentModel.find({ user: userId }).distinct(
    'course',
  )
  if (!courseIds.length) return []
  return CourseModel.find({ _id: { $in: courseIds } }).lean()
}

export async function isUserEnrolled(userId, courseId) {
  if (!userId || !courseId) return false
  const exists = await EnrollmentModel.exists({
    user: userId,
    course: courseId,
  })
  return !!exists
}
