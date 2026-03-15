const Document = require("../models/Document");
const Flashcard = require("../models/Flashcard");
const { generateFlashcards } = require("../utils/openaiHelper");

// @desc    Generate flashcards from a document
// @route   POST /api/flashcards/generate/:documentId
// @access  Private
const generateFlashcardsForDoc = async (req, res) => {
  try {
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

    const cards = await generateFlashcards(document.extractedText, 10);

    const flashcardSet = await Flashcard.create({
      document: document._id,
      owner: req.user._id,
      title: `Flashcards – ${document.originalName}`,
      cards,
    });

    document.hasFlashcards = true;
    await document.save();

    res.status(201).json(flashcardSet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all flashcard sets for logged-in user
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ owner: req.user._id })
      .populate("document", "originalName")
      .sort({ createdAt: -1 });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get flashcard set by ID
// @route   GET /api/flashcards/:id
// @access  Private
const getFlashcardById = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate(
      "document",
      "originalName",
    );
    if (!flashcard)
      return res.status(404).json({ message: "Flashcard set not found" });
    if (flashcard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get flashcards for a specific document
// @route   GET /api/flashcards/document/:documentId
// @access  Private
const getFlashcardsByDocument = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      document: req.params.documentId,
      owner: req.user._id,
    });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateFlashcardsForDoc,
  getFlashcards,
  getFlashcardById,
  getFlashcardsByDocument,
};
