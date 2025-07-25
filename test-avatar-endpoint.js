/**
 * Simple test to verify avatar API endpoint
 */

// Test using a mock session-like request
async function testAvatarEndpoint() {
  try {
    console.log("🧪 Testing avatar generation endpoint...");
    
    const response = await fetch("http://localhost:3000/api/profile/avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: This will fail with 401 since we don't have a real session
      },
      body: JSON.stringify({
        generateAI: true,
        customPrompt: "friendly person with glasses"
      })
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log("📄 Response body:", responseData);

  } catch (error) {
    console.error("💥 Request failed:", error);
  }
}

testAvatarEndpoint();
