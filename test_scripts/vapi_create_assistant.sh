VAPI_API_KEY="key_here"

curl -X POST "https://api.vapi.ai/assistant" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Assistant",
    "model": {
      "provider": "openai",
      "model": "gpt-4o",
      "messages": [{ "role": "system", "content": "You are Alex, a customer service voice assistant for TechSolutions." }]
    },
    "voice": { "provider": "11labs", "voiceId": "cgSgspJ2msm6clMCkdW9" },
    "firstMessage": "Hi there, this is Alex from TechSolutions customer support. How can I help you today?"
  }'