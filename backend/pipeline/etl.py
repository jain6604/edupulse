import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import (RawScores, RawAttendance, RawStudyLogs, RawSkills,
                    StagingScores, StagingAttendance, StagingStudyLogs, StagingSkills,
                    FactStudentPerformance, FactAttendance, PerformanceSummary,
                    MsritScores, StagingMsritScores)
from datetime import datetime

def get_db():
    return SessionLocal()

# ============================================
# LAYER 1 → LAYER 2: RAW TO STAGING
# ============================================

def raw_to_staging_scores(db):
    print("Running: Raw → Staging Scores")
    raw_records = db.query(RawScores).all()
    count = 0

    for r in raw_records:
        # Check if already staged
        existing = db.query(StagingScores).filter(StagingScores.id == r.id).first()
        if existing:
            continue

        # Validate
        is_valid = True
        if r.assignment_score is None or r.midterm_score is None or r.final_score is None:
            is_valid = False
        elif not (0 <= float(r.assignment_score) <= 100):
            is_valid = False
        elif not (0 <= float(r.midterm_score) <= 100):
            is_valid = False
        elif not (0 <= float(r.final_score) <= 100):
            is_valid = False

        # Calculate total score
        total = 0
        if is_valid:
            total = round(
                float(r.assignment_score) * 0.2 +
                float(r.midterm_score) * 0.3 +
                float(r.final_score) * 0.5, 2
            )

        staged = StagingScores(
            id=r.id,
            student_id=r.student_id,
            subject_id=r.subject_id,
            semester_id=r.semester_id,
            assignment_score=r.assignment_score,
            midterm_score=r.midterm_score,
            final_score=r.final_score,
            total_score=total,
            is_valid=is_valid
        )
        db.add(staged)
        count += 1

    db.commit()
    print(f"Staged {count} score records")


def raw_to_staging_attendance(db):
    print("Running: Raw → Staging Attendance")
    raw_records = db.query(RawAttendance).all()
    count = 0

    for r in raw_records:
        existing = db.query(StagingAttendance).filter(StagingAttendance.id == r.id).first()
        if existing:
            continue

        is_valid = True
        if r.classes_attended is None or r.total_classes is None:
            is_valid = False
        elif r.total_classes <= 0:
            is_valid = False
        elif r.classes_attended > r.total_classes:
            is_valid = False

        attendance_pct = 0
        if is_valid:
            attendance_pct = round((r.classes_attended / r.total_classes) * 100, 2)

        staged = StagingAttendance(
            id=r.id,
            student_id=r.student_id,
            subject_id=r.subject_id,
            semester_id=r.semester_id,
            classes_attended=r.classes_attended,
            total_classes=r.total_classes,
            attendance_pct=attendance_pct,
            is_valid=is_valid
        )
        db.add(staged)
        count += 1

    db.commit()
    print(f"Staged {count} attendance records")


def raw_to_staging_study_logs(db):
    print("Running: Raw → Staging Study Logs")
    raw_records = db.query(RawStudyLogs).all()
    count = 0

    for r in raw_records:
        existing = db.query(StagingStudyLogs).filter(StagingStudyLogs.id == r.id).first()
        if existing:
            continue

        is_valid = True
        if r.hours_studied is None or r.sleep_hours is None:
            is_valid = False
        elif not (0 <= float(r.hours_studied) <= 24):
            is_valid = False
        elif not (0 <= float(r.sleep_hours) <= 24):
            is_valid = False

        staged = StagingStudyLogs(
            id=r.id,
            student_id=r.student_id,
            log_date=r.log_date,
            hours_studied=r.hours_studied,
            sleep_hours=r.sleep_hours,
            is_valid=is_valid
        )
        db.add(staged)
        count += 1

    db.commit()
    print(f"Staged {count} study log records")


def raw_to_staging_msrit_scores(db):
    print("Running: Raw → Staging MSRIT Scores")
    raw_records = db.query(MsritScores).all()
    count = 0

    for r in raw_records:
        # Check if already staged
        existing = db.query(StagingMsritScores).filter(StagingMsritScores.id == r.id).first()
        if existing:
            continue

        # Validate all fields are within correct ranges
        is_valid = True
        if r.cie1_score is None or r.cie2_score is None or r.component1_score is None or r.component2_score is None:
            is_valid = False
        elif not (0 <= float(r.cie1_score) <= 30):
            is_valid = False
        elif not (0 <= float(r.cie2_score) <= 30):
            is_valid = False
        elif not (0 <= float(r.component1_score) <= 10):
            is_valid = False
        elif not (0 <= float(r.component2_score) <= 10):
            is_valid = False
        
        if is_valid and r.see_score is not None:
            if not (0 <= float(r.see_score) <= 100):
                is_valid = False

        # Calculate derived fields if valid
        avg_cie = None
        internal_total = None
        see_converted = None
        final_total = None
        
        if is_valid:
            avg_cie = round((float(r.cie1_score) + float(r.cie2_score)) / 2, 2)
            internal_total = round(avg_cie + float(r.component1_score) + float(r.component2_score), 2)
            
            if r.see_score is not None:
                see_converted = round(float(r.see_score) / 2, 2)
                final_total = round(internal_total + see_converted, 2)

        staged = StagingMsritScores(
            id=r.id,
            student_id=r.student_id,
            subject_id=r.subject_id,
            semester_id=r.semester_id,
            cie1_score=r.cie1_score,
            cie2_score=r.cie2_score,
            component1_score=r.component1_score,
            component2_score=r.component2_score,
            avg_cie=avg_cie,
            internal_total=internal_total,
            see_score=r.see_score,
            see_converted=see_converted,
            final_total=final_total,
            is_valid=is_valid
        )
        db.add(staged)
        count += 1

    db.commit()
    print(f"Staged {count} MSRIT score records")


# ============================================
# LAYER 2 → LAYER 3: STAGING TO ANALYTICS
# ============================================

def staging_to_analytics(db):
    print("Running: Staging → Analytics Layer")

    # Get all valid staged scores grouped by student
    from sqlalchemy import func
    students_with_scores = db.query(StagingScores.student_id).filter(
        StagingScores.is_valid == True
    ).distinct().all()

    for (student_id,) in students_with_scores:
        # Get scores
        scores = db.query(StagingScores).filter(
            StagingScores.student_id == student_id,
            StagingScores.is_valid == True
        ).all()

        # Get attendance
        attendance = db.query(StagingAttendance).filter(
            StagingAttendance.student_id == student_id,
            StagingAttendance.is_valid == True
        ).all()

        # Get study logs
        logs = db.query(StagingStudyLogs).filter(
            StagingStudyLogs.student_id == student_id,
            StagingStudyLogs.is_valid == True
        ).all()

        # Calculate metrics
        avg_score = round(sum(float(s.total_score or 0) for s in scores) / len(scores), 2) if scores else 0
        attendance_pct = round(
            (sum(a.classes_attended for a in attendance) /
             sum(a.total_classes for a in attendance)) * 100, 2
        ) if attendance else 0
        avg_study = round(sum(float(l.hours_studied or 0) for l in logs) / len(logs), 2) if logs else 0
        avg_sleep = round(sum(float(l.sleep_hours or 0) for l in logs) / len(logs), 2) if logs else 0
        gpa = round((avg_score / 100) * 10, 2)

        # Determine grade
        if avg_score >= 90: grade = "A+"
        elif avg_score >= 80: grade = "A"
        elif avg_score >= 70: grade = "B+"
        elif avg_score >= 60: grade = "B"
        elif avg_score >= 50: grade = "C"
        else: grade = "F"

        # Determine risk
        risk_score = 0
        if attendance_pct >= 75: risk_score += 40
        elif attendance_pct >= 60: risk_score += 20
        if avg_score >= 70: risk_score += 30
        elif avg_score >= 50: risk_score += 15
        if avg_study >= 4: risk_score += 20
        elif avg_study >= 2: risk_score += 10
        if 6 <= avg_sleep <= 8: risk_score += 10
        elif avg_sleep >= 5: risk_score += 5

        if risk_score >= 70: risk_level = "LOW"
        elif risk_score >= 40: risk_level = "MEDIUM"
        else: risk_level = "HIGH"

        # Update or create performance summary
        summary = db.query(PerformanceSummary).filter(
            PerformanceSummary.student_id == student_id
        ).first()

        if summary:
            summary.avg_score = avg_score
            summary.avg_attendance = attendance_pct
            summary.avg_study_hours = avg_study
            summary.avg_sleep_hours = avg_sleep
            summary.gpa = gpa
            summary.risk_level = risk_level
            summary.updated_at = datetime.now()
        else:
            summary = PerformanceSummary(
                student_id=student_id,
                avg_score=avg_score,
                avg_attendance=attendance_pct,
                avg_study_hours=avg_study,
                avg_sleep_hours=avg_sleep,
                gpa=gpa,
                risk_level=risk_level
            )
            db.add(summary)

    db.commit()
    print("Analytics layer updated")


# ============================================
# RUN FULL PIPELINE
# ============================================

def run_pipeline():
    print("=" * 40)
    print("EduPulse ETL Pipeline Started")
    print("=" * 40)
    db = get_db()
    try:
        raw_to_staging_scores(db)
        raw_to_staging_attendance(db)
        raw_to_staging_study_logs(db)
        raw_to_staging_msrit_scores(db)
        staging_to_analytics(db)
        print("=" * 40)
        print("Pipeline Complete ✅")
        print("=" * 40)
    except Exception as e:
        print(f"Pipeline Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    run_pipeline()