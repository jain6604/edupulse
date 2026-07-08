from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import DimStudent, PerformanceSummary, PlacementScores
from database import DATABASE_URL
from datetime import datetime

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

# Find students missing performance_summary
students = db.query(DimStudent).all()
added_perf = 0
added_place = 0
fixed_gpa = 0
for s in students:
    ps = db.query(PerformanceSummary).filter(PerformanceSummary.student_id == s.student_id).first()
    if not ps:
        new_ps = PerformanceSummary(
            student_id=s.student_id,
            semester_id=None,
            avg_score=0,
            avg_attendance=0,
            avg_study_hours=0,
            avg_sleep_hours=0,
            gpa=7.0,
            risk_level='Low',
            placement_score=0,
            updated_at=datetime.now()
        )
        db.add(new_ps)
        added_perf += 1

    pls = db.query(PlacementScores).filter(PlacementScores.student_id == s.student_id).first()
    if not pls:
        new_pls = PlacementScores(
            student_id=s.student_id,
            score=0,
            strong_areas='',
            weak_areas='',
            generated_at=datetime.now()
        )
        db.add(new_pls)
        added_place += 1

# Fix zero/null GPA
zeros = db.query(PerformanceSummary).filter((PerformanceSummary.gpa == None) | (PerformanceSummary.gpa == 0)).all()
for z in zeros:
    z.gpa = 7.0
    fixed_gpa += 1

if added_perf or added_place or fixed_gpa:
    db.commit()

print(f'Added performance summaries: {added_perf}')
print(f'Added placement scores: {added_place}')
print(f'Fixed zero/null GPA entries: {fixed_gpa}')

db.close()
