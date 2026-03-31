const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  refreshRecommendations,
} = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getRecommendations);
router.post("/refresh", refreshRecommendations);

module.exports = router;
