import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

function ResumeUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [uploadStatus, setUploadStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [resumeProfile, setResumeProfile] = useState(null);

  const userName =
    localStorage.getItem("userName") || "Student";

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // ==================================================
  // LOAD SAVED RESUME
  // ==================================================

  useEffect(() => {
    const savedSkills =
      localStorage.getItem("extractedSkills");

    const savedProfile =
      localStorage.getItem("resumeProfile");

    const savedResume =
      localStorage.getItem("resumeUploaded");

    try {
      if (savedSkills) {
        const parsedSkills =
          JSON.parse(savedSkills);

        if (Array.isArray(parsedSkills)) {
          setExtractedSkills(
            convertSkillsToUI(parsedSkills)
          );
        }
      }

      if (savedProfile) {
        const parsedProfile =
          JSON.parse(savedProfile);

        if (
          parsedProfile &&
          typeof parsedProfile === "object"
        ) {
          setResumeProfile(parsedProfile);
        }
      }

      if (
        savedResume === "true" &&
        savedSkills
      ) {
        setUploadStatus("completed");

        setStatusMessage(
          "Your previous resume analysis is available."
        );
      }
    } catch (error) {
      console.error(
        "Saved resume loading error:",
        error
      );
    }
  }, []);

  // ==================================================
  // OPEN FILE SELECTOR
  // ==================================================

  const openFileSelector = () => {
    if (uploadStatus === "uploading") {
      return;
    }

    fileInputRef.current?.click();
  };

  // ==================================================
  // VALIDATE FILE
  // ==================================================

  const validateFileSignature = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const arr = new Uint8Array(reader.result);
            // PDF header: %PDF-
            const pdfHeader = [0x25, 0x50, 0x44, 0x46, 0x2D];
            let isPdf = true;
            for (let i = 0; i < pdfHeader.length; i++) {
              if (arr[i] !== pdfHeader[i]) {
                isPdf = false;
                break;
              }
            }

            // DOCX/ZIP header: PK\x03\x04
            const zipHeader = [0x50, 0x4B, 0x03, 0x04];
            let isZip = true;
            for (let i = 0; i < zipHeader.length; i++) {
              if (arr[i] !== zipHeader[i]) {
                isZip = false;
                break;
              }
            }

            resolve({ isPdf, isZip });
          } catch (e) {
            resolve({ isPdf: false, isZip: false });
          }
        };
        reader.onerror = () => resolve({ isPdf: false, isZip: false });
        // Read first 8 bytes
        const blob = file.slice(0, 8);
        reader.readAsArrayBuffer(blob);
      });
    };

    const handleFile = async (selectedFile) => {
      if (!selectedFile) {
        return;
      }

      const fileName =
        selectedFile.name.toLowerCase();

      const validExtensions = [
        ".pdf",
        ".doc",
        ".docx",
      ];

      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // Some browsers use these for PDF
        "application/x-pdf",
        "application/octet-stream",
      ];

      const validExtension =
        validExtensions.some((extension) =>
          fileName.endsWith(extension)
        );

      const validType =
        validTypes.includes(selectedFile.type);

      if (!validExtension && !validType) {
        setFile(null);
        setUploadStatus("error");

        setStatusMessage(
          "Only PDF, DOC or DOCX files are allowed."
        );

        return;
      }

      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        setFile(null);
        setUploadStatus("error");

        setStatusMessage(
          "Maximum file size is 5 MB."
        );

        return;
      }

      // Signature check for PDFs/DOCX
      try {
        const sig = await validateFileSignature(selectedFile);

        if (fileName.endsWith(".pdf") && !sig.isPdf) {
          setFile(null);
          setUploadStatus("error");
          setStatusMessage(
            "The selected file does not look like a valid PDF. Please choose a proper PDF file."
          );
          return;
        }

        if (
          (fileName.endsWith(".docx") || fileName.endsWith(".doc")) &&
          !sig.isZip
        ) {
          // Note: .doc (old binary) will not be zip; we currently require docx or pdf
          setFile(null);
          setUploadStatus("error");
          setStatusMessage(
            "Please provide a valid DOCX file (not the old DOC binary format)."
          );
          return;
        }
      } catch (e) {
        // If signature check fails unexpectedly, allow processing but warn
        console.warn("File signature check failed:", e);
      }

      // New file selected
      setFile(selectedFile);

      setUploadStatus("selected");

      setStatusMessage(
        "Resume selected successfully."
      );

      // Remove old UI result
      setExtractedSkills([]);
      setResumeProfile(null);

      // New resume should replace old resume
      localStorage.removeItem(
        "resumeUploaded"
      );

      localStorage.removeItem(
        "extractedSkills"
      );

      localStorage.removeItem(
        "resumeProfile"
      );
    };

  // ==================================================
  // FILE INPUT
  // ==================================================

  const handleInputChange = async (event) => {
    const selectedFile =
      event.target.files?.[0];

      await handleFile(selectedFile);
  };

  // ==================================================
  // DRAG OVER
  // ==================================================

  const handleDragOver = (event) => {
    event.preventDefault();

    if (
      uploadStatus !== "uploading"
    ) {
      setDragging(true);
    }
  };

  // ==================================================
  // DRAG LEAVE
  // ==================================================

  const handleDragLeave = () => {
    setDragging(false);
  };

  // ==================================================
  // DROP
  // ==================================================

  const handleDrop = async (event) => {
    event.preventDefault();

    setDragging(false);

    if (
      uploadStatus === "uploading"
    ) {
      return;
    }

    const droppedFile =
      event.dataTransfer.files?.[0];

      await handleFile(droppedFile);
  };

  // ==================================================
  // UPLOAD
  // ==================================================

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("error");

      setStatusMessage(
        "Please select your resume first."
      );

      return;
    }

    try {
      setUploadStatus("uploading");

      setStatusMessage(
        "Uploading and analyzing your resume..."
      );

      const formData =
        new FormData();

      formData.append(
        "resume",
        file
      );

      console.log(
        "Uploading:",
        file.name
      );

      console.log(
        "API:",
        `${API_URL}/api/resume/upload`
      );

      const response =
        await fetch(
          `${API_URL}/api/resume/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      console.log(
        "Resume API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Server error: ${response.status}`
        );
      }

      if (
        data?.success === false
      ) {
        throw new Error(
          data.message ||
            "Resume analysis failed."
        );
      }

      // ==================================================
      // EXTRACT SKILLS
      // ==================================================

      const skills =
        Array.isArray(data?.skills)
          ? data.skills
          : [];

      const profile =
        data?.resumeProfile &&
        typeof data.resumeProfile ===
          "object"
          ? data.resumeProfile
          : {
              wordCount: 0,
              skillCount: skills.length,
              profileStatus:
                skills.length > 0
                  ? "skills_detected"
                  : "incomplete",
            };

      if (skills.length === 0) {
        throw new Error(
          "Resume uploaded, but no skills were detected."
        );
      }

      // ==================================================
      // UPDATE UI
      // ==================================================

      setExtractedSkills(
        convertSkillsToUI(
          skills
        )
      );

      setResumeProfile(
        profile
      );

      setUploadStatus(
        "completed"
      );

      setStatusMessage(
        "Resume analyzed successfully."
      );

      // ==================================================
      // SAVE
      // ==================================================

      localStorage.setItem(
        "resumeUploaded",
        "true"
      );

      localStorage.setItem(
        "resumeName",
        file.name
      );

      localStorage.setItem(
        "resumeText",
        data.extractedText ||
          ""
      );

      localStorage.setItem(
        "extractedSkills",
        JSON.stringify(skills)
      );

      localStorage.setItem(
        "resumeProfile",
        JSON.stringify(profile)
      );

      localStorage.setItem(
        "resumeAnalysis",
        JSON.stringify(data)
      );

    } catch (error) {
      console.error(
        "Resume upload error:",
        error
      );

      setUploadStatus(
        "error"
      );

      if (
        error instanceof TypeError
      ) {
        setStatusMessage(
          "Backend se connection nahi ho raha. Check karo ki backend port 5000 par running hai."
        );
      } else {
        setStatusMessage(
          error.message ||
            "Resume upload failed."
        );
      }
    }
  };

  // ==================================================
  // CONVERT SKILLS
  // ==================================================

  const convertSkillsToUI = (
    skills
  ) => {
    if (!Array.isArray(skills)) {
      return [];
    }

    const uniqueSkills = [
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

    return uniqueSkills.map(
      (skill) => ({
        name: skill,
        score: 0,
        level: "Detected",
      })
    );
  };

  // ==================================================
  // STATUS
  // ==================================================

  const getStatusText = () => {
    switch (uploadStatus) {
      case "selected":
        return "Resume selected";

      case "uploading":
        return "Analyzing resume...";

      case "completed":
        return "Resume analyzed successfully";

      case "error":
        return "Resume processing failed";

      default:
        return "";
    }
  };

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigate = (
    page
  ) => {
    const routes = {
      Dashboard:
        "/dashboard",

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
              "/learning",
    };

    if (
      page === "Logout"
    ) {
      localStorage.clear();

      navigate(
        "/login"
      );

      return;
    }

    navigate(
      routes[page] ||
        "/dashboard"
    );
  };

  // ==================================================
  // REMOVE CURRENT FILE
  // ==================================================

  const removeFile = () => {
    if (
      uploadStatus === "uploading"
    ) {
      return;
    }

    setFile(null);
    setUploadStatus("idle");
    setStatusMessage("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  // ==================================================
  // CLEAR SAVED RESUME
  // ==================================================

  const clearSavedResume =
    () => {
      const keys = [
        "resumeUploaded",
        "resumeName",
        "resumeText",
        "extractedSkills",
        "resumeProfile",
        "resumeAnalysis",
      ];

      keys.forEach(
        (key) =>
          localStorage.removeItem(
            key
          )
      );

      setFile(null);
      setExtractedSkills([]);
      setResumeProfile(null);
      setUploadStatus("idle");
      setStatusMessage("");

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  // ==================================================
  // CONTINUE
  // ==================================================

  const handleContinue = () => {
    if (
      extractedSkills.length ===
      0
    ) {
      setStatusMessage(
        "Please upload and analyze your resume first."
      );

      return;
    }

    navigate(
      "/interview-setup"
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="app-layout">

      <Navbar
        userName={userName}
      />

      <div className="main-layout">

        <Sidebar
          activePage="My Resume"
          onNavigate={
            handleNavigate
          }
        />

        <main className="page-content">

          <div className="page-header">

            <p className="page-label">
              PROFILE
            </p>

            <h1>
              Upload Your Resume
            </h1>

            <p>
              Upload your resume so
              SkillVerify AI can extract
              your skills and create your
              personalized interview profile.
            </p>

          </div>

          <div className="resume-container">

            {/* UPLOAD CARD */}

            <div className="resume-upload-card">

              <div className="resume-upload-header">

                <div>
                  <h2>
                    Resume Analysis
                  </h2>

                  <p>
                    PDF, DOC or DOCX supported
                  </p>
                </div>

                <div className="resume-icon">
                  📄
                </div>

              </div>

              {/* DROP AREA */}

              <div
                className={`resume-drop-area ${
                  dragging
                    ? "dragging"
                    : ""
                }`}
                onClick={
                  openFileSelector
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
              >

                <div className="upload-icon">
                  📤
                </div>

                <h3>
                  {file
                    ? file.name
                    : "Drop your resume here"}
                </h3>

                <p>
                  {file
                    ? `${(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)} MB`
                    : "or click to browse from your computer"}
                </p>

                <p>
                  PDF, DOC or DOCX •
                  Maximum 5 MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={
                    handleInputChange
                  }
                  hidden
                />

              </div>

              {/* SELECTED FILE */}

              {file && (
                <div className="selected-file">

                  <div className="file-info">

                    <div className="file-icon">
                      📄
                    </div>

                    <div>

                      <strong>
                        {file.name}
                      </strong>

                      <span>
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </span>

                    </div>

                  </div>

                  <span className="file-ready">
                    Ready
                  </span>

                  <button
                    type="button"
                    className="remove-file"
                    disabled={
                      uploadStatus ===
                      "uploading"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile();
                    }}
                  >
                    ✕
                  </button>

                </div>
              )}

              {/* STATUS */}

              {uploadStatus !==
                "idle" && (
                <div
                  className={`resume-status ${
                    uploadStatus ===
                    "uploading"
                      ? "status-processing"
                      : uploadStatus ===
                        "completed"
                      ? "status-success"
                      : uploadStatus ===
                        "error"
                      ? "status-error"
                      : "status-idle"
                  }`}
                >

                  <span className="status-dot">
                    {uploadStatus ===
                    "uploading"
                      ? "⏳"
                      : uploadStatus ===
                        "completed"
                      ? "✓"
                      : uploadStatus ===
                        "error"
                      ? "!"
                      : "●"}
                  </span>

                  <div>

                    <strong>
                      {getStatusText()}
                    </strong>

                    {statusMessage && (
                      <div>
                        {
                          statusMessage
                        }
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* BUTTONS */}

              <div className="resume-actions">

                <Button
                  variant="outline"
                  disabled={
                    uploadStatus ===
                    "uploading"
                  }
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  disabled={
                    !file ||
                    uploadStatus ===
                      "uploading"
                  }
                  loading={
                    uploadStatus ===
                    "uploading"
                  }
                  onClick={
                    handleUpload
                  }
                >
                  {uploadStatus ===
                  "uploading"
                    ? "Analyzing Resume..."
                    : "Upload & Analyze"}
                </Button>

              </div>

            </div>

            {/* PROCESS */}

            <div className="resume-info-grid">

              <div>
                <span>01</span>

                <h3>
                  Extract Skills
                </h3>

                <p>
                  AI extracts technical
                  skills from your resume.
                </p>
              </div>

              <div>
                <span>02</span>

                <h3>
                  Build Skill Profile
                </h3>

                <p>
                  Your detected skills become
                  your interview profile.
                </p>
              </div>

              <div>
                <span>03</span>

                <h3>
                  Verify Skills
                </h3>

                <p>
                  AI will test your claimed
                  skills through adaptive
                  interviews.
                </p>
              </div>

            </div>

            {/* EXTRACTED SKILLS */}

            {extractedSkills.length >
              0 && (
              <div className="extracted-skills-card">

                <div className="resume-upload-header">

                  <div>

                    <p className="page-label">
                      AI ANALYSIS
                    </p>

                    <h2>
                      Extracted Skills
                    </h2>

                    <p>
                      These skills were detected
                      from your uploaded resume.
                    </p>

                  </div>

                  <span className="skills-count">
                    {
                      extractedSkills.length
                    }{" "}
                    Skills
                  </span>

                </div>

                <div className="extracted-skills-grid">

                  {extractedSkills.map(
                    (
                      skill,
                      index
                    ) => (
                      <div
                        className="extracted-skill"
                        key={`${skill.name}-${index}`}
                      >

                        <div className="skill-info">

                          <div>

                            <h3>
                              {
                                skill.name
                              }
                            </h3>

                            <span>
                              {
                                skill.level
                              }
                            </span>

                          </div>

                          <strong>
                            ✓
                          </strong>

                        </div>

                        <div className="skill-detected-bar">
                          Detected from resume
                        </div>

                      </div>
                    )
                  )}

                </div>

                {resumeProfile && (
                  <div className="resume-profile-summary">

                    <div>
                      <span>
                        Resume Words
                      </span>

                      <strong>
                        {
                          resumeProfile.wordCount ||
                          0
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Skills Detected
                      </span>

                      <strong>
                        {
                          resumeProfile.skillCount ||
                          extractedSkills.length
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Profile Status
                      </span>

                      <strong>
                        {
                          resumeProfile.profileStatus ===
                          "skills_detected"
                            ? "Ready"
                            : "Incomplete"
                        }
                      </strong>
                    </div>

                  </div>
                )}

                <div className="skills-actions">

                  <Button
                    onClick={
                      handleContinue
                    }
                  >
                    Continue to AI Interview →
                  </Button>

                </div>

              </div>
            )}

            {/* PREVIOUS RESUME */}

            {localStorage.getItem(
              "resumeUploaded"
            ) === "true" &&
              !file && (
                <div className="previous-resume-card">

                  <div>

                    <p className="page-label">
                      PREVIOUS RESUME
                    </p>

                    <h3>
                      {localStorage.getItem(
                        "resumeName"
                      ) ||
                        "Resume uploaded"}
                    </h3>

                    <p>
                      Your resume analysis
                      is saved.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={
                      clearSavedResume
                    }
                  >
                    Remove
                  </button>

                </div>
              )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default ResumeUpload;