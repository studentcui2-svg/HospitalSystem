// Test script to verify Lab Portal API integration
// Run this with: node test-lab-api.js

const API_BASE = "http://localhost:5000";

async function testLabAPI() {
  console.log("🧪 Testing Lab Portal API Integration\n");
  console.log("=".repeat(50));

  // Test 1: Health check
  console.log("\n1️⃣ Testing backend health...");
  try {
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log("✅ Backend Status:", healthData);
  } catch (err) {
    console.error("❌ Backend not accessible:", err.message);
    return;
  }

  // Test 2: Lab API endpoint (will fail without valid token, but should return 401/403, not 404)
  console.log("\n2️⃣ Testing Lab API endpoint...");
  try {
    const labRes = await fetch(`${API_BASE}/api/lab`);
    console.log("Status Code:", labRes.status);
    const labData = await labRes.text();

    if (labRes.status === 404) {
      console.log("❌ FAIL: Endpoint returns 404 - Route not registered!");
    } else if (labRes.status === 401 || labRes.status === 403) {
      console.log("✅ PASS: Endpoint exists (requires authentication)");
      console.log("Response:", labData.substring(0, 100));
    } else {
      console.log("Response:", labData.substring(0, 100));
    }
  } catch (err) {
    console.error("❌ Error testing lab endpoint:", err.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📋 Summary:");
  console.log("- Backend is running: ✅");
  console.log("- Lab API endpoint exists: Check status above");
  console.log("\n💡 Next steps:");
  console.log("1. Make sure backend is running on port 5000");
  console.log("2. Login to get a valid token");
  console.log("3. Use the token to fetch lab tests");
  console.log("\n🔧 For Vercel deployment:");
  console.log(
    "- Set VITE_API_BASE_URL environment variable to your backend URL",
  );
  console.log("- Or set window.__API_BASE__ in index.html");
}

testLabAPI().catch(console.error);
