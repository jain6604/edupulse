from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/overview")
def get_data_quality_overview(db: Session = Depends(get_db)):
    from pipeline_state import pipeline_status
    status = pipeline_status

    # 1. Total records
    raw_scores_count = db.query(models.RawScores).count()
    raw_att_count = db.query(models.RawAttendance).count()
    raw_study_count = db.query(models.RawStudyLogs).count()
    msrit_scores_count = db.query(models.MsritScores).count()
    total_records = raw_scores_count + raw_att_count + raw_study_count + msrit_scores_count

    # 2. Completeness percentage
    def get_completeness(table, count, required_cols):
        if count == 0: return 100.0
        filters = [getattr(table, col).isnot(None) for col in required_cols]
        complete_count = db.query(table).filter(*filters).count()
        return round((complete_count / count) * 100, 2)

    comp_scores = get_completeness(models.RawScores, raw_scores_count, ['student_id', 'subject_id', 'semester_id', 'assignment_score', 'midterm_score', 'final_score'])
    comp_att = get_completeness(models.RawAttendance, raw_att_count, ['student_id', 'subject_id', 'semester_id', 'classes_attended', 'total_classes'])
    comp_study = get_completeness(models.RawStudyLogs, raw_study_count, ['student_id', 'log_date', 'hours_studied', 'sleep_hours'])
    comp_msrit = get_completeness(models.MsritScores, msrit_scores_count, ['student_id', 'subject_id', 'semester_id', 'cie1_score', 'cie2_score', 'see_score'])

    # 3. Student profile completeness
    total_students = db.query(models.DimStudent).count()
    if total_students == 0:
        student_completeness = 100.0
    else:
        scores_st = set(r[0] for r in db.query(models.RawScores.student_id).distinct().all())
        att_st = set(r[0] for r in db.query(models.RawAttendance.student_id).distinct().all())
        study_st = set(r[0] for r in db.query(models.RawStudyLogs.student_id).distinct().all())
        complete_st = scores_st.intersection(att_st).intersection(study_st)
        student_completeness = round((len(complete_st) / total_students) * 100, 2)

    # 4. Anomalies
    anomalies = []
    
    bad_att = db.query(models.RawAttendance).filter(models.RawAttendance.classes_attended > models.RawAttendance.total_classes).count()
    if bad_att > 0:
        anomalies.append({"type": "Invalid Attendance", "count": bad_att, "description": "Classes attended > total classes"})
    
    bad_msrit = db.query(models.MsritScores).filter(models.MsritScores.cie1_score > 30).count()
    if bad_msrit > 0:
        anomalies.append({"type": "Invalid CIE1 Score", "count": bad_msrit, "description": "CIE1 score > 30"})

    bad_study = db.query(models.RawStudyLogs).filter(models.RawStudyLogs.hours_studied > 24).count()
    if bad_study > 0:
         anomalies.append({"type": "Invalid Study Hours", "count": bad_study, "description": "Study hours > 24 in a day"})

    return {
        "total_raw_records": total_records,
        "completeness": {
            "RawScores": comp_scores,
            "RawAttendance": comp_att,
            "RawStudyLogs": comp_study,
            "MsritScores": comp_msrit
        },
        "student_profile_completeness": student_completeness,
        "anomalies": anomalies,
        "last_pipeline_run": status
    }
