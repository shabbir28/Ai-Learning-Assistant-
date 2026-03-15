const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");
const { extractTextFromPDF } = require("../utils/pdfParser");
const { generateSummary, chatWithDocument } = require("../utils/openaiHelper");

// @desc    Upload a PDF document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    let extractedText = "";

    try {
      extractedText = await extractTextFromPDF(filePath);
    } catch (err) {
      console.error("Text extraction failed:", err.message);
    }

    const document = await Document.create({
      owner: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: filePath,
      fileSize: req.file.size,
      extractedText,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate and save summary for a document
// @route   POST /api/documents/:id/summary
// @access  Private
const generateDocumentSummary = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
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

    const summary = await generateSummary(document.extractedText);
    document.summary = summary;
    await document.save();

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document)
      return res.status(404).json({ message: "Document not found" });
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.deleteOne();
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with a document using AI
// @route   POST /api/documents/:id/chat
// @access  Private
const chatDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document)
      return res.status(404).json({ message: "Document not found" });
    if (document.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (!document.extractedText)
      return res.status(400).json({ message: "No text extracted from this document" });

    const { message, history = [] } = req.body;
    if (!message || !message.trim())
      return res.status(400).json({ message: "Message is required" });

    const reply = await chatWithDocument(document.extractedText, history, message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  generateDocumentSummary,
  deleteDocument,
  chatDocument,
};
