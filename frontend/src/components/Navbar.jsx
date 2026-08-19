import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar({
  userName = "Student",
  onProfileClick,
  onNotificationClick,

  // Performance data
  overallScore = 0,
  weakSkills = 0,
  interviewCompleted = false,
}) {
  const navigate = useNavigate();
  // -----------------------------------------------
  // PERFORMANCE STATUS
  // -----------------------------------------------

  const getPerformanceStatus = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score > 0) return "Needs Improvement";

    return "Not Evaluated";
  };

  const performanceStatus =
    getPerformanceStatus(overallScore);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
      return;
    }

    navigate("/profile");
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
      return;
    }

    window.alert(
      weakSkills > 0
        ? `${weakSkills} skill improvement alert(s) need attention.`
        : "You have no new notifications."
    );
  };

  // -----------------------------------------------
  // SCORE CLASS
  // -----------------------------------------------

  const getScoreClass = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score > 0) return "weak";

    return "not-evaluated";
  };

  return (
    <header className="navbar">

      {/* ==========================================
          LEFT
      ========================================== */}

      <div className="navbar-left">

        <div className="navbar-logo">
          AI
        </div>

        <div>
          <h2 className="navbar-title">
            SkillVerify AI
          </h2>

          <p className="navbar-subtitle">
            AI Interview & Skill Assessment
          </p>
        </div>

      </div>


      {/* ==========================================
          RIGHT
      ========================================== */}

      <div className="navbar-right">


        {/* ========================================
            PERFORMANCE
        ======================================== */}

        {interviewCompleted && (

          <button
            className="navbar-performance"
            onClick={() =>
              onProfileClick &&
              onProfileClick("Performance")
            }
            title="View your interview performance"
          >

            <div className="navbar-performance-icon">
              📊
            </div>

            <div className="navbar-performance-info">

              <span>
                Performance
              </span>

              <strong
                className={`navbar-score ${getScoreClass(
                  overallScore
                )}`}
              >
                {overallScore}/100
              </strong>

            </div>

          </button>

        )}


        {/* ========================================
            NOTIFICATION
        ======================================== */}

        <button
          className="notification-btn"
          title={
            weakSkills > 0
              ? `${weakSkills} skill(s) need improvement`
              : "Notifications"
          }
          onClick={handleNotificationClick}
        >

          🔔

          {weakSkills > 0 && (
            <span className="notification-dot"></span>
          )}

        </button>


        {/* ========================================
            PROFILE
        ======================================== */}

        <button
          className="profile-btn"
          onClick={handleProfileClick}
        >

          <div className="profile-avatar">

            {userName
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="profile-info">

            <span className="profile-name">
              {userName}
            </span>

            <span className="profile-role">

              {interviewCompleted
                ? performanceStatus
                : "Student"}

            </span>

          </div>


          <span className="profile-arrow">
            ⌄
          </span>

        </button>

      </div>

    </header>
  );
}

export default Navbar;