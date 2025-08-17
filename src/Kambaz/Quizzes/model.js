import mongoose from 'mongoose'
const { Schema, model } = mongoose

const QuizSettingsSchema = new Schema(
  {
    shuffleAnswers: { type: Boolean, default: true },
    timeLimitMinutes: { type: Number, default: 20 },
    multipleAttempts: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 1 },
    showCorrectAnswers: {
      type: String,
      enum: ['immediately', 'after_due', 'never'],
      default: 'immediately',
    },
    accessCode: { type: String },
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockAfterAnswering: { type: Boolean, default: false },
  },
  { _id: false },
)

const QuizSchema = new Schema(
  {
    course: {
      type: String,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: { type: String, default: 'New Quiz' },
    description: String,
    type: {
      type: String,
      enum: [
        'GRADED_QUIZ',
        'PRACTICE_QUIZ',
        'GRADED_SURVEY',
        'UNGRADED_SURVEY',
      ],
      default: 'GRADED_QUIZ',
    },
    assignmentGroup: {
      type: String,
      enum: ['QUIZZES', 'EXAMS', 'ASSIGNMENTS', 'PROJECT'],
      default: 'QUIZZES',
    },
    published: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    dueDate: Date,
    availableDate: Date,
    availableUntil: Date,
    questionCount: { type: Number, default: 0 },
    settings: { type: QuizSettingsSchema, default: () => ({}) },
  },
  { timestamps: true },
)

QuizSchema.index({ course: 1, availableDate: 1, createdAt: 1 })

const QuestionSchema = new Schema(
  {
    quiz: { type: String, ref: 'Quiz', required: true, index: true },
    type: {
      type: String,
      enum: ['mcq', 'truefalse', 'fillblank'],
      default: 'mcq',
    },
    title: { type: String, default: 'Question' },
    points: { type: Number, default: 1 },
    text: String,

    // mcq
    choices: [String],
    correctIndex: Number,

    // true/false
    correct: Boolean,

    // fill in blank
    answers: [String],
    caseInsensitive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const AttemptAnswerSchema = new Schema(
  {
    question: { type: String, ref: 'Question', required: true },
    type: {
      type: String,
      enum: ['mcq', 'truefalse', 'fillblank'],
      required: true,
    },
    choiceIndex: { type: Number }, // mcq
    valueBool: { type: Boolean }, // true/false
    valueText: { type: String }, // fillblank
  },
  { _id: false },
)

const AttemptSchema = new Schema(
  {
    quiz: { type: String, ref: 'Quiz', required: true, index: true },
    user: { type: String, ref: 'User', required: true, index: true },
    answers: [AttemptAnswerSchema],
    score: { type: Number, default: 0 },
    submittedAt: { type: Date },
  },
  { timestamps: true },
)

export const QuizModel = model('Quiz', QuizSchema)
export const QuestionModel = model('Question', QuestionSchema)
export const AttemptModel = model('Attempt', AttemptSchema)

QuizSchema.index({ course: 1, createdAt: -1 })
QuestionSchema.index({ quiz: 1, createdAt: 1 })
AttemptSchema.index({ user: 1, quiz: 1, submittedAt: -1 })
