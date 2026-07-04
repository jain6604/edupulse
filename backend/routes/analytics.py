from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import (DimStudent, RawScores, RawAttendance, RawStudyLogs,
                    StudentSkills, Achievements, RiskScores,
                    PlacementScores, PerformanceSummary, DimSubject, MsritScores)
from datetime import datetime
from pipeline.etl import run_pipeline
from pipeline.predictor import predict_student
from pipeline.anomaly import detect_anomalies
from pipeline_state import set_pipeline_status

router = APIRouter()

# ============================================
# HELPER FUNCTIONS
# ============================================

def calculate_risk(attendance_pct: float, avg_score: float, avg_study_hours: float, avg_sleep: float):
    score = 0
    if attendance_pct >= 75: score += 40
    elif attendance_pct >= 60: score += 20
    if avg_score >= 70: score += 30
    elif avg_score >= 50: score += 15
    if avg_study_hours >= 4: score += 20
    elif avg_study_hours >= 2: score += 10
    if 6 <= avg_sleep <= 8: score += 10
    elif avg_sleep >= 5: score += 5
    if score >= 70: risk_level = "LOW"
    elif score >= 40: risk_level = "MEDIUM"
    else: risk_level = "HIGH"
    return score, risk_level


def calculate_placement_score(avg_score: float, attendance_pct: float, skills: list, achievements: list):
    score = 0
    strong_areas = []
    weak_areas = []
    if avg_score >= 70: score += 30; strong_areas.append("Academics")
    elif avg_score >= 50: score += 15
    else: weak_areas.append("Academics")
    if attendance_pct >= 75: score += 20; strong_areas.append("Attendance")
    elif attendance_pct >= 60: score += 10
    else: weak_areas.append("Attendance")
    skill_score = min(len(skills) * 5, 30)
    score += skill_score
    if skill_score >= 20: strong_areas.append("Technical Skills")
    else: weak_areas.append("Technical Skills")
    achievement_score = min(len(achievements) * 5, 20)
    score += achievement_score
    if achievement_score >= 10: strong_areas.append("Achievements")
    else: weak_areas.append("Achievements")
    return round(score, 2), ", ".join(strong_areas), ", ".join(weak_areas)


# ============================================
# LEADERBOARD
# ============================================
@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    students = db.query(DimStudent).all()
    leaderboard = []

    for student in students:
        scores = db.query(RawScores).filter(RawScores.student_id == student.student_id).all()
        attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student.student_id).all()

        avg_score = round(sum(
            float(s.assignment_score or 0) * 0.2 +
            float(s.midterm_score or 0) * 0.3 +
            float(s.final_score or 0) * 0.5
            for s in scores) / len(scores), 2) if scores else 0

        attendance_pct = round(
            (sum(a.classes_attended for a in attendance) /
             sum(a.total_classes for a in attendance)) * 100, 2
        ) if attendance else 0

        gpa = round((avg_score / 100) * 10, 2)

        leaderboard.append({
            "branch": student.branch,
            "avg_score": avg_score,
            "attendance_pct": attendance_pct,
            "gpa": gpa
        })

    leaderboard.sort(key=lambda x: x["avg_score"], reverse=True)
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1

    return {
        "total_students": len(leaderboard),
        "leaderboard": leaderboard
    }


# ============================================
# GET FULL ANALYTICS
# ============================================
@router.get("/{student_id}")
def get_analytics(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if MSRIT scores exist for this student
    msrit_scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
    
    if msrit_scores:
        # Use MSRIT scores for analytics
        avg_score = round(sum(float(s.final_total or 0) for s in msrit_scores) / len(msrit_scores), 2) if msrit_scores else 0
    else:
        # Fall back to old RawScores
        scores = db.query(RawScores).filter(RawScores.student_id == student_id).all()
        avg_score = 0
        if scores:
            totals = [(float(s.assignment_score or 0) * 0.2 +
                       float(s.midterm_score or 0) * 0.3 +
                       float(s.final_score or 0) * 0.5) for s in scores]
            avg_score = round(sum(totals) / len(totals), 2)

    attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
    attendance_pct = 0
    if attendance:
        total_attended = sum(a.classes_attended for a in attendance)
        total_classes = sum(a.total_classes for a in attendance)
        attendance_pct = round((total_attended / total_classes) * 100, 2)

    logs = db.query(RawStudyLogs).filter(RawStudyLogs.student_id == student_id).all()
    avg_study_hours = round(sum(float(l.hours_studied or 0) for l in logs) / len(logs), 2) if logs else 0
    avg_sleep = round(sum(float(l.sleep_hours or 0) for l in logs) / len(logs), 2) if logs else 0

    skills = db.query(StudentSkills).filter(StudentSkills.student_id == student_id).all()
    achievements = db.query(Achievements).filter(Achievements.student_id == student_id).all()

    gpa = round((avg_score / 100) * 10, 2)
    risk_score, risk_level = calculate_risk(attendance_pct, avg_score, avg_study_hours, avg_sleep)
    placement_score, strong_areas, weak_areas = calculate_placement_score(
        avg_score, attendance_pct, skills, achievements
    )

    return {
        "student_id": student_id,
        "name": student.name,
        "avg_score": avg_score,
        "attendance_percentage": attendance_pct,
        "avg_study_hours": avg_study_hours,
        "avg_sleep_hours": avg_sleep,
        "gpa": gpa,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "placement_score": placement_score,
        "strong_areas": strong_areas,
        "weak_areas": weak_areas,
        "total_skills": len(skills),
        "total_achievements": len(achievements)
    }


# ============================================
# GET RISK ONLY
# ============================================
@router.get("/{student_id}/risk")
def get_risk(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    scores = db.query(RawScores).filter(RawScores.student_id == student_id).all()
    attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
    logs = db.query(RawStudyLogs).filter(RawStudyLogs.student_id == student_id).all()

    avg_score = round(sum(float(s.final_score or 0) for s in scores) / len(scores), 2) if scores else 0
    attendance_pct = round((sum(a.classes_attended for a in attendance) / sum(a.total_classes for a in attendance)) * 100, 2) if attendance else 0
    avg_study = round(sum(float(l.hours_studied or 0) for l in logs) / len(logs), 2) if logs else 0
    avg_sleep = round(sum(float(l.sleep_hours or 0) for l in logs) / len(logs), 2) if logs else 0

    risk_score, risk_level = calculate_risk(attendance_pct, avg_score, avg_study, avg_sleep)
    return {"student_id": student_id, "risk_level": risk_level, "risk_score": risk_score}


# ============================================
# GET BATCH ANALYTICS
# ============================================
@router.get("/batch/overview")
def get_batch_analytics(db: Session = Depends(get_db)):
    students = db.query(DimStudent).all()
    if not students:
        return {"message": "No students found"}

    batch_data = []
    for student in students:
        scores = db.query(RawScores).filter(RawScores.student_id == student.student_id).all()
        attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student.student_id).all()
        avg_score = round(sum(float(s.final_score or 0) for s in scores) / len(scores), 2) if scores else 0
        attendance_pct = round((sum(a.classes_attended for a in attendance) / sum(a.total_classes for a in attendance)) * 100, 2) if attendance else 0
        batch_data.append({
            "name": student.name,
            "branch": student.branch,
            "avg_score": avg_score,
            "attendance_pct": attendance_pct
        })

    batch_data.sort(key=lambda x: x["avg_score"], reverse=True)
    return {
        "total_students": len(students),
        "top_performers": batch_data[:10],
        "batch_avg_score": round(sum(s["avg_score"] for s in batch_data) / len(batch_data), 2),
        "batch_avg_attendance": round(sum(s["attendance_pct"] for s in batch_data) / len(batch_data), 2)
    }


# ============================================
# CGPA CALCULATOR
# ============================================
@router.get("/cgpa/{student_id}")
def get_cgpa(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    msrit_scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
    if msrit_scores:
        total_grade_points = 0
        total_credits = 0
        for s in msrit_scores:
            subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
            credits = subject.credits if subject else 4
            grade_point = (float(s.final_total or 0) / 10)
            total_grade_points += grade_point * credits
            total_credits += credits
        cgpa = round(total_grade_points / total_credits, 2) if total_credits > 0 else 0
        return {
            "student_id": student_id,
            "cgpa": cgpa,
            "total_credits": total_credits,
            "subjects_completed": len(msrit_scores),
            "grade_points_earned": total_grade_points
        }

    scores = db.query(RawScores).filter(RawScores.student_id == student_id).all()
    if not scores:
        return {"cgpa": 0, "total_credits": 0, "subjects_completed": 0}

    total_grade_points = 0
    total_credits = 0

    for s in scores:
        subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
        credits = subject.credits if subject else 4
        total_score = round(
            float(s.assignment_score or 0) * 0.2 +
            float(s.midterm_score or 0) * 0.3 +
            float(s.final_score or 0) * 0.5, 2
        )
        if total_score >= 90: grade_point = 10
        elif total_score >= 80: grade_point = 9
        elif total_score >= 70: grade_point = 8
        elif total_score >= 60: grade_point = 7
        elif total_score >= 55: grade_point = 6
        elif total_score >= 50: grade_point = 5
        elif total_score >= 45: grade_point = 4
        elif total_score >= 40: grade_point = 3
        else: grade_point = 0
        total_grade_points += grade_point * credits
        total_credits += credits

    cgpa = round(total_grade_points / total_credits, 2) if total_credits > 0 else 0
    return {
        "student_id": student_id,
        "cgpa": cgpa,
        "total_credits": total_credits,
        "subjects_completed": len(scores),
        "grade_points_earned": total_grade_points
    }


# ============================================
# SUBJECT-WISE PERFORMANCE
# ============================================
@router.get("/subjects/{student_id}")
def get_subject_performance(student_id: str, semester: Optional[int] = None, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    msrit_scores_query = db.query(MsritScores).filter(MsritScores.student_id == student_id)
    msrit_scores_all = msrit_scores_query.all()
    
    if msrit_scores_all:
        # Determine which semester to use
        if semester is not None:
            target_semester = semester
        else:
            # Find the highest semester_number among their subjects
            highest_sem = 1
            for s in msrit_scores_all:
                subj = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
                if subj and subj.semester_number and subj.semester_number > highest_sem:
                    highest_sem = subj.semester_number
            target_semester = highest_sem
            
        # Filter scores by the target semester
        filtered_scores = []
        for s in msrit_scores_all:
            subj = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
            if subj and subj.semester_number == target_semester:
                filtered_scores.append((s, subj))
                
        result = []
        for s, subject in filtered_scores:
            result.append({
                "subject_name": subject.subject_name if subject else "Unknown",
                "final_total": float(s.final_total or 0),
                "internal_total": float(s.internal_total or 0),
                "cie1_score": float(s.cie1_score or 0),
                "cie2_score": float(s.cie2_score or 0),
                "credits": subject.credits if subject else 4
            })
        return {
            "student_id": student_id,
            "semester_number": target_semester,
            "subjects": result,
            "total_subjects": len(result)
        }

    scores = db.query(RawScores).filter(RawScores.student_id == student_id).all()
    result = []
    for s in scores:
        subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
        total = round(
            float(s.assignment_score or 0) * 0.2 +
            float(s.midterm_score or 0) * 0.3 +
            float(s.final_score or 0) * 0.5, 2
        )
        result.append({
            "subject_name": subject.subject_name if subject else "Unknown",
            "assignment_score": float(s.assignment_score or 0),
            "midterm_score": float(s.midterm_score or 0),
            "final_score": float(s.final_score or 0),
            "total_score": total,
            "credits": subject.credits if subject else 4
        })

    return {
        "student_id": student_id,
        "semester_number": 1,
        "subjects": result,
        "total_subjects": len(result)
    }

@router.get("/semesters/{student_id}")
def get_student_semesters(student_id: str, db: Session = Depends(get_db)):
    msrit_scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
    semesters = set()
    for s in msrit_scores:
        subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
        if subject and subject.semester_number:
            semesters.add(subject.semester_number)
    return {"semesters": sorted(list(semesters))}



# ============================================
# TRIGGER ETL PIPELINE
# ============================================
@router.post("/pipeline/run")
def trigger_pipeline():
    try:
        run_pipeline()
        set_pipeline_status("Success")
        return {"message": "ETL Pipeline completed successfully"}
    except Exception as e:
        set_pipeline_status(f"Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# TRIGGER ML PREDICTION
# ============================================
@router.post("/predict/{student_id}")
def predict(student_id: str, db: Session = Depends(get_db)):
    result = predict_student(student_id)
    return result


# ============================================
# TRIGGER ANOMALY DETECTION
# ============================================
@router.get("/anomalies/{student_id}")
def anomalies(student_id: str):
    result = detect_anomalies(student_id)
    return result