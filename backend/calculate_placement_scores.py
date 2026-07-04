import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import DimStudent, RawScores, RawAttendance, StudentSkills, Achievements, PlacementScores, MsritScores
from datetime import datetime

engine = create_engine('postgresql://postgres:postgres123@localhost:5432/edupulse')
Session = sessionmaker(bind=engine)
db = Session()

def calculate_placement_score(avg_score, attendance_pct, skills, achievements):
    score = 0
    strong_areas = []
    weak_areas = []

    if avg_score >= 70:
        score += 30
        strong_areas.append("Academics")
    elif avg_score >= 50:
        score += 15
    else:
        weak_areas.append("Academics")

    if attendance_pct >= 75:
        score += 20
        strong_areas.append("Attendance")
    elif attendance_pct >= 60:
        score += 10
    else:
        weak_areas.append("Attendance")

    skill_score = min(len(skills) * 5, 30)
    score += skill_score
    if skill_score >= 20:
        strong_areas.append("Technical Skills")
    else:
        weak_areas.append("Technical Skills")

    achievement_score = min(len(achievements) * 5, 20)
    score += achievement_score
    if achievement_score >= 10:
        strong_areas.append("Achievements")
    else:
        weak_areas.append("Achievements")

    return round(score, 2), ", ".join(strong_areas), ", ".join(weak_areas)

students = db.query(DimStudent).all()
print(f"Calculating placement scores for {len(students)} students...")

for student in students:
    # Try MSRIT scores first
    msrit_scores = db.query(MsritScores).filter(MsritScores.student_id == student.student_id).all()
    raw_scores = db.query(RawScores).filter(RawScores.student_id == student.student_id).all()

    if msrit_scores:
        avg_score = round(sum(float(s.final_total or 0) for s in msrit_scores) / len(msrit_scores), 2)
    elif raw_scores:
        avg_score = round(sum(
            float(s.assignment_score or 0) * 0.2 +
            float(s.midterm_score or 0) * 0.3 +
            float(s.final_score or 0) * 0.5
            for s in raw_scores) / len(raw_scores), 2)
    else:
        avg_score = 0

    attendance = db.query(RawAttendance).filter(RawAttendance.student_id == student.student_id).all()
    attendance_pct = 0
    if attendance:
        total_attended = sum(a.classes_attended for a in attendance)
        total_classes = sum(a.total_classes for a in attendance)
        attendance_pct = round((total_attended / total_classes) * 100, 2) if total_classes > 0 else 0

    skills = db.query(StudentSkills).filter(StudentSkills.student_id == student.student_id).all()
    achievements = db.query(Achievements).filter(Achievements.student_id == student.student_id).all()

    score, strong, weak = calculate_placement_score(avg_score, attendance_pct, skills, achievements)

    existing = db.query(PlacementScores).filter(PlacementScores.student_id == student.student_id).first()
    if existing:
        existing.score = score
        existing.strong_areas = strong
        existing.weak_areas = weak
        existing.generated_at = datetime.now()
    else:
        new_entry = PlacementScores(
            student_id=student.student_id,
            score=score,
            strong_areas=strong,
            weak_areas=weak,
            generated_at=datetime.now()
        )
        db.add(new_entry)

    db.commit()
    print(f"{student.name}: Score={score}, Strong={strong}, Weak={weak}")

db.close()
print("\nDone! All placement scores calculated and saved.")