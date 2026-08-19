const {
  processResume,
} = require("../services/resumeService");


// ==================================================
// UPLOAD RESUME
// POST /api/resume/upload
// ==================================================

const uploadResume = async (req, res) => {
  try {

    // ==================================================
    // CHECK FILE
    // ==================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a resume file.",
      });
    }


    // ==================================================
    // PROCESS RESUME
    // ==================================================

    const result =
      await processResume(req.file);


    // ==================================================
    // EXTRACT SKILLS
    // ==================================================

    const rawSkills =
      Array.isArray(result.skills)
        ? result.skills
        : [];


    // Remove duplicate skills
    const skills = [
      ...new Set(
        rawSkills
          .filter(
            (skill) =>
              typeof skill === "string"
          )
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean)
      ),
    ];


    // ==================================================
    // RESUME PROFILE
    // ==================================================

    const resumeProfile =
      result.resumeProfile || {
        wordCount: 0,
        skillCount: skills.length,
        profileStatus:
          skills.length > 0
            ? "skills_detected"
            : "no_skills_detected",
      };


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      success: true,

      message:
        "Resume uploaded and processed successfully.",

      fileName:
        req.file.originalname,

      fileSize:
        req.file.size,

      fileType:
        req.file.mimetype,

      // Skills for frontend
      skills: skills,

      // Extracted resume text
      extractedText:
        result.extractedText || "",

      // Resume profile
      resumeProfile:
        resumeProfile,
    });

  } catch (error) {

    console.error(
      "Resume Upload Error:",
      error
    );


    // ==================================================
    // FILE PROCESSING ERROR
    // ==================================================

    return res.status(500).json({

      success: false,

      message:
        "Something went wrong while processing the resume.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


// ==================================================
// GET RESUME STATUS
// GET /api/resume/status
// ==================================================

const getResumeStatus = async (
  req,
  res
) => {

  try {

    return res.status(200).json({

      success: true,

      message:
        "Resume service is working.",

      status: "ready",

    });

  } catch (error) {

    console.error(
      "Resume Status Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to get resume status.",

    });
  }
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

  uploadResume,

  getResumeStatus,

};