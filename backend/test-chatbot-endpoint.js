// Quick test script for the doctor chatbot endpoint
require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");

async function testChatbotEndpoint() {
  console.log("\n🧪 Testing Doctor Medical Chatbot Endpoint\n");

  // Create a test token for a doctor
  const testToken = jwt.sign(
    {
      id: "6968efb92d030b644123545d",
      email: "mnbcuilahore321@gmail.com",
      role: "doctor",
    },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "1h" },
  );

  console.log("✅ Test token generated");
  console.log("Token:", testToken.substring(0, 50) + "...\n");

  // Create form data
  const formData = new FormData();
  formData.append("patientName", "Test Patient");
  formData.append("patientAge", "45");
  formData.append("patientGender", "Male");
  formData.append(
    "symptoms",
    "Persistent cough for 2 weeks, fever 101-102°F for 5 days, chest pain when breathing",
  );
  formData.append("medicalHistory", "Diabetes Type 2, Hypertension");
  formData.append(
    "currentMedications",
    "Metformin 500mg twice daily, Amlodipine 5mg once daily",
  );

  try {
    console.log(
      "📤 Sending request to http://localhost:5000/api/doctor-chatbot/analyze\n",
    );

    const response = await axios.post(
      "http://localhost:5000/api/doctor-chatbot/analyze",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${testToken}`,
        },
        timeout: 60000,
      },
    );

    console.log("✅ SUCCESS! Status:", response.status);
    console.log("\n📊 Response Data:");
    console.log("- Files Processed:", response.data.filesProcessed);
    console.log("- Patient:", response.data.patientInfo?.name);
    console.log(
      "- Analysis Length:",
      response.data.analysis?.length,
      "characters",
    );
    console.log("\n📝 Analysis Preview (first 500 chars):");
    console.log(response.data.analysis?.substring(0, 500) + "...");
    console.log("\n✅ Endpoint is working correctly!");
  } catch (error) {
    console.error(
      "❌ ERROR:",
      error.response?.status,
      error.response?.statusText,
    );
    console.error(
      "Error Message:",
      error.response?.data?.message || error.message,
    );
    console.error("\nFull Error:", error.toString());

    if (error.code) {
      console.error("Error Code:", error.code);
    }

    if (error.response?.status === 401) {
      console.error("\n⚠️  Authentication failed. Check token format.");
    } else if (error.response?.status === 500) {
      console.error("\n⚠️  Server error. Check backend logs.");
      console.error("Error details:", error.response?.data);
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        "\n⚠️  Cannot connect to server. Is it running on port 5000?",
      );
    }
  }
}

// Run the test
testChatbotEndpoint();
