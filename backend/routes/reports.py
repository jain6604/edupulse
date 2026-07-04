from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import DimStudent
from pipeline.report_generator import generate_report
import os

router = APIRouter()

# ============================================
# GENERATE AND DOWNLOAD PDF REPORT
# ============================================
@router.get("/{student_id}")
def get_report(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        return {"error": "Student not found"}

    result = generate_report(student_id)

    if "error" in result:
        return result

    # Return PDF file as download
    return FileResponse(
        path=result["filepath"],
        media_type="application/pdf",
        filename=result["filename"]
    )