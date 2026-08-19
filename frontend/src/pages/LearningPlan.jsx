import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function LearningPlan() {
  const userName =
    localStorage.getItem("userName") || "Student";

  const getRecommendations = () => {
    try {
      const raw = localStorage.getItem("interviewResult");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Try common fields used in the app
      return parsed.recommendations || parsed.recs || [];
    } catch (err) {
      console.error("Unable to read recommendations:", err);
      return [];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="app-layout">
      <Navbar userName={userName} />

      <div className="main-layout">
        <Sidebar activePage="Dashboard" onNavigate={() => {}} />

        <main className="page-content">
          <div className="page-header">
            <p className="page-label">LEARNING</p>
            <h1>Personalized Learning Plan</h1>
            <p>
              Follow these recommendations generated after your AI interview to
              improve your skills.
            </p>
          </div>

          <section className="learning-plan-page">
            {recommendations && recommendations.length > 0 ? (
              <div className="recommendation-list full">
                {recommendations.map((item, idx) => (
                  <div className="recommendation-item" key={idx}>
                    <div className="recommendation-number">{idx + 1}</div>
                    <div>
                      <strong>{item}</strong>
                      <p>Suggested learning path and resources.</p>
                    </div>
                    <a
                      className="open-resource"
                      href="#"
                      onClick={(e) => e.preventDefault()}
                    >
                      Open →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-dashboard-card">
                <div>📚</div>
                <h3>Your learning plan will appear here.</h3>
                <p>
                  Complete an AI interview to generate personalized learning
                  recommendations.
                </p>
                <button
                  onClick={() => {
                    window.location.href = "/interview-setup";
                  }}
                >
                  Start Interview
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default LearningPlan;
