import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const navigate = useNavigate();

  // ==================================================
  // USER
  // ==================================================

  const userName =
    localStorage.getItem("userName") || "Student";

  // ==================================================
  // STATE
  // ==================================================

  const [overallScore, setOverallScore] = useState(0);
  const [technicalScore, setTechnicalScore] = useState(0);
  const [problemSolvingScore, setProblemSolvingScore] =
    useState(0);
  const [communicationScore, setCommunicationScore] =
    useState(0);

  const [skills, setSkills] = useState([]);

  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [interviewCompleted, setInterviewCompleted] =
    useState(false);

  const [totalInterviews, setTotalInterviews] =
    useState(0);

  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // --------------------------------------------------
    // RESUME SKILLS
    // --------------------------------------------------

    const savedSkills =
      localStorage.getItem("extractedSkills");

    if (savedSkills) {
      try {
        const parsedSkills = JSON.parse(savedSkills);

        if (Array.isArray(parsedSkills)) {
          setSkills(
            parsedSkills.map((skill) => {
              if (typeof skill === "string") {
                return {
                  name: skill,
                  score: 0,
                };
              }

              return {
                name:
                  skill.name ||
                  skill.skill ||
                  "Unknown Skill",

                score: Number(
                  skill.score ||
                    skill.percentage ||
                    0
                ),

                weakAreas:
                  skill.weakAreas || [],
              };
            })
          );
        }
      } catch (error) {
        console.error(
          "Unable to load resume skills:",
          error
        );
      }
    }

    // --------------------------------------------------
    // INTERVIEW COMPLETED
    // --------------------------------------------------

    const completed =
      localStorage.getItem(
        "interviewCompleted"
      ) === "true";

    setInterviewCompleted(completed);

    // --------------------------------------------------
    // TOTAL INTERVIEWS
    // --------------------------------------------------

    const oldTotal =
      Number(
        localStorage.getItem(
          "totalInterviews"
        )
      ) || 0;

    setTotalInterviews(oldTotal);

    // --------------------------------------------------
    // INTERVIEW RESULT
    // --------------------------------------------------

    const savedResult =
      localStorage.getItem("interviewResult");

    if (!savedResult) {
      return;
    }

    try {
      const result = JSON.parse(savedResult);

      console.log(
        "Dashboard Interview Result:",
        result
      );

      // ------------------------------------------------
      // OVERALL SCORE
      // ------------------------------------------------

      const overall =
        Number(
          result.overallScore ??
          result.overall ??
          result.score ??
          0
        ) || 0;

      setOverallScore(
        Math.min(Math.max(overall, 0), 100)
      );

      // ------------------------------------------------
      // TECHNICAL
      // ------------------------------------------------

      setTechnicalScore(
        Number(
          result.technicalScore ??
          result.technical ??
          0
        ) || 0
      );

      // ------------------------------------------------
      // PROBLEM SOLVING
      // ------------------------------------------------

      setProblemSolvingScore(
        Number(
          result.problemSolvingScore ??
          result.problemSolving ??
          0
        ) || 0
      );

      // ------------------------------------------------
      // COMMUNICATION
      // ------------------------------------------------

      setCommunicationScore(
        Number(
          result.communicationScore ??
          result.communication ??
          0
        ) || 0
      );

      // ------------------------------------------------
      // STRENGTHS
      // ------------------------------------------------

      if (Array.isArray(result.strengths)) {
        setStrengths(result.strengths);
      }

      // ------------------------------------------------
      // WEAKNESSES
      // ------------------------------------------------

      if (Array.isArray(result.weaknesses)) {
        setWeaknesses(result.weaknesses);
      }

      // ------------------------------------------------
      // RECOMMENDATIONS
      // ------------------------------------------------

      if (
        Array.isArray(
          result.recommendations
        )
      ) {
        setRecommendations(
          result.recommendations
        );
      }

      // ------------------------------------------------
      // SKILL ANALYSIS
      // ------------------------------------------------

      if (Array.isArray(result.skills)) {
        setSkills(
          result.skills.map((skill) => ({
            name:
              skill.name ||
              skill.skill ||
              "Unknown Skill",

            score: Number(
              skill.score ??
              skill.percentage ??
              0
            ),

            weakAreas:
              skill.weakAreas || [],
          }))
        );
      }
    } catch (error) {
      console.error(
        "Unable to parse interview result:",
        error
      );
    }
  };

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigate = (page) => {
    switch (page) {
      case "Dashboard":
        navigate("/dashboard");
        break;

      case "Student Profile":
        navigate("/profile");
        break;

      case "My Resume":
        navigate("/resume");
        break;

      case "Skills":
        navigate("/dashboard");
        break;

      case "Start Interview":
        navigate("/interview-setup");
        break;

      case "Interview History":
        navigate("/result");
        break;

      case "Learning Plan":
              navigate("/learning");
        break;

      case "Logout":
        localStorage.removeItem(
          "isLoggedIn"
        );

        localStorage.removeItem(
          "userName"
        );

        navigate("/login");
        break;

      default:
        navigate("/dashboard");
    }
  };

  // ==================================================
  // SCORE
  // ==================================================

  const score = Math.min(
    Math.max(
      Number(overallScore) || 0,
      0
    ),
    100
  );

  // ==================================================
  // STATUS
  // ==================================================

  const getStatus = (value) => {
    if (value >= 90) return "Outstanding";
    if (value >= 80) return "Excellent";
    if (value >= 70) return "Good";
    if (value >= 60) return "Average";
    if (value > 0) return "Needs Improvement";

    return "Not Evaluated";
  };

  const getScoreClass = (value) => {
    if (value >= 80) return "excellent";
    if (value >= 60) return "good";
    if (value > 0) return "weak";

    return "not-evaluated";
  };

  const status = getStatus(score);

  // ==================================================
  // STRONG / WEAK
  // ==================================================

  const strongSkills = skills.filter(
    (skill) =>
      Number(skill.score) >= 80
  );

  const weakSkills = skills.filter(
    (skill) =>
      Number(skill.score) < 60
  );

  // ==================================================
  // PROGRESS TEXT
  // ==================================================

  const progressText =
    score === 0
      ? "Complete an AI interview to get your performance score."
      : score >= 80
      ? "Excellent performance! Keep improving your weak areas."
      : score >= 60
      ? "Good progress. Focus on your weak skills to improve."
      : "You need more practice. Follow your AI learning plan.";

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="app-layout">

      {/* ================================
          NAVBAR
      ================================= */}

      <Navbar
        userName={userName}
      />

      <div className="main-layout">

        {/* ================================
            SIDEBAR
        ================================= */}

        <Sidebar
          activePage="Dashboard"
          onNavigate={handleNavigate}
          overallScore={score}
          strongSkills={strongSkills.length}
          weakSkills={weakSkills.length}
          interviewCompleted={
            interviewCompleted
          }
        />

        {/* ================================
            DASHBOARD
        ================================= */}

        <main className="page-content">

          <div className="dashboard">

            {/* HEADER */}

            <div className="dashboard-header">

              <div>

                <p className="dashboard-label">
                  AI SKILL ANALYTICS
                </p>

                <h1>
                  Welcome back, {userName} 👋
                </h1>

                <p className="dashboard-description">
                  Track your interview
                  performance, identify weak
                  skills and build a
                  personalized learning plan.
                </p>

              </div>

              <div
                className={`dashboard-status ${getScoreClass(
                  score
                )}`}
              >
                <span>
                  AI Performance
                </span>

                <strong>
                  {Math.round(score)}/100
                </strong>

                <small>
                  {status}
                </small>
              </div>

            </div>

            {/* ================================
                STAT CARDS
            ================================= */}

            <div className="dashboard-stat-grid">

              <div className="dashboard-stat-card primary">

                <div className="stat-icon">
                  🎯
                </div>

                <div>
                  <span>
                    Overall Score
                  </span>

                  <strong>
                    {Math.round(score)}
                    <small>/100</small>
                  </strong>

                  <p>
                    {status}
                  </p>
                </div>

              </div>

              <div className="dashboard-stat-card">

                <div className="stat-icon">
                  💻
                </div>

                <div>
                  <span>
                    Technical Knowledge
                  </span>

                  <strong>
                    {Math.round(
                      technicalScore
                    )}
                    <small>/100</small>
                  </strong>
                </div>

              </div>

              <div className="dashboard-stat-card">

                <div className="stat-icon">
                  🧠
                </div>

                <div>
                  <span>
                    Problem Solving
                  </span>

                  <strong>
                    {Math.round(
                      problemSolvingScore
                    )}
                    <small>/100</small>
                  </strong>
                </div>

              </div>

              <div className="dashboard-stat-card">

                <div className="stat-icon">
                  🗣️
                </div>

                <div>
                  <span>
                    Communication
                  </span>

                  <strong>
                    {Math.round(
                      communicationScore
                    )}
                    <small>/100</small>
                  </strong>
                </div>

              </div>

            </div>

            {/* ================================
                PROGRESS
            ================================= */}

            <div className="dashboard-progress-card">

              <div>

                <h3>
                  🚀 Your AI Progress
                </h3>

                <p>
                  {progressText}
                </p>

              </div>

              <div className="progress-score">

                <strong>
                  {Math.round(score)}%
                </strong>

                <div className="dashboard-progress">

                  <div
                    className="dashboard-progress-fill"
                    style={{
                      width: `${score}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* ================================
                SKILLS
            ================================= */}

            <section className="dashboard-section">

              <div className="section-heading">

                <div>
                  <span>
                    SKILL ANALYSIS
                  </span>

                  <h2>
                    Your Skill Performance
                  </h2>
                </div>

                <button
                  onClick={() =>
                    handleNavigate("Skills")
                  }
                >
                  View All Skills →
                </button>

              </div>

              {skills.length > 0 ? (

                <div className="dashboard-skills">

                  {skills.map(
                    (skill, index) => {

                      const skillScore =
                        Math.min(
                          Math.max(
                            Number(
                              skill.score
                            ) || 0,
                            0
                          ),
                          100
                        );

                      return (
                        <div
                          className="dashboard-skill-card"
                          key={index}
                        >

                          <div className="skill-row">

                            <div className="skill-title">

                              <div className="dashboard-skill-icon">
                                {skill.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}
                              </div>

                              <div>

                                <h3>
                                  {skill.name}
                                </h3>

                                <span
                                  className={`skill-level ${getScoreClass(
                                    skillScore
                                  )}`}
                                >
                                  {getStatus(
                                    skillScore
                                  )}
                                </span>

                              </div>

                            </div>

                            <strong>
                              {Math.round(
                                skillScore
                              )}%
                            </strong>

                          </div>

                          <div className="skill-bar">

                            <div
                              className="skill-bar-fill"
                              style={{
                                width: `${skillScore}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="empty-dashboard-card">

                  <div>
                    🎯
                  </div>

                  <h3>
                    No skill assessment yet
                  </h3>

                  <p>
                    Upload your resume first,
                    then complete your AI
                    interview.
                  </p>

                  <button
                    onClick={() =>
                      handleNavigate(
                        "My Resume"
                      )
                    }
                  >
                    Upload Resume
                  </button>

                </div>

              )}

            </section>

            {/* ================================
                STRONG / WEAK
            ================================= */}

            <div className="dashboard-two-column">

              <section className="analysis-card strong-card">

                <div className="analysis-card-header">

                  <div className="analysis-icon">
                    💪
                  </div>

                  <div>
                    <h3>
                      Strong Skills
                    </h3>

                    <span>
                      {strongSkills.length}
                      {" "}skills performing well
                    </span>
                  </div>

                </div>

                {strongSkills.length > 0 ? (

                  <ul>
                    {strongSkills
                      .slice(0, 5)
                      .map(
                        (skill, index) => (
                          <li key={index}>
                            ✓{" "}
                            <strong>
                              {skill.name}
                            </strong>
                            {" "}
                            {skill.score}%
                          </li>
                        )
                      )}
                  </ul>

                ) : (

                  <p className="analysis-empty">
                    Your strong skills will
                    appear after the AI
                    assessment.
                  </p>

                )}

              </section>

              <section className="analysis-card weak-card">

                <div className="analysis-card-header">

                  <div className="analysis-icon">
                    ⚠️
                  </div>

                  <div>
                    <h3>
                      Weak Skills
                    </h3>

                    <span>
                      Skills that need attention
                    </span>
                  </div>

                </div>

                {weakSkills.length > 0 ? (

                  <ul>
                    {weakSkills
                      .slice(0, 5)
                      .map(
                        (skill, index) => (
                          <li key={index}>
                            !{" "}
                            <strong>
                              {skill.name}
                            </strong>
                            {" "}
                            {skill.score}%
                          </li>
                        )
                      )}
                  </ul>

                ) : (

                  <p className="analysis-empty">
                    No weak skills detected yet.
                  </p>

                )}

              </section>

            </div>

            {/* ================================
                AI INSIGHTS
            ================================= */}

            <div className="dashboard-two-column">

              <section className="insight-card">

                <div className="insight-header">
                  <span>💡</span>
                  <h3>
                    AI Identified Strengths
                  </h3>
                </div>

                {strengths.length > 0 ? (

                  <ul>
                    {strengths
                      .slice(0, 5)
                      .map(
                        (item, index) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}
                  </ul>

                ) : (

                  <p>
                    Complete an interview to
                    receive AI-generated
                    strengths.
                  </p>

                )}

              </section>

              <section className="insight-card">

                <div className="insight-header">
                  <span>🔍</span>
                  <h3>
                    AI Identified Weaknesses
                  </h3>
                </div>

                {weaknesses.length > 0 ? (

                  <ul>
                    {weaknesses
                      .slice(0, 5)
                      .map(
                        (item, index) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}
                  </ul>

                ) : (

                  <p>
                    Your weak areas will be
                    identified after the
                    interview.
                  </p>

                )}

              </section>

            </div>

            {/* ================================
                LEARNING PLAN
            ================================= */}

            <section className="learning-plan-card">

              <div className="learning-plan-header">

                <div>

                  <span>
                    PERSONALIZED AI LEARNING
                  </span>

                  <h2>
                    What You Should Learn Next
                  </h2>

                  <p>
                    Based on your interview
                    performance, these areas
                    should be your priority.
                  </p>

                </div>

                <div className="learning-icon">
                  📚
                </div>

              </div>

              {recommendations.length > 0 ? (

                <div className="recommendation-list">

                  {recommendations
                    .slice(0, 6)
                    .map(
                      (item, index) => (
                        <div
                          className="recommendation-item"
                          key={index}
                        >

                          <div className="recommendation-number">
                            {index + 1}
                          </div>

                          <div>
                            <strong>
                              {item}
                            </strong>

                            <p>
                              Recommended based
                              on your AI
                              assessment.
                            </p>
                          </div>

                          <span>
                            →
                          </span>

                        </div>
                      )
                    )}

                </div>

              ) : (

                <div className="learning-empty">

                  <span>
                    📚
                  </span>

                  <div>
                    <h3>
                      Your learning plan is
                      waiting
                    </h3>

                    <p>
                      Complete an AI interview
                      and Gemini will generate
                      personalized learning
                      recommendations.
                    </p>
                  </div>

                </div>

              )}

              <button
                className="learning-plan-btn"
                onClick={() =>
                  handleNavigate(
                    "Learning Plan"
                  )
                }
              >
                Open Learning Plan →
              </button>

            </section>

            {/* ================================
                INTERVIEW CTA
            ================================= */}

            <section className="dashboard-cta">

              <div className="cta-icon">
                🎤
              </div>

              <div className="cta-content">

                <h2>
                  {interviewCompleted
                    ? "Ready to improve your score?"
                    : "Start your AI skill assessment"}
                </h2>

                <p>
                  {interviewCompleted
                    ? "Take another interview and see how much your performance has improved."
                    : "Answer personalized technical questions generated from your resume skills."}
                </p>

              </div>

              <button
                onClick={() =>
                  handleNavigate(
                    "Start Interview"
                  )
                }
              >
                {interviewCompleted
                  ? "Retake Interview"
                  : "Start AI Interview"}
              </button>

            </section>

            {/* ================================
                FOOTER STATS
            ================================= */}

            <div className="dashboard-footer-stats">

              <div>
                <span>
                  🎤 Interviews Completed
                </span>

                <strong>
                  {totalInterviews}
                </strong>
              </div>

              <div>
                <span>
                  💪 Strong Skills
                </span>

                <strong>
                  {strongSkills.length}
                </strong>
              </div>

              <div>
                <span>
                  ⚠️ Skills To Improve
                </span>

                <strong>
                  {weakSkills.length}
                </strong>
              </div>

              <div>
                <span>
                  📚 Learning Topics
                </span>

                <strong>
                  {recommendations.length}
                </strong>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}

export default Dashboard;