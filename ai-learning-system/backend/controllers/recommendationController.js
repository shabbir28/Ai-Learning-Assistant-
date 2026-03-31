const Quiz = require("../models/Quiz");
const Recommendation = require("../models/Recommendation");
const { generateRecommendations } = require("../utils/openaiHelper");

// @desc    Get personalized recommendations (cached or fresh)
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    // Check for existing cached recommendations (< 24 hours old)
    const existing = await Recommendation.findOne({ owner: req.user._id });
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (existing && existing.updatedAt > oneDayAgo) {
      return res.json(existing);
    }

    // Fetch user's completed quizzes for analysis
    const quizHistory = await Quiz.find({
      owner: req.user._id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (quizHistory.length === 0) {
      return res.json({
        recommendations: [],
        overallSummary:
          "Complete at least one quiz to receive personalized recommendations.",
        generatedFrom: { quizCount: 0, avgScore: 0 },
      });
    }

    // Generate AI recommendations
    const aiResult = await generateRecommendations(quizHistory);

    const avgScore =
      quizHistory.length > 0
        ? Math.round(
            quizHistory.reduce(
              (sum, q) =>
                sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizHistory.length
          )
        : 0;

    // Upsert recommendation document
    const recommendation = await Recommendation.findOneAndUpdate(
      { owner: req.user._id },
      {
        owner: req.user._id,
        recommendations: aiResult.recommendations || [],
        overallSummary: aiResult.overallSummary || "",
        generatedFrom: { quizCount: quizHistory.length, avgScore },
      },
      { upsert: true, new: true }
    );

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Force refresh recommendations
// @route   POST /api/recommendations/refresh
// @access  Private
const refreshRecommendations = async (req, res) => {
  try {
    const quizHistory = await Quiz.find({
      owner: req.user._id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (quizHistory.length === 0) {
      return res.json({
        recommendations: [],
        overallSummary:
          "Complete at least one quiz to receive personalized recommendations.",
        generatedFrom: { quizCount: 0, avgScore: 0 },
      });
    }

    const aiResult = await generateRecommendations(quizHistory);

    const avgScore =
      quizHistory.length > 0
        ? Math.round(
            quizHistory.reduce(
              (sum, q) =>
                sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizHistory.length
          )
        : 0;

    const recommendation = await Recommendation.findOneAndUpdate(
      { owner: req.user._id },
      {
        owner: req.user._id,
        recommendations: aiResult.recommendations || [],
        overallSummary: aiResult.overallSummary || "",
        generatedFrom: { quizCount: quizHistory.length, avgScore },
      },
      { upsert: true, new: true }
    );

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations, refreshRecommendations };
