import 'dotenv/config'
import mongoose from 'mongoose'
import { env } from './env.js'
import { UserModel } from '../Kambaz/Users/model.js'
import { CourseModel } from '../Kambaz/Courses/model.js'
import { ModuleModel } from '../Kambaz/Modules/model.js'
import { AssignmentModel } from '../Kambaz/Assignments/model.js'
import { EnrollmentModel } from '../Kambaz/Enrollments/model.js'

export async function connectMongo() {
  mongoose.set('strictQuery', true)
  const uri = env.MONGODB_URI.replace(
    '${MONGODB_PASS}',
    process.env.MONGODB_PASS || '',
  )
  console.log(uri)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  })
  await Promise.all([
    UserModel.init(),
    CourseModel.init(),
    ModuleModel.init(),
    AssignmentModel.init(),
    EnrollmentModel.init(),
  ])
  console.log('Mongo connected', uri.split('@')[1])
}
