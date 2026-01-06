VAPI_API_KEY="bf687aa6-a209-4e64-a532-93cafdc3cd65"
PHONE_NUMBER_ID="0b870701-dd5b-4b5d-9c8e-486044be3091"
ASSISTANT_ID="443ff8b4-7b81-4f82-b574-b9113aec7f93"
TO_PHONE="+37379334046"

curl -X POST "https://api.vapi.ai/call" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"assistantId\": \"$ASSISTANT_ID\",
    \"phoneNumberId\": \"$PHONE_NUMBER_ID\",
    \"customer\": {
      \"number\": \"$TO_PHONE\"
    }
  }"
