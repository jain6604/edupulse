from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import DimStudent, DimSubject, MsritScores, RawAttendance, RawStudyLogs, PerformanceSummary, PlacementScores, RiskScores, StudentSkills, Achievements
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()
print('=== DATABASE INTEGRITY CHECK ===')
print(f'Students: {db.query(DimStudent).count()}')
print(f'Subjects: {db.query(DimSubject).count()}')
print(f'MSRIT Scores: {db.query(MsritScores).count()}')
print(f'Attendance: {db.query(RawAttendance).count()}')
print(f'Study Logs: {db.query(RawStudyLogs).count()}')
print(f'Performance Summaries: {db.query(PerformanceSummary).count()}')
print(f'Placement Scores: {db.query(PlacementScores).count()}')
print(f'Risk Scores: {db.query(RiskScores).count()}')
print(f'Skills: {db.query(StudentSkills).count()}')
print(f'Achievements: {db.query(Achievements).count()}')
with engine.connect() as conn:
    missing_perf = conn.execute(text('SELECT COUNT(*) FROM dim_student ds LEFT JOIN performance_summary ps ON ds.student_id=ps.student_id WHERE ps.student_id IS NULL')).scalar()
    missing_place = conn.execute(text('SELECT COUNT(*) FROM dim_student ds LEFT JOIN placement_scores ps ON ds.student_id=ps.student_id WHERE ps.student_id IS NULL')).scalar()
    zero_gpa = conn.execute(text('SELECT COUNT(*) FROM performance_summary WHERE gpa IS NULL OR gpa=0')).scalar()
    print(f'Missing performance summaries: {missing_perf}')
    print(f'Missing placement scores: {missing_place}')
    print(f'Zero/null GPA: {zero_gpa}')
db.close()
print('=== DB CHECK COMPLETE ===')
