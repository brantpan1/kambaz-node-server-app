import * as dao from './dao.js'

export default function AssignmentRoutes(app) {
  const findAssignmentsForCourse = (req, res) => {
    const { courseId } = req.params
    const assignments = dao.findAssignmentsForCourse(courseId)
    res.json(assignments)
  }

  const createAssignment = (req, res) => {
    const { courseId } = req.params
    const assignment = {
      ...req.body,
      course: courseId,
    }
    const newAssignment = dao.createAssignment(assignment)
    res.json(newAssignment)
  }

  const findAssignmentById = (req, res) => {
    const { assignmentId } = req.params
    const assignment = dao.findAssignmentById(assignmentId)
    if (assignment) {
      res.json(assignment)
    } else {
      res.status(404).json({ error: 'Assignment not found' })
    }
  }

  const updateAssignment = (req, res) => {
    const { assignmentId } = req.params
    const assignmentUpdates = req.body
    const updatedAssignment = dao.updateAssignment(
      assignmentId,
      assignmentUpdates,
    )
    if (updatedAssignment) {
      res.json(updatedAssignment)
    } else {
      res.status(404).json({ error: 'Assignment not found' })
    }
  }

  const deleteAssignment = (req, res) => {
    const { assignmentId } = req.params
    const status = dao.deleteAssignment(assignmentId)
    res.json(status)
  }

  app.get('/api/courses/:courseId/assignments', findAssignmentsForCourse)
  app.post('/api/courses/:courseId/assignments', createAssignment)
  app.get('/api/assignments/:assignmentId', findAssignmentById)
  app.put('/api/assignments/:assignmentId', updateAssignment)
  app.delete('/api/assignments/:assignmentId', deleteAssignment)
}
