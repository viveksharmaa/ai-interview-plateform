const express = require("express");
const multer = require("multer");

const {
  uploadResume,
  getResumeStatus,
} = require("../controllers/resumeController");

const router = express.Router();


// ==================================================
// MULTER CONFIGURATION
// ==================================================

// IMPORTANT:
// memoryStorage() gives us req.file.buffer
// which is required by pdf-parse and mammoth.

const storage = multer.memoryStorage();


const upload = multer({

  storage,

  // Maximum 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },


  // ==================================================
  // FILE VALIDATION
  // ==================================================

  fileFilter: (req, file, cb) => {

    const allowedMimeTypes = [

      "application/pdf",

      "application/msword",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    ];


    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];


    const fileName =
      file.originalname
        ? file.originalname.toLowerCase()
        : "";


    const extension =
      fileName.substring(
        fileName.lastIndexOf(".")
      );


    const validMimeType =
      allowedMimeTypes.includes(
        file.mimetype
      );


    const validExtension =
      allowedExtensions.includes(
        extension
      );


    // Accept if both MIME type and extension are valid
    if (
      validMimeType &&
      validExtension
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only PDF, DOC and DOCX files are allowed."
        ),
        false
      );
    }
  },

});


// ==================================================
// UPLOAD RESUME
// ==================================================

router.post(
  "/upload",
  upload.single("resume"),
  uploadResume
);


// ==================================================
// RESUME STATUS
// ==================================================

router.get(
  "/status",
  getResumeStatus
);


// ==================================================
// MULTER ERROR HANDLER
// ==================================================

router.use(
  (err, req, res, next) => {

    console.error(
      "Resume Route Error:",
      err
    );


    // File too large
    if (
      err instanceof multer.MulterError &&
      err.code === "LIMIT_FILE_SIZE"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Resume file size cannot exceed 5 MB.",

      });
    }


    // Invalid file type
    if (
      err.message &&
      err.message.includes(
        "Only PDF, DOC and DOCX files are allowed"
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Only PDF, DOC and DOCX files are allowed.",

      });
    }


    // Other upload error
    return res.status(400).json({

      success: false,

      message:
        err.message ||
        "Unable to upload resume.",

    });
  }
);


module.exports = router;