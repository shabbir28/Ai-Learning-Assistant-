const Document = require("../models/Document");
const Quiz = require("../models/Quiz");
const { generateQuizWithDifficulty } = require("../utils/openaiHelper");

// @desc    Generate quiz from a document (with difficulty support)
// @route   POST /api/quizzes/generate/:documentId
// @access  Private
const generateQuizForDoc = async (req, res) => {
  try {
    const { difficulty = "medium", count = 5, timePerQuestion = 30 } = req.body;

    const document = await Document.findById(req.params.documentId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!document.extractedText) {
      return res
        .status(400)
        .json({ message: "No text extracted from this document" });
    }

    const questions = await generateQuizWithDifficulty(
      document.extractedText,
      Number(count),
      difficulty
    );

    const quiz = await Quiz.create({
      document: document._id,
      owner: req.user._id,
      title: `Quiz – ${document.originalName}`,
      difficulty,
      timePerQuestion: Number(timePerQuestion),
      questions,
      totalQuestions: questions.length,
    });

    document.hasQuiz = true;
    await document.save();

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes for logged-in user
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ owner: req.user._id })
      .populate("document", "originalName")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "document",
      "originalName",
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers (with timer data)
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken = {}, timedOut = false } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (quiz.isCompleted) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    let score = 0;
    quiz.questions.forEach((q, index) => {
      const userAnswer = answers[index.toString()];
      if (userAnswer && userAnswer === q.correctAnswer) {
        score++;
      }
    });

    quiz.userAnswers = answers;
    quiz.timeTaken = timeTaken;
    quiz.timedOut = timedOut;
    quiz.score = score;
    quiz.isCompleted = true;
    await quiz.save();

    res.json({
      score,
      totalQuestions: quiz.totalQuestions,
      percentage: Math.round((score / quiz.totalQuestions) * 100),
      timedOut,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "document",
      "originalName",
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!quiz.isCompleted) {
      return res.status(400).json({ message: "Quiz not yet submitted" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateQuizForDoc,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
};
