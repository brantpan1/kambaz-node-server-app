import db from '../Database/index.js'
import { v4 as uuidv4 } from 'uuid'

export function findModulesForCourse(courseId) {
  const { modules } = db
  return modules.filter((module) => module.course === courseId)
}

export function createModule(module) {
  const newModule = {
    ...module,
    _id: uuidv4(),
    lessons: module.lessons || [],
  }
  db.modules = [...db.modules, newModule]
  return newModule
}

export function deleteModule(moduleId) {
  const { modules } = db
  db.modules = modules.filter((module) => module._id !== moduleId)
  return { status: 'ok' }
}

export function updateModule(moduleId, moduleUpdates) {
  const module = db.modules.find((module) => module._id === moduleId)
  if (module) {
    Object.assign(module, moduleUpdates)
  }
  return module
}

export function findModuleById(moduleId) {
  const { modules } = db
  return modules.find((module) => module._id === moduleId)
}
