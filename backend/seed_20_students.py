import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import random
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import (DimStudent, DimSubject, DimSemester, MsritScores,
                    RawAttendance, RawStudyLogs, StudentSkills, Achievements)
import bcrypt
import requests

random.seed(42)

DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/edupulse"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

# ============================================
# STUDENT DATA
# ============================================
students_data = [
    # CSE — 5 students
    {"name": "Arjun Sharma", "branch": "CSE", "usn": "1MS22CS001", "hostel": "Cauvery", "year": 2022, "category": "topper", "semester_number": 7},
    {"name": "Priya Nair", "branch": "CSE", "usn": "1MS22CS002", "hostel": "Sharavathi", "year": 2022, "category": "average", "semester_number": 7},
    {"name": "Rohan Verma", "branch": "CSE", "usn": "1MS22CS003", "hostel": "Tungabhadra", "year": 2022, "category": "below_average", "semester_number": 7},
    {"name": "Sneha Reddy", "branch": "CSE", "usn": "1MS22CS004", "hostel": "Day Scholar", "year": 2022, "category": "topper", "semester_number": 7},
    {"name": "Karan Mehta", "branch": "CSE", "usn": "1MS22CS005", "hostel": "Cauvery", "year": 2022, "category": "struggling", "semester_number": 7},

    # EIE — 4 students
    {"name": "Ananya Krishnan", "branch": "EIE", "usn": "1MS22EI001", "hostel": "Sharavathi", "year": 2022, "category": "average", "semester_number": 7},
    {"name": "Vikram Patel", "branch": "EIE", "usn": "1MS22EI002", "hostel": "Tungabhadra", "year": 2022, "category": "topper", "semester_number": 7},
    {"name": "Divya Menon", "branch": "EIE", "usn": "1MS22EI003", "hostel": "Day Scholar", "year": 2022, "category": "below_average", "semester_number": 7},
    {"name": "Rahul Singh", "branch": "EIE", "usn": "1MS22EI004", "hostel": "Cauvery", "year": 2022, "category": "struggling", "semester_number": 7},

    # ECE — 4 students
    {"name": "Aishwarya Rao", "branch": "ECE", "usn": "1MS22EC001", "hostel": "Sharavathi", "year": 2022, "category": "topper", "semester_number": 7},
    {"name": "Nikhil Kumar", "branch": "ECE", "usn": "1MS22EC002", "hostel": "Tungabhadra", "year": 2022, "category": "average", "semester_number": 7},
    {"name": "Pooja Iyer", "branch": "ECE", "usn": "1MS22EC003", "hostel": "Day Scholar", "year": 2022, "category": "below_average", "semester_number": 7},
    {"name": "Siddharth Joshi", "branch": "ECE", "usn": "1MS22EC004", "hostel": "Cauvery", "year": 2022, "category": "average", "semester_number": 7},

    # ME — 4 students
    {"name": "Ravi Teja", "branch": "ME", "usn": "1MS22ME001", "hostel": "Tungabhadra", "year": 2022, "category": "struggling", "semester_number": 7},
    {"name": "Kavya Shetty", "branch": "ME", "usn": "1MS22ME002", "hostel": "Sharavathi", "year": 2022, "category": "average", "semester_number": 7},
    {"name": "Akash Gowda", "branch": "ME", "usn": "1MS22ME003", "hostel": "Cauvery", "year": 2022, "category": "below_average", "semester_number": 7},
    {"name": "Shreya Pillai", "branch": "ME", "usn": "1MS22ME004", "hostel": "Day Scholar", "year": 2022, "category": "topper", "semester_number": 7},

    # ISE — 3 students
    {"name": "Abhishek Das", "branch": "ISE", "usn": "1MS22IS001", "hostel": "Cauvery", "year": 2022, "category": "average", "semester_number": 7},
    {"name": "Nandini Kulkarni", "branch": "ISE", "usn": "1MS22IS002", "hostel": "Sharavathi", "year": 2022, "category": "below_average", "semester_number": 7},
    {"name": "Tejas Hegde", "branch": "ISE", "usn": "1MS22IS003", "hostel": "Tungabhadra", "year": 2022, "category": "struggling", "semester_number": 7},
]

# ============================================
# SCORE RANGES BY CATEGORY
# ============================================
score_ranges = {
    "topper":        {"cie": (25, 30), "comp": (8, 10), "see": (80, 95)},
    "average":       {"cie": (18, 24), "comp": (6, 8),  "see": (60, 75)},
    "below_average": {"cie": (12, 18), "comp": (4, 7),  "see": (45, 60)},
    "struggling":    {"cie": (8, 14),  "comp": (3, 6),  "see": (35, 50)},
}

attendance_ranges = {
    "topper":        (42, 48),
    "average":       (35, 42),
    "below_average": (28, 36),
    "struggling":    (20, 30),
}

study_ranges = {
    "topper":        {"study": (5, 7), "sleep": (7, 8)},
    "average":       {"study": (3, 5), "sleep": (6, 7)},
    "below_average": {"study": (2, 3), "sleep": (5, 7)},
    "struggling":    {"study": (0, 2), "sleep": (4, 6)},
}

skills_pool = {
    "CSE":  ["Python", "Java", "DSA", "SQL", "React", "Machine Learning"],
    "EIE":  ["MATLAB", "Arduino", "Python", "Control Systems", "LabVIEW", "SQL"],
    "ECE":  ["MATLAB", "Arduino", "VLSI", "Python", "Communication", "Signal Processing"],
    "ME":   ["AutoCAD", "SolidWorks", "MATLAB", "Python", "Manufacturing", "Thermodynamics"],
    "ISE":  ["Python", "SQL", "Java", "Cybersecurity", "Networking", "Linux"],
}

skills_count = {
    "topper": (4, 6),
    "average": (2, 4),
    "below_average": (1, 3),
    "struggling": (0, 2),
}

achievements_pool = [
    {"type": "Hackathon", "title": "Smart India Hackathon 2024 Finalist"},
    {"type": "Hackathon", "title": "IEEE Hackathon Winner"},
    {"type": "Certification", "title": "Python for Data Science — Coursera"},
    {"type": "Certification", "title": "AWS Cloud Practitioner"},
    {"type": "Certification", "title": "Google Data Analytics Certificate"},
    {"type": "Internship", "title": "Software Intern at Infosys"},
    {"type": "Internship", "title": "Data Analyst Intern at TCS"},
    {"type": "Sports", "title": "Inter-college Cricket Champion"},
    {"type": "Other", "title": "Technical Paper Published in IEEE"},
]

achievements_count = {
    "topper": (2, 4),
    "average": (1, 2),
    "below_average": (0, 1),
    "struggling": (0, 0),
}

# ============================================
# PASSWORD HASH
# ============================================
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ============================================
# MAIN SEEDING
# ============================================
print("Starting EduPulse seed script...")

# We will assign semester dynamically per student based on join year
def get_current_semester_number(join_year):
    # e.g. 2022 join -> 2026 is 4th year -> semester 7 (odd sem)
    return (2026 - join_year) * 2 - 1

created_students = []
skipped = 0

for s_data in students_data:
    # Check if already exists
    existing = db.query(DimStudent).filter(DimStudent.usn == s_data["usn"]).first()
    if existing:
        print(f"Skipping {s_data['name']} — already exists")
        skipped += 1
        created_students.append((existing, s_data["category"], s_data["branch"]))
        continue

    email = f"{s_data['name'].split()[0].lower()}.{s_data['usn'].lower()}@msrit.edu"
    student = DimStudent(
        student_id=uuid.uuid4(),
        name=s_data["name"],
        email=email,
        password_hash=hash_password("Student@123"),
        branch=s_data["branch"],
        hostel=s_data["hostel"],
        year_of_joining=s_data["year"],
        usn=s_data["usn"],
        college="MS Ramaiah Institute of Technology"
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    created_students.append((student, s_data["category"], s_data["branch"]))
    print(f"Created: {s_data['name']} ({s_data['branch']}) — {s_data['category']}")

print(f"\nStudents created: {len(created_students) - skipped}, Skipped: {skipped}")

# ============================================
# SCORES, ATTENDANCE, LOGS, SKILLS, ACHIEVEMENTS
# ============================================
for student, category, branch in created_students:
    ranges = score_ranges[category]

    current_sem_num = get_current_semester_number(student.year_of_joining)
    semester = db.query(DimSemester).filter(DimSemester.semester_no == current_sem_num).first()
    if not semester:
        semester = db.query(DimSemester).first()

    # Get subjects for this branch and semester
    if current_sem_num <= 2:
        subjects = db.query(DimSubject).filter(
            DimSubject.branch == 'COMMON',
            DimSubject.semester_number == current_sem_num
        ).all()
    else:
        subjects = db.query(DimSubject).filter(
            DimSubject.branch == branch,
            DimSubject.semester_number == current_sem_num
        ).all()

    if not subjects:
        print(f"No subjects found for {branch} sem {current_sem_num}")
        continue

    # Insert MSRIT scores
    existing_scores = db.query(MsritScores).filter(
        MsritScores.student_id == student.student_id
    ).first()

    if not existing_scores:
        for subject in subjects:
            cie1 = round(random.uniform(*ranges["cie"]), 1)
            cie2 = round(random.uniform(*ranges["cie"]), 1)
            comp1 = round(random.uniform(*ranges["comp"]), 1)
            comp2 = round(random.uniform(*ranges["comp"]), 1)
            see = round(random.uniform(*ranges["see"]), 1)

            avg_cie = round((cie1 + cie2) / 2, 2)
            internal = round(avg_cie + comp1 + comp2, 2)
            see_conv = round(see / 2, 2)
            final = round(internal + see_conv, 2)

            score = MsritScores(
                student_id=student.student_id,
                subject_id=subject.subject_id,
                semester_id=semester.semester_id,
                cie1_score=cie1,
                cie2_score=cie2,
                component1_score=comp1,
                component2_score=comp2,
                avg_cie=avg_cie,
                internal_total=internal,
                see_score=see,
                see_converted=see_conv,
                final_total=final
            )
            db.add(score)
        db.commit()

    # Insert attendance for 3 subjects
    existing_att = db.query(RawAttendance).filter(
        RawAttendance.student_id == student.student_id
    ).first()

    if not existing_att:
        att_range = attendance_ranges[category]
        for subject in subjects[:3]:
            att = RawAttendance(
                student_id=student.student_id,
                subject_id=subject.subject_id,
                semester_id=semester.semester_id,
                classes_attended=random.randint(*att_range),
                total_classes=50
            )
            db.add(att)
        db.commit()

    # Insert study logs for 14 days
    existing_logs = db.query(RawStudyLogs).filter(
        RawStudyLogs.student_id == student.student_id
    ).first()

    if not existing_logs:
        study_range = study_ranges[category]
        for i in range(14):
            log_date = date.today() - timedelta(days=i)
            log = RawStudyLogs(
                student_id=student.student_id,
                log_date=log_date,
                hours_studied=round(random.uniform(*study_range["study"]), 1),
                sleep_hours=round(random.uniform(*study_range["sleep"]), 1)
            )
            db.add(log)
        db.commit()

    # Insert skills
    existing_skills = db.query(StudentSkills).filter(
        StudentSkills.student_id == student.student_id
    ).first()

    if not existing_skills:
        count_range = skills_count[category]
        count = random.randint(*count_range)
        branch_skills = skills_pool.get(branch, skills_pool["CSE"])
        selected_skills = random.sample(branch_skills, min(count, len(branch_skills)))
        for skill in selected_skills:
            proficiency_ranges = {
                "topper": (7, 10),
                "average": (5, 8),
                "below_average": (3, 6),
                "struggling": (2, 5)
            }
            prof_range = proficiency_ranges[category]
            sk = StudentSkills(
                student_id=student.student_id,
                skill_name=skill,
                proficiency=random.randint(*prof_range)
            )
            db.add(sk)
        db.commit()

    # Insert achievements
    existing_ach = db.query(Achievements).filter(
        Achievements.student_id == student.student_id
    ).first()

    if not existing_ach:
        count_range = achievements_count[category]
        count = random.randint(*count_range)
        if count > 0:
            selected = random.sample(achievements_pool, min(count, len(achievements_pool)))
            for ach in selected:
                a = Achievements(
                    student_id=student.student_id,
                    type=ach["type"],
                    title=ach["title"],
                    date=str(date.today() - timedelta(days=random.randint(30, 365)))
                )
                db.add(a)
            db.commit()

print("\nAll data inserted successfully!")

# ============================================
# TRIGGER ETL PIPELINE
# ============================================
print("\nTriggering ETL pipeline...")
try:
    from pipeline.etl import run_pipeline
    from pipeline_state import set_pipeline_status
    run_pipeline()
    set_pipeline_status("Success")
    print("ETL: Pipeline completed successfully")
except Exception as e:
    print(f"ETL error: {e}")

# ============================================
# TRIGGER ML PREDICTIONS
# ============================================
print("\nRunning ML predictions for all students...")
from pipeline.predictor import predict_student
for student, category, branch in created_students:
    try:
        pred = predict_student(str(student.student_id))
        print(f"{student.name}: GPA={pred.get('predicted_gpa', 'N/A')} Risk={pred.get('predicted_risk', 'N/A')}")
    except Exception as e:
        print(f"Prediction error for {student.name}: {e}")

# ============================================
# SUMMARY
# ============================================
print("\n===== SEEDING SUMMARY =====")
from collections import Counter
branches = [b for _, _, b in created_students]
categories = [c for _, c, _ in created_students]
print(f"Total students: {len(created_students)}")
for branch, count in Counter(branches).items():
    print(f"  {branch}: {count} students")
print("\nBy performance:")
for cat, count in Counter(categories).items():
    print(f"  {cat}: {count} students")

db.close()
print("\nDone! EduPulse is ready with 20 MSRIT students.")