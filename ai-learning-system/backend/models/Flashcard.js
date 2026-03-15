const mongoose = require("mongoose");

const flashcardItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const flashcardSchema = new mongoose.Schema(
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
      default: "Flashcard Set",
    },
    cards: [flashcardItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Flashcard", flashcardSchema);
