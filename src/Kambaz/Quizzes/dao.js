import { QuizModel, QuestionModel, AttemptModel } from './model.js'

export async function findQuizzesForCourse(courseId) {
  const cid = courseId
  if (!cid) return []
  return QuizModel.find({ course: cid })
    .sort({ availableDate: 1, dueDate: 1, createdAt: 1, _id: 1 })
    .lean()
}

export async function createQuiz(payload) {
  const data = {
    title: 'New Quiz',
    assignmentGroup: 'QUIZZES',
    type: 'GRADED_QUIZ',
    points: 0,
    questionCount: 0,
    published: false,
    settings: {
      shuffleAnswers: true,
      timeLimitMinutes: 20,
      oneQuestionAtATime: true,
    },
    ...payload,
  }
  const created = await QuizModel.create(data)
  return created.toObject()
}

export async function findQuizById(quizId) {
  const qid = quizId
  if (!qid) return null
  return QuizModel.findById(qid).lean()
}

export async function updateQuiz(quizId, patch) {
  const qid = quizId
  if (!qid) return null
  await QuizModel.updateOne({ _id: qid }, { $set: patch })
  return QuizModel.findById(qid).lean()
}

export async function deleteQuiz(quizId) {
  const qid = quizId
  if (!qid) return { success: false }
  await QuestionModel.deleteMany({ quiz: qid })
  await AttemptModel.deleteMany({ quiz: qid })
  const res = await QuizModel.deleteOne({ _id: qid })
  return { success: res.deletedCount > 0 }
}

export async function setPublished(quizId, published) {
  return updateQuiz(quizId, { published: !!published })
}

/** Questions */
export async function findQuestionsByQuiz(quizId) {
  const qid = quizId
  if (!qid) return []
  return QuestionModel.find({ quiz: qid }).sort({ createdAt: 1 }).lean()
}

export async function createQuestion(quizId, body) {
  const qid = quizId
  if (!qid) throw new Error('Invalid quiz id')
  const created = await QuestionModel.create({ quiz: qid, ...body })
  await recomputeQuizStats(qid)
  return created.toObject()
}

export async function updateQuestion(questionId, patch) {
  const id = questionId
  if (!id) return null
  await QuestionModel.updateOne({ _id: id }, { $set: patch })
  const q = await QuestionModel.findById(id).lean()
  if (q) await recomputeQuizStats(q.quiz)
  return q
}

export async function deleteQuestion(questionId) {
  const id = questionId
  if (!id) return { success: false }
  const q = await QuestionModel.findById(id).lean()
  const res = await QuestionModel.deleteOne({ _id: id })
  if (q) await recomputeQuizStats(q.quiz)
  return { success: res.deletedCount > 0 }
}

async function recomputeQuizStats(quizId) {
  const qid = quizId
  if (!qid) return
  const agg = await QuestionModel.aggregate([
    { $match: { quiz: qid } },
    {
      $group: {
        _id: '$quiz',
        points: { $sum: { $ifNull: ['$points', 0] } },
        count: { $sum: 1 },
      },
    },
  ])
  const stats = agg[0] || { points: 0, count: 0 }
  await QuizModel.updateOne(
    { _id: qid },
    { $set: { points: stats.points || 0, questionCount: stats.count || 0 } },
  )
}

/** Attempts */
export async function getLastAttempt(userId, quizId) {
  const uid = userId
  const qid = quizId
  if (!uid || !qid) return null
  return AttemptModel.findOne({
    user: uid,
    quiz: qid,
    submittedAt: { $ne: null },
  })
    .sort({ submittedAt: -1 })
    .lean()
}

export async function startAttempt(userId, quizId) {
  const uid = userId
  const qid = quizId
  if (!uid || !qid) throw new Error('Invalid ids')
  const quiz = await QuizModel.findById(qid).lean()
  if (!quiz) throw new Error('Quiz not found')

  const now = new Date()
  if (!quiz.published)
    throw Object.assign(new Error('Quiz is unpublished'), { status: 403 })
  if (quiz.availableDate && now < new Date(quiz.availableDate))
    throw Object.assign(new Error('Quiz not yet available'), { status: 403 })
  if (quiz.availableUntil && now > new Date(quiz.availableUntil))
    throw Object.assign(new Error('Quiz is closed'), { status: 403 })

  const allowed = quiz.settings?.multipleAttempts
    ? (quiz.settings?.maxAttempts ?? 1)
    : 1

  const prevCount = await AttemptModel.countDocuments({
    user: uid,
    quiz: qid,
    submittedAt: { $ne: null },
  })

  if (prevCount >= allowed)
    throw Object.assign(new Error('Max attempts reached'), { status: 403 })

  const attempt = await AttemptModel.create({
    quiz: qid,
    user: uid,
    answers: [],
  })
  return { attemptId: attempt._id.toString() }
}

export async function submitAttempt(userId, attemptId, payloadAnswers) {
  const uid = userId
  const aid = attemptId
  if (!uid || !aid) throw new Error('Invalid ids')

  const attempt = await AttemptModel.findById(aid).lean()
  if (!attempt)
    throw Object.assign(new Error('Attempt not found'), { status: 404 })
  if (attempt.user.toString() !== uid.toString())
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  if (attempt.submittedAt)
    throw Object.assign(new Error('Attempt already submitted'), { status: 400 })

  const quizId = attempt.quiz
  const questions = await QuestionModel.find({ quiz: quizId }).lean()
  const qmap = new Map(questions.map((q) => [q._id.toString(), q]))

  let score = 0
  const answers = []

  for (const a of payloadAnswers || []) {
    const q = qmap.get(a.questionId)
    if (!q) continue
    let correct = false
    if (q.type === 'mcq') {
      correct = Number(a.choiceIndex) === Number(q.correctIndex)
      if (correct) score += q.points || 0
      answers.push({
        question: q._id,
        type: 'mcq',
        choiceIndex: a.choiceIndex ?? null,
      })
    } else if (q.type === 'truefalse') {
      correct = typeof a.value === 'boolean' && a.value === q.correct
      if (correct) score += q.points || 0
      answers.push({
        question: q._id,
        type: 'truefalse',
        valueBool: a.value ?? null,
      })
    } else if (q.type === 'fillblank') {
      const given = (a.value || '').toString().trim()
      const list = (q.answers || []).map((s) => s.toString())
      const ci = !!q.caseInsensitive
      const ok = list.some((ans) =>
        ci
          ? ans.trim().toLowerCase() === given.toLowerCase()
          : ans.trim() === given,
      )
      if (ok) score += q.points || 0
      answers.push({ question: q._id, type: 'fillblank', valueText: given })
    }
  }

  await AttemptModel.updateOne(
    { _id: aid },
    { $set: { answers, score, submittedAt: new Date() } },
  )

  return { score }
}

export async function getAttemptsForUser(userId, quizId) {
  const uid = userId
  const qid = quizId
  if (!uid || !qid) return []
  return AttemptModel.find({
    user: uid,
    quiz: qid,
    submittedAt: { $ne: null },
  })
    .sort({ submittedAt: -1, _id: -1 })
    .lean()
}

export async function getAttemptById(attemptId) {
  const aid = attemptId
  if (!aid) return null
  return AttemptModel.findById(aid).lean()
}
