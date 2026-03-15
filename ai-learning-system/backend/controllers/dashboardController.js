const Document = require("../models/Document");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");

// @desc    Get dashboard statistics for logged-in user
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [documents, flashcardSets, quizzes] = await Promise.all([
      Document.find({ owner: userId }).sort({ createdAt: -1 }).limit(5),
      Flashcard.find({ owner: userId })
        .populate("document", "originalName")
        .sort({ createdAt: -1 })
        .limit(5),
      Quiz.find({ owner: userId })
        .populate("document", "originalName")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalDocuments = await Document.countDocuments({ owner: userId });
    const totalFlashcardSets = await Flashcard.countDocuments({
      owner: userId,
    });
    const totalQuizzes = await Quiz.countDocuments({ owner: userId });
    const completedQuizzes = await Quiz.countDocuments({
      owner: userId,
      isCompleted: true,
    });

    // Calculate average quiz score
    const scoredQuizzes = await Quiz.find({
      owner: userId,
      isCompleted: true,
      score: { $ne: null },
    });
    let avgScore = 0;
    if (scoredQuizzes.length > 0) {
      const totalScore = scoredQuizzes.reduce(
        (sum, q) => sum + (q.score / q.totalQuestions) * 100,
        0,
      );
      avgScore = Math.round(totalScore / scoredQuizzes.length);
    }

    res.json({
      stats: {
        totalDocuments,
        totalFlashcardSets,
        totalQuizzes,
        completedQuizzes,
        avgScore,
      },
      recentDocuments: documents,
      recentFlashcards: flashcardSets,
      recentQuizzes: quizzes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
