from sqlalchemy import Column, String, Integer, Boolean, Date, DateTime, Text, ForeignKey, Numeric
from sqlalchemy import Numeric as Decimal
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

# ============================================
# DIMENSION TABLES
# ============================================

class DimStudent(Base):
    __tablename__ = "dim_student"

    student_id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name            = Column(String(100), nullable=False)
    email           = Column(String(100), unique=True, nullable=False)
    password_hash   = Column(String(255), nullable=False)
    branch          = Column(String(50), nullable=False)
    hostel          = Column(String(50))
    year_of_joining = Column(Integer, nullable=False)
    usn             = Column(String(15), unique=True, nullable=True)
    college         = Column(String(100), default='MS Ramaiah Institute of Technology')
    created_at      = Column(DateTime, default=datetime.now)
    scores        = relationship("RawScores", back_populates="student")
    attendance    = relationship("RawAttendance", back_populates="student")
    study_logs    = relationship("RawStudyLogs", back_populates="student")
    skills        = relationship("StudentSkills", back_populates="student")
    achievements  = relationship("Achievements", back_populates="student")

class DimSubject(Base):
    __tablename__ = "dim_subject"

    subject_id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_name    = Column(String(100), nullable=False)
    subject_code    = Column(String(20))
    branch          = Column(String(50), nullable=False)
    credits         = Column(Integer, nullable=False)
    semester_number = Column(Integer)

class DimSemester(Base):
    __tablename__ = "dim_semester"

    semester_id   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_no   = Column(Integer, nullable=False)
    academic_year = Column(String(10), nullable=False)
    term          = Column(String(10), nullable=False)

# ============================================
# RAW LAYER
# ============================================

class RawScores(Base):
    __tablename__ = "raw_scores"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id       = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id       = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id      = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    assignment_score = Column(Decimal(5,2))
    midterm_score    = Column(Decimal(5,2))
    final_score      = Column(Decimal(5,2))
    loaded_at        = Column(DateTime, default=datetime.now)

    student = relationship("DimStudent", back_populates="scores")

class RawAttendance(Base):
    __tablename__ = "raw_attendance"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id       = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id       = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id      = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    classes_attended = Column(Integer)
    total_classes    = Column(Integer)
    loaded_at        = Column(DateTime, default=datetime.now)

    student = relationship("DimStudent", back_populates="attendance")

class RawStudyLogs(Base):
    __tablename__ = "raw_study_logs"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id    = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    log_date      = Column(Date, nullable=False)
    hours_studied = Column(Decimal(4,2))
    sleep_hours   = Column(Decimal(4,2))
    loaded_at     = Column(DateTime, default=datetime.now)

    student = relationship("DimStudent", back_populates="study_logs")

class RawSkills(Base):
    __tablename__ = "raw_skills"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id  = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    skill_name  = Column(String(100), nullable=False)
    proficiency = Column(Integer)
    loaded_at   = Column(DateTime, default=datetime.now)

# ============================================
# ADDITIONAL TABLES
# ============================================

class StudentSkills(Base):
    __tablename__ = "student_skills"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id  = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    skill_name  = Column(String(100), nullable=False)
    proficiency = Column(Integer)
    updated_at  = Column(DateTime, default=datetime.now)

    student = relationship("DimStudent", back_populates="skills")

class Achievements(Base):
    __tablename__ = "achievements"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    type       = Column(String(50), nullable=False)
    title      = Column(String(200), nullable=False)
    date       = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    student = relationship("DimStudent", back_populates="achievements")

class RiskScores(Base):
    __tablename__ = "risk_scores"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id   = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    semester_id  = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    risk_level   = Column(String(10))
    risk_score   = Column(Decimal(5,2))
    generated_at = Column(DateTime, default=datetime.now)

class Recommendations(Base):
    __tablename__ = "recommendations"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id   = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    type         = Column(String(50))
    message      = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.now)

class PlacementScores(Base):
    __tablename__ = "placement_scores"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id   = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    score        = Column(Decimal(5,2))
    strong_areas = Column(Text)
    weak_areas   = Column(Text)
    generated_at = Column(DateTime, default=datetime.now)

class PerformanceSummary(Base):
    __tablename__ = "performance_summary"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id       = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    semester_id      = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    avg_score        = Column(Decimal(5,2))
    avg_attendance   = Column(Decimal(5,2))
    avg_study_hours  = Column(Decimal(4,2))
    avg_sleep_hours  = Column(Decimal(4,2))
    gpa              = Column(Decimal(3,2))
    risk_level       = Column(String(10))
    placement_score  = Column(Decimal(5,2))
    updated_at       = Column(DateTime, default=datetime.now)

    # ============================================
# STAGING LAYER MODELS
# ============================================

class StagingScores(Base):
    __tablename__ = "staging_scores"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id       = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id       = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id      = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    assignment_score = Column(Numeric(5,2))
    midterm_score    = Column(Numeric(5,2))
    final_score      = Column(Numeric(5,2))
    total_score      = Column(Numeric(5,2))
    is_valid         = Column(Boolean, default=True)
    staged_at        = Column(DateTime, default=datetime.now)

class StagingAttendance(Base):
    __tablename__ = "staging_attendance"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id       = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id       = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id      = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    classes_attended = Column(Integer)
    total_classes    = Column(Integer)
    attendance_pct   = Column(Numeric(5,2))
    is_valid         = Column(Boolean, default=True)
    staged_at        = Column(DateTime, default=datetime.now)

class StagingStudyLogs(Base):
    __tablename__ = "staging_study_logs"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id    = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    log_date      = Column(Date, nullable=False)
    hours_studied = Column(Numeric(4,2))
    sleep_hours   = Column(Numeric(4,2))
    is_valid      = Column(Boolean, default=True)
    staged_at     = Column(DateTime, default=datetime.now)

class StagingSkills(Base):
    __tablename__ = "staging_skills"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id  = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    skill_name  = Column(String(100), nullable=False)
    proficiency = Column(Integer)
    is_valid    = Column(Boolean, default=True)
    staged_at   = Column(DateTime, default=datetime.now)

# ============================================
# FACT TABLES MODELS
# ============================================

class FactStudentPerformance(Base):
    __tablename__ = "fact_student_performance"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id      = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id      = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id     = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    total_score     = Column(Numeric(5,2))
    grade           = Column(String(2))
    attendance_pct  = Column(Numeric(5,2))
    study_hours_avg = Column(Numeric(4,2))
    sleep_hours_avg = Column(Numeric(4,2))
    gpa             = Column(Numeric(3,2))
    risk_level      = Column(String(10))
    created_at      = Column(DateTime, default=datetime.now)

class FactAttendance(Base):
    __tablename__ = "fact_attendance"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id       = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id       = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id      = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    classes_attended = Column(Integer)
    total_classes    = Column(Integer)
    attendance_pct   = Column(Numeric(5,2))
    created_at       = Column(DateTime, default=datetime.now)

# ============================================
# MSRIT MARKING SCHEME
# ============================================

class MsritScores(Base):
    __tablename__ = "msrit_scores"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id         = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id         = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id        = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    cie1_score         = Column(Numeric(5,2))
    cie2_score         = Column(Numeric(5,2))
    component1_score   = Column(Numeric(5,2))
    component2_score   = Column(Numeric(5,2))
    avg_cie            = Column(Numeric(5,2))
    internal_total     = Column(Numeric(5,2))
    see_score          = Column(Numeric(5,2))
    see_converted      = Column(Numeric(5,2))
    final_total        = Column(Numeric(5,2))
    loaded_at          = Column(DateTime, default=datetime.now)

class StagingMsritScores(Base):
    __tablename__ = "staging_msrit_scores"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id         = Column(UUID(as_uuid=True), ForeignKey("dim_student.student_id"))
    subject_id         = Column(UUID(as_uuid=True), ForeignKey("dim_subject.subject_id"))
    semester_id        = Column(UUID(as_uuid=True), ForeignKey("dim_semester.semester_id"))
    cie1_score         = Column(Numeric(5,2))
    cie2_score         = Column(Numeric(5,2))
    component1_score   = Column(Numeric(5,2))
    component2_score   = Column(Numeric(5,2))
    avg_cie            = Column(Numeric(5,2))
    internal_total     = Column(Numeric(5,2))
    see_score          = Column(Numeric(5,2))
    see_converted      = Column(Numeric(5,2))
    final_total        = Column(Numeric(5,2))
    is_valid           = Column(Boolean, default=True)
    staged_at          = Column(DateTime, default=datetime.now)