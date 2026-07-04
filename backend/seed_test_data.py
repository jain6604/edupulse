import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import requests

# Database connection
DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/edupulse"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_data():
    db = SessionLocal()
    
    try:
        print("Connecting to database...")
        
        # Get student by email from dim_student
        student_email = 'saksham1234@gmail.com'
        student_result = db.execute(text("SELECT student_id FROM dim_student WHERE email = :email LIMIT 1"), {"email": student_email}).fetchone()
        if not student_result:
            print(f"No student found in dim_student with email {student_email}!")
            return
        student_id = student_result[0]
        print(f"Student ID: {student_id}")
        
        # Get all subjects from dim_subject
        subjects_result = db.execute(text("SELECT subject_id FROM dim_subject")).fetchall()
        if not subjects_result:
            print("No subjects found in dim_subject table!")
            return
        subject_ids = [row[0] for row in subjects_result]
        print(f"Found {len(subject_ids)} subjects")
        
        # Get the first semester from dim_semester
        semester_result = db.execute(text("SELECT semester_id FROM dim_semester LIMIT 1")).fetchone()
        if not semester_result:
            print("No semesters found in dim_semester table!")
            return
        semester_id = semester_result[0]
        print(f"Semester ID: {semester_id}")
        
        # Insert scores for each subject
        print(f"\nInserting scores for {len(subject_ids)} subjects...")
        for subject_id in subject_ids:
            assignment_score = round(random.uniform(65, 95), 2)
            midterm_score = round(random.uniform(60, 90), 2)
            final_score = round(random.uniform(65, 95), 2)
            
            insert_query = text("""
                INSERT INTO raw_scores (student_id, subject_id, semester_id, assignment_score, midterm_score, final_score, loaded_at)
                VALUES (:student_id, :subject_id, :semester_id, :assignment_score, :midterm_score, :final_score, NOW())
            """)
            
            db.execute(insert_query, {
                "student_id": str(student_id),
                "subject_id": str(subject_id),
                "semester_id": str(semester_id),
                "assignment_score": assignment_score,
                "midterm_score": midterm_score,
                "final_score": final_score
            })
        
        db.commit()
        print(f"✓ Inserted {len(subject_ids)} score records")
        
        # Insert 7 study logs for the last 7 days
        print("\nInserting 7 study log records...")
        for i in range(7):
            log_date = (datetime.now() - timedelta(days=i)).date()
            hours_studied = round(random.uniform(2, 6), 2)
            sleep_hours = round(random.uniform(5, 8), 2)
            
            insert_query = text("""
                INSERT INTO raw_study_logs (student_id, log_date, hours_studied, sleep_hours, loaded_at)
                VALUES (:student_id, :log_date, :hours_studied, :sleep_hours, NOW())
            """)
            
            db.execute(insert_query, {
                "student_id": str(student_id),
                "log_date": log_date,
                "hours_studied": hours_studied,
                "sleep_hours": sleep_hours
            })
        
        db.commit()
        print("✓ Inserted 7 study log records")
        
        # Insert 3 attendance records with different subjects
        print("\nInserting 3 attendance records...")
        selected_subjects = random.sample(subject_ids, min(3, len(subject_ids)))
        
        for subject_id in selected_subjects:
            classes_attended = random.randint(35, 45)
            total_classes = 50
            
            insert_query = text("""
                INSERT INTO raw_attendance (student_id, subject_id, semester_id, classes_attended, total_classes, loaded_at)
                VALUES (:student_id, :subject_id, :semester_id, :classes_attended, :total_classes, NOW())
            """)
            
            db.execute(insert_query, {
                "student_id": str(student_id),
                "subject_id": str(subject_id),
                "semester_id": str(semester_id),
                "classes_attended": classes_attended,
                "total_classes": total_classes
            })
        
        db.commit()
        print("✓ Inserted 3 attendance records")
        
        # Call the ETL pipeline endpoint
        print("\nTriggering ETL pipeline...")
        try:
            response = requests.post("http://localhost:8000/api/analytics/pipeline/run", timeout=300)
            if response.status_code == 200:
                print("✓ ETL pipeline triggered successfully")
                print(f"Response: {response.json()}")
            else:
                print(f"⚠ ETL pipeline returned status code: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"⚠ Error calling ETL pipeline: {e}")
        
        print("\nDone!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
