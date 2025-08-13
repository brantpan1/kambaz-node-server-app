import mongoose from 'mongoose'
import { UserModel } from '../Users/model.js'
import { CourseModel } from './model.js'
import { EnrollmentModel } from '../Enrollments/model.js'

export async function findAllCourses() {
  return CourseModel.find().lean()
}

export async function findCourseById(id) {
  if (!id) return null
  return CourseModel.findById(id).lean()
}

export async function createCourse(payload) {
  const _id = payload._id ?? new mongoose.Types.ObjectId().toString()
  const doc = await CourseModel.create({ ...payload, _id })
  return doc.toObject()
}

export async function updateCourse(id, updates) {
  if (!id) return null
  const { _id, ...rest } = updates || {}
  return CourseModel.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean()
}

export async function deleteCourse(id) {
  if (!id) return { deletedCount: 0 }
  const res = await CourseModel.deleteOne({ _id: id })
  if (res.deletedCount) {
    await EnrollmentModel.deleteMany({ course: id })
  }
  return res
}

export async function findCoursesForEnrolledUser(userId) {
  if (!userId) return []

  const user = await UserModel.findById(userId).select('role').lean()
  if (user?.role === 'ADMIN') {
    return CourseModel.find().lean()
  }

  const enrollments = await EnrollmentModel.find({ user: userId })
    .select('course')
    .lean()
  const ids = enrollments.map((e) => e.course)
  if (ids.length === 0) return []
  return CourseModel.find({ _id: { $in: ids } }).lean()
}
