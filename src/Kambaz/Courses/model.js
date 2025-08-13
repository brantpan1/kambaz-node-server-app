import mongoose from 'mongoose'
const { Schema, model } = mongoose

const CourseSchema = new Schema(
  {
    _id: String,
    name: { type: String, required: true },
    title: String,
    description: String,
    image: String,
  },
  { versionKey: false }
)

export const CourseModel = model('Course', CourseSchema, 'courses')

