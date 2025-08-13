import mongoose from 'mongoose'
import { UserModel } from './model.js'

export async function createUser(payload) {
  const _id = payload._id ?? new mongoose.Types.ObjectId().toString()
  const doc = await UserModel.create({ ...payload, _id })
  return doc.toObject()
}

export async function findAllUsers() {
  return UserModel.find().lean()
}

export async function findUserById(id) {
  if (!id) return null
  return UserModel.findById(id).lean()
}

export async function findUserByUsername(username) {
  if (!username) return null
  return UserModel.findOne({ username }).lean()
}

export async function findUserByCredentials(username, password) {
  if (!username || !password) return null
  return UserModel.findOne({ username, password }).lean()
}

export async function updateUser(id, updates) {
  if (!id) return null
  const { _id, ...rest } = updates || {}
  const doc = await UserModel.findByIdAndUpdate(
    id,
    { $set: rest },
    { new: true },
  ).lean()
  return doc
}

export async function deleteUser(id) {
  if (!id) return { deletedCount: 0 }
  return UserModel.deleteOne({ _id: id })
}

export async function findUsersByIds(ids = []) {
  const uniq = [...new Set(ids)].filter(Boolean)
  if (!uniq.length) return []
  return UserModel.find({ _id: { $in: uniq } }).lean()
}
