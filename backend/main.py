from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
import models
from routes import students, scores, attendance, analytics, recommendations, reports, subjects, msrit_scores, insights, chat, data_quality
from apscheduler.schedulers.background import BackgroundScheduler
from pipeline.etl import run_pipeline
from pipeline_state import pipeline_status, set_pipeline_status
import datetime

# Create all tables if they don't exist
from sqlalchemy import text
with engine.connect() as connection:
    try:
        connection.execute(text("ALTER TABLE dim_student ADD COLUMN IF NOT EXISTS usn VARCHAR(15) UNIQUE;"))
        connection.execute(text("ALTER TABLE dim_student ADD COLUMN IF NOT EXISTS college VARCHAR(100) DEFAULT 'MS Ramaiah Institute of Technology';"))
        connection.execute(text("ALTER TABLE dim_subject ADD COLUMN IF NOT EXISTS subject_code VARCHAR(20);"))
        connection.execute(text("ALTER TABLE dim_subject ADD COLUMN IF NOT EXISTS semester_number INT;"))
        connection.commit()
        print("Database migrations applied successfully.")
    except Exception as e:
        print(f"Database migration warning/error: {e}")

Base.metadata.create_all(bind=engine)

# Auto-seed database if empty
from database import SessionLocal
from models import DimStudent, DimSemester, DimSubject
import uuid
db = SessionLocal()
try:
    if db.query(DimSemester).count() == 0:
        print("Auto-seeding semesters...")
        for i in range(1, 9):
            sem = DimSemester(
                semester_id=uuid.uuid4(),
                semester_no=i,
                academic_year="2024-25",
                term="ODD" if i % 2 != 0 else "EVEN"
            )
            db.add(sem)
        db.commit()
        print("Auto-seeding semesters completed.")

    if db.query(DimSubject).count() == 0:
        print("Auto-seeding subjects from SQL files...")
        for sql_file in ["update_subjects.sql", "insert_branches.sql", "backend/update_subjects.sql", "backend/insert_branches.sql"]:
            if os.path.exists(sql_file):
                print(f"Executing SQL file: {sql_file}")
                with open(sql_file, "r") as f:
                    statements = f.read().split(";")
                    for stmt in statements:
                        stmt = stmt.strip()
                        if stmt:
                            db.execute(text(stmt))
                db.commit()
        print("Auto-seeding subjects completed.")

    if db.query(DimStudent).count() == 0:
        print("Auto-seeding 20 students and analytics...")
        from seed_20_students import seed_data_func
        seed_data_func(db)
        print("Auto-seeding students completed.")
except Exception as e:
    print(f"Auto-seeding error: {e}")
    db.rollback()
finally:
    db.close()

# Initialize FastAPI app
app = FastAPI(
    title="EduPulse API",
    description="AI-Powered Student Performance Analytics",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    # Allow local frontend origins and live/preview Vercel origins
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://edupulse-sandy-nu.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/photos", exist_ok=True)
os.makedirs("uploads/resumes", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include all routes
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(scores.router, prefix="/api/scores", tags=["Scores"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(msrit_scores.router, prefix="/api/msrit-scores", tags=["MSRIT Scores"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat Assistant"])
app.include_router(data_quality.router, prefix="/api/data-quality", tags=["Data Quality"])

scheduler = BackgroundScheduler()

def scheduled_pipeline():
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting scheduled ETL pipeline...")
    try:
        run_pipeline()
        set_pipeline_status("Success")
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduled ETL pipeline completed successfully.")
    except Exception as e:
        set_pipeline_status(f"Failed: {str(e)}")
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduled ETL pipeline failed: {str(e)}")

@app.on_event("startup")
def startup_event():
    scheduler.add_job(scheduled_pipeline, 'interval', minutes=30)
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

@app.get("/api/analytics/pipeline/status")
def get_pipeline_status():
    return pipeline_status

@app.get("/")
def root():
    return {"message": "EduPulse API is running 🚀"}