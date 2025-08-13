import mongoose from 'mongoose'
const { Schema, model } = mongoose

const UserSchema = new Schema(
  {
    _id: String,
    username: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: String,
    role: {
      type: String,
      enum: ['STUDENT', 'FACULTY', 'ADMIN'],
      default: 'STUDENT',
    },
    dob: Date,
    loginId: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
  },
  { versionKey: false },
)

export const UserModel = model('User', UserSchema, 'people')
