from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import DimSubject, DimSemester

router = APIRouter()

# ============================================
# GET SUBJECTS BY BRANCH
# ============================================
@router.get("/branch/{branch}")
def get_subjects_by_branch(branch: str, db: Session = Depends(get_db)):
    subjects = db.query(DimSubject).filter(
        (DimSubject.branch == branch) | (DimSubject.branch == 'COMMON')
    ).all()
    return [
        {
            "subject_id": str(s.subject_id),
            "subject_name": s.subject_name,
            "branch": s.branch,
            "credits": s.credits
        }
        for s in subjects
    ]

# ============================================
# GET ALL SUBJECTS
# ============================================
@router.get("/")
def get_all_subjects(db: Session = Depends(get_db)):
    subjects = db.query(DimSubject).all()
    return [
        {
            "subject_id": str(s.subject_id),
            "subject_name": s.subject_name,
            "branch": s.branch,
            "credits": s.credits
        }
        for s in subjects
    ]

# ============================================
# GET ALL SEMESTERS
# ============================================
@router.get("/semesters")
def get_semesters(db: Session = Depends(get_db)):
    semesters = db.query(DimSemester).order_by(DimSemester.semester_no).all()
    return [
        {
            "semester_id": str(s.semester_id),
            "semester_no": s.semester_no,
            "academic_year": s.academic_year,
            "term": s.term
        }
        for s in semesters
    ]