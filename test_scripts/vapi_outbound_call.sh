VAPI_API_KEY="key_here"
PHONE_NUMBER_ID="0b870701-dd5b-4b5d-9c8e-486044be3091"
TO_PHONE="+37379334046"
VOICE_PROVIDER="11labs"
VOICE_ID="Will"   # example voice
TEXT="Hello. This is an automated call made using Vapi AI. This is an automated call made using Vapi AI."

curl -X POST "https://api.vapi.ai/call/phone" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"phoneNumberId\": \"$PHONE_NUMBER_ID\",
    \"assistant\": {
      \"model\": {
        \"provider\": \"openai\",
        \"model\": \"gpt-4.1-mini\"
      },
      \"voice\": {
        \"provider\": \"$VOICE_PROVIDER\",
        \"voiceId\": \"$VOICE_ID\"
      },
      \"firstMessage\": \"$TEXT\"
    },
    \"customer\": {
      \"number\": \"$TO_PHONE\"
    }
  }"



