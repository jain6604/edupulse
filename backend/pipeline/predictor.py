import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from database import SessionLocal
from models import RawScores, RawAttendance, RawStudyLogs, RiskScores, PerformanceSummary, MsritScores
from datetime import datetime

def get_db():
    return SessionLocal()

# ============================================
# GENERATE SYNTHETIC TRAINING DATA
# ============================================

def generate_training_data(n=500):
    np.random.seed(42)

    attendance   = np.random.uniform(30, 100, n)
    study_hours  = np.random.uniform(0, 10, n)
    sleep_hours  = np.random.uniform(3, 10, n)
    assignment   = np.random.uniform(20, 100, n)
    midterm      = np.random.uniform(20, 100, n)
    final        = np.random.uniform(20, 100, n)

    gpa = (
        assignment * 0.2 +
        midterm * 0.3 +
        final * 0.5 +
        study_hours * 1.5 +
        (attendance / 100) * 10 -
        np.abs(sleep_hours - 7) * 0.5 +
        np.random.normal(0, 2, n)
    ) / 12
    gpa = np.clip(gpa, 0, 10)

    risk = []
    for i in range(n):
        score = 0
        if attendance[i] >= 75: score += 40
        elif attendance[i] >= 60: score += 20
        if (assignment[i]*0.2 + midterm[i]*0.3 + final[i]*0.5) >= 70: score += 30
        elif (assignment[i]*0.2 + midterm[i]*0.3 + final[i]*0.5) >= 50: score += 15
        if study_hours[i] >= 4: score += 20
        elif study_hours[i] >= 2: score += 10
        if 6 <= sleep_hours[i] <= 8: score += 10
        elif sleep_hours[i] >= 5: score += 5
        if score >= 70: risk.append("LOW")
        elif score >= 40: risk.append("MEDIUM")
        else: risk.append("HIGH")

    X = np.column_stack([attendance, study_hours, sleep_hours, assignment, midterm, final])
    return X, np.array(gpa), np.array(risk)


# ============================================
# TRAIN MODELS
# ============================================

def train_models():
    X, gpa, risk = generate_training_data()
    gpa_model = LinearRegression()
    gpa_model.fit(X, gpa)
    le = LabelEncoder()
    risk_encoded = le.fit_transform(risk)
    risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
    risk_model.fit(X, risk_encoded)
    return gpa_model, risk_model, le


# ============================================
# PREDICT FOR A STUDENT
# ============================================

def predict_student(student_id: str):
    db = get_db()
    try:
        # Try MsritScores first
        msrit_scores = db.query(MsritScores).filter(
            MsritScores.student_id == student_id
        ).all()

        # Fallback to RawScores
        raw_scores = db.query(RawScores).filter(
            RawScores.student_id == student_id
        ).all()

        attendance = db.query(RawAttendance).filter(
            RawAttendance.student_id == student_id
        ).all()

        logs = db.query(RawStudyLogs).filter(
            RawStudyLogs.student_id == student_id
        ).all()

        if not msrit_scores and not raw_scores:
            return {"error": "No data found for this student"}

        # Calculate score features
        if msrit_scores:
            # Use MSRIT scores — convert internal_total to 100 scale
            # internal is /50, see_converted is /50, final is /100
            finals = [float(s.final_total or (float(s.internal_total or 0) * 2)) for s in msrit_scores]
            internals = [float(s.internal_total or 0) for s in msrit_scores]
            cie1s = [float(s.cie1_score or 0) for s in msrit_scores]
            cie2s = [float(s.cie2_score or 0) for s in msrit_scores]

            # Map to assignment/midterm/final equivalent
            avg_assignment = round(sum(cie1s) / len(cie1s) / 30 * 100, 2)
            avg_midterm    = round(sum(cie2s) / len(cie2s) / 30 * 100, 2)
            avg_final      = round(sum(finals) / len(finals), 2)
        else:
            avg_assignment = round(sum(float(s.assignment_score or 0) for s in raw_scores) / len(raw_scores), 2)
            avg_midterm    = round(sum(float(s.midterm_score or 0) for s in raw_scores) / len(raw_scores), 2)
            avg_final      = round(sum(float(s.final_score or 0) for s in raw_scores) / len(raw_scores), 2)

        attendance_pct = round(
            (sum(a.classes_attended for a in attendance) /
             sum(a.total_classes for a in attendance)) * 100, 2
        ) if attendance else 50.0

        avg_study = round(sum(float(l.hours_studied or 0) for l in logs) / len(logs), 2) if logs else 3.0
        avg_sleep = round(sum(float(l.sleep_hours or 0) for l in logs) / len(logs), 2) if logs else 7.0

        # Train and predict
        gpa_model, risk_model, le = train_models()
        features = np.array([[attendance_pct, avg_study, avg_sleep,
                               avg_assignment, avg_midterm, avg_final]])

        predicted_gpa  = round(float(gpa_model.predict(features)[0]), 2)
        predicted_gpa  = max(0, min(10, predicted_gpa))
        risk_encoded   = risk_model.predict(features)[0]
        predicted_risk = le.inverse_transform([risk_encoded])[0]

        # Save to DB
        existing = db.query(RiskScores).filter(RiskScores.student_id == student_id).first()
        if existing:
            existing.risk_level   = predicted_risk
            existing.risk_score   = predicted_gpa * 10
            existing.generated_at = datetime.now()
        else:
            db.add(RiskScores(
                student_id=student_id,
                risk_level=predicted_risk,
                risk_score=predicted_gpa * 10,
                generated_at=datetime.now()
            ))

        # Update performance summary
        summary = db.query(PerformanceSummary).filter(
            PerformanceSummary.student_id == student_id
        ).first()
        if summary:
            summary.gpa        = predicted_gpa
            summary.risk_level = predicted_risk
        else:
            db.add(PerformanceSummary(
                student_id=student_id,
                avg_score=avg_final,
                avg_attendance=attendance_pct,
                avg_study_hours=avg_study,
                avg_sleep_hours=avg_sleep,
                gpa=predicted_gpa,
                risk_level=predicted_risk,
                placement_score=0
            ))

        db.commit()

        return {
            "student_id": student_id,
            "predicted_gpa": predicted_gpa,
            "predicted_risk": predicted_risk,
            "data_source": "msrit_scores" if msrit_scores else "raw_scores",
            "features_used": {
                "attendance_pct": attendance_pct,
                "avg_study_hours": avg_study,
                "avg_sleep_hours": avg_sleep,
                "avg_assignment": avg_assignment,
                "avg_midterm": avg_midterm,
                "avg_final": avg_final
            }
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        return {"error": str(e)}
    finally:
        db.close()


if __name__ == "__main__":
    gpa_model, risk_model, le = train_models()
    print("GPA Model coefficients:", gpa_model.coef_)
    print("Risk classes:", le.classes_)
    