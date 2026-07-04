from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import DimStudent, RawScores, RawAttendance, RawStudyLogs, StudentSkills, Recommendations
from datetime import datetime

router = APIRouter()

# ============================================
# GENERATE SMART RECOMMENDATIONS
# ============================================
@router.get("/{student_id}")
def get_recommendations(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    recommendations = []

    # Get data
    scores     = db.query(RawScores).filter(RawScores.student_id == student_id).all()
    attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
    logs       = db.query(RawStudyLogs).filter(RawStudyLogs.student_id == student_id).all()
    skills     = db.query(StudentSkills).filter(StudentSkills.student_id == student_id).all()

    # Calculate metrics
    avg_score = round(sum(float(s.final_score or 0) for s in scores) / len(scores), 2) if scores else 0
    attendance_pct = round(
        (sum(a.classes_attended for a in attendance) /
         sum(a.total_classes for a in attendance)) * 100, 2
    ) if attendance else 0
    avg_study = round(sum(float(l.hours_studied or 0) for l in logs) / len(logs), 2) if logs else 0
    avg_sleep = round(sum(float(l.sleep_hours or 0) for l in logs) / len(logs), 2) if logs else 0

    # ============================================
    # ATTENDANCE RECOMMENDATIONS
    # ============================================
    if attendance_pct < 75:
        recommendations.append({
            "type": "ATTENDANCE",
            "message": f"Your attendance is {attendance_pct}% which is below the required 75%. Try to attend at least 2 more classes per week to get back on track."
        })
    elif attendance_pct < 85:
        recommendations.append({
            "type": "ATTENDANCE",
            "message": f"Your attendance is {attendance_pct}%. Good, but there is room for improvement. Aim for 90%+ to stay safe."
        })

    # ============================================
    # SCORE RECOMMENDATIONS
    # ============================================
    if avg_score < 50:
        recommendations.append({
            "type": "ACADEMICS",
            "message": f"Your average score is {avg_score}. You are at risk of failing. Focus on your weak subjects and consider seeking help from your professors."
        })
    elif avg_score < 70:
        recommendations.append({
            "type": "ACADEMICS",
            "message": f"Your average score is {avg_score}. You can do better. Try solving past papers and spending more time on theory."
        })
    else:
        recommendations.append({
            "type": "ACADEMICS",
            "message": f"Great work! Your average score is {avg_score}. Keep it up and aim for distinction."
        })

    # ============================================
    # STUDY HOURS RECOMMENDATIONS
    # ============================================
    if avg_study < 2:
        recommendations.append({
            "type": "STUDY",
            "message": f"You are studying only {avg_study} hours per day on average. Top performers study at least 4-5 hours. Try adding 1 extra hour each day."
        })
    elif avg_study < 4:
        recommendations.append({
            "type": "STUDY",
            "message": f"You study {avg_study} hours per day. Consider increasing to 4+ hours for better results."
        })

    # ============================================
    # SLEEP RECOMMENDATIONS
    # ============================================
    if avg_sleep < 6:
        recommendations.append({
            "type": "SLEEP",
            "message": f"You are sleeping only {avg_sleep} hours. Poor sleep directly impacts memory and focus. Aim for 7-8 hours every night."
        })
    elif avg_sleep > 9:
        recommendations.append({
            "type": "SLEEP",
            "message": f"You are sleeping {avg_sleep} hours which is more than recommended. Try to maintain a 7-8 hour sleep schedule."
        })

    # ============================================
    # SKILL RECOMMENDATIONS
    # ============================================
    skill_names = [s.skill_name.lower() for s in skills]

    if "python" not in skill_names:
        recommendations.append({
            "type": "SKILL",
            "message": "Python is the most in-demand skill for Data roles. Start with basics on freeCodeCamp or W3Schools."
        })
    if "sql" not in skill_names:
        recommendations.append({
            "type": "SKILL",
            "message": "SQL is essential for any data or backend role. Practice on SQLZoo or LeetCode."
        })
    if "power bi" not in skill_names and "powerbi" not in skill_names:
        recommendations.append({
            "type": "SKILL",
            "message": "Power BI is highly valued for analytics roles. Microsoft offers free learning at learn.microsoft.com."
        })

    # Save recommendations to DB
    for rec in recommendations:
        new_rec = Recommendations(
            student_id=student_id,
            type=rec["type"],
            message=rec["message"],
            generated_at=datetime.now()
        )
        db.add(new_rec)
    db.commit()

    return {
        "student_id": student_id,
        "total_recommendations": len(recommendations),
        "recommendations": recommendations
    }