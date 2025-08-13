import mongoose from 'mongoose'
import { ModuleModel } from './model.js'

export async function findModulesForCourse(courseId) {
  if (!courseId) return []
  return ModuleModel.find({ course: courseId }).lean()
}

export async function findModuleById(id) {
  if (!id) return null
  return ModuleModel.findById(id).lean()
}

export async function createModule(payload) {
  const _id = payload._id ?? new mongoose.Types.ObjectId().toString()
  const doc = await ModuleModel.create({ ...payload, _id })
  return doc.toObject()
}

export async function updateModule(id, patch) {
  if (!id) return null
  const { _id, lessons, ...rest } = patch || {}
  return ModuleModel.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean()
}

export async function deleteModule(id) {
  if (!id) return { deletedCount: 0 }
  return ModuleModel.deleteOne({ _id: id })
}

export async function addLesson(moduleId, lesson) {
  if (!moduleId) return null
  const lessonId = lesson._id ?? new mongoose.Types.ObjectId().toString()
  const toPush = { ...lesson, _id: lessonId }
  const doc = await ModuleModel.findByIdAndUpdate(
    moduleId,
    { $push: { lessons: toPush } },
    { new: true },
  ).lean()
  return { module: doc, lesson: toPush }
}

export async function updateLesson(moduleId, lessonId, patch) {
  if (!moduleId || !lessonId) return null
  const $set = {}
  for (const [k, v] of Object.entries(patch || {})) {
    if (k === '_id') continue
    $set[`lessons.$.${k}`] = v
  }
  const doc = await ModuleModel.findOneAndUpdate(
    { _id: moduleId, 'lessons._id': lessonId },
    { $set },
    { new: true },
  ).lean()
  return doc
}

export async function deleteLesson(moduleId, lessonId) {
  if (!moduleId || !lessonId) return { modifiedCount: 0 }
  const res = await ModuleModel.updateOne(
    { _id: moduleId },
    { $pull: { lessons: { _id: lessonId } } },
  )
  return res
}
