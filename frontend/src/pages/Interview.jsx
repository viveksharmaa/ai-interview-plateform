import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

function Interview() {
  const navigate = useNavigate();

  // ==================================================
  // CONFIGURATION
  // ==================================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const QUESTION_OPTIONS = [
    5,
    10,
    15,
    20,
  ];

  // ==================================================
  // SAFE LOCAL STORAGE
  // ==================================================

  const getLocalJSON = (
    key,
    fallback
  ) => {
    try {
      const value =
        localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(
        `Unable to read ${key}:`,
        error
      );

      return fallback;
    }
  };

  // ==================================================
  // INTERVIEW CONFIG
  // ==================================================

  const interviewConfig =
    getLocalJSON(
      "interviewConfig",
      {}
    );

  // ==================================================
  // USER DATA
  // ==================================================

  const role =
    interviewConfig.role ||
    localStorage.getItem(
      "targetRole"
    ) ||
    "Software Developer";

  const experience =
    interviewConfig.experience ||
    localStorage.getItem(
      "interviewExperience"
    ) ||
    "Fresher";

  const mode =
    interviewConfig.mode ||
    localStorage.getItem(
      "interviewMode"
    ) ||
    "Technical";

  const difficulty =
    interviewConfig.difficulty ||
    localStorage.getItem(
      "interviewDifficulty"
    ) ||
    "Adaptive";

  const configuredDuration =
    Number(
      interviewConfig.duration ||
        localStorage.getItem(
          "interviewDuration"
        ) ||
        20
    ) || 20;

  const configuredQuestionCount =
    Number(
      interviewConfig.questionCount ||
        localStorage.getItem(
          "questionCount"
        ) ||
        10
    ) || 10;

  const followUp =
    interviewConfig.followUp ??
    true;

  const avoidRepeat =
    interviewConfig.avoidRepeat ??
    true;

  const focusAreas =
    Array.isArray(
      interviewConfig.focusAreas
    )
      ? interviewConfig.focusAreas
      : [];

  // ==================================================
  // SKILLS
  // ==================================================

  const storedSkills =
    Array.isArray(
      interviewConfig.skills
    ) &&
    interviewConfig.skills.length > 0
      ? interviewConfig.skills
      : getLocalJSON(
          "extractedSkills",
          []
        );

  const resumeSkills = Array.isArray(
    storedSkills
  )
    ? storedSkills
        .map((skill) => {
          if (
            typeof skill === "string"
          ) {
            return skill.trim();
          }

          if (
            skill &&
            typeof skill ===
              "object" &&
            skill.name
          ) {
            return String(
              skill.name
            ).trim();
          }

          return "";
        })
        .filter(Boolean)
    : [];

  const uniqueSkills = [
    ...new Set(resumeSkills),
  ];

  // ==================================================
  // STATE
  // ==================================================

  const [totalQuestions, setTotalQuestions] =
    useState(
      QUESTION_OPTIONS.includes(
        configuredQuestionCount
      )
        ? configuredQuestionCount
        : 10
    );

  const [currentQuestion, setCurrentQuestion] =
    useState(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [answers, setAnswers] =
    useState([]);

  const [timeLeft, setTimeLeft] =
    useState(120);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isFinished, setIsFinished] =
    useState(false);

  // ==================================================
  // TIME PER QUESTION
  // ==================================================

  const timePerQuestion =
    Math.max(
      30,
      Math.floor(
        (configuredDuration * 60) /
          totalQuestions
      )
    );

  // ==================================================
  // TOTAL INTERVIEW TIME
  // ==================================================

  const totalInterviewSeconds =
    totalQuestions *
    timePerQuestion;

  const totalInterviewMinutes =
    Math.ceil(
      totalInterviewSeconds / 60
    );

  // ==================================================
  // CHANGE QUESTION COUNT
  // ==================================================

  const handleQuestionCountChange = (
    event
  ) => {
    const value = Number(
      event.target.value
    );

    if (
      !QUESTION_OPTIONS.includes(
        value
      )
    ) {
      return;
    }

    // Only before first question
    if (
      currentIndex > 0 ||
      answers.length > 0
    ) {
      return;
    }

    setTotalQuestions(value);

    localStorage.setItem(
      "questionCount",
      String(value)
    );

    const updatedConfig = {
      ...interviewConfig,
      questionCount: value,
    };

    localStorage.setItem(
      "interviewConfig",
      JSON.stringify(
        updatedConfig
      )
    );

    console.log(
      "Question count changed:",
      value
    );
  };

  // ==================================================
  // NORMALIZE QUESTION
  // ==================================================

  const normalizeQuestion = (
    question
  ) => {
    if (!question) {
      return null;
    }

    // Backend returns string
    if (
      typeof question ===
      "string"
    ) {
      return {
        question,
        skill:
          uniqueSkills[0] ||
          "General",
        difficulty:
          difficulty || "Basic",
      };
    }

    // Backend returns object
    if (
      typeof question ===
      "object"
    ) {
      return {
        question:
          question.question ||
          question.text ||
          question.content ||
          "Please explain your experience with this skill.",

        skill:
          question.skill ||
          uniqueSkills[0] ||
          "General",

        difficulty:
          question.difficulty ||
          difficulty ||
          "Basic",
      };
    }

    return null;
  };

  // ==================================================
  // API RESPONSE
  // ==================================================

  const getResponseData =
    async (response) => {
      let data = {};

      try {
        data =
          await response.json();
      } catch (error) {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Server error: ${response.status}`
        );
      }

      if (
        data.success === false
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "AI request failed."
        );
      }

      return data;
    };

  // ==================================================
  // START INTERVIEW ONCE
  // ==================================================

  useEffect(() => {
    startInterview();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================================================
  // START INTERVIEW
  // ==================================================

  const startInterview =
    async () => {
      try {
        setIsLoading(true);
        setError("");
        setIsFinished(false);

        setCurrentIndex(0);
        setAnswers([]);
        setAnswer("");

        const selectedCount =
          QUESTION_OPTIONS.includes(
            configuredQuestionCount
          )
            ? configuredQuestionCount
            : 10;

        setTotalQuestions(
          selectedCount
        );

        // ==========================================
        // CHECK SKILLS
        // ==========================================

        if (
          uniqueSkills.length ===
          0
        ) {
          throw new Error(
            "No skills found from your resume. Please upload your resume first."
          );
        }

        // ==========================================
        // LOG
        // ==========================================

        console.log(
          "===================================="
        );

        console.log(
          "STARTING AI INTERVIEW"
        );

        console.log(
          "Role:",
          role
        );

        console.log(
          "Experience:",
          experience
        );

        console.log(
          "Mode:",
          mode
        );

        console.log(
          "Difficulty:",
          difficulty
        );

        console.log(
          "Skills:",
          uniqueSkills
        );

        console.log(
          "Focus Areas:",
          focusAreas
        );

        console.log(
          "Follow Up:",
          followUp
        );

        console.log(
          "Avoid Repeat:",
          avoidRepeat
        );

        console.log(
          "Questions:",
          selectedCount
        );

        console.log(
          "Total Duration:",
          configuredDuration,
          "minutes"
        );

        console.log(
          "===================================="
        );

        // ==========================================
        // FIRST QUESTION
        // ==========================================

        const response =
          await fetch(
            `${API_URL}/api/interview/question`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                role,

                experience,

                mode,

                difficulty,

                skills:
                  uniqueSkills,

                focusAreas,

                followUp,

                avoidRepeat,

                questionNumber: 1,

                totalQuestions:
                  selectedCount,

                previousQuestions:
                  [],

                previousAnswers:
                  [],
              }),
            }
          );

        const data =
          await getResponseData(
            response
          );

        console.log(
          "First question response:",
          data
        );

        // ==========================================
        // QUESTION
        // ==========================================

        const question =
          normalizeQuestion(
            data.question ||
              data.data?.question
          );

        if (!question) {
          throw new Error(
            "AI did not return a valid interview question."
          );
        }

        setCurrentQuestion(
          question
        );

        setCurrentIndex(0);

        setAnswer("");

        setTimeLeft(
          Math.max(
            30,
            Math.floor(
              (configuredDuration *
                60) /
                selectedCount
            )
          )
        );

        setIsLoading(false);
      } catch (err) {
        console.error(
          "AI interview start error:",
          err
        );

        setError(
          err.message ||
            "Unable to connect to AI interview service."
        );

        setCurrentQuestion(
          null
        );

        setIsLoading(false);
      }
    };

  // ==================================================
  // QUESTION TIMER
  // ==================================================

  useEffect(() => {
    if (
      isLoading ||
      isFinished ||
      isSubmitting ||
      !currentQuestion
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (previous) => {
            if (
              previous <= 1
            ) {
              return 0;
            }

            return (
              previous - 1
            );
          }
        );
      }, 1000);

    return () => {
      clearInterval(
        timer
      );
    };
  }, [
    timeLeft,
    isLoading,
    isFinished,
    isSubmitting,
    currentQuestion,
  ]);

  // ==================================================
  // TIMER FORMAT
  // ==================================================

  const formatTime =
    () => {
      const minutes =
        Math.floor(
          timeLeft / 60
        );

      const seconds =
        timeLeft % 60;

      return `${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        seconds
      ).padStart(
        2,
        "0"
      )}`;
    };

  // ==================================================
  // SAVE ANSWER
  // ==================================================

  const createAnswerObject =
    () => {
      return {
        question:
          currentQuestion?.question ||
          "",

        skill:
          currentQuestion?.skill ||
          "General",

        difficulty:
          currentQuestion?.difficulty ||
          difficulty ||
          "Basic",

        answer:
          answer.trim(),
      };
    };

  // ==================================================
  // NEXT QUESTION
  // ==================================================

  const handleNext =
    async () => {
      if (
        !currentQuestion ||
        isSubmitting ||
        isFinished
      ) {
        return;
      }

      try {
        setIsSubmitting(
          true
        );

        setError("");

        // ==========================================
        // SAVE CURRENT ANSWER
        // ==========================================

        const newAnswer =
          createAnswerObject();

        const updatedAnswers =
          [
            ...answers,
            newAnswer,
          ];

        setAnswers(
          updatedAnswers
        );

        console.log(
          "Answer saved:",
          updatedAnswers.length,
          "/",
          totalQuestions
        );

        // ==========================================
        // LAST QUESTION
        // ==========================================

        if (
          currentIndex >=
          totalQuestions - 1
        ) {
          console.log(
            "LAST QUESTION COMPLETED"
          );

          await finishInterview(
            updatedAnswers
          );

          return;
        }

        // ==========================================
        // NEXT QUESTION NUMBER
        // ==========================================

        const nextQuestionNumber =
          currentIndex + 2;

        console.log(
          `Generating Question ${nextQuestionNumber}/${totalQuestions}`
        );

        // ==========================================
        // NEXT QUESTION API
        // ==========================================

        const response =
          await fetch(
            `${API_URL}/api/interview/question`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                role,

                experience,

                mode,

                difficulty,

                skills:
                  uniqueSkills,

                focusAreas,

                followUp,

                avoidRepeat,

                questionNumber:
                  nextQuestionNumber,

                totalQuestions,

                previousQuestions:
                  updatedAnswers.map(
                    (item) =>
                      item.question
                  ),

                previousAnswers:
                  updatedAnswers.map(
                    (item) =>
                      item.answer
                  ),
              }),
            }
          );

        const data =
          await getResponseData(
            response
          );

        console.log(
          "Next question response:",
          data
        );

        // ==========================================
        // NORMALIZE
        // ==========================================

        const nextQuestion =
          normalizeQuestion(
            data.question ||
              data.data?.question
          );

        if (
          !nextQuestion
        ) {
          throw new Error(
            "AI did not return the next interview question."
          );
        }

        // ==========================================
        // UPDATE UI
        // ==========================================

        setCurrentQuestion(
          nextQuestion
        );

        setCurrentIndex(
          (previous) =>
            previous + 1
        );

        setAnswer("");

        setTimeLeft(
          Math.max(
            30,
            Math.floor(
              (configuredDuration *
                60) /
                totalQuestions
            )
          )
        );

        setIsSubmitting(
          false
        );
      } catch (err) {
        console.error(
          "Next question error:",
          err
        );

        setError(
          err.message ||
            "Unable to generate next question."
        );

        setIsSubmitting(
          false
        );
      }
    };

  // ==================================================
  // FINISH INTERVIEW
  // ==================================================

  const finishInterview =
    async (
      finalAnswers
    ) => {
      try {
        setIsSubmitting(
          true
        );

        setError("");

        console.log(
          "Evaluating interview:",
          finalAnswers
        );

        // ==========================================
        // EVALUATION API
        // ==========================================

        const response =
          await fetch(
            `${API_URL}/api/interview/evaluate`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                role,

                experience,

                mode,

                difficulty,

                skills:
                  uniqueSkills,

                focusAreas,

                followUp,

                avoidRepeat,

                answers:
                  finalAnswers,

                totalQuestions,
              }),
            }
          );

        const data =
          await getResponseData(
            response
          );

        console.log(
          "Interview evaluation response:",
          data
        );

        const result =
          data.result ||
          data.data ||
          {};

        // ==========================================
        // SAVE ANSWERS
        // ==========================================

        localStorage.setItem(
          "interviewAnswers",
          JSON.stringify(
            finalAnswers
          )
        );

        // ==========================================
        // SAVE RESULT
        // ==========================================

        localStorage.setItem(
          "interviewResult",
          JSON.stringify(
            result
          )
        );

        // ==========================================
        // COMPLETE FLAG
        // ==========================================

        localStorage.setItem(
          "interviewCompleted",
          "true"
        );

        // ==========================================
        // SCORE
        // ==========================================

        const finalScore =
          Number(
            result.score ??
              result.overallScore ??
              result.overall ??
              0
          ) || 0;

        localStorage.setItem(
          "lastInterviewScore",
          String(
            finalScore
          )
        );

        localStorage.setItem(
          "lastInterviewQuestionCount",
          String(
            totalQuestions
          )
        );

        // ==========================================
        // FINISHED
        // ==========================================

        setIsFinished(
          true
        );

        // ==========================================
        // RESULT PAGE
        // ==========================================

        setTimeout(() => {
          navigate(
            "/result"
          );
        }, 500);
      } catch (err) {
        console.error(
          "Interview evaluation error:",
          err
        );

        setError(
          err.message ||
            "Unable to evaluate interview."
        );

        setIsSubmitting(
          false
        );
      }
    };

  // ==================================================
  // PROGRESS
  // ==================================================

  const progress =
    totalQuestions > 0
      ? ((currentIndex + 1) /
          totalQuestions) *
        100
      : 0;

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (isLoading) {
    return (
      <div className="interview-page">

        <header className="interview-header">

          <div className="interview-brand">

            <div className="navbar-logo">
              AI
            </div>

            <div>

              <h2>
                SkillVerify AI
              </h2>

              <span>
                AI Technical Interview
              </span>

            </div>

          </div>

        </header>

        <main className="interview-content">

          <div className="answer-card">

            <h2>
              🤖 AI is preparing your interview...
            </h2>

            <p>
              Generating personalized
              questions based on your
              selected skills and
              interview configuration.
            </p>

            <p
              style={{
                marginTop:
                  "10px",
                fontWeight:
                  "600",
              }}
            >
              {totalQuestions}{" "}
              Questions •{" "}
              {configuredDuration}{" "}
              Minutes
            </p>

            <div
              style={{
                marginTop:
                  "20px",
                textAlign:
                  "center",
              }}
            >

              <span className="button-spinner"></span>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ==================================================
  // ERROR SCREEN
  // ==================================================

  if (
    error &&
    !currentQuestion
  ) {
    return (
      <div className="interview-page">

        <header className="interview-header">

          <div className="interview-brand">

            <div className="navbar-logo">
              AI
            </div>

            <div>

              <h2>
                SkillVerify AI
              </h2>

              <span>
                AI Technical Interview
              </span>

            </div>

          </div>

        </header>

        <main className="interview-content">

          <div className="answer-card">

            <h2>
              ⚠️ Interview unavailable
            </h2>

            <p>
              {error}
            </p>

            <div
              style={{
                display:
                  "flex",
                gap: "12px",
                marginTop:
                  "20px",
              }}
            >

              <Button
                onClick={
                  startInterview
                }
              >
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    "/resume"
                  )
                }
              >
                Go to Resume
              </Button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div className="interview-page">

      {/* HEADER */}

      <header className="interview-header">

        <div className="interview-brand">

          <div className="navbar-logo">
            AI
          </div>

          <div>

            <h2>
              SkillVerify AI
            </h2>

            <span>
              AI Technical Interview
            </span>

          </div>

        </div>

        <div className="interview-role">

          <span>
            Target Role
          </span>

          <strong>
            {role}
          </strong>

        </div>

        <div
          className={`interview-timer ${
            timeLeft <= 30
              ? "timer-warning"
              : ""
          }`}
        >
          ⏱️{" "}
          {formatTime()}
        </div>

      </header>

      {/* ==================================================
          CONFIGURATION
          ================================================== */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: "10px",
          padding:
            "15px 30px",
          background:
            "#fff",
          borderBottom:
            "1px solid #e5e7eb",
          flexWrap:
            "wrap",
        }}
      >

        <div>

          <strong>
            Interview Configuration
          </strong>

          <div
            style={{
              fontSize:
                "13px",
              color:
                "#6b7280",
              marginTop:
                "4px",
            }}
          >
            {totalQuestions}{" "}
            Questions •{" "}
            {configuredDuration}{" "}
            Minutes •{" "}
            {mode}
          </div>

        </div>

        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "10px",
          }}
        >

          <label
            htmlFor="questionCount"
            style={{
              fontWeight:
                "600",
            }}
          >
            Number of Questions:
          </label>

          <select
            id="questionCount"
            value={
              totalQuestions
            }
            onChange={
              handleQuestionCountChange
            }
            disabled={
              currentIndex > 0 ||
              isSubmitting
            }
            style={{
              padding:
                "8px 12px",
              borderRadius:
                "8px",
              border:
                "1px solid #d1d5db",
              fontSize:
                "15px",
              cursor:
                currentIndex >
                  0
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {QUESTION_OPTIONS.map(
              (number) => (

                <option
                  key={number}
                  value={number}
                >
                  {number}{" "}
                  Questions
                </option>

              )
            )}

          </select>

        </div>

      </div>

      {/* PROGRESS */}

      <div className="interview-progress">

        <div
          className="interview-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* CONTENT */}

      <main className="interview-content">

        {/* ERROR */}

        {error && (
          <div className="resume-status status-error">

            <span>
              !
            </span>

            <div>
              {error}
            </div>

          </div>
        )}

        {/* QUESTION HEADER */}

        <div className="question-header">

          <div>

            <span>
              Question{" "}
              {currentIndex + 1}{" "}
              of{" "}
              {totalQuestions}
            </span>

            <h1>
              {
                currentQuestion?.question
              }
            </h1>

          </div>

          <div className="question-tags">

            <span className="skill-tag">
              {
                currentQuestion?.skill
              }
            </span>

            <span className="difficulty-tag">
              {
                currentQuestion?.difficulty
              }
            </span>

          </div>

        </div>

        {/* AI INDICATOR */}

        <div className="ai-question-indicator">

          🤖 AI generated question based on
          your resume and selected
          configuration

        </div>

        {/* ANSWER */}

        <div className="answer-card">

          <label>
            Your Answer
          </label>

          <textarea
            value={answer}
            onChange={(event) =>
              setAnswer(
                event.target.value
              )
            }
            placeholder="Type your answer here..."
            rows={10}
            disabled={
              isSubmitting
            }
          />

          <div className="answer-footer">

            <span>
              {answer.length}{" "}
              characters
            </span>

            <span>
              ⏱️{" "}
              {Math.floor(
                timePerQuestion /
                  60
              )}{" "}
              min/question
            </span>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="interview-actions">

          <button
            className="exit-button"
            disabled={
              isSubmitting
            }
            onClick={() => {

              const confirmExit =
                window.confirm(
                  "Are you sure you want to exit the interview?"
                );

              if (
                confirmExit
              ) {
                navigate(
                  "/dashboard"
                );
              }

            }}
          >
            Exit Interview
          </button>

          <Button
            size="large"
            loading={
              isSubmitting
            }
            disabled={
              isSubmitting
            }
            onClick={
              handleNext
            }
          >

            {currentIndex ===
            totalQuestions - 1
              ? "Finish Interview"
              : "Submit & Next →"}

          </Button>

        </div>

      </main>

    </div>
  );
}

export default Interview;