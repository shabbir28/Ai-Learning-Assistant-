const mongoose = require("mongoose");

const recommendationItemSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  reason: { type: String, required: true },
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  suggestedAction: { type: String, required: true },
  resourceType: { type: String, enum: ["document", "quiz", "flashcard", "review"], default: "review" },
});

const recommendationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    recommendations: [recommendationItemSchema],
    overallSummary: { type: String, default: "" },
    generatedFrom: {
      quizCount: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
