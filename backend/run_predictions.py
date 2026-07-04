import sys
import os
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import DimStudent

DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/edupulse"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

def main():
    print("Running ML predictions for all students...")
    students = db.query(DimStudent).all()
    for student in students:
        try:
            # We will use the python module directly to avoid needing the server running
            from pipeline.predictor import predict_student
            pred = predict_student(str(student.student_id))
            print(f"{student.name}: GPA={pred.get('predicted_gpa', 'N/A')} Risk={pred.get('predicted_risk', 'N/A')}")
        except Exception as e:
            print(f"Prediction error for {student.name}: {e}")

if __name__ == "__main__":
    main()
