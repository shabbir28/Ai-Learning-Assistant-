const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  generateDocumentSummary,
  deleteDocument,
  chatDocument,
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.post("/upload", upload.single("pdf"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.post("/:id/summary", generateDocumentSummary);
router.post("/:id/chat", chatDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
