import mongoose from 'mongoose'
const { Schema, model } = mongoose

const AssignmentSchema = new Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    course: { type: String, ref: 'Course', required: true },
    points: Number,
    dueDate: Date,
    availableDate: Date,
    modules: [String],
  },
  { versionKey: false },
)

export const AssignmentModel = model('Assignment', AssignmentSchema, 'assignments')
