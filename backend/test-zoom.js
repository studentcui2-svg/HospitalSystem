require("dotenv").config();
const axios = require("axios");

// Test Zoom API Connection
async function testZoomAPI() {
  console.log("🧪 Testing Zoom API Connection...\n");

  const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
  const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
  const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

  // Step 1: Check credentials
  console.log("📋 Step 1: Checking credentials...");
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    console.error("❌ Missing Zoom credentials in .env file");
    console.log("Required:");
    console.log("  - ZOOM_ACCOUNT_ID:", ZOOM_ACCOUNT_ID ? "✅" : "❌");
    console.log("  - ZOOM_CLIENT_ID:", ZOOM_CLIENT_ID ? "✅" : "❌");
    console.log("  - ZOOM_CLIENT_SECRET:", ZOOM_CLIENT_SECRET ? "✅" : "❌");
    return;
  }
  console.log("✅ All credentials present\n");

  // Step 2: Get access token
  console.log("🔑 Step 2: Getting access token...");
  try {
    const authString = Buffer.from(
      `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenResponse = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;
    console.log(
      "✅ Access token obtained:",
      accessToken.substring(0, 20) + "...",
    );
    console.log(
      "   Token expires in:",
      tokenResponse.data.expires_in,
      "seconds\n",
    );

    // Step 3: Create a test meeting
    console.log("📅 Step 3: Creating test meeting...");
    const testDate = new Date();
    testDate.setHours(testDate.getHours() + 2); // 2 hours from now

    const meetingData = {
      topic: "Test Medical Appointment - Dr. Smith with John Doe",
      type: 2, // Scheduled meeting
      start_time: testDate.toISOString(),
      duration: 30,
      timezone: "Asia/Karachi",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: "both",
        auto_recording: "none",
      },
    };

    const meetingResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Test meeting created successfully!");
    console.log("\n📊 Meeting Details:");
    console.log("   Meeting ID:", meetingResponse.data.id);
    console.log("   Topic:", meetingResponse.data.topic);
    console.log("   Start Time:", meetingResponse.data.start_time);
    console.log("   Duration:", meetingResponse.data.duration, "minutes");
    console.log("   Join URL:", meetingResponse.data.join_url);
    console.log("   Password:", meetingResponse.data.password || "None");
    console.log("\n✅ Zoom integration is working correctly!");

    // Step 4: Delete the test meeting
    console.log("\n🗑️  Step 4: Cleaning up test meeting...");
    await axios.delete(
      `https://api.zoom.us/v2/meetings/${meetingResponse.data.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log("✅ Test meeting deleted\n");
    console.log("✅ All tests passed! Zoom API is configured correctly.");
  } catch (error) {
    console.error("\n❌ Error during testing:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error(
        "   Message:",
        error.response.data?.message || error.message,
      );
      console.error(
        "   Details:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error("   Error:", error.message);
    }
    console.log("\n💡 Common issues:");
    console.log(
      "   - Check if your Zoom account is Pro or higher (Basic accounts can't use API)",
    );
    console.log("   - Verify credentials are correct in .env file");
    console.log(
      "   - Check if Server-to-Server OAuth app is properly configured in Zoom Marketplace",
    );
  }
}

// Run the test
testZoomAPI();
