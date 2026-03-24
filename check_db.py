import sqlite3
import os

db_path = "backend/sql_app.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users;")
    rows = cursor.fetchall()
    print(f"Users found: {len(rows)}")
    for row in rows:
        print(row)
    conn.close()
else:
    print("Database not found")
