from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RawScores, DimStudent, DimSubject, DimSemester
from schemas import ScoreCreate, ScoreResponse
from typing import List
import uuid

router = APIRouter()

# ============================================
# SUBMIT SCORES
# ============================================
@router.post("/{student_id}", response_model=ScoreResponse)
def submit_scores(student_id: str, score: ScoreCreate, db: Session = Depends(get_db)):
    # Verify student exists
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify subject exists
    subject = db.query(DimSubject).filter(DimSubject.subject_id == score.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Verify semester exists
    semester = db.query(DimSemester).filter(DimSemester.semester_id == score.semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    # Validate score ranges
    for s in [score.assignment_score, score.midterm_score, score.final_score]:
        if not (0 <= s <= 100):
            raise HTTPException(status_code=400, detail="Scores must be between 0 and 100")

    # Save to raw layer
    new_score = RawScores(
        student_id=student_id,
        subject_id=score.subject_id,
        semester_id=score.semester_id,
        assignment_score=score.assignment_score,
        midterm_score=score.midterm_score,
        final_score=score.final_score
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score

# ============================================
# GET ALL SCORES FOR A STUDENT
# ============================================
@router.get("/{student_id}", response_model=List[ScoreResponse])
def get_scores(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    scores = db.query(RawScores).filter(RawScores.student_id == student_id).all()
    return scores