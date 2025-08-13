import mongoose from 'mongoose'
const { Schema, model } = mongoose

const LessonSchema = new Schema(
  {
    _id: String,
    name: String,
    description: String,
    module: String,
  },
  { _id: false, versionKey: false },
)

const ModuleSchema = new Schema(
  {
    _id: String,
    name: { type: String, required: true },
    description: String,
    course: { type: String, ref: 'Course', required: true },
    lessons: [LessonSchema],
  },
  { versionKey: false },
)

export const ModuleModel = model('Module', ModuleSchema, 'modules')
