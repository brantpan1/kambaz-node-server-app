import db from '../Database/index.js'
import { v4 as uuidv4 } from 'uuid'

export function findAssignmentsForCourse(courseId) {
  const { assignments } = db
  return assignments.filter((assignment) => assignment.course === courseId)
}

export function createAssignment(assignment) {
  const newAssignment = {
    _id: uuidv4(),
    title: assignment.title || 'New Assignment',
    course: assignment.course,
    description: assignment.description || '',
    points: assignment.points || 100,
    dueDate: assignment.dueDate || new Date().toISOString(),
    availableDate: assignment.availableDate || new Date().toISOString(),
    availableUntil: assignment.availableUntil || assignment.dueDate,
    modules: assignment.modules || ['Multiple Modules'],
  }
  db.assignments = [...db.assignments, newAssignment]
  return newAssignment
}

export function deleteAssignment(assignmentId) {
  const { assignments } = db
  db.assignments = assignments.filter(
    (assignment) => assignment._id !== assignmentId,
  )
  return { status: 'ok' }
}

export function updateAssignment(assignmentId, assignmentUpdates) {
  const assignment = db.assignments.find((a) => a._id === assignmentId)
  if (assignment) {
    Object.assign(assignment, assignmentUpdates)
  }
  return assignment
}

export function findAssignmentById(assignmentId) {
  const { assignments } = db
  return assignments.find((assignment) => assignment._id === assignmentId)
}
