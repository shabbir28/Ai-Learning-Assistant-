const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Quiz",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    timePerQuestion: {
      type: Number,
      default: 30, // seconds
    },
    questions: [quizQuestionSchema],
    userAnswers: {
      type: Map,
      of: String,
      default: {},
    },
    timeTaken: {
      type: Map,
      of: Number, // seconds spent on each question index
      default: {},
    },
    timedOut: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: null,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quiz", quizSchema);
