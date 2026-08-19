import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

function InterviewSetup() {
  const navigate = useNavigate();

  // ==========================================
  // USER
  // ==========================================

  const userName =
    localStorage.getItem("userName") || "Student";


  // ==========================================
  // FORM STATE
  // ==========================================

  const [role, setRole] = useState(
    "Software Developer"
  );

  const [experience, setExperience] =
    useState("Fresher");

  const [mode, setMode] =
    useState("Technical");

  const [difficulty, setDifficulty] =
    useState("Adaptive");

  const [duration, setDuration] =
    useState("20");

  const [questionCount, setQuestionCount] =
    useState("10");

  const [followUp, setFollowUp] =
    useState(true);

  const [avoidRepeat, setAvoidRepeat] =
    useState(true);

  const [selectedSkills, setSelectedSkills] =
    useState([]);

  const [focusAreas, setFocusAreas] =
    useState([]);

  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // RESUME SKILLS
  // ==========================================

  const resumeSkills = useMemo(() => {
    try {
      const savedSkills =
        localStorage.getItem(
          "extractedSkills"
        );

      if (!savedSkills) return [];

      const parsed =
        JSON.parse(savedSkills);

      return parsed.map((skill) => {
        if (typeof skill === "string") {
          return skill;
        }

        return skill.name;
      });
    } catch {
      return [];
    }
  }, []);


  // ==========================================
  // DEFAULT SKILLS
  // ==========================================

  useEffect(() => {
    if (
      resumeSkills.length > 0 &&
      selectedSkills.length === 0
    ) {
      setSelectedSkills(
        resumeSkills.slice(0, 5)
      );
    }
  }, [
    resumeSkills,
    selectedSkills.length,
  ]);


  // ==========================================
  // FOCUS AREAS
  // ==========================================

  const availableFocusAreas = [
    "Problem Solving",
    "Data Structures",
    "Algorithms",
    "System Design",
    "Coding",
    "Database",
    "APIs",
    "Debugging",
    "Projects",
    "Communication",
    "Behavioral",
  ];


  // ==========================================
  // SKILL TOGGLE
  // ==========================================

  const toggleSkill = (skill) => {
    setSelectedSkills((previous) => {
      if (previous.includes(skill)) {
        return previous.filter(
          (item) => item !== skill
        );
      }

      return [
        ...previous,
        skill,
      ];
    });
  };


  // ==========================================
  // FOCUS TOGGLE
  // ==========================================

  const toggleFocus = (area) => {
    setFocusAreas((previous) => {
      if (previous.includes(area)) {
        return previous.filter(
          (item) => item !== area
        );
      }

      return [
        ...previous,
        area,
      ];
    });
  };


  // ==========================================
  // START INTERVIEW
  // ==========================================

  const handleStart = () => {
    if (selectedSkills.length === 0) {
      alert(
        "Please select at least one skill for the AI interview."
      );

      return;
    }

    setLoading(true);


    const interviewConfig = {
      role,
      experience,
      mode,
      difficulty,
      duration: Number(duration),
      questionCount: Number(
        questionCount
      ),
      skills: selectedSkills,
      focusAreas,
      followUp,
      avoidRepeat,

      createdAt:
        new Date().toISOString(),
    };


    // Save complete interview configuration

    localStorage.setItem(
      "interviewConfig",
      JSON.stringify(
        interviewConfig
      )
    );


    // Backward compatibility

    localStorage.setItem(
      "targetRole",
      role
    );

    localStorage.setItem(
      "interviewExperience",
      experience
    );

    localStorage.setItem(
      "interviewMode",
      mode
    );

    localStorage.setItem(
      "interviewDuration",
      duration
    );


    setTimeout(() => {
      navigate("/interview");
    }, 500);
  };


  // ==========================================
  // SIDEBAR
  // ==========================================

  const handleNavigate = (page) => {
    const routes = {
      Dashboard: "/dashboard",

      "Student Profile": "/profile",

      "My Resume": "/resume",

      Skills: "/dashboard",

      "Start Interview":
        "/interview-setup",

      "Interview History":
        "/result",

      "Learning Plan":
        "/dashboard",

      Logout: "/login",
    };


    if (page === "Logout") {
      localStorage.clear();
    }


    navigate(
      routes[page] || "/dashboard"
    );
  };


  return (
    <div className="app-layout">

      <Navbar userName={userName} />


      <div className="main-layout">

        <Sidebar
          activePage="Start Interview"
          onNavigate={handleNavigate}
        />


        <main className="page-content">

          {/* =================================
              HEADER
          ================================= */}

          <div className="page-header">

            <p className="page-label">
              AI INTERVIEW
            </p>

            <h1>
              Configure Your Interview
            </h1>

            <p>
              Customize your interview.
              AI will generate questions
              based on your resume, skills
              and selected preferences.
            </p>

          </div>


          <div className="advanced-interview-layout">


            {/* =================================
                MAIN FORM
            ================================= */}

            <div className="setup-card">


              {/* ================================
                  TARGET ROLE
              ================================= */}

              <div className="setup-section">

                <label>
                  Target Job Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >

                  <option>
                    Software Developer
                  </option>

                  <option>
                    Frontend Developer
                  </option>

                  <option>
                    Backend Developer
                  </option>

                  <option>
                    Full Stack Developer
                  </option>

                  <option>
                    React Developer
                  </option>

                  <option>
                    Node.js Developer
                  </option>

                  <option>
                    Data Analyst
                  </option>

                  <option>
                    Data Scientist
                  </option>

                  <option>
                    DevOps Engineer
                  </option>

                  <option>
                    AI / ML Engineer
                  </option>

                </select>

              </div>


              {/* ================================
                  EXPERIENCE
              ================================= */}

              <div className="setup-section">

                <label>
                  Experience Level
                </label>

                <div className="option-grid">

                  {[
                    {
                      value: "Fresher",
                      description:
                        "Starting career",
                    },

                    {
                      value: "0-2 Years",
                      description:
                        "Junior professional",
                    },

                    {
                      value: "2-5 Years",
                      description:
                        "Experienced",
                    },

                    {
                      value: "5+ Years",
                      description:
                        "Senior professional",
                    },
                  ].map((item) => (

                    <button
                      type="button"
                      key={item.value}
                      className={`option-card ${
                        experience ===
                        item.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setExperience(
                          item.value
                        )
                      }
                    >

                      <strong>
                        {item.value}
                      </strong>

                      <span>
                        {item.description}
                      </span>

                    </button>

                  ))}

                </div>

              </div>


              {/* ================================
                  INTERVIEW TYPE
              ================================= */}

              <div className="setup-section">

                <label>
                  Interview Type
                </label>

                <div className="option-grid">

                  <button
                    type="button"
                    className={`option-card ${
                      mode === "Technical"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setMode("Technical")
                    }
                  >

                    <strong>
                      💻 Technical
                    </strong>

                    <span>
                      Skills, concepts &
                      problem solving
                    </span>

                  </button>


                  <button
                    type="button"
                    className={`option-card ${
                      mode === "HR"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setMode("HR")
                    }
                  >

                    <strong>
                      👤 HR
                    </strong>

                    <span>
                      Behavioral &
                      communication
                    </span>

                  </button>


                  <button
                    type="button"
                    className={`option-card ${
                      mode === "Mixed"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setMode("Mixed")
                    }
                  >

                    <strong>
                      🎯 Mixed
                    </strong>

                    <span>
                      Technical + HR
                    </span>

                  </button>

                </div>

              </div>


              {/* ================================
                  DIFFICULTY
              ================================= */}

              <div className="setup-section">

                <label>
                  AI Difficulty
                </label>

                <div className="option-grid">

                  {[
                    {
                      value: "Beginner",
                      description:
                        "Basic concepts",
                    },

                    {
                      value: "Intermediate",
                      description:
                        "Industry level",
                    },

                    {
                      value: "Advanced",
                      description:
                        "Deep technical",
                    },

                    {
                      value: "Adaptive",
                      description:
                        "AI adjusts difficulty",
                    },
                  ].map((item) => (

                    <button
                      type="button"
                      key={item.value}
                      className={`option-card ${
                        difficulty ===
                        item.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setDifficulty(
                          item.value
                        )
                      }
                    >

                      <strong>
                        {item.value}
                      </strong>

                      <span>
                        {item.description}
                      </span>

                    </button>

                  ))}

                </div>

              </div>


              {/* ================================
                  RESUME SKILLS
              ================================= */}

              <div className="setup-section">

                <label>
                  Skills AI Should Test
                </label>

                {resumeSkills.length ===
                0 ? (

                  <div className="no-skills">
                    No extracted resume skills
                    found. Upload your resume
                    first.
                  </div>

                ) : (

                  <div className="skills-selection">

                    {resumeSkills.map(
                      (skill) => (

                        <button
                          type="button"
                          key={skill}
                          className={`skill-chip ${
                            selectedSkills.includes(
                              skill
                            )
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            toggleSkill(
                              skill
                            )
                          }
                        >

                          {selectedSkills.includes(
                            skill
                          )
                            ? "✓ "
                            : "+ "}

                          {skill}

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* ================================
                  FOCUS AREAS
              ================================= */}

              <div className="setup-section">

                <label>
                  Additional Focus Areas
                </label>

                <div className="skills-selection">

                  {availableFocusAreas.map(
                    (area) => (

                      <button
                        type="button"
                        key={area}
                        className={`skill-chip ${
                          focusAreas.includes(
                            area
                          )
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFocus(area)
                        }
                      >

                        {focusAreas.includes(
                          area
                        )
                          ? "✓ "
                          : "+ "}

                        {area}

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* ================================
                  DURATION
              ================================= */}

              <div className="setup-section">

                <label>
                  Interview Duration
                </label>

                <div className="duration-options">

                  {[
                    "10",
                    "20",
                    "30",
                    "45",
                  ].map((time) => (

                    <button
                      type="button"
                      key={time}
                      className={`duration-btn ${
                        duration === time
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setDuration(time)
                      }
                    >

                      {time} min

                    </button>

                  ))}

                </div>

              </div>


              {/* ================================
                  QUESTIONS
              ================================= */}

              <div className="setup-section">

                <label>
                  Number of Questions
                </label>

                <div className="duration-options">

                  {[
                    "5",
                    "10",
                    "15",
                    "20",
                  ].map((count) => (

                    <button
                      type="button"
                      key={count}
                      className={`duration-btn ${
                        questionCount ===
                        count
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setQuestionCount(
                          count
                        )
                      }
                    >

                      {count}

                    </button>

                  ))}

                </div>

              </div>


              {/* ================================
                  AI FEATURES
              ================================= */}

              <div className="setup-section">

                <label>
                  AI Interview Features
                </label>


                <div className="ai-feature-list">

                  {/* Follow Up */}

                  <label className="ai-feature">

                    <div>

                      <strong>
                        Dynamic Follow-up
                      </strong>

                      <span>
                        AI asks deeper questions
                        based on your answer.
                      </span>

                    </div>


                    <input
                      type="checkbox"
                      checked={followUp}
                      onChange={(e) =>
                        setFollowUp(
                          e.target.checked
                        )
                      }
                    />

                  </label>


                  {/* Avoid Repeat */}

                  <label className="ai-feature">

                    <div>

                      <strong>
                        Avoid Repeated Questions
                      </strong>

                      <span>
                        AI checks previous
                        questions before generating
                        a new one.
                      </span>

                    </div>


                    <input
                      type="checkbox"
                      checked={avoidRepeat}
                      onChange={(e) =>
                        setAvoidRepeat(
                          e.target.checked
                        )
                      }
                    />

                  </label>

                </div>

              </div>


              {/* ================================
                  ACTION
              ================================= */}

              <Button
                fullWidth
                size="large"
                icon="🎤"
                disabled={
                  loading ||
                  selectedSkills.length ===
                    0
                }
                onClick={handleStart}
              >

                {loading
                  ? "Preparing AI Interview..."
                  : "Start AI Interview"}

              </Button>

            </div>


            {/* =================================
                LIVE PREVIEW
            ================================= */}

            <aside className="interview-preview-card">

              <div className="preview-header">

                <span>
                  AI INTERVIEW
                </span>

                <div className="ai-online">
                  <i />
                  AI Ready
                </div>

              </div>


              <h2>
                Interview Preview
              </h2>

              <p>
                Your AI interviewer will
                dynamically generate questions
                based on these settings.
              </p>


              <div className="preview-item">

                <span>
                  Target Role
                </span>

                <strong>
                  {role}
                </strong>

              </div>


              <div className="preview-item">

                <span>
                  Experience
                </span>

                <strong>
                  {experience}
                </strong>

              </div>


              <div className="preview-item">

                <span>
                  Interview
                </span>

                <strong>
                  {mode}
                </strong>

              </div>


              <div className="preview-item">

                <span>
                  Difficulty
                </span>

                <strong>
                  {difficulty}
                </strong>

              </div>


              <div className="preview-item">

                <span>
                  Duration
                </span>

                <strong>
                  {duration} min
                </strong>

              </div>


              <div className="preview-item">

                <span>
                  Questions
                </span>

                <strong>
                  {questionCount}
                </strong>

              </div>


              <div className="preview-divider" />


              <div className="preview-skills">

                <span>
                  Selected Skills
                </span>

                <div>

                  {selectedSkills.length ===
                  0 ? (

                    <small>
                      No skills selected
                    </small>

                  ) : (

                    selectedSkills.map(
                      (skill) => (

                        <span
                          key={skill}
                          className="preview-skill"
                        >
                          {skill}
                        </span>

                      )
                    )

                  )}

                </div>

              </div>


              <div className="adaptive-info">

                <span>
                  🧠
                </span>

                <div>

                  <strong>
                    Adaptive AI
                  </strong>

                  <p>
                    AI can increase or decrease
                    question difficulty based on
                    your answers.
                  </p>

                </div>

              </div>

            </aside>

          </div>

        </main>

      </div>

    </div>
  );
}

export default InterviewSetup;