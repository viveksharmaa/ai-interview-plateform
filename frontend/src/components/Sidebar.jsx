import React from "react";

function Sidebar({
  activePage = "Dashboard",
  onNavigate,

  // Performance data
  overallScore = 0,
  strongSkills = 0,
  weakSkills = 0,
  interviewCompleted = false,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "Student Profile",
      icon: "👤",
    },
    {
      name: "My Resume",
      icon: "📄",
    },
    {
      name: "Start Interview",
      icon: "🎤",
    },
    {
      name: "Interview History",
      icon: "🕘",
    },
  ];

  // -----------------------------------------------
  // SCORE STATUS
  // -----------------------------------------------

  const getPerformanceStatus = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score > 0) return "Needs Improvement";

    return "Not Evaluated";
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score > 0) return "weak";

    return "not-evaluated";
  };

  const safeScore = Math.min(
    Math.max(Number(overallScore) || 0, 0),
    100
  );

  const performanceStatus = getPerformanceStatus(safeScore);

  return (
    <aside className="sidebar">

      {/* ==========================================
          MENU
      ========================================== */}

      <div className="sidebar-menu">

        <p className="sidebar-heading">
          MENU
        </p>

        {menuItems.map((item) => (
          <button
            key={item.name}
            type="button"
            className={`sidebar-item ${
              activePage === item.name ? "active" : ""
            }`}
            onClick={() =>
              onNavigate && onNavigate(item.name)
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span className="sidebar-item-text">
              {item.name}
            </span>
          </button>
        ))}

      </div>

      {/* ==========================================
          BOTTOM SECTION
      ========================================== */}

      <div className="sidebar-bottom">

        {/* ========================================
            PERFORMANCE CARD
        ======================================== */}

        <div className="performance-card">

          {/* Header */}

          <div className="performance-header">

            <div className="performance-icon">
              📊
            </div>

            <div className="performance-title">

              <h3>
                Your Performance
              </h3>

              <span
                className={`performance-status ${getScoreClass(
                  safeScore
                )}`}
              >
                {performanceStatus}
              </span>

            </div>

          </div>

          {/* Score */}

          <div className="performance-score">

            <strong>
              {Math.round(safeScore)}
            </strong>

            <span>
              /100
            </span>

          </div>

          {/* Progress */}

          <div className="performance-progress">

            <div className="performance-progress-bar">

              <div
                className={`performance-progress-fill ${getScoreClass(
                  safeScore
                )}`}
                style={{
                  width: `${safeScore}%`,
                }}
              />

            </div>

          </div>

          {/* Skill Summary */}

          <div className="performance-summary">

            <div className="skill-box">

              <span>
                💪 Strong
              </span>

              <strong>
                {strongSkills}
              </strong>

            </div>

            <div className="skill-box">

              <span>
                ⚠️ Weak
              </span>

              <strong>
                {weakSkills}
              </strong>

            </div>

          </div>

          {/* Action */}

          <button
            type="button"
            className="performance-btn"
            onClick={() => {
              if (interviewCompleted) {
                onNavigate && onNavigate("Skills");
              } else {
                onNavigate && onNavigate("Start Interview");
              }
            }}
          >
            {interviewCompleted
              ? "View Skill Analysis"
              : "Start AI Interview"}
          </button>

        </div>

        {/* ========================================
            LOGOUT
        ======================================== */}

        <button
          type="button"
          className="sidebar-item logout"
          onClick={() =>
            onNavigate && onNavigate("Logout")
          }
        >
          <span className="sidebar-icon">
            ↪
          </span>

          <span className="sidebar-item-text">
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;