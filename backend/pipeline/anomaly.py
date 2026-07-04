import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import RawScores, RawAttendance, RawStudyLogs, Recommendations
from datetime import datetime, timedelta

def get_db():
    return SessionLocal()

# ============================================
# DETECT ANOMALIES
# ============================================

def detect_anomalies(student_id: str):
    db = get_db()
    anomalies = []

    try:
        # ----------------------------------------
        # ANOMALY 1: Sudden attendance drop
        # ----------------------------------------
        attendance_records = db.query(RawAttendance).filter(
            RawAttendance.student_id == student_id
        ).all()

        if len(attendance_records) >= 2:
            # Calculate attendance % for each record
            pcts = [
                round((r.classes_attended / r.total_classes) * 100, 2)
                for r in attendance_records if r.total_classes > 0
            ]
            if len(pcts) >= 2:
                latest  = pcts[-1]
                previous = pcts[-2]
                drop = previous - latest
                if drop >= 15:
                    anomalies.append({
                        "type": "ATTENDANCE_DROP",
                        "message": f"Attendance dropped by {round(drop, 1)}% recently. This is a significant drop. Please attend classes regularly to avoid shortage.",
                        "severity": "HIGH"
                    })
                elif drop >= 10:
                    anomalies.append({
                        "type": "ATTENDANCE_DROP",
                        "message": f"Attendance dropped by {round(drop, 1)}% recently. Try to attend more classes this week.",
                        "severity": "MEDIUM"
                    })

        # ----------------------------------------
        # ANOMALY 2: Sudden score drop
        # ----------------------------------------
        score_records = db.query(RawScores).filter(
            RawScores.student_id == student_id
        ).order_by(RawScores.loaded_at).all()

        if len(score_records) >= 2:
            def total(s):
                return float(s.assignment_score or 0)*0.2 + float(s.midterm_score or 0)*0.3 + float(s.final_score or 0)*0.5

            latest_score   = total(score_records[-1])
            previous_score = total(score_records[-2])
            drop = previous_score - latest_score

            if drop >= 20:
                anomalies.append({
                    "type": "SCORE_DROP",
                    "message": f"Your score dropped by {round(drop, 1)} points compared to your last submission. Focus on weak subjects and revise regularly.",
                    "severity": "HIGH"
                })
            elif drop >= 10:
                anomalies.append({
                    "type": "SCORE_DROP",
                    "message": f"Your score dropped by {round(drop, 1)} points. Try to identify which topics need more attention.",
                    "severity": "MEDIUM"
                })

        # ----------------------------------------
        # ANOMALY 3: Low sleep detected
        # ----------------------------------------
        recent_logs = db.query(RawStudyLogs).filter(
            RawStudyLogs.student_id == student_id,
            RawStudyLogs.log_date >= (datetime.now() - timedelta(days=7)).date()
        ).all()

        if recent_logs:
            avg_sleep = sum(float(l.sleep_hours or 0) for l in recent_logs) / len(recent_logs)
            if avg_sleep < 5:
                anomalies.append({
                    "type": "LOW_SLEEP",
                    "message": f"You have been sleeping only {round(avg_sleep, 1)} hours on average this week. Sleep deprivation seriously affects memory and performance.",
                    "severity": "HIGH"
                })

        # ----------------------------------------
        # ANOMALY 4: Attendance below 75%
        # ----------------------------------------
        if attendance_records:
            total_attended = sum(r.classes_attended for r in attendance_records)
            total_classes  = sum(r.total_classes for r in attendance_records)
            overall_pct    = round((total_attended / total_classes) * 100, 2) if total_classes > 0 else 0

            if overall_pct < 75:
                anomalies.append({
                    "type": "LOW_ATTENDANCE",
                    "message": f"Overall attendance is {overall_pct}% which is below the required 75%. You may be detained from exams if this continues.",
                    "severity": "HIGH"
                })

        # ----------------------------------------
        # SAVE ANOMALIES AS RECOMMENDATIONS
        # ----------------------------------------
        for anomaly in anomalies:
            rec = Recommendations(
                student_id=student_id,
                type=anomaly["type"],
                message=anomaly["message"],
                generated_at=datetime.now()
            )
            db.add(rec)

        db.commit()

        return {
            "student_id": student_id,
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies
        }

    except Exception as e:
        print(f"Anomaly detection error: {e}")
        return {"error": str(e)}
    finally:
        db.close()


if __name__ == "__main__":
    print("Anomaly detector ready")