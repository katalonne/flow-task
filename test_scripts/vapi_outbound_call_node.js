// call.js
const VAPI_API_KEY = "key_here";
const PHONE_NUMBER_ID = "0b870701-dd5b-4b5d-9c8e-486044be3091";
const ASSISTANT_ID = "443ff8b4-7b81-4f82-b574-b9113aec7f93";
const TO_PHONE = "+37379334046";

async function makeOutboundCall() {
  try {
    const url = "https://api.vapi.ai/call";
    // const body = {
    //   assistantId: ASSISTANT_ID,
    //   phoneNumberId: PHONE_NUMBER_ID,
    //   customer: { number: TO_PHONE },
    // };

    const body = {
      phoneNumberId: PHONE_NUMBER_ID,
      assistant: {
        model: { provider: "openai", model: "gpt-4.1-mini"},
        voice: { provider: "11labs", voiceId: "paula"},
        firstMessage: "Hello from fetch! Hello from fetch! Hello from fetch!"
      },
      customer: { number: TO_PHONE }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API returned error:", errorData);
      return;
    }

    const data = await response.json();
    console.log("Call created:", data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

makeOutboundCall();
