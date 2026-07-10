from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Response
from fastapi.responses import FileResponse
import shutil
from sqlalchemy.orm import Session
from database import get_db
from models import DimStudent
from schemas import StudentCreate, StudentResponse, LoginRequest, TokenResponse, PasswordResetRequest
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain[:72], hashed)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ============================================
# REGISTER
# ============================================
@router.post("/register", response_model=StudentResponse)
def register(student: StudentCreate, db: Session = Depends(get_db)):
    import traceback
    try:
        # Check if email already exists
        existing = db.query(DimStudent).filter(DimStudent.email == student.email).first()
        if existing:
            if existing.name.strip().lower() == student.name.strip().lower():
                raise HTTPException(status_code=400, detail="A user with this exact name and email is already registered")
            raise HTTPException(status_code=400, detail="This email is already registered to another user")

        # Handle empty string USN
        usn_val = student.usn if student.usn and student.usn.strip() != "" else None

        # Hash password and save
        new_student = DimStudent(
            name=student.name,
            email=student.email,
            password_hash=hash_password(student.password),
            branch=student.branch,
            hostel=student.hostel,
            year_of_joining=student.year_of_joining,
            usn=usn_val
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        return new_student
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        err_msg = f"Registration error: {str(e)}\n{traceback.format_exc()}"
        print(err_msg)
        raise HTTPException(
            status_code=500,
            detail=err_msg
        )

# ============================================
# LOGIN
# ============================================
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.email == request.email).first()
    if not student or not verify_password(request.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": str(student.student_id)})
    return {"access_token": token, "token_type": "bearer"}


# ============================================
# ADMIN LOGIN
# ============================================
@router.post("/admin/login", response_model=TokenResponse)
def admin_login(request: LoginRequest):
    # Simple admin credential check (hardcoded for MSRIT)
    if request.email == 'admin@msrit.edu' and request.password == '6604':
        token = create_token({"sub": "admin", "role": "admin"})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

# ============================================
# RESET PASSWORD
# ============================================
@router.post("/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.email == request.email, DimStudent.usn == request.usn).first()
    if not student:
        raise HTTPException(status_code=400, detail="Invalid email or USN")
    
    student.password_hash = hash_password(request.new_password)
    db.commit()
    return {"message": "Password reset successfully"}

# ============================================
# GET STUDENT PROFILE
# ============================================
@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

from models import StudentSkills, Achievements, RawStudyLogs
from schemas import SkillCreate, SkillResponse, AchievementCreate, AchievementResponse, StudyLogCreate, StudyLogResponse
from typing import List
from datetime import date

# ============================================
# SKILLS
# ============================================
@router.post("/{student_id}/skills", response_model=SkillResponse)
def add_skill(student_id: str, skill: SkillCreate, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Update if exists
    existing = db.query(StudentSkills).filter(
        StudentSkills.student_id == student_id,
        StudentSkills.skill_name == skill.skill_name
    ).first()

    if existing:
        existing.proficiency = skill.proficiency
        db.commit()
        db.refresh(existing)
        return existing

    new_skill = StudentSkills(
        student_id=student_id,
        skill_name=skill.skill_name,
        proficiency=skill.proficiency
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.get("/{student_id}/skills", response_model=List[SkillResponse])
def get_skills(student_id: str, db: Session = Depends(get_db)):
    return db.query(StudentSkills).filter(StudentSkills.student_id == student_id).all()

# ============================================
# ACHIEVEMENTS
# ============================================
@router.post("/{student_id}/achievements", response_model=AchievementResponse)
def add_achievement(student_id: str, achievement: AchievementCreate, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_achievement = Achievements(
        student_id=student_id,
        type=achievement.type,
        title=achievement.title,
        date=achievement.date
    )
    db.add(new_achievement)
    db.commit()
    db.refresh(new_achievement)
    return new_achievement

@router.get("/{student_id}/achievements", response_model=List[AchievementResponse])
def get_achievements(student_id: str, db: Session = Depends(get_db)):
    return db.query(Achievements).filter(Achievements.student_id == student_id).all()

# ============================================
# STUDY LOGS
# ============================================
@router.post("/{student_id}/studylog", response_model=StudyLogResponse)
def add_study_log(student_id: str, log: StudyLogCreate, db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_log = RawStudyLogs(
        student_id=student_id,
        log_date=log.log_date,
        hours_studied=log.hours_studied,
        sleep_hours=log.sleep_hours
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/{student_id}/studylogs", response_model=List[StudyLogResponse])
def get_study_logs(student_id: str, db: Session = Depends(get_db)):
    return db.query(RawStudyLogs).filter(RawStudyLogs.student_id == student_id).all()


# ============================================
# PHOTO UPLOAD
# ============================================
@router.post("/{student_id}/upload-photo")
def upload_photo(student_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    ext = file.filename.split(".")[-1]
    filename = f"{student_id}.{ext}"
    filepath = f"uploads/photos/{filename}"
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"photo_url": f"/uploads/photos/{filename}"}

@router.head("/{student_id}/photo")
def head_photo(student_id: str):
    for ext in ["jpg", "jpeg", "png"]:
        filepath = f"uploads/photos/{student_id}.{ext}"
        if os.path.exists(filepath):
            return Response(status_code=200)
    raise HTTPException(status_code=404, detail="Photo not found")

@router.get("/{student_id}/photo")
def get_photo(student_id: str):
    # Check common extensions
    for ext in ["jpg", "jpeg", "png"]:
        filepath = f"uploads/photos/{student_id}.{ext}"
        if os.path.exists(filepath):
            return FileResponse(filepath)
    raise HTTPException(status_code=404, detail="Photo not found")

# ============================================
# RESUME UPLOAD
# ============================================
@router.post("/{student_id}/upload-resume")
def upload_resume(student_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    filepath = f"uploads/resumes/{student_id}.pdf"
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"resume_url": f"/uploads/resumes/{student_id}.pdf", "filename": file.filename}

@router.get("/{student_id}/resume")
def get_resume(student_id: str):
    filepath = f"uploads/resumes/{student_id}.pdf"
    if os.path.exists(filepath):
        return FileResponse(filepath)
    raise HTTPException(status_code=404, detail="Resume not found")

@router.head("/{student_id}/resume")
def head_resume(student_id: str):
    filepath = f"uploads/resumes/{student_id}.pdf"
    if os.path.exists(filepath):
        return Response(status_code=200)
    raise HTTPException(status_code=404, detail="Resume not found")

@router.delete("/{student_id}/resume")
def delete_resume(student_id: str):
    filepath = f"uploads/resumes/{student_id}.pdf"
    if os.path.exists(filepath):
        os.remove(filepath)
        return {"message": "Resume deleted"}
    raise HTTPException(status_code=404, detail="Resume not found")


# ============================================
# ADMIN OVERVIEW
# ============================================
@router.get("/admin/overview")
def admin_overview(db: Session = Depends(get_db)):
    students = db.query(DimStudent).all()
    total = len(students)
    # Return only non-sensitive fields
    student_list = []
    for s in students:
        student_list.append({
            "usn": s.usn,
            "branch": s.branch,
            "year_of_joining": s.year_of_joining,
            "date_joined": s.created_at
        })
    return {"total_students": total, "students": student_list}