from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# ============================================
# STUDENT SCHEMAS
# ============================================

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch: str
    hostel: Optional[str] = None
    year_of_joining: int
    usn: Optional[str] = None

class StudentResponse(BaseModel):
    student_id: UUID
    name: str
    email: str
    branch: str
    hostel: Optional[str]
    usn: Optional[str]
    college: Optional[str]
    year_of_joining: int
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================
# AUTH SCHEMAS
# ============================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    usn: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# ============================================
# SCORES SCHEMAS
# ============================================

class ScoreCreate(BaseModel):
    subject_id: UUID
    semester_id: UUID
    assignment_score: float
    midterm_score: float
    final_score: float

class ScoreResponse(BaseModel):
    id: UUID
    student_id: UUID
    subject_id: UUID
    assignment_score: float
    midterm_score: float
    final_score: float
    loaded_at: datetime

    class Config:
        from_attributes = True

# ============================================
# ATTENDANCE SCHEMAS
# ============================================

class AttendanceCreate(BaseModel):
    subject_id: UUID
    semester_id: UUID
    classes_attended: int
    total_classes: int

class AttendanceResponse(BaseModel):
    id: UUID
    student_id: UUID
    subject_id: UUID
    classes_attended: int
    total_classes: int
    loaded_at: datetime

    class Config:
        from_attributes = True

# ============================================
# STUDY LOG SCHEMAS
# ============================================

class StudyLogCreate(BaseModel):
    log_date: date
    hours_studied: float
    sleep_hours: float

class StudyLogResponse(BaseModel):
    id: UUID
    student_id: UUID
    log_date: date
    hours_studied: float
    sleep_hours: float
    loaded_at: datetime

    class Config:
        from_attributes = True

# ============================================
# SKILLS SCHEMAS
# ============================================

class SkillCreate(BaseModel):
    skill_name: str
    proficiency: int

class SkillResponse(BaseModel):
    id: UUID
    student_id: UUID
    skill_name: str
    proficiency: int
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================
# ACHIEVEMENT SCHEMAS
# ============================================

class AchievementCreate(BaseModel):
    type: str
    title: str
    date: date

class AchievementResponse(BaseModel):
    id: UUID
    student_id: UUID
    type: str
    title: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================
# ANALYTICS SCHEMAS
# ============================================

class RiskResponse(BaseModel):
    student_id: UUID
    risk_level: str
    risk_score: float
    generated_at: datetime

    class Config:
        from_attributes = True

class PlacementResponse(BaseModel):
    student_id: UUID
    score: float
    strong_areas: str
    weak_areas: str
    generated_at: datetime

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: UUID
    student_id: UUID
    type: str
    message: str
    generated_at: datetime

    class Config:
        from_attributes = True

# ============================================
# MSRIT SCORES SCHEMAS
# ============================================

class MsritScoreCreate(BaseModel):
    subject_id: UUID
    semester_id: UUID
    cie1_score: float
    cie2_score: float
    component1_score: float
    component2_score: float
    see_score: Optional[float] = None

class MsritScoreResponse(BaseModel):
    id: UUID
    student_id: UUID
    subject_id: UUID
    semester_id: UUID
    cie1_score: float
    cie2_score: float
    component1_score: float
    component2_score: float
    avg_cie: float
    internal_total: float
    see_score: Optional[float]
    see_converted: Optional[float]
    final_total: Optional[float]
    loaded_at: datetime

    class Config:
        from_attributes = True