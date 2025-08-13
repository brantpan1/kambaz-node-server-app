import mongoose from 'mongoose'
const { Schema, model } = mongoose

const EnrollmentSchema = new Schema(
  {
    _id: String,
    user: { type: String, ref: 'User', required: true },
    course: { type: String, ref: 'Course', required: true },
  },
  { versionKey: false },
)

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

export const EnrollmentModel = model('Enrollment', EnrollmentSchema, 'enrollment')
