from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import DimStudent
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()
try:
    arjun = db.query(DimStudent).filter(DimStudent.name=='Arjun Sharma').first()
    if arjun:
        print(f'Student ID: {arjun.student_id}')
    else:
        print('Arjun Sharma not found')
finally:
    db.close()
