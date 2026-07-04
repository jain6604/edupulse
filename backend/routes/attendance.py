from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RawAttendance, DimStudent, DimSubject, DimSemester
from schemas import AttendanceCreate, AttendanceResponse
from typing import List

router = APIRouter()

# ============================================
# LOG ATTENDANCE
# ============================================
@router.post("/{student_id}", response_model=AttendanceResponse)
def log_attendance(student_id: str, attendance: AttendanceCreate, db: Session = Depends(get_db)):
    # Verify student exists
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify subject exists
    subject = db.query(DimSubject).filter(DimSubject.subject_id == attendance.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Validate attendance
    if attendance.classes_attended > attendance.total_classes:
        raise HTTPException(status_code=400, detail="Attended classes cannot exceed total classes")

    if attendance.total_classes <= 0:
        raise HTTPException(status_code=400, detail="Total classes must be greater than 0")

    # Save to raw layer
    new_attendance = RawAttendance(
        student_id=student_id,
        subject_id=attendance.subject_id,
        semester_id=attendance.semester_id,
        classes_attended=attendance.classes_attended,
        total_classes=attendance.total_classes
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

# ============================================
# GET ATTENDANCE FOR A STUDENT
# ============================================
@router.get("/{student_id}", response_model=List[AttendanceResponse])
def get_attendance(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
    return attendance

# ============================================
# GET ATTENDANCE PERCENTAGE
# ============================================
@router.get("/{student_id}/percentage")
def get_attendance_percentage(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    records = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
    if not records:
        return {"attendance_percentage": 0}

    total_attended = sum(r.classes_attended for r in records)
    total_classes  = sum(r.total_classes for r in records)
    percentage     = round((total_attended / total_classes) * 100, 2)

    return {
        "student_id": student_id,
        "total_attended": total_attended,
        "total_classes": total_classes,
        "attendance_percentage": percentage
    }