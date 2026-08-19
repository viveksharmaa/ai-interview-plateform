// ==================================================
// IMPORTS
// ==================================================

const pdfParseModule = require("pdf-parse");
const mammoth = require("mammoth");


// ==================================================
// COMMON SKILLS DATABASE
// ==================================================

const SKILLS_DATABASE = [

  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Java",
  "Python",
  "C++",
  "C#",
  "C",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",

  // Frontend
  "HTML",
  "CSS",
  "React",
  "React.js",
  "Angular",
  "Vue.js",
  "Next.js",
  "Redux",
  "Tailwind CSS",
  "Bootstrap",

  // Backend
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "ASP.NET",
  "REST API",
  "GraphQL",

  // Database
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Oracle",
  "Firebase",

  // Cloud / DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "GitHub Actions",

  // Tools
  "Git",
  "GitHub",
  "GitLab",
  "Postman",
  "Linux",

  // AI / Data
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Data Science",
  "Data Analysis",
  "Pandas",
  "NumPy",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",

  // Core CS
  "Data Structures",
  "Algorithms",
  "DSA",
  "Object Oriented Programming",
  "OOP",
  "Operating Systems",
  "Computer Networks",
  "DBMS",
  "System Design",
];


// ==================================================
// NORMALIZE TEXT
// ==================================================

const normalizeText = (text) => {

  if (!text) {
    return "";
  }

  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
};


// ==================================================
// NORMALIZE SKILL TEXT
// ==================================================

const normalizeSkillText = (text) => {

  return String(text || "")
    .toLowerCase()
    .replace(/[‐-‒–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
};


// ==================================================
// EXTRACT TEXT FROM PDF
// pdf-parse v2.4.5
// ==================================================

const extractPdfText = async (buffer) => {
  try {
    // Basic buffer validation
    if (!buffer) {
      throw new Error("PDF buffer is missing.");
    }

    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Invalid PDF file buffer.");
    }

    if (buffer.length === 0) {
      throw new Error("PDF file is empty.");
    }

    console.log("📄 PDF buffer size:", buffer.length, "bytes");

    // Quick PDF signature check (best-effort)
    const pdfHeader = buffer.subarray(0, 5).toString("utf8");
    if (pdfHeader !== "%PDF-") {
      // Not all PDFs always include the header at position 0 in some edge cases,
      // but this is a useful early check. We'll still attempt parsing below.
      console.warn("Uploaded file does not start with %PDF- header, attempting parse anyway.");
    }

    // Support both function-style and class-style exports from pdf-parse.
    let text = "";

    if (typeof pdfParseModule === "function") {
      const result = await pdfParseModule(buffer);
      text = result?.text || "";
    } else if (
      pdfParseModule &&
      typeof pdfParseModule.PDFParse === "function"
    ) {
      const Parser = pdfParseModule.PDFParse;
      const parser = new Parser({ data: buffer });
      const result = await parser.getText();
      text = result?.text || "";
    } else {
      throw new Error("pdf-parse module is not available.");
    }

    console.log("✅ PDF parsed successfully");
    console.log("📝 Extracted text length:", text.length);

    if (!text.trim()) {
      throw new Error(
        "PDF contains no readable text. It may be a scanned/image-only PDF."
      );
    }

    return text;
  } catch (error) {
    console.error("====================================");
    console.error("❌ PDF Extraction Error");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("====================================");

    throw new Error(`Unable to read the PDF resume: ${error?.message || "Unknown PDF error"}`);
  }
};



// ==================================================
// EXTRACT TEXT FROM DOCX
// ==================================================

const extractDocxText = async (buffer) => {

  try {

    if (!buffer) {

      throw new Error(
        "DOCX buffer is missing."
      );

    }


    if (!Buffer.isBuffer(buffer)) {

      throw new Error(
        "Invalid DOCX file buffer."
      );

    }


    if (buffer.length === 0) {

      throw new Error(
        "DOCX file is empty."
      );

    }


    console.log(
      "📄 DOCX buffer size:",
      buffer.length,
      "bytes"
    );


    const result =
      await mammoth.extractRawText({
        buffer,
      });


    const text =
      result?.value || "";


    console.log(
      "✅ DOCX parsed successfully"
    );


    console.log(
      "📝 Extracted text length:",
      text.length
    );


    if (!text.trim()) {

      throw new Error(
        "DOCX contains no readable text."
      );

    }


    return text;


  } catch (error) {

    console.error(
      "===================================="
    );

    console.error(
      "❌ DOCX Extraction Error"
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "===================================="
    );


    throw new Error(
      `Unable to read the DOCX resume: ${
        error?.message || "Unknown DOCX error"
      }`
    );

  }

};


// ==================================================
// EXTRACT TEXT FROM RESUME
// ==================================================

const extractResumeText = async (file) => {

  if (!file) {

    throw new Error(
      "Resume file is missing."
    );

  }


  if (!file.buffer) {

    throw new Error(
      "Resume file data is missing."
    );

  }


  const mimetype =
    String(file.mimetype || "")
      .toLowerCase();


  const originalName =
    String(file.originalname || "")
      .toLowerCase();


  console.log(
    "📎 Resume:",
    file.originalname
  );


  console.log(
    "📎 MIME:",
    file.mimetype
  );


  console.log(
    "📎 Size:",
    file.size || file.buffer.length
  );


  // ==================================================
  // PDF
  // ==================================================

  if (
    mimetype === "application/pdf" ||
    originalName.endsWith(".pdf")
  ) {

    return await extractPdfText(
      file.buffer
    );

  }


  // ==================================================
  // DOCX
  // ==================================================

  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalName.endsWith(".docx")
  ) {

    return await extractDocxText(
      file.buffer
    );

  }


  // ==================================================
  // OLD DOC
  // ==================================================

  if (
    mimetype === "application/msword" ||
    originalName.endsWith(".doc")
  ) {

    throw new Error(
      "Old DOC format is not supported. Please upload PDF or DOCX."
    );

  }


  // ==================================================
  // UNSUPPORTED FORMAT
  // ==================================================

  throw new Error(
    "Unsupported resume file format. Please upload PDF or DOCX."
  );

};


// ==================================================
// ESCAPE REGEX CHARACTERS
// ==================================================

const escapeRegex = (value) => {

  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

};


// ==================================================
// EXTRACT SKILLS
// ==================================================

const extractSkills = (text) => {

  if (!text) {
    return [];
  }


  const normalizedText =
    normalizeSkillText(text);


  const foundSkills = [];


  for (const skill of SKILLS_DATABASE) {

    const skillLower =
      normalizeSkillText(skill);


    const escapedSkill =
      escapeRegex(skillLower);


    const regex =
      new RegExp(
        `(^|[^a-z0-9+#.])${escapedSkill}(?=$|[^a-z0-9+#.])`,
        "i"
      );


    if (
      regex.test(normalizedText)
    ) {

      if (
        !foundSkills.includes(skill)
      ) {

        foundSkills.push(skill);

      }

    }

  }


  return foundSkills;

};


// ==================================================
// CREATE RESUME PROFILE
// ==================================================

const createResumeProfile = (
  text,
  skills
) => {

  const words =
    text
      .split(/\s+/)
      .filter(Boolean);


  const wordCount =
    words.length;


  return {

    skills,

    wordCount,

    skillCount:
      skills.length,

    profileStatus:
      skills.length > 0
        ? "skills_detected"
        : "no_skills_detected",

  };

};


// ==================================================
// MAIN RESUME PROCESSOR
// ==================================================

const processResume = async (
  file
) => {

  try {

    console.log(
      "===================================="
    );


    console.log(
      "📄 Processing resume:",
      file?.originalname
    );


    console.log(
      "===================================="
    );


    // ==================================================
    // 1. EXTRACT TEXT
    // ==================================================

    const extractedText =
      await extractResumeText(
        file
      );


    if (
      !extractedText ||
      !extractedText.trim()
    ) {

      throw new Error(
        "Could not extract readable text from this resume."
      );

    }


    console.log(
      "✅ Resume text extracted"
    );


    // ==================================================
    // 2. CLEAN TEXT
    // ==================================================

    const cleanedText =
      normalizeText(
        extractedText
      );


    console.log(
      "📝 Cleaned text length:",
      cleanedText.length
    );


    // ==================================================
    // 3. EXTRACT SKILLS
    // ==================================================

    const skills =
      extractSkills(
        cleanedText
      );


    console.log(
      "🧠 Skills detected:",
      skills
    );


    // ==================================================
    // 4. CREATE PROFILE
    // ==================================================

    const resumeProfile =
      createResumeProfile(
        cleanedText,
        skills
      );


    // ==================================================
    // 5. RETURN RESULT
    // ==================================================

    return {

      extractedText:
        cleanedText,

      skills,

      resumeProfile,

    };


  } catch (error) {

    console.error(
      "===================================="
    );


    console.error(
      "❌ Resume Processing Error:",
      error
    );


    console.error(
      "===================================="
    );


    throw error;

  }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

  processResume,

  extractResumeText,

  extractSkills,

};