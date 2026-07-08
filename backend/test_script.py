import urllib.request
import json

base_url = "http://localhost:8000"
endpoints = [
    "/",
    "/api/analytics/pipeline/status",
    "/api/analytics/leaderboard",
    "/api/analytics/batch/overview",
    "/api/data-quality/overview",
    "/api/insights/batch/summary",
    "/api/students/admin/overview",
    "/api/subjects/semesters"
]

results = []
student_id = None

for ep in endpoints:
    url = base_url + ep
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            body = response.read().decode()
            results.append((ep, status, "OK"))
            
            # If leaderboard, get a student ID
            if ep == "/api/analytics/leaderboard" and status == 200:
                data = json.loads(body)
                if "leaderboard" in data and len(data["leaderboard"]) > 0:
                    student_id = data["leaderboard"][0]["student_id"]
                    
    except urllib.error.HTTPError as e:
        results.append((ep, e.code, str(e)))
    except Exception as e:
        results.append((ep, 500, str(e)))

if student_id:
    student_endpoints = [
        f"/api/analytics/{student_id}",
        f"/api/analytics/cgpa/{student_id}",
        f"/api/analytics/subjects/{student_id}",
        f"/api/analytics/semesters/{student_id}",
        f"/api/analytics/anomalies/{student_id}",
        f"/api/insights/{student_id}/batch-comparison",
        f"/api/insights/{student_id}/correlations",
        f"/api/insights/{student_id}/narrative",
        f"/api/recommendations/{student_id}",
        f"/api/reports/{student_id}",
        f"/api/students/{student_id}"
    ]
    for sep in student_endpoints:
        surl = base_url + sep
        try:
            sreq = urllib.request.Request(surl)
            with urllib.request.urlopen(sreq, timeout=5) as sresponse:
                results.append((sep, sresponse.getcode(), "OK"))
        except urllib.error.HTTPError as e:
            results.append((sep, e.code, str(e)))
        except Exception as e:
            results.append((sep, 500, str(e)))

print("--- TEST RESULTS ---")
all_200 = True
for r in results:
    print(f"[{r[1]}] {r[0]} - {r[2]}")
    if r[1] != 200:
        all_200 = False

try:
    req = urllib.request.Request("http://localhost:3000")
    with urllib.request.urlopen(req, timeout=5) as response:
        code = response.getcode()
        print(f"[{code}] Frontend React App - OK")
        if code != 200: all_200 = False
except Exception as e:
    print(f"[ERROR] Frontend React App - {str(e)}")
    all_200 = False

if all_200:
    print("\nSUCCESS: All endpoints returned 200 OK!")
else:
    print("\nWARNING: Some endpoints did not return 200 OK.")
