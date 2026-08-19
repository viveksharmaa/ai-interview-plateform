const express = require("express");

const {
  generateQuestion,
  evaluateInterview,
} = require("../controllers/interviewController");

const router = express.Router();


// ==================================================
// GENERATE AI INTERVIEW QUESTION
// ==================================================
//
// POST /api/interview/question
//

router.post(
  "/question",
  generateQuestion
);


// ==================================================
// EVALUATE COMPLETE INTERVIEW
// ==================================================
//
// POST /api/interview/evaluate
//

router.post(
  "/evaluate",
  evaluateInterview
);


// ==================================================
// INTERVIEW HEALTH CHECK
// ==================================================
//
// GET /api/interview
//

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Interview API",
    message: "Interview routes are working",
  });
});


module.exports = router;