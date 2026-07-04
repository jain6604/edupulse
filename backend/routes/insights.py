from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/{student_id}/batch-comparison")
def get_batch_comparison(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.DimStudent).filter(models.DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_perf = db.query(models.PerformanceSummary).filter(models.PerformanceSummary.student_id == student_id).first()
    if not student_perf:
        raise HTTPException(status_code=404, detail="Performance data not found")

    branch = student.branch
    gpa = float(student_perf.gpa) if student_perf.gpa else 0.0
    attendance = float(student_perf.avg_attendance) if student_perf.avg_attendance else 0.0
    study_hours = float(student_perf.avg_study_hours) if student_perf.avg_study_hours else 0.0

    # Branch calculation
    branch_students = db.query(models.DimStudent).filter(models.DimStudent.branch == branch).all()
    branch_student_ids = [s.student_id for s in branch_students]
    
    branch_perfs = db.query(models.PerformanceSummary).filter(models.PerformanceSummary.student_id.in_(branch_student_ids)).all()
    branch_gpas = [float(p.gpa) for p in branch_perfs if p.gpa]
    
    lower_gpa_branch = sum(1 for bg in branch_gpas if bg < gpa)
    branch_percentile = (lower_gpa_branch / len(branch_gpas)) * 100 if branch_gpas else 0

    # Batch calculation
    all_perfs = db.query(models.PerformanceSummary).all()
    all_gpas = [float(p.gpa) for p in all_perfs if p.gpa]
    
    lower_gpa_batch = sum(1 for bg in all_gpas if bg < gpa)
    batch_percentile = (lower_gpa_batch / len(all_gpas)) * 100 if all_gpas else 0

    batch_avg_gpa = sum(all_gpas) / len(all_gpas) if all_gpas else 0

    all_att = [float(p.avg_attendance) for p in all_perfs if p.avg_attendance]
    batch_avg_attendance = sum(all_att) / len(all_att) if all_att else 0

    all_study = [float(p.avg_study_hours) for p in all_perfs if p.avg_study_hours]
    batch_avg_study_hours = sum(all_study) / len(all_study) if all_study else 0

    sorted_all_gpas = sorted(all_gpas, reverse=True)
    try:
        rank = sorted_all_gpas.index(gpa) + 1
    except ValueError:
        rank = len(all_gpas)

    return {
        "student_gpa": gpa,
        "student_attendance": attendance,
        "student_study_hours": study_hours,
        "branch_percentile": branch_percentile,
        "batch_percentile": batch_percentile,
        "rank": rank,
        "total_students": len(all_gpas),
        "batch_avg_gpa": batch_avg_gpa,
        "batch_avg_attendance": batch_avg_attendance,
        "batch_avg_study_hours": batch_avg_study_hours,
        "diff_gpa": gpa - batch_avg_gpa,
        "diff_attendance": attendance - batch_avg_attendance,
        "diff_study_hours": study_hours - batch_avg_study_hours,
        "above_avg_gpa": gpa >= batch_avg_gpa,
        "above_avg_attendance": attendance >= batch_avg_attendance,
        "above_avg_study_hours": study_hours >= batch_avg_study_hours
    }

@router.get("/{student_id}/correlations")
def get_correlations(student_id: str, db: Session = Depends(get_db)):
    all_perfs = db.query(models.PerformanceSummary).all()
    if not all_perfs:
        return []

    # Attendance vs Risk
    att_below_75 = [p for p in all_perfs if p.avg_attendance and float(p.avg_attendance) < 75]
    if att_below_75:
        high_med_risk = sum(1 for p in att_below_75 if p.risk_level in ['HIGH', 'MEDIUM'])
        low_risk = sum(1 for p in att_below_75 if p.risk_level == 'LOW')
        if low_risk > 0:
            ratio = high_med_risk / low_risk
        else:
            ratio = float(high_med_risk) if high_med_risk > 0 else 0
        
        att_desc = f"Students with attendance below 75% are {ratio:.1f} times more likely to be HIGH or MEDIUM risk."
        att_impact = "High" if ratio > 2 else "Medium"
    else:
        att_desc = "Not enough data for attendance correlation."
        att_impact = "Low"

    # Study hours vs GPA
    study_high = [float(p.gpa) for p in all_perfs if p.avg_study_hours and float(p.avg_study_hours) >= 4 and p.gpa]
    study_low = [float(p.gpa) for p in all_perfs if p.avg_study_hours and float(p.avg_study_hours) < 4 and p.gpa]

    avg_gpa_high_study = sum(study_high) / len(study_high) if study_high else 0
    avg_gpa_low_study = sum(study_low) / len(study_low) if study_low else 0
    diff_study_gpa = avg_gpa_high_study - avg_gpa_low_study

    study_desc = f"Students studying 4+ hours average {avg_gpa_high_study:.2f} GPA, which is {diff_study_gpa:.2f} points higher than those studying less."
    study_impact = "High" if diff_study_gpa > 1.0 else "Medium"

    # Sleep hours vs GPA
    sleep_high = [float(p.gpa) for p in all_perfs if p.avg_sleep_hours and float(p.avg_sleep_hours) >= 7 and p.gpa]
    sleep_low = [float(p.gpa) for p in all_perfs if p.avg_sleep_hours and float(p.avg_sleep_hours) < 7 and p.gpa]

    avg_gpa_high_sleep = sum(sleep_high) / len(sleep_high) if sleep_high else 0
    avg_gpa_low_sleep = sum(sleep_low) / len(sleep_low) if sleep_low else 0
    diff_sleep_gpa = avg_gpa_high_sleep - avg_gpa_low_sleep

    sleep_desc = f"Students sleeping 7+ hours average {avg_gpa_high_sleep:.2f} GPA compared to {avg_gpa_low_sleep:.2f} for those sleeping less."
    sleep_impact = "Medium" if diff_sleep_gpa > 0.5 else "Low"

    return [
        {"title": "Attendance & Risk", "description": att_desc, "impact_level": att_impact},
        {"title": "Study Hours & GPA", "description": study_desc, "impact_level": study_impact},
        {"title": "Sleep & Academic Performance", "description": sleep_desc, "impact_level": sleep_impact}
    ]

@router.get("/{student_id}/narrative")
def get_narrative(student_id: str, db: Session = Depends(get_db)):
    student_perf = db.query(models.PerformanceSummary).filter(models.PerformanceSummary.student_id == student_id).first()
    if not student_perf:
        raise HTTPException(status_code=404, detail="Performance data not found")

    gpa = float(student_perf.gpa) if student_perf.gpa else 0.0
    attendance = float(student_perf.avg_attendance) if student_perf.avg_attendance else 0.0
    risk = student_perf.risk_level

    all_perfs = db.query(models.PerformanceSummary).all()
    all_gpas = [float(p.gpa) for p in all_perfs if p.gpa]
    batch_avg_gpa = sum(all_gpas) / len(all_gpas) if all_gpas else 0

    gpa_diff = gpa - batch_avg_gpa
    gpa_text = "above" if gpa_diff >= 0 else "below"

    att_text = "above" if attendance >= 75 else "below"

    narrative = f"Your current GPA of {gpa:.2f} is {abs(gpa_diff):.2f} points {gpa_text} the batch average of {batch_avg_gpa:.2f}. "
    narrative += f"Your attendance of {attendance:.1f}% is {att_text} the required 75% threshold. "
    
    if risk == 'HIGH':
        narrative += "Due to critical factors such as low attendance or poor recent scores, your academic risk is currently HIGH. "
        recommendation = "Actionable Recommendation: Immediately consult with your mentor and prioritize attending all upcoming classes to avoid detention."
    elif risk == 'MEDIUM':
        narrative += "There are some warning signs in your performance indicating a MEDIUM risk. "
        recommendation = "Actionable Recommendation: Increase your daily study hours and review past assignment feedback to boost your scores."
    else:
        narrative += "Your consistent performance places you in the LOW risk category. "
        recommendation = "Actionable Recommendation: Keep up the good work and consider participating in technical clubs to boost your placement readiness."

    return {
        "narrative": narrative + "\n\n" + recommendation
    }

@router.get("/batch/summary")
def get_batch_summary(db: Session = Depends(get_db)):
    all_perfs = db.query(models.PerformanceSummary).all()
    total_students = len(all_perfs)

    if total_students == 0:
        return {"total_students": 0}

    all_gpas = [float(p.gpa) for p in all_perfs if p.gpa]
    batch_avg_gpa = sum(all_gpas) / len(all_gpas) if all_gpas else 0

    all_att = [float(p.avg_attendance) for p in all_perfs if p.avg_attendance]
    batch_avg_attendance = sum(all_att) / len(all_att) if all_att else 0

    low_risk = sum(1 for p in all_perfs if p.risk_level == 'LOW')
    med_risk = sum(1 for p in all_perfs if p.risk_level == 'MEDIUM')
    high_risk = sum(1 for p in all_perfs if p.risk_level == 'HIGH')

    students = db.query(models.DimStudent).all()
    student_branch_map = {s.student_id: s.branch for s in students}
    
    branch_gpa_map = {}
    branch_count_map = {}
    for p in all_perfs:
        branch = student_branch_map.get(p.student_id)
        if branch and p.gpa:
            branch_gpa_map[branch] = branch_gpa_map.get(branch, 0) + float(p.gpa)
            branch_count_map[branch] = branch_count_map.get(branch, 0) + 1

    branch_wise_gpa = [
        {"branch": b, "avg_gpa": branch_gpa_map[b] / branch_count_map[b]}
        for b in branch_gpa_map
    ]

    sorted_perfs = sorted([p for p in all_perfs if p.gpa], key=lambda x: float(x.gpa), reverse=True)
    top_5 = []
    for i, p in enumerate(sorted_perfs[:5]):
        top_5.append({
            "rank": i + 1,
            "student_id": p.student_id,
            "gpa": float(p.gpa)
        })

    return {
        "total_students": total_students,
        "avg_gpa": batch_avg_gpa,
        "avg_attendance": batch_avg_attendance,
        "risk_distribution": {
            "LOW": low_risk,
            "MEDIUM": med_risk,
            "HIGH": high_risk
        },
        "branch_wise_gpa": branch_wise_gpa,
        "top_performers": top_5
    }
