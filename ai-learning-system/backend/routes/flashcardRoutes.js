const express = require("express");
const router = express.Router();
const {
  generateFlashcardsForDoc,
  getFlashcards,
  getFlashcardById,
  getFlashcardsByDocument,
} = require("../controllers/flashcardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getFlashcards);
router.post("/generate/:documentId", generateFlashcardsForDoc);
router.get("/document/:documentId", getFlashcardsByDocument);
router.get("/:id", getFlashcardById);

module.exports = router;
