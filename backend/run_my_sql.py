import os
import sys
from sqlalchemy import text
from database import engine

def main():
    sql_file = "E:/edupulse/edupulse/backend/update_subjects.sql"
    with open(sql_file, 'r') as f:
        sql = f.read()

    with engine.begin() as conn:
        for statement in sql.split(';'):
            statement = statement.strip()
            if statement:
                print(f"Executing: {statement[:50]}...")
                conn.execute(text(statement))

    print("SQL execution complete.")

if __name__ == "__main__":
    main()
