const express = require("express");
const router = express.Router();
const {
  generateQuizForDoc,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getQuizzes);
router.post("/generate/:documentId", generateQuizForDoc);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);

module.exports = router;
