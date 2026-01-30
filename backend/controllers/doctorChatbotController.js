const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/medical-analysis");
    // Synchronous version to ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "medical-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|dicom|dcm/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype =
      allowedTypes.test(file.mimetype) || file.mimetype === "application/dicom";

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (JPEG, PNG), PDF, and DICOM files are allowed!",
        ),
      );
    }
  },
});

function extractTextFromResponse(data) {
  if (!data) return null;
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts.length > 0
    ) {
      return candidate.content.parts[0].text || null;
    }
    return candidate.output || candidate.content || candidate.text || null;
  }
  if (typeof data.text === "string") return data.text;
  if (typeof data.content === "string") return data.content;
  return null;
}

// Convert file to base64 for Gemini API
async function fileToBase64(filePath) {
  const fileBuffer = await fsPromises.readFile(filePath);
  return fileBuffer.toString("base64");
}

// Determine MIME type based on file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".dcm": "application/dicom",
    ".dicom": "application/dicom",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

exports.analyzeMedicalCase = async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      symptoms,
      medicalHistory,
      currentMedications,
      additionalNotes,
      conversationHistory,
    } = req.body;

    const files = req.files || [];

    if (!patientName || !patientAge || !symptoms) {
      return res.status(400).json({
        message: "Patient name, age, and symptoms are required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key not configured on server",
      });
    }

    // Build comprehensive medical prompt
    let medicalPrompt = `You are an expert medical AI assistant helping a doctor analyze a patient case. Provide comprehensive, professional medical analysis with proper formatting.

**PATIENT INFORMATION**
- **Name:** ${patientName}
- **Age:** ${patientAge} years
- **Gender:** ${patientGender || "Not specified"}

**CHIEF COMPLAINTS & SYMPTOMS**
${symptoms}

${medicalHistory ? `**MEDICAL HISTORY**\n${medicalHistory}\n` : ""}
${currentMedications ? `**CURRENT MEDICATIONS**\n${currentMedications}\n` : ""}
${additionalNotes ? `**ADDITIONAL NOTES**\n${additionalNotes}\n` : ""}

${files.length > 0 ? `**ATTACHED REPORTS:** ${files.length} file(s) - CT Scans, Lab Reports, X-Rays, or Medical Documents\n` : ""}

---

Please provide a COMPREHENSIVE medical analysis following this EXACT structure with proper formatting and bold headings:

## 📋 CLINICAL ASSESSMENT

### **Chief Complaints Summary**
[Summarize the main symptoms and concerns]

### **Vital Signs & Initial Observations**
[If mentioned in reports, note any vital signs or initial observations]

---

## 🔬 DIAGNOSTIC ANALYSIS

### **Test Results Interpretation**
[Analyze all attached lab reports, CT scans, X-rays if provided. Mention key findings, abnormalities, and normal values]

### **Differential Diagnosis**
[List possible conditions/diseases based on symptoms and test results]
1. **Primary Diagnosis:** [Most likely condition]
2. **Secondary Considerations:** [Other possible conditions]

---

## 🦠 DISEASE ETIOLOGY & PATHOPHYSIOLOGY

### **Why This Disease Occurred**
[Explain the underlying causes - genetic, environmental, lifestyle factors, infections, etc.]

### **Disease Progression**
[Explain how the disease develops and progresses]

### **Risk Factors Identified**
- [List specific risk factors present in this patient]

---

## ⚕️ SEVERITY ASSESSMENT

### **Current Disease Stage**
[Early, Moderate, Advanced - with justification]

### **Severity Level**
- **Mild / Moderate / Severe / Critical**
- **Suffering Level:** [Rate and explain patient discomfort/impact on quality of life]

### **Complications Risk**
[Potential complications if untreated or poorly managed]

---

## 💊 TREATMENT PLAN

### **Immediate Management**
[First-line treatments, emergency measures if needed]

### **Pharmacological Therapy**
**Recommended Medications:**
1. **[Medicine Name]**
   - Dosage: [specific dose]
   - Frequency: [times per day]
   - Duration: [how many days/weeks]
   - Purpose: [why this medication]
   
2. **[Medicine Name]**
   - Dosage: [specific dose]
   - Frequency: [times per day]
   - Duration: [how many days/weeks]
   - Purpose: [why this medication]

[Continue for all recommended medications]

**Important Medication Instructions:**
- [Timing - before/after meals, morning/evening]
- [Drug interactions to watch for]
- [Side effects monitoring]

### **Non-Pharmacological Interventions**
- **Lifestyle Modifications:** [Diet, exercise, rest, etc.]
- **Physical Therapy/Procedures:** [If applicable]
- **Medical Devices Required:** [Nebulizer, glucometer, BP monitor, etc.]

---

## 📅 FOLLOW-UP SCHEDULE

### **Next Appointment**
- **Recommended Date:** [Specific timeline - e.g., 1 week, 2 weeks, 1 month from now]
- **Urgency:** [Routine / Important / Urgent]

### **Follow-up Appointments Timeline**
1. **First Follow-up:** [Date/timeframe] - [Purpose]
2. **Second Follow-up:** [Date/timeframe] - [Purpose]
3. **Long-term Monitoring:** [Frequency for chronic conditions]

---

## 📊 TESTS & REPORTS TO BRING

### **For Next Visit**
- [ ] [Specific lab test - e.g., Complete Blood Count (CBC)]
- [ ] [Imaging - e.g., Chest X-Ray PA view]
- [ ] [Monitoring logs - e.g., Blood glucose diary]
- [ ] [Other specific tests]

### **Additional Investigations Needed**
[Any new tests required for confirmation or monitoring]

---

## ⚠️ WARNING SIGNS & WHEN TO SEEK IMMEDIATE CARE

**Contact Doctor Immediately If:**
- [Symptom worsening criteria]
- [Emergency warning signs]
- [Medication adverse reactions]

---

## 📝 PATIENT EDUCATION & INSTRUCTIONS

### **Disease Information**
[Brief patient-friendly explanation of the condition]

### **Self-Care Instructions**
- [What patient should do at home]
- [Activity restrictions]
- [Diet recommendations]

### **Monitoring at Home**
- [What to track - symptoms, vitals, etc.]
- [How often to monitor]

---

## 📞 ADDITIONAL RECOMMENDATIONS

### **Specialist Referrals**
[If referral to specialist is needed - cardiologist, neurologist, etc.]

### **Support Resources**
[Support groups, educational resources, rehabilitation services]

---

**IMPORTANT MEDICAL DISCLAIMER:** This analysis is AI-assisted and should be reviewed by the treating physician. Final clinical decisions should be made by qualified medical professionals based on comprehensive patient evaluation.

Please provide detailed, evidence-based analysis for this case.`;

    // Prepare the API request
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let contents = [];

    // If there are files, we need to include them as inline data
    if (files.length > 0) {
      const parts = [{ text: medicalPrompt }];

      for (const file of files) {
        try {
          const base64Data = await fileToBase64(file.path);
          const mimeType = getMimeType(file.originalname);

          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          });
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
        }
      }

      contents.push({ parts });
    } else {
      // Text-only request
      contents.push({
        parts: [{ text: medicalPrompt }],
      });
    }

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg) => {
        contents.push({
          role: msg.role || "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.4, // Lower temperature for more factual medical responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    console.log("[DOCTOR CHATBOT] Analyzing medical case for:", patientName);
    console.log("[DOCTOR CHATBOT] Files attached:", files.length);
    console.log("[DOCTOR CHATBOT] Using model:", model);
    console.log("[DOCTOR CHATBOT] Endpoint:", endpoint);

    const response = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000, // 60 seconds timeout for complex analysis
    });

    const analysisText = extractTextFromResponse(response.data);

    if (!analysisText) {
      return res.status(500).json({
        message: "Failed to extract medical analysis from AI response",
        rawResponse: response.data,
      });
    }

    // Clean up uploaded files after processing
    if (files.length > 0) {
      for (const file of files) {
        try {
          await fsPromises.unlink(file.path);
        } catch (err) {
          console.error(`Failed to delete file ${file.path}:`, err);
        }
      }
    }

    res.json({
      success: true,
      analysis: analysisText,
      patientInfo: {
        name: patientName,
        age: patientAge,
        gender: patientGender,
      },
      filesProcessed: files.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DOCTOR CHATBOT ERROR]:", error.message);

    // Clean up files in case of error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await fsPromises.unlink(file.path);
        } catch (err) {
          console.error(`Failed to delete file ${file.path}:`, err);
        }
      }
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: "AI service error",
        error: error.response.data,
      });
    }

    res.status(500).json({
      message: "Server error during medical analysis",
      error: error.message,
    });
  }
};

exports.upload = upload;
