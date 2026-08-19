const { GoogleGenerativeAI } = require("@google/generative-ai");

// ==================================================
// GEMINI CONFIGURATION
// ==================================================

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const model = genAI
  ? genAI.getGenerativeModel({
      model: DEFAULT_GEMINI_MODEL,
    })
  : null;


// ==================================================
// FALLBACK QUESTION
// ==================================================

const buildFallbackQuestion = ({
  role,
  skills,
  questionNumber = 1,
  previousQuestions = [],
}) => {
  const cleanedSkills = Array.isArray(skills)
    ? [
        ...new Set(
          skills
            .filter(Boolean)
            .map((skill) => String(skill).trim())
            .filter(Boolean)
        ),
      ]
    : [];

  const safeRole = role || "Software Developer";

  const selectedSkill =
    cleanedSkills[
      (Number(questionNumber) - 1) % cleanedSkills.length
    ] ||
    cleanedSkills[0] ||
    "Problem Solving";

  const questionTemplates = {
    JavaScript: [
      "Explain how closures work in JavaScript and give a real-world use case.",
      "Explain the difference between var, let and const with examples.",
      "How would you optimize a slow JavaScript application?",
    ],

    React: [
      "What is the difference between props and state in React?",
      "Explain controlled and uncontrolled components in React.",
      "What are React hooks and why are they useful?",
    ],

    Java: [
      "Explain abstraction and encapsulation in Java with a real-world example.",
      "What is the difference between an interface and an abstract class in Java?",
      "How does exception handling work in Java?",
    ],

    Python: [
      "Explain the difference between a list and a tuple in Python.",
      "What are generators in Python and when would you use them?",
      "How would you process a very large file efficiently in Python?",
    ],

    SQL: [
      "Explain the difference between INNER JOIN and LEFT JOIN.",
      "How would you optimize a slow SQL query?",
      "Write a SQL query to find the second highest salary.",
    ],

    "Data Structures": [
      "When would you use a stack instead of a queue?",
      "Explain how a hash map provides fast lookup.",
      "How would you find duplicates in an array efficiently?",
    ],

    "System Design": [
      "How would you design a scalable chat application?",
      "How would you design a notification system for millions of users?",
      "How would you design a rate-limited API?",
    ],

    default: [
      `Explain how you would solve a real-world ${safeRole} problem using ${selectedSkill}.`,
      `Describe a project where you could use ${selectedSkill} and explain your approach.`,
      `What are the important concepts of ${selectedSkill} that an interviewer should expect you to know?`,
    ],
  };

  const templates =
    questionTemplates[selectedSkill] ||
    questionTemplates.default;

  const index =
    previousQuestions.length > 0
      ? previousQuestions.length % templates.length
      : (Number(questionNumber) - 1) % templates.length;

  return {
    skill: selectedSkill,
    difficulty:
      Number(questionNumber) > 2
        ? "Intermediate"
        : "Basic",
    question: templates[index],
  };
};


// ==================================================
// FALLBACK EVALUATION
// ==================================================

const buildFallbackEvaluation = ({
  role,
  skills,
  answers,
}) => {
  const safeSkills = Array.isArray(skills)
    ? [
        ...new Set(
          skills
            .filter(Boolean)
            .map((skill) => String(skill).trim())
            .filter(Boolean)
        ),
      ]
    : [];

  const answerCount = Array.isArray(answers)
    ? answers.length
    : 0;

  const averageLength =
    answerCount > 0
      ? answers.reduce(
          (sum, answer) =>
            sum +
            String(answer?.answer || "").length,
          0
        ) / answerCount
      : 0;

  const technicalScore = Math.min(
    95,
    Math.max(
      45,
      Math.round(
        60 +
          averageLength / 18 +
          answerCount * 5
      )
    )
  );

  const problemSolvingScore = Math.min(
    95,
    Math.max(
      40,
      Math.round(
        55 +
          answerCount * 6 +
          (safeSkills.length || 3) * 4
      )
    )
  );

  const communicationScore = Math.min(
    95,
    Math.max(
      50,
      Math.round(
        68 +
          averageLength / 12
      )
    )
  );

  const overallScore = Math.min(
    100,
    Math.round(
      (
        technicalScore +
        problemSolvingScore +
        communicationScore
      ) / 3
    )
  );

  return {
    overallScore,
    technicalScore,
    problemSolvingScore,
    communicationScore,

    strengths: [
      `Good foundation in ${
        safeSkills[0] ||
        "core technical concepts"
      }`,
      "Able to explain technical concepts",
      "Shows practical problem-solving ability",
    ],

    weaknesses: [
      "Needs more advanced problem-solving practice",
      "Can improve explanation of edge cases",
      "Needs more practice with real-world system scenarios",
    ],

    recommendations: [
      `Practice ${
        safeSkills[0] ||
        "core technical skills"
      } regularly`,
      "Solve medium and hard interview problems",
      "Practice explaining technical solutions clearly",
    ],

    summary: `The candidate shows a promising foundation for the ${
      role || "target role"
    }. More practice with advanced problems, optimization and real-world scenarios will improve interview readiness.`,
  };
};


// ==================================================
// SLEEP
// ==================================================

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


// ==================================================
// GET RETRY DELAY
// ==================================================

const getRetryDelay = (error, attempt) => {
  try {
    const retryInfo =
      error?.errorDetails?.find(
        (item) => item?.retryDelay
      );

    if (retryInfo?.retryDelay) {
      const seconds = parseInt(
        retryInfo.retryDelay.replace("s", ""),
        10
      );

      if (
        !isNaN(seconds) &&
        seconds > 0
      ) {
        return seconds * 1000;
      }
    }
  } catch (error) {
    console.log(
      "Unable to read Gemini retry delay."
    );
  }

  return Math.min(
    5000 * Math.pow(2, attempt - 1),
    30000
  );
};


// ==================================================
// GENERATE WITH RETRY
// ==================================================

const generateWithRetry = async (
  prompt,
  maxRetries = 2
) => {
  if (!model) {
    const error = new Error(
      "Gemini API is not configured."
    );

    error.fallback = true;

    throw error;
  }

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= maxRetries + 1;
    attempt++
  ) {
    try {
      console.log(
        `🤖 Gemini request ${attempt}/${maxRetries + 1}`
      );

      const response =
        await model.generateContent(prompt);

      console.log(
        "✅ Gemini response received"
      );

      return response;
    } catch (error) {
      lastError = error;

      console.error(
        "===================================="
      );

      console.error(
        `❌ Gemini attempt ${attempt} failed`
      );

      console.error(
        "Status:",
        error?.status
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "===================================="
      );

      // --------------------------------------------------
      // MODEL NOT AVAILABLE
      // --------------------------------------------------

      if (
        error?.status === 404 ||
        /model.*not available|not found/i.test(
          error?.message || ""
        )
      ) {
        const fallbackError =
          new Error(
            "Gemini model unavailable."
          );

        fallbackError.status = 404;
        fallbackError.fallback = true;

        throw fallbackError;
      }

      // --------------------------------------------------
      // RETRYABLE ERRORS
      // --------------------------------------------------

      const retryable =
        error?.status === 429 ||
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503 ||
        error?.status === 504;

      if (!retryable) {
        throw error;
      }

      if (
        attempt >=
        maxRetries + 1
      ) {
        throw error;
      }

      const delay =
        getRetryDelay(
          error,
          attempt
        );

      console.log(
        `⏳ Retrying after ${Math.ceil(
          delay / 1000
        )} seconds...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};


// ==================================================
// CLEAN GEMINI JSON
// ==================================================

const cleanGeminiJSON = (output) => {
  if (!output) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleaned =
    String(output).trim();

  cleaned = cleaned
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned =
      cleaned.substring(
        firstBrace,
        lastBrace + 1
      );
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "❌ Invalid Gemini JSON:"
    );

    console.error(cleaned);

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
};


// ==================================================
// GENERATE QUESTION
// POST /api/interview/question
// ==================================================

const generateQuestion = async (
  req,
  res
) => {
  const {
    role,
    skills,
    questionNumber,
    previousQuestions,
    previousAnswers,
  } = req.body || {};

  let cleanSkills = [];
  let oldQuestions = [];
  let oldAnswers = [];

  try {
    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!role) {
      return res.status(400).json({
        success: false,
        message:
          "Target role is required.",
      });
    }

    if (
      !Array.isArray(skills) ||
      skills.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Resume skills are required.",
      });
    }

    // --------------------------------------------------
    // CLEAN SKILLS
    // --------------------------------------------------

    cleanSkills = [
      ...new Set(
        skills
          .filter(
            (skill) =>
              typeof skill ===
              "string"
          )
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean)
      ),
    ];

    if (
      cleanSkills.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid resume skills found.",
      });
    }

    // --------------------------------------------------
    // PREVIOUS DATA
    // --------------------------------------------------

    oldQuestions =
      Array.isArray(
        previousQuestions
      )
        ? previousQuestions
        : [];

    oldAnswers =
      Array.isArray(
        previousAnswers
      )
        ? previousAnswers
        : [];

    // --------------------------------------------------
    // FALLBACK IF GEMINI NOT CONFIGURED
    // --------------------------------------------------

    if (
      !model ||
      !process.env.GEMINI_API_KEY
    ) {
      const fallbackQuestion =
        buildFallbackQuestion({
          role,
          skills: cleanSkills,
          questionNumber,
          previousQuestions:
            oldQuestions,
        });

      return res.status(200).json({
        success: true,
        source: "fallback",
        question:
          fallbackQuestion,
      });
    }

    // --------------------------------------------------
    // GEMINI PROMPT
    // --------------------------------------------------

    const prompt = `
You are an expert technical interviewer.

Create ONE personalized technical interview question.

TARGET ROLE:
${role}

RESUME SKILLS:
${cleanSkills.join(", ")}

QUESTION NUMBER:
${questionNumber || 1}

PREVIOUS QUESTIONS:
${
  oldQuestions.length
    ? oldQuestions.join("\n")
    : "None"
}

PREVIOUS ANSWERS:
${
  oldAnswers.length
    ? oldAnswers.join("\n")
    : "None"
}

RULES:

1. Ask ONLY from resume skills.

2. Never use a skill outside:
${cleanSkills.join(", ")}

3. Never repeat a previous question.

4. Make the question relevant to:
${role}

5. Prefer practical technical questions.

6. If the previous answer was strong,
increase difficulty.

7. If previous answer was weak,
keep similar or slightly easier difficulty.

8. Generate exactly ONE question.

9. The skill must exactly match one
skill from the resume list.

10. Return ONLY valid JSON.

FORMAT:

{
  "skill": "one resume skill",
  "difficulty": "Basic",
  "question": "question"
}

difficulty must be exactly:

Basic
Intermediate
Advanced
`;

    // --------------------------------------------------
    // GEMINI REQUEST
    // --------------------------------------------------

    const response =
      await generateWithRetry(
        prompt,
        2
      );

    const output =
      response.response.text();

    const questionData =
      cleanGeminiJSON(output);

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
      !questionData.skill ||
      !questionData.difficulty ||
      !questionData.question
    ) {
      throw new Error(
        "Gemini returned incomplete question data."
      );
    }

    // --------------------------------------------------
    // MATCH SKILL
    // --------------------------------------------------

    const matchedSkill =
      cleanSkills.find(
        (skill) =>
          skill.toLowerCase() ===
          String(
            questionData.skill
          ).toLowerCase()
      );

    if (!matchedSkill) {
      throw new Error(
        "AI generated a skill not found in resume."
      );
    }

    // --------------------------------------------------
    // DIFFICULTY VALIDATION
    // --------------------------------------------------

    const allowedDifficulty = [
      "Basic",
      "Intermediate",
      "Advanced",
    ];

    if (
      !allowedDifficulty.includes(
        questionData.difficulty
      )
    ) {
      throw new Error(
        "Invalid difficulty returned by Gemini."
      );
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      question: {
        skill: matchedSkill,

        difficulty:
          questionData.difficulty,

        question:
          String(
            questionData.question
          ).trim(),
      },
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "❌ Generate Question Error"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------

    if (
      error?.fallback === true ||
      error?.status === 404
    ) {
      const fallbackQuestion =
        buildFallbackQuestion({
          role,
          skills: cleanSkills,
          questionNumber,
          previousQuestions:
            oldQuestions,
        });

      return res.status(200).json({
        success: true,
        source: "fallback",
        question:
          fallbackQuestion,
      });
    }

    // --------------------------------------------------
    // RATE LIMIT
    // --------------------------------------------------

    if (
      error?.status === 429
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini API rate limit reached. Please wait before generating another question.",
      });
    }

    // --------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------

    if (
      error?.status === 500 ||
      error?.status === 502 ||
      error?.status === 503 ||
      error?.status === 504
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini AI is temporarily unavailable. Please try again shortly.",
      });
    }

    // --------------------------------------------------
    // GENERAL ERROR
    // --------------------------------------------------

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate AI interview question.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


// ==================================================
// EVALUATE INTERVIEW
// POST /api/interview/evaluate
// ==================================================

const evaluateInterview = async (
  req,
  res
) => {
  const {
    role,
    skills,
    answers,
  } = req.body || {};

  try {
    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interview answers are required.",
      });
    }

    // --------------------------------------------------
    // INTERVIEW DATA
    // --------------------------------------------------

    const interviewData =
      answers
        .map(
          (item, index) => `
Question ${index + 1}:
${item.question || ""}

Skill:
${item.skill || ""}

Difficulty:
${item.difficulty || ""}

Candidate Answer:
${item.answer || "No answer provided"}
`
        )
        .join("\n");

    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------

    if (
      !model ||
      !process.env.GEMINI_API_KEY
    ) {
      const fallbackResult =
        buildFallbackEvaluation({
          role,
          skills,
          answers,
        });

      return res.status(200).json({
        success: true,
        source: "fallback",
        result: fallbackResult,
      });
    }

    // --------------------------------------------------
    // GEMINI PROMPT
    // --------------------------------------------------

    const prompt = `
You are an expert technical interviewer.

Evaluate this candidate's complete interview.

TARGET ROLE:
${role || "Not specified"}

RESUME SKILLS:
${
  Array.isArray(skills)
    ? skills.join(", ")
    : "Not specified"
}

INTERVIEW:

${interviewData}

Evaluate the candidate on:

1. Technical knowledge
2. Accuracy
3. Problem solving
4. Concept understanding
5. Practical knowledge
6. Communication

Scores must be between 0 and 100.

Return ONLY valid JSON.

FORMAT:

{
  "overallScore": 0,
  "technicalScore": 0,
  "problemSolvingScore": 0,
  "communicationScore": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "summary": ""
}

RULES:

- Scores must be numbers.
- Scores must be between 0 and 100.
- strengths must be an array.
- weaknesses must be an array.
- recommendations must be an array.
- summary must be a concise evaluation.
`;

    // --------------------------------------------------
    // GEMINI
    // --------------------------------------------------

    const response =
      await generateWithRetry(
        prompt,
        2
      );

    const output =
      response.response.text();

    const result =
      cleanGeminiJSON(output);

    // --------------------------------------------------
    // SCORE VALIDATION
    // --------------------------------------------------

    const scores = [
      result.overallScore,
      result.technicalScore,
      result.problemSolvingScore,
      result.communicationScore,
    ];

    for (const score of scores) {
      if (
        typeof score !==
          "number" ||
        score < 0 ||
        score > 100
      ) {
        throw new Error(
          "Gemini returned invalid score."
        );
      }
    }

    // --------------------------------------------------
    // ARRAY VALIDATION
    // --------------------------------------------------

    if (
      !Array.isArray(
        result.strengths
      )
    ) {
      throw new Error(
        "Invalid strengths returned."
      );
    }

    if (
      !Array.isArray(
        result.weaknesses
      )
    ) {
      throw new Error(
        "Invalid weaknesses returned."
      );
    }

    if (
      !Array.isArray(
        result.recommendations
      )
    ) {
      throw new Error(
        "Invalid recommendations returned."
      );
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Interview evaluated successfully.",

      result,
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "❌ Evaluate Interview Error"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------

    if (
      error?.fallback === true ||
      error?.status === 404
    ) {
      const fallbackResult =
        buildFallbackEvaluation({
          role,
          skills,
          answers,
        });

      return res.status(200).json({
        success: true,
        source: "fallback",
        result: fallbackResult,
      });
    }

    // --------------------------------------------------
    // RATE LIMIT
    // --------------------------------------------------

    if (
      error?.status === 429
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini API rate limit reached. Please wait before evaluating the interview.",
      });
    }

    // --------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------

    if (
      error?.status === 500 ||
      error?.status === 502 ||
      error?.status === 503 ||
      error?.status === 504
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini AI is temporarily unavailable. Please try again shortly.",
      });
    }

    // --------------------------------------------------
    // GENERAL ERROR
    // --------------------------------------------------

    return res.status(500).json({
      success: false,

      message:
        "Unable to evaluate interview.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
  generateQuestion,
  evaluateInterview,
};