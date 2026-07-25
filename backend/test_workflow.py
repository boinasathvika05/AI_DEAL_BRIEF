import requests
import json
import sseclient
import sys

base_url = "http://localhost:8000/api"

payload = {
  "company_name": "OpenAI",
  "industry": "Artificial Intelligence",
  "country": "USA",
  "revenue": 2000000000,
  "ebitda": -500000000,
  "employees": 1500,
  "existing_debt": 0,
  "funding_amount": 5000000000,
  "funding_purpose": "Compute scaling and research",
  "years_in_business": 9,
  "business_description": "Leading AI research laboratory developing state-of-the-art LLMs."
}

print("Submitting deal...")
response = requests.post(f"{base_url}/deals", json=payload)
if response.status_code != 200:
    print("Error submitting deal:", response.text)
    sys.exit(1)

deal_id = response.json()["id"]
print(f"Deal submitted successfully. ID: {deal_id}")

print("Listening to stream...")
stream_response = requests.get(f"{base_url}/deals/{deal_id}/stream", stream=True)
client = sseclient.SSEClient(stream_response)

for event in client.events():
    print(f"Event: {event.event}")
    
    try:
        data = json.loads(event.data)
        if event.event == "progress":
            print(f"  [{data.get('step')}] {data.get('status')}: {data.get('message')}")
        elif event.event == "error":
            print(f"  Error: {data.get('message')}")
        elif event.event == "complete":
            print(f"  Complete!")
            break
    except Exception as e:
        print(f"  Raw data: {event.data}")
    
    if event.event == "close":
        print("Stream closed by server.")
        break
