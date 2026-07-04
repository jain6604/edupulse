import os
import sys
from sqlalchemy import text
from database import engine

def main():
    sql_file = "E:/edupulse/edupulse/backend/insert_branches.sql"
    with open(sql_file, 'r') as f:
        sql = f.read()

    with engine.begin() as conn:
        for statement in sql.split(';'):
            statement = statement.strip()
            if statement:
                print(f"Executing: {statement[:50]}...")
                conn.execute(text(statement))

    print("SQL execution complete.")
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM dim_subject"))
        count = result.scalar()
        print(f"Total subjects now in database: {count}")

if __name__ == "__main__":
    main()
