import requests
import time

url = "http://127.0.0.1:8000/api/chat/2cc7017b-6536-4ce5-9d43-b6a5ccab1b8f"

questions = [
    "What is my attendance percentage?",
    "What is my GPA?"
]

for q in questions:
    start_time = time.time()
    resp = requests.post(url, json={"message": q})
    duration = time.time() - start_time
    print(f"Q: {q}")
    if resp.status_code == 200:
        print(f"A: {resp.json().get('response')}")
    else:
        print(f"Error: {resp.status_code} - {resp.text}")
    print(f"Time taken: {duration:.2f} seconds\n")
