import requests
BASE='http://localhost:8000'
SID='433ba027-4f49-443d-95c1-84df3cea17f3'
try:
    r = requests.post(f'{BASE}/api/chat/{SID}', json={'message':'What is my GPA?'}, timeout=30)
    print('status', r.status_code)
    try:
        print('json:', r.json())
    except Exception:
        print('text:', r.text)
except Exception as e:
    print('error', e)
