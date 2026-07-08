import requests
BASE = 'http://localhost:8000'
SID = '433ba027-4f49-443d-95c1-84df3cea17f3'

tests = [
    ('GET', f'{BASE}/'),
    ('GET', f'{BASE}/api/analytics/{SID}'),
    ('GET', f'{BASE}/api/analytics/cgpa/{SID}'),
    ('GET', f'{BASE}/api/analytics/subjects/{SID}'),
    ('GET', f'{BASE}/api/analytics/leaderboard'),
    ('GET', f'{BASE}/api/analytics/pipeline/status'),
    ('GET', f'{BASE}/api/analytics/semesters/{SID}'),
    ('GET', f'{BASE}/api/insights/{SID}/batch-comparison'),
    ('GET', f'{BASE}/api/insights/{SID}/correlations'),
    ('GET', f'{BASE}/api/insights/{SID}/narrative'),
    ('GET', f'{BASE}/api/insights/batch/summary'),
    ('GET', f'{BASE}/api/data-quality/overview'),
    ('GET', f'{BASE}/api/subjects/branch/CSE'),
    ('GET', f'{BASE}/api/students/{SID}/photo'),
    ('GET', f'{BASE}/api/msrit-scores/{SID}'),
]

print('=== API ENDPOINT TESTS ===')
all_passed = True
for method, url in tests:
    try:
        r = requests.get(url, timeout=10)
        status = 'PASS ✅' if r.status_code == 200 else f'FAIL ❌ ({r.status_code})'
        if r.status_code != 200:
            all_passed = False
        print(f'{status} | {url.split(BASE)[1]}')
    except Exception as e:
        print(f'ERROR ❌ | {url.split(BASE)[1]}: {e}')
        all_passed = False

# POST endpoints
post_tests = [
    ('Admin Login', f'{BASE}/api/students/admin/login', {'email':'admin@msrit.edu','password':'6604'}),
    ('Student Login', f'{BASE}/api/students/login', {'email':'arjun.1ms22cs001@msrit.edu','password':'Student@123'}),
    ('ML Predict', f'{BASE}/api/analytics/predict/{SID}', {}),
]

for name, url, payload in post_tests:
    try:
        r = requests.post(url, json=payload, timeout=10)
        status = 'PASS ✅' if r.status_code == 200 else f'FAIL ❌ ({r.status_code})'
        if r.status_code != 200:
            all_passed = False
        print(f'{status} | POST {name}')
    except Exception as e:
        print(f'ERROR ❌ | POST {name}: {e}')
        all_passed = False

# Chat endpoint (with timeout since Gemini can be slow)
try:
    r = requests.post(f'{BASE}/api/chat/{SID}', json={'message':'What is my GPA?'}, timeout=30)
    status = 'PASS ✅' if r.status_code == 200 else f'FAIL ❌ ({r.status_code})'
    print(f'{status} | POST AI Chat')
except Exception as e:
    print(f'ERROR ❌ | POST AI Chat: {e}')

print(f'\n{ "ALL TESTS PASSED ✅" if all_passed else "SOME TESTS FAILED ❌" }')
