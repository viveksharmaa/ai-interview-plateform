import React from "react";

function SkillCard({
  skill = "Java",
  score = 8.2,
  claimedLevel = "Advanced",
  verifiedLevel = "Intermediate",

  // AI Analysis
  strengths = [],
  weakAreas = [],
  knowledgeGaps = [],
  topicsToLearn = [],
  priority = "Medium",
}) {
  // -----------------------------------------------
  // SCORE
  // -----------------------------------------------

  const numericScore = Number(score) || 0;

  const percentage =
    numericScore <= 10
      ? Math.min(Math.max(numericScore * 10, 0), 100)
      : Math.min(Math.max(numericScore, 0), 100);

  // -----------------------------------------------
  // STATUS
  // -----------------------------------------------

  let status = "Needs Improvement";

  if (percentage >= 80) {
    status = "Strong";
  } else if (percentage >= 60) {
    status = "Good";
  }

  // -----------------------------------------------
  // PRIORITY
  // -----------------------------------------------

  const priorityClass = priority
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div className="skill-card">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="skill-card-top">

        <div className="skill-icon">
          {skill.charAt(0).toUpperCase()}
        </div>

        <div className="skill-name-section">

          <h3>{skill}</h3>

          <span
            className={`skill-status ${
              status === "Strong"
                ? "strong"
                : status === "Good"
                ? "good"
                : "weak"
            }`}
          >
            {status}
          </span>

        </div>

        <div className="skill-score">

          <strong>
            {Math.round(percentage)}
          </strong>

          <span>/100</span>

        </div>

      </div>


      {/* ==========================================
          PERFORMANCE BAR
      ========================================== */}

      <div className="skill-progress-container">

        <div className="skill-progress">

          <div
            className="skill-progress-fill"
            style={{
              width: `${percentage}%`,
            }}
          ></div>

        </div>

        <span>
          {Math.round(percentage)}%
        </span>

      </div>


      {/* ==========================================
          LEVEL DETAILS
      ========================================== */}

      <div className="skill-details">

        <div>
          <span>Resume Claim</span>
          <strong>{claimedLevel}</strong>
        </div>

        <div>
          <span>AI Verified Level</span>
          <strong>{verifiedLevel}</strong>
        </div>

      </div>


      {/* ==========================================
          CLAIM WARNING
      ========================================== */}

      {claimedLevel &&
        verifiedLevel &&
        claimedLevel.toLowerCase() !==
          verifiedLevel.toLowerCase() && (

        <div className="skill-warning">
          ⚠️ Resume claim and interview assessment differ.
        </div>

      )}


      {/* ==========================================
          STRENGTHS
      ========================================== */}

      {strengths.length > 0 && (

        <div className="skill-analysis-section">

          <h4>💪 Strong Areas</h4>

          <ul>
            {strengths.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

        </div>

      )}


      {/* ==========================================
          WEAK AREAS
      ========================================== */}

      {weakAreas.length > 0 && (

        <div className="skill-analysis-section">

          <h4>⚠️ Weak Areas</h4>

          <ul>
            {weakAreas.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

        </div>

      )}


      {/* ==========================================
          KNOWLEDGE GAPS
      ========================================== */}

      {knowledgeGaps.length > 0 && (

        <div className="skill-analysis-section">

          <h4>📚 Knowledge Gaps</h4>

          <ul>
            {knowledgeGaps.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

        </div>

      )}


      {/* ==========================================
          WHAT TO LEARN
      ========================================== */}

      {topicsToLearn.length > 0 && (

        <div className="skill-learning-section">

          <h4>🎯 Recommended Learning</h4>

          <ul>
            {topicsToLearn.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

        </div>

      )}


      {/* ==========================================
          PRIORITY
      ========================================== */}

      <div
        className={`skill-priority ${priorityClass}`}
      >

        <span>Learning Priority</span>

        <strong>
          {priority}
        </strong>

      </div>

    </div>
  );
}

export default SkillCard;