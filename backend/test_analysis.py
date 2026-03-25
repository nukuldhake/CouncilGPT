import urllib.request
import json
import sys

# Mock debate history
history = [
    {"role": "user", "text": "Is space exploration worth the cost?"},
    {"agent": "Optimist", "text": "Absolutely! Space exploration drives technological innovation that benefits everything from medicine to communications. It inspires generations and pushes the boundaries of human knowledge."},
    {"agent": "Analyst", "text": "To add to that, every dollar spent on NASA is estimated to return between $7 and $21 to the economy through spinoff technologies and commercial applications. The GPS alone, a product of satellite tech, accounts for billions in annual global value."},
    {"agent": "Critic", "text": "But at what cost? We have crumbling infrastructure, climate change, and poverty right here on Earth. Spending billions on Mars while millions lack basic necessities is a failure of priorities. The spinoffs are often accidental and could be achieved through direct research on Earth-bound problems."},
    {"agent": "Judge", "text": "While the economic spinoffs are impressive, the Critic's point about immediate Earthly priorities is hard to ignore. We are basically buying a fancy telescope while the house is on fire. Case closed: space is a luxury we shouldn't be prioritizing so heavily right now."}
]

req_data = {
    "topic": "Is space exploration worth the cost?",
    "history": history,
    "agent": "Insight_Analyst" # Reusing TurnRequest schema
}

req = urllib.request.Request(
    'http://localhost:8000/api/debate/analyze',
    method='POST',
    headers={'Content-Type': 'application/json'},
    data=json.dumps(req_data).encode('utf-8')
)

try:
    print("Sending request to /api/debate/analyze...")
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    print("\nResponse received:")
    print(json.dumps(data, indent=2))
    
    # Simple assertions
    assert "agents" in data, "Response missing 'agents' key"
    assert "contradictions" in data, "Response missing 'contradictions' key"
    assert len(data["agents"]) > 0, "Agents list is empty"
    
except Exception as e:
    print("\nError:", e)
    sys.exit(1)
