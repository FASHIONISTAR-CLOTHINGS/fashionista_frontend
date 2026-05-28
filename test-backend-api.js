import axios from 'axios';

(async () => {
  const backendUrl = "https://fashionistar-backend-259415881346.europe-west1.run.app/api/v1/auth/register/";
  const payload = {
    email: `test.backend.${Date.now()}@fashionistar.io`,
    first_name: "Chidi",
    last_name: "Client",
    password: "FashionTestUser2026!",
    password2: "FashionTestUser2026!",
    role: "client"
  };

  console.log(`Sending direct POST to: ${backendUrl}`);
  console.log("Payload:", JSON.stringify(payload));

  try {
    const response = await axios.post(backendUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000
    });
    console.log(`[SUCCESS] Status: ${response.status}`);
    console.log("Response Body:", JSON.stringify(response.data));
  } catch (err) {
    console.error(`[ERROR] status: ${err.response?.status}`);
    console.error("Error Response Body:", JSON.stringify(err.response?.data));
    console.error("Error Message:", err.message);
  }
})();
