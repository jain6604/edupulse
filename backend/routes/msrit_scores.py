from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import MsritScores, DimStudent, DimSubject, DimSemester, RawAttendance
from schemas import MsritScoreCreate, MsritScoreResponse
from typing import List

router = APIRouter()

@router.post("/{student_id}", response_model=MsritScoreResponse)
def submit_msrit_scores(student_id: str, score: MsritScoreCreate, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    subject = db.query(DimSubject).filter(DimSubject.subject_id == score.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Validate ranges
    if not (0 <= score.cie1_score <= 30):
        raise HTTPException(status_code=400, detail="CIE 1 must be between 0 and 30")
    if not (0 <= score.cie2_score <= 30):
        raise HTTPException(status_code=400, detail="CIE 2 must be between 0 and 30")
    if not (0 <= score.component1_score <= 10):
        raise HTTPException(status_code=400, detail="Component 1 must be between 0 and 10")
    if not (0 <= score.component2_score <= 10):
        raise HTTPException(status_code=400, detail="Component 2 must be between 0 and 10")

    # Calculate derived fields
    avg_cie = round((score.cie1_score + score.cie2_score) / 2, 2)
    internal_total = round(avg_cie + score.component1_score + score.component2_score, 2)

    see_converted = None
    final_total = None
    if score.see_score is not None:
        if not (0 <= score.see_score <= 100):
            raise HTTPException(status_code=400, detail="SEE must be between 0 and 100")
        see_converted = round(score.see_score / 2, 2)
        final_total = round(internal_total + see_converted, 2)

    new_score = MsritScores(
        student_id=student_id,
        subject_id=score.subject_id,
        semester_id=score.semester_id,
        cie1_score=score.cie1_score,
        cie2_score=score.cie2_score,
        component1_score=score.component1_score,
        component2_score=score.component2_score,
        avg_cie=avg_cie,
        internal_total=internal_total,
        see_score=score.see_score,
        see_converted=see_converted,
        final_total=final_total
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score

@router.get("/{student_id}", response_model=List[MsritScoreResponse])
def get_msrit_scores(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
    return scores

@router.get("/{student_id}/summary")
def get_score_summary(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
    if not scores:
        return {"message": "No scores found", "subjects": []}

    summary = []
    for s in scores:
        subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
        grade = ""
        if s.final_total is not None:
            ft = float(s.final_total)
            if ft >= 90: grade = "O"
            elif ft >= 80: grade = "A+"
            elif ft >= 70: grade = "A"
            elif ft >= 60: grade = "B+"
            elif ft >= 55: grade = "B"
            elif ft >= 50: grade = "C"
            elif ft >= 40: grade = "P"
            else: grade = "F"

        summary.append({
            "subject_name": subject.subject_name if subject else "Unknown",
            "credits": subject.credits if subject else 4,
            "cie1": float(s.cie1_score or 0),
            "cie2": float(s.cie2_score or 0),
            "avg_cie": float(s.avg_cie or 0),
            "component1": float(s.component1_score or 0),
            "component2": float(s.component2_score or 0),
            "internal_total": float(s.internal_total or 0),
            "see_score": float(s.see_score) if s.see_score else None,
            "see_converted": float(s.see_converted) if s.see_converted else None,
            "final_total": float(s.final_total) if s.final_total else None,
            "grade": grade
        })

    total_credits = sum(s["credits"] for s in summary if s["final_total"] is not None)
    total_grade_points = 0
    for s in summary:
        if s["final_total"] is not None:
            ft = s["final_total"]
            if ft >= 90: gp = 10
            elif ft >= 80: gp = 9
            elif ft >= 70: gp = 8
            elif ft >= 60: gp = 7
            elif ft >= 55: gp = 6
            elif ft >= 50: gp = 5
            elif ft >= 40: gp = 4
            else: gp = 0
            total_grade_points += gp * s["credits"]

    cgpa = round(total_grade_points / total_credits, 2) if total_credits > 0 else 0

    return {
        "student_id": student_id,
        "subjects": summary,
        "total_subjects": len(summary),
        "cgpa": cgpa,
        "total_credits": total_credits
    }

@router.get("/{student_id}/detention-risk")
def get_detention_risk(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    attendance_records = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
    if not attendance_records:
        return {"message": "No attendance data found"}

    results = []
    for a in attendance_records:
        subject = db.query(DimSubject).filter(DimSubject.subject_id == a.subject_id).first()
        attended = a.classes_attended
        total = a.total_classes
        current_pct = round((attended / total) * 100, 2) if total > 0 else 0

        classes_needed = 0
        if current_pct < 75:
            classes_needed = max(0, round((0.75 * total - attended) / 0.25))

        can_miss = 0
        if current_pct >= 75:
            can_miss = max(0, int(attended - 0.75 * total))

        results.append({
            "subject_name": subject.subject_name if subject else "Unknown",
            "classes_attended": attended,
            "total_classes": total,
            "current_percentage": current_pct,
            "status": "SAFE" if current_pct >= 75 else "AT RISK",
            "classes_needed_to_recover": classes_needed,
            "classes_can_miss": can_miss,
            "message": f"Attend {classes_needed} more consecutive classes to reach 75%" if current_pct < 75 else f"You can afford to miss {can_miss} more classes"
        })

    overall_attended = sum(a.classes_attended for a in attendance_records)
    overall_total = sum(a.total_classes for a in attendance_records)
    overall_pct = round((overall_attended / overall_total) * 100, 2) if overall_total > 0 else 0

    return {
        "student_id": student_id,
        "overall_attendance": overall_pct,
        "overall_status": "SAFE" if overall_pct >= 75 else "AT RISK",
        "subject_wise": results
    }

@router.get("/{student_id}/whatif")
def whatif_simulator(student_id: str, see_score: float = 75, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
    if not scores:
        return {"message": "No scores found"}

    simulated = []
    for s in scores:
        subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
        internal = float(s.internal_total or 0)
        simulated_see_converted = round(see_score / 2, 2)
        simulated_final = round(internal + simulated_see_converted, 2)

        if simulated_final >= 90: grade = "O"
        elif simulated_final >= 80: grade = "A+"
        elif simulated_final >= 70: grade = "A"
        elif simulated_final >= 60: grade = "B+"
        elif simulated_final >= 55: grade = "B"
        elif simulated_final >= 50: grade = "C"
        elif simulated_final >= 40: grade = "P"
        else: grade = "F"

        simulated.append({
            "subject_name": subject.subject_name if subject else "Unknown",
            "internal_total": internal,
            "simulated_see": see_score,
            "simulated_final": simulated_final,
            "simulated_grade": grade
        })

    total_credits = 0
    total_gp = 0
    for i, s in enumerate(simulated):
        score_obj = scores[i]
        subject = db.query(DimSubject).filter(DimSubject.subject_id == score_obj.subject_id).first()
        credits = subject.credits if subject else 4
        ft = s["simulated_final"]
        if ft >= 90: gp = 10
        elif ft >= 80: gp = 9
        elif ft >= 70: gp = 8
        elif ft >= 60: gp = 7
        elif ft >= 55: gp = 6
        elif ft >= 50: gp = 5
        elif ft >= 40: gp = 4
        else: gp = 0
        total_gp += gp * credits
        total_credits += credits

    simulated_cgpa = round(total_gp / total_credits, 2) if total_credits > 0 else 0

    return {
        "student_id": student_id,
        "simulated_see_score": see_score,
        "simulated_cgpa": simulated_cgpa,
        "subjects": simulated,
        "message": f"If you score {see_score}/100 in SEE, your CGPA will be {simulated_cgpa}"
    }
