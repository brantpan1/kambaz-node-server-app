import mongoose from 'mongoose'
import { AssignmentModel } from './model.js'

export async function findAssignmentsForCourse(courseId) {
  if (!courseId) return []
  return AssignmentModel.find({ course: courseId }).lean()
}

export async function findAssignmentById(id) {
  if (!id) return null
  return AssignmentModel.findById(id).lean()
}

export async function createAssignment(payload) {
  const _id = payload._id ?? new mongoose.Types.ObjectId().toString()
  const doc = await AssignmentModel.create({ ...payload, _id })
  return doc.toObject()
}

export async function updateAssignment(id, patch) {
  if (!id) return null
  const { _id, ...rest } = patch || {}
  return AssignmentModel.findByIdAndUpdate(
    id,
    { $set: rest },
    { new: true },
  ).lean()
}

export async function deleteAssignment(id) {
  if (!id) return { deletedCount: 0 }
  return AssignmentModel.deleteOne({ _id: id })
}
