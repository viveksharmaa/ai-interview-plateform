import React from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SkillCard from "../components/SkillCard";
import Button from "../components/Button";

function Result() {
  const navigate = useNavigate();

  // ==================================================
  // USER DATA
  // ==================================================

  const userName =
    localStorage.getItem("userName") || "Student";

  const role =
    localStorage.getItem("targetRole") ||
    "Software Developer";

  // ==================================================
  // AI RESULT
  // ==================================================
  // Later these values can come directly from Gemini API
  // ==================================================

  const overallScore = 72;

  const technicalScore = 78;

  const problemSolvingScore = 68;

  const communicationScore = 75;

  const readiness = 72;

  // ==================================================
  // INTERVIEW STATISTICS
  // ==================================================

  const totalQuestions = 4;

  const strongAnswers = 3;

  const averageTime = "1:24";

  const completedDate = "Today";

  // ==================================================
  // SKILL ANALYSIS
  // ==================================================

  const skills = [
    {
      skill: "Java",
      score: 81,
      claimedLevel: "Advanced",
      verifiedLevel: "Advanced",

      strengths: [
        "Strong OOP concepts",
        "Good Java fundamentals",
      ],

      weakAreas: [
        "Multithreading",
      ],

      knowledgeGaps: [
        "ExecutorService",
        "Synchronization",
      ],

      topicsToLearn: [
        "Java Concurrency",
        "Thread Pools",
      ],

      priority: "Medium",
    },

    {
      skill: "SQL",
      score: 57,
      claimedLevel: "Advanced",
      verifiedLevel: "Intermediate",

      strengths: [
        "Basic queries",
        "SELECT and filtering",
      ],

      weakAreas: [
        "Complex JOIN queries",
        "Subqueries",
      ],

      knowledgeGaps: [
        "Window Functions",
        "Query Optimization",
        "Indexing",
      ],

      topicsToLearn: [
        "Advanced SQL JOINs",
        "Window Functions",
        "SQL Indexing",
      ],

      priority: "High",
    },

    {
      skill: "DSA",
      score: 64,
      claimedLevel: "Intermediate",
      verifiedLevel: "Intermediate",

      strengths: [
        "Basic problem solving",
        "Array manipulation",
      ],

      weakAreas: [
        "Advanced algorithms",
        "Optimization",
      ],

      knowledgeGaps: [
        "Dynamic Programming",
        "Graph Algorithms",
      ],

      topicsToLearn: [
        "Dynamic Programming",
        "Graph Algorithms",
        "Advanced Binary Search",
      ],

      priority: "High",
    },
  ];

  // ==================================================
  // STRONG AREAS
  // ==================================================

  const strongAreas = [
    "Java fundamentals",
    "Object-oriented programming",
    "Basic problem solving",
    "Core programming concepts",
  ];

  // ==================================================
  // WEAK AREAS
  // ==================================================

  const weakAreas = [
    "Advanced SQL queries",
    "Dynamic Programming",
    "Complex problem solving",
    "Real-world system scenarios",
  ];

  // ==================================================
  // KNOWLEDGE GAPS
  // ==================================================

  const knowledgeGaps = [
    {
      skill: "SQL",
      topics: [
        "Window Functions",
        "Query Optimization",
        "Indexing",
      ],
    },

    {
      skill: "DSA",
      topics: [
        "Dynamic Programming",
        "Graph Algorithms",
      ],
    },

    {
      skill: "Java",
      topics: [
        "Concurrency",
        "ExecutorService",
      ],
    },
  ];

  // ==================================================
  // LEARNING RECOMMENDATIONS
  // ==================================================

  const learningRecommendations = [
    {
      priority: "HIGH",
      title: "Advanced SQL",
      description:
        "Practice JOINs, subqueries, window functions and query optimization.",
      time: "3-5 Days",
    },

    {
      priority: "HIGH",
      title: "Dynamic Programming",
      description:
        "Focus on memoization, tabulation and common DP patterns.",
      time: "5-7 Days",
    },

    {
      priority: "MEDIUM",
      title: "Java Concurrency",
      description:
        "Learn threads, synchronization, ExecutorService and thread pools.",
      time: "3-4 Days",
    },
  ];

  // ==================================================
  // PERFORMANCE STATUS
  // ==================================================

  const getPerformanceStatus = (score) => {
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";

    return "Needs Improvement";
  };

  const performanceStatus =
    getPerformanceStatus(overallScore);

  // ==================================================
  // SCORE CLASS
  // ==================================================

  const getScoreClass = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";

    return "weak";
  };

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigate = (page) => {
    const routes = {
      Dashboard: "/dashboard",
      "Student Profile": "/profile",
      "My Resume": "/resume",
      Skills: "/dashboard",
      "Start Interview": "/interview-setup",
      "Interview History": "/result",
      "Learning Plan": "/dashboard",
      Logout: "/login",
    };

    if (page === "Logout") {
      localStorage.clear();
    }

    navigate(routes[page] || "/dashboard");
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="app-layout">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <Navbar
        userName={userName}
        overallScore={overallScore}
        weakSkills={
          skills.filter(
            (skill) => skill.score < 60
          ).length
        }
        strongSkills={
          skills.filter(
            (skill) => skill.score >= 80
          ).length
        }
        interviewCompleted={true}
        onProfileClick={() => navigate("/profile")}
        onPerformanceClick={() =>
          navigate("/result")
        }
      />


      <div className="main-layout">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <Sidebar
          activePage="Interview History"
          overallScore={overallScore}
          strongSkills={
            skills.filter(
              (skill) => skill.score >= 80
            ).length
          }
          weakSkills={
            skills.filter(
              (skill) => skill.score < 60
            ).length
          }
          interviewCompleted={true}
          onNavigate={handleNavigate}
        />


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="page-content result-page">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="result-hero">

            <div>

              <span className="page-label">
                AI INTERVIEW COMPLETED
              </span>

              <h1>
                Your Interview Results 🎉
              </h1>

              <p>
                Here's your personalized AI
                performance analysis for{" "}
                <strong>{role}</strong>.
              </p>

            </div>


            <div className="result-date-card">

              <span>
                Completed
              </span>

              <strong>
                {completedDate}
              </strong>

            </div>

          </section>


          {/* ==================================================
              OVERALL RESULT
          ================================================== */}

          <section className="result-overview">

            {/* SCORE */}

            <div className="result-main-score">

              <div
                className={`result-score-circle ${getScoreClass(
                  overallScore
                )}`}
              >

                <div>

                  <strong>
                    {overallScore}
                  </strong>

                  <span>
                    /100
                  </span>

                </div>

              </div>


              <span
                className={`result-status ${getScoreClass(
                  overallScore
                )}`}
              >
                {performanceStatus}
              </span>

              <h2>
                {overallScore >= 80
                  ? "You are interview ready!"
                  : "You have a good foundation."}
              </h2>

              <p>
                Your technical foundation is good,
                but improving your weak areas can
                significantly increase your interview
                readiness.
              </p>

            </div>


            {/* METRICS */}

            <div className="result-metrics-grid">

              <div className="result-metric">

                <span>
                  💻 Technical
                </span>

                <strong>
                  {technicalScore}
                  <small>/100</small>
                </strong>

                <div className="metric-bar">

                  <div
                    style={{
                      width: `${technicalScore}%`,
                    }}
                  />

                </div>

              </div>


              <div className="result-metric">

                <span>
                  🧠 Problem Solving
                </span>

                <strong>
                  {problemSolvingScore}
                  <small>/100</small>
                </strong>

                <div className="metric-bar">

                  <div
                    style={{
                      width: `${problemSolvingScore}%`,
                    }}
                  />

                </div>

              </div>


              <div className="result-metric">

                <span>
                  🗣️ Communication
                </span>

                <strong>
                  {communicationScore}
                  <small>/100</small>
                </strong>

                <div className="metric-bar">

                  <div
                    style={{
                      width: `${communicationScore}%`,
                    }}
                  />

                </div>

              </div>


              <div className="result-metric">

                <span>
                  🎯 Interview Readiness
                </span>

                <strong>
                  {readiness}%
                </strong>

                <div className="metric-bar">

                  <div
                    style={{
                      width: `${readiness}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              INTERVIEW STATS
          ================================================== */}

          <section className="interview-stats">

            <div>

              <span>
                Questions
              </span>

              <strong>
                {totalQuestions}
              </strong>

            </div>

            <div>

              <span>
                Strong Answers
              </span>

              <strong>
                {strongAnswers}
              </strong>

            </div>

            <div>

              <span>
                Average Time
              </span>

              <strong>
                {averageTime}
              </strong>

            </div>

            <div>

              <span>
                Readiness
              </span>

              <strong>
                {readiness}%
              </strong>

            </div>

          </section>


          {/* ==================================================
              SKILL VERIFICATION
          ================================================== */}

          <section className="result-section">

            <div className="section-heading">

              <div>

                <span className="page-label">
                  AI SKILL VERIFICATION
                </span>

                <h2>
                  Resume vs Interview Performance
                </h2>

                <p>
                  See how your actual interview
                  performance compares with the
                  skills claimed on your resume.
                </p>

              </div>

              <div className="skill-summary-badge">

                <strong>
                  {skills.length}
                </strong>

                <span>
                  Skills Assessed
                </span>

              </div>

            </div>


            <div className="skills-grid">

              {skills.map((skill) => (

                <SkillCard
                  key={skill.skill}

                  skill={skill.skill}

                  score={skill.score}

                  claimedLevel={
                    skill.claimedLevel
                  }

                  verifiedLevel={
                    skill.verifiedLevel
                  }

                  strengths={
                    skill.strengths
                  }

                  weakAreas={
                    skill.weakAreas
                  }

                  knowledgeGaps={
                    skill.knowledgeGaps
                  }

                  topicsToLearn={
                    skill.topicsToLearn
                  }

                  priority={
                    skill.priority
                  }
                />

              ))}

            </div>

          </section>


          {/* ==================================================
              STRONG + WEAK
          ================================================== */}

          <section className="feedback-grid">


            {/* STRONG */}

            <div className="feedback-card strong-card">

              <div className="feedback-header">

                <div className="feedback-icon">
                  💪
                </div>

                <div>

                  <span>
                    WHAT YOU DO WELL
                  </span>

                  <h3>
                    Strong Areas
                  </h3>

                </div>

              </div>


              <ul>

                {strongAreas.map(
                  (item, index) => (

                    <li key={index}>

                      <span>
                        ✓
                      </span>

                      {item}

                    </li>

                  )
                )}

              </ul>

            </div>


            {/* WEAK */}

            <div className="feedback-card weak-card">

              <div className="feedback-header">

                <div className="feedback-icon">
                  ⚠️
                </div>

                <div>

                  <span>
                    NEEDS ATTENTION
                  </span>

                  <h3>
                    Weak Areas
                  </h3>

                </div>

              </div>


              <ul>

                {weakAreas.map(
                  (item, index) => (

                    <li key={index}>

                      <span>
                        !
                      </span>

                      {item}

                    </li>

                  )
                )}

              </ul>

            </div>

          </section>


          {/* ==================================================
              KNOWLEDGE GAPS
          ================================================== */}

          <section className="knowledge-gap-section">

            <div className="section-heading">

              <div>

                <span className="page-label">
                  AI KNOWLEDGE ANALYSIS
                </span>

                <h2>
                  Knowledge Gaps
                </h2>

                <p>
                  These are the concepts you should
                  strengthen based on your interview.
                </p>

              </div>

            </div>


            <div className="knowledge-gap-grid">

              {knowledgeGaps.map(
                (item, index) => (

                  <div
                    className="knowledge-gap-card"
                    key={index}
                  >

                    <div className="knowledge-gap-title">

                      <div>
                        📚
                      </div>

                      <h3>
                        {item.skill}
                      </h3>

                    </div>


                    <div className="knowledge-tags">

                      {item.topics.map(
                        (topic, topicIndex) => (

                          <span key={topicIndex}>
                            {topic}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* ==================================================
              LEARNING PLAN
          ================================================== */}

          <section className="learning-section">

            <div className="learning-section-header">

              <div>

                <span className="page-label">
                  PERSONALIZED LEARNING PLAN
                </span>

                <h2>
                  What You Should Learn Next 🚀
                </h2>

                <p>
                  Your learning priorities are based
                  on your AI interview performance.
                </p>

              </div>

              <div className="learning-icon">
                📚
              </div>

            </div>


            <div className="learning-list">

              {learningRecommendations.map(
                (item, index) => (

                  <div
                    className="learning-item"
                    key={index}
                  >

                    <div className="learning-number">
                      {index + 1}
                    </div>


                    <div className="learning-content">

                      <div className="learning-title">

                        <h3>
                          {item.title}
                        </h3>

                        <span
                          className={`priority-${item.priority.toLowerCase()}`}
                        >
                          {item.priority}
                        </span>

                      </div>

                      <p>
                        {item.description}
                      </p>

                    </div>


                    <div className="learning-time">

                      <span>
                        Estimated
                      </span>

                      <strong>
                        {item.time}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>


            <button
              className="learning-plan-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Open Full Learning Plan →
            </button>

          </section>


          {/* ==================================================
              AI SUMMARY
          ================================================== */}

          <section className="ai-summary-card">

            <div className="ai-summary-icon">
              🤖
            </div>

            <div>

              <span>
                AI INTERVIEWER SUMMARY
              </span>

              <h2>
                Your current interview readiness
              </h2>

              <p>
                You demonstrate a good foundation
                in Java and core programming concepts.
                Your biggest improvement opportunities
                are advanced SQL, Dynamic Programming
                and real-world problem solving.
                Focus on these areas before your next
                interview attempt.
              </p>

            </div>

          </section>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <section className="result-action-card">

            <div>

              <span className="page-label">
                NEXT STEP
              </span>

              <h2>
                Ready to improve your score?
              </h2>

              <p>
                Practice your weak areas and take
                another AI interview to measure your
                improvement.
              </p>

            </div>


            <div className="action-buttons">

              <Button
                variant="secondary"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                View Dashboard
              </Button>


              <Button
                onClick={() =>
                  navigate(
                    "/interview-setup"
                  )
                }
              >
                🎤 Take Another Interview
              </Button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Result;