const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

const testZoom = async () => {
  try {
    // Step 1: Manual Base64 encoding
    const clientID = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const accountID = process.env.ZOOM_ACCOUNT_ID;

    console.log("🧪 Testing Zoom API Connection...\n");
    console.log("Account ID:", accountID);
    console.log("Client ID:", clientID);
    console.log(
      "Client Secret:",
      clientSecret ? "Present (hidden)" : "Missing",
    );

    const auth = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");

    // Step 2: Use x-www-form-urlencoded format as required by Zoom
    const response = await axios({
      method: "post",
      url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountID}`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("\n✅ Success! Access Token generated.");
    console.log("Token:", response.data.access_token.substring(0, 20) + "...");
    console.log("Expires in:", response.data.expires_in, "seconds");

    // Test creating a meeting
    console.log("\n📅 Testing meeting creation...");
    const testDate = new Date();
    testDate.setHours(testDate.getHours() + 2);

    const meetingResponse = await axios({
      method: "post",
      url: "https://api.zoom.us/v2/users/me/meetings",
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        "Content-Type": "application/json",
      },
      data: {
        topic: "Test Medical Appointment",
        type: 2,
        start_time: testDate.toISOString(),
        duration: 30,
        timezone: "Asia/Karachi",
      },
    });

    console.log("✅ Test meeting created!");
    console.log("Meeting ID:", meetingResponse.data.id);
    console.log("Join URL:", meetingResponse.data.join_url);

    // Clean up
    await axios({
      method: "delete",
      url: `https://api.zoom.us/v2/meetings/${meetingResponse.data.id}`,
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });
    console.log("✅ Test meeting deleted");
    console.log(
      "\n🎉 All tests passed! Zoom integration is working correctly!",
    );
  } catch (error) {
    console.log(
      "\n❌ Error Reason:",
      error.response?.data?.reason || error.message,
    );
    console.log("Full Error:", error.response?.data || error.message);
  }
};

testZoom();
