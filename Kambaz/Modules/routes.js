import * as dao from './dao.js'

export default function ModuleRoutes(app) {
  const findModulesForCourse = (req, res) => {
    const { courseId } = req.params
    const modules = dao.findModulesForCourse(courseId)
    res.json(modules)
  }

  const createModule = (req, res) => {
    const { courseId } = req.params
    const module = {
      ...req.body,
      course: courseId,
    }
    const newModule = dao.createModule(module)
    res.json(newModule)
  }

  const updateModule = (req, res) => {
    const { moduleId } = req.params
    const moduleUpdates = req.body
    const { editing, ...updates } = moduleUpdates
    const updatedModule = dao.updateModule(moduleId, updates)
    res.json(updatedModule)
  }

  const deleteModule = (req, res) => {
    const { moduleId } = req.params
    const status = dao.deleteModule(moduleId)
    res.json(status)
  }

  const findModuleById = (req, res) => {
    const { moduleId } = req.params
    const module = dao.findModuleById(moduleId)
    if (module) {
      res.json(module)
    } else {
      res.status(404).json({ error: 'Module not found' })
    }
  }

  app.get('/api/courses/:courseId/modules', findModulesForCourse)
  app.post('/api/courses/:courseId/modules', createModule)
  app.put('/api/modules/:moduleId', updateModule)
  app.delete('/api/modules/:moduleId', deleteModule)
  app.get('/api/modules/:moduleId', findModuleById)
}
