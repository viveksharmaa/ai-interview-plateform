import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

// ==================================================
// EMPTY PROFILE
// ==================================================

const emptyProfile = {
  fullName: "",
  email: "",
  phone: "",
  college: "",
  branch: "",
  graduationYear: "",
  targetRole: "",
  currentGoal: "",
  bio: "",
  skillFocus: "",
  strengths: "",
  learningPlan: "",
};

// ==================================================
// SAFE JSON PARSER
// ==================================================

const getJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(`Unable to parse localStorage key: ${key}`, error);
    return fallback;
  }
};

// ==================================================
// PROFILE COMPONENT
// ==================================================

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(emptyProfile);

  const [overallScore, setOverallScore] = useState(0);

  const [skillCount, setSkillCount] = useState(0);

  const [baselineScore, setBaselineScore] = useState(45);

  const [saveState, setSaveState] = useState({
    type: "",
    message: "",
  });

  // ==================================================
  // LOAD PROFILE DATA
  // ==================================================

  const loadProfileData = useCallback(() => {
    const savedProfile = getJSON("studentProfile", {});

    const savedName =
      localStorage.getItem("userName") || "";

    const savedEmail =
      localStorage.getItem("userEmail") || "";

    // -----------------------------------------------
    // INTERVIEW RESULT
    // -----------------------------------------------

    const interviewResult = getJSON(
      "interviewResult",
      {}
    );

    const score = Number(
      interviewResult?.overallScore ??
        interviewResult?.overall ??
        interviewResult?.score ??
        interviewResult?.result?.overallScore ??
        0
    );

    setOverallScore(
      Number.isFinite(score) ? score : 0
    );

    // -----------------------------------------------
    // RESUME SKILLS
    // -----------------------------------------------

    const extractedSkills =
      getJSON("extractedSkills", []);

    if (Array.isArray(extractedSkills)) {
      setSkillCount(
        extractedSkills.filter(Boolean).length
      );
    } else {
      setSkillCount(0);
    }

    // -----------------------------------------------
    // BASELINE
    // -----------------------------------------------

    const storedBaseline = Number(
      localStorage.getItem(
        "studentProfileBaseline"
      ) || "45"
    );

    setBaselineScore(
      Number.isFinite(storedBaseline)
        ? storedBaseline
        : 45
    );

    // -----------------------------------------------
    // PROFILE
    // -----------------------------------------------

    setProfile({
      ...emptyProfile,

      fullName:
        savedName || "Student",

      email:
        savedEmail,

      ...savedProfile,
    });
  }, []);

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // ==================================================
  // REFRESH PROFILE WHEN PAGE GETS FOCUS
  // ==================================================

  useEffect(() => {
    const handleFocus = () => {
      loadProfileData();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadProfileData]);

  // ==================================================
  // REFRESH WHEN LOCAL STORAGE CHANGES
  // ==================================================

  useEffect(() => {
    const handleStorageChange = () => {
      loadProfileData();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [loadProfileData]);

  // ==================================================
  // IMPROVEMENT SCORE
  // ==================================================

  const improvementScore = Math.max(
    overallScore - baselineScore,
    0
  );

  // ==================================================
  // PROFILE COMPLETION
  // ==================================================

  const profileValues = Object.values(profile);

  const filledFields =
    profileValues.filter((value) => {
      if (
        typeof value === "string"
      ) {
        return value.trim().length > 0;
      }

      return Boolean(value);
    }).length;

  const profileCompletion = Math.min(
    100,
    Math.round(
      (filledFields /
        Object.keys(emptyProfile).length) *
        100
    )
  );

  // ==================================================
  // READINESS SCORE
  // ==================================================

  const readinessScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (overallScore +
          Math.min(skillCount * 6, 30)) /
          1.3
      )
    )
  );

  // ==================================================
  // HANDLE INPUT CHANGE
  // ==================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaveState({
      type: "",
      message: "",
    });
  };

  // ==================================================
  // SAVE PROFILE
  // ==================================================

  const handleSave = (event) => {
    event.preventDefault();

    const nextProfile = {
      ...profile,

      fullName:
        profile.fullName.trim() ||
        "Student",

      email:
        profile.email.trim(),
    };

    // -----------------------------------------------
    // SAVE COMPLETE PROFILE
    // -----------------------------------------------

    localStorage.setItem(
      "studentProfile",
      JSON.stringify(nextProfile)
    );

    // -----------------------------------------------
    // SAVE USER NAME
    // -----------------------------------------------

    localStorage.setItem(
      "userName",
      nextProfile.fullName
    );

    // -----------------------------------------------
    // SAVE EMAIL
    // -----------------------------------------------

    if (nextProfile.email) {
      localStorage.setItem(
        "userEmail",
        nextProfile.email
      );
    }

    // -----------------------------------------------
    // SAVE TARGET ROLE
    // -----------------------------------------------

    if (nextProfile.targetRole) {
      localStorage.setItem(
        "targetRole",
        nextProfile.targetRole
      );
    }

    // -----------------------------------------------
    // SAVE BASELINE
    // -----------------------------------------------

    if (overallScore > 0) {
      const newBaseline = Math.max(
        25,
        Math.min(
          60,
          overallScore - 15
        )
      );

      localStorage.setItem(
        "studentProfileBaseline",
        String(newBaseline)
      );

      setBaselineScore(newBaseline);
    }

    // -----------------------------------------------
    // UPDATE STATE
    // -----------------------------------------------

    setProfile(nextProfile);

    setSaveState({
      type: "success",
      message:
        "Student profile saved successfully.",
    });
  };

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigate = (page) => {
    const routes = {
      Dashboard: "/dashboard",

      "Student Profile":
        "/profile",

      "My Resume":
        "/resume",

      Skills:
        "/dashboard",

      "Start Interview":
        "/interview-setup",

      "Interview History":
        "/result",

      "Learning Plan":
        "/dashboard",

      Logout:
        "/login",
    };

    // -----------------------------------------------
    // LOGOUT
    // -----------------------------------------------

    if (page === "Logout") {
      localStorage.clear();

      navigate("/login");

      return;
    }

    navigate(
      routes[page] ||
        "/dashboard"
    );
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
        userName={
          profile.fullName ||
          "Student"
        }
      />

      <div className="main-layout">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <Sidebar
          activePage="Student Profile"
          onNavigate={handleNavigate}

          overallScore={
            overallScore
          }

          strongSkills={Math.max(
            0,
            Math.min(
              10,
              skillCount
            )
          )}

          weakSkills={Math.max(
            0,
            Math.min(
              6,
              Math.max(
                0,
                8 - skillCount
              )
            )
          )}

          interviewCompleted={
            overallScore > 0
          }
        />

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="page-content">

          <div className="profile-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="page-header profile-header">

              <div>

                <p className="page-label">
                  STUDENT PROFILE
                </p>

                <h1>
                  Build your personal
                  skill profile
                </h1>

                <p>
                  Track your growth,
                  update your details,
                  and see how much your
                  skills have improved
                  with AI-based interview
                  practice.
                </p>

              </div>

              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                Back to Dashboard
              </Button>

            </div>

            {/* ==================================================
                PROFILE STATS
            ================================================== */}

            <div className="profile-overview">

              {/* PROFILE COMPLETION */}

              <div className="profile-stat-card primary">

                <div className="profile-stat-icon">
                  🎯
                </div>

                <div>

                  <span>
                    Profile Completion
                  </span>

                  <strong>
                    {profileCompletion}%
                  </strong>

                </div>

              </div>

              {/* SKILLS */}

              <div className="profile-stat-card">

                <div className="profile-stat-icon">
                  💼
                </div>

                <div>

                  <span>
                    Skills Detected
                  </span>

                  <strong>
                    {skillCount}
                  </strong>

                </div>

              </div>

              {/* IMPROVEMENT */}

              <div className="profile-stat-card">

                <div className="profile-stat-icon">
                  📈
                </div>

                <div>

                  <span>
                    Skill Improvement
                  </span>

                  <strong>
                    +
                    {improvementScore.toFixed(
                      0
                    )}{" "}
                    pts
                  </strong>

                </div>

              </div>

              {/* READINESS */}

              <div className="profile-stat-card">

                <div className="profile-stat-icon">
                  ✅
                </div>

                <div>

                  <span>
                    Readiness
                  </span>

                  <strong>
                    {readinessScore}%
                  </strong>

                </div>

              </div>

            </div>

            {/* ==================================================
                MAIN GRID
            ================================================== */}

            <div className="profile-main-grid">

              {/* ==================================================
                  PROFILE FORM
              ================================================== */}

              <form
                className="profile-form-card"
                onSubmit={
                  handleSave
                }
              >

                {/* CARD HEADER */}

                <div className="profile-card-header">

                  <div>

                    <p className="page-label">
                      PROFILE FORM
                    </p>

                    <h2>
                      Student Information
                    </h2>

                  </div>

                  <span className="profile-pill">
                    Auto-filled
                  </span>

                </div>

                <div className="profile-form-grid">

                  {/* FULL NAME */}

                  <div className="form-group">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={
                        profile.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Student name"
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="form-group">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        profile.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="student@example.com"
                    />

                  </div>

                  {/* PHONE */}

                  <div className="form-group">

                    <label>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        profile.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="+91 98765 43210"
                    />

                  </div>

                  {/* GRADUATION YEAR */}

                  <div className="form-group">

                    <label>
                      Graduation Year
                    </label>

                    <input
                      type="text"
                      name="graduationYear"
                      value={
                        profile.graduationYear
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="2026"
                    />

                  </div>

                  {/* COLLEGE */}

                  <div className="form-group">

                    <label>
                      College / University
                    </label>

                    <input
                      type="text"
                      name="college"
                      value={
                        profile.college
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="ABC Institute"
                    />

                  </div>

                  {/* BRANCH */}

                  <div className="form-group">

                    <label>
                      Branch
                    </label>

                    <input
                      type="text"
                      name="branch"
                      value={
                        profile.branch
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="CSE / IT / ECE"
                    />

                  </div>

                  {/* TARGET ROLE */}

                  <div className="form-group full-width">

                    <label>
                      Target Role
                    </label>

                    <input
                      type="text"
                      name="targetRole"
                      value={
                        profile.targetRole
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Software Developer / Data Analyst"
                    />

                  </div>

                  {/* CURRENT GOAL */}

                  <div className="form-group full-width">

                    <label>
                      Current Goal
                    </label>

                    <input
                      type="text"
                      name="currentGoal"
                      value={
                        profile.currentGoal
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Get placed in a product-based company"
                    />

                  </div>

                  {/* SKILL FOCUS */}

                  <div className="form-group full-width">

                    <label>
                      Skill Focus
                    </label>

                    <input
                      type="text"
                      name="skillFocus"
                      value={
                        profile.skillFocus
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="DSA, Java, React, SQL"
                    />

                  </div>

                  {/* BIO */}

                  <div className="form-group full-width">

                    <label>
                      Short Bio
                    </label>

                    <textarea
                      name="bio"
                      value={
                        profile.bio
                      }
                      onChange={
                        handleChange
                      }
                      rows="4"
                      placeholder="Share a short summary of your academic journey and career focus."
                    />

                  </div>

                  {/* STRENGTHS */}

                  <div className="form-group full-width">

                    <label>
                      Strengths
                    </label>

                    <textarea
                      name="strengths"
                      value={
                        profile.strengths
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="Problem solving, communication, teamwork..."
                    />

                  </div>

                  {/* LEARNING PLAN */}

                  <div className="form-group full-width">

                    <label>
                      Learning Plan
                    </label>

                    <textarea
                      name="learningPlan"
                      value={
                        profile.learningPlan
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="What do you want to improve next?"
                    />

                  </div>

                </div>

                {/* SAVE MESSAGE */}

                {saveState.message && (

                  <div
                    className={`profile-save ${saveState.type}`}
                  >
                    {saveState.message}
                  </div>

                )}

                {/* SAVE BUTTON */}

                <div className="profile-form-actions">

                  <Button type="submit">
                    Save Profile
                  </Button>

                </div>

              </form>

              {/* ==================================================
                  RIGHT SUMMARY
              ================================================== */}

              <aside className="profile-summary-card">

                {/* HEADER */}

                <div className="profile-card-header">

                  <div>

                    <p className="page-label">
                      GROWTH OVERVIEW
                    </p>

                    <h2>
                      Skill Improvement
                    </h2>

                  </div>

                </div>

                {/* CURRENT PERFORMANCE */}

                <div className="profile-meter-block">

                  <div className="profile-meter-row">

                    <span>
                      Current performance
                    </span>

                    <strong>
                      {overallScore.toFixed(
                        0
                      )}%
                    </strong>

                  </div>

                  <div className="profile-meter">

                    <div
                      className="profile-meter-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          overallScore
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                {/* IMPROVEMENT */}

                <div className="profile-meter-block">

                  <div className="profile-meter-row">

                    <span>
                      Improvement from baseline
                    </span>

                    <strong>
                      +
                      {improvementScore.toFixed(
                        0
                      )}{" "}
                      pts
                    </strong>

                  </div>

                  <div className="profile-meter improvement">

                    <div
                      className="profile-meter-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          improvementScore
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                {/* STUDENT DETAILS */}

                <div className="profile-mini-grid">

                  <div>

                    <span>
                      Student
                    </span>

                    <strong>
                      {profile.fullName ||
                        "Student"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Branch
                    </span>

                    <strong>
                      {profile.branch ||
                        "Not added"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      College
                    </span>

                    <strong>
                      {profile.college ||
                        "Not added"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Target Role
                    </span>

                    <strong>
                      {profile.targetRole ||
                        localStorage.getItem(
                          "targetRole"
                        ) ||
                        "Open"}
                    </strong>

                  </div>

                </div>

                {/* CURRENT INSIGHT */}

                <div className="profile-insight-box">

                  <h3>
                    Current insight
                  </h3>

                  <p>

                    {overallScore > 0
                      ? `You are improving steadily. Your current interview score is ${overallScore.toFixed(
                          0
                        )}%. Continue practicing your weak skills to improve interview readiness.`
                      : skillCount > 0
                      ? `Your resume has ${skillCount} detected skill${
                          skillCount === 1
                            ? ""
                            : "s"
                        }. Start an AI interview to measure your current performance.`
                      : "Upload your resume and complete your first AI interview to generate a complete improvement profile."}

                  </p>

                </div>

              </aside>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Profile;