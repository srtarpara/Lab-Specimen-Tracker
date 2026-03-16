from fastapi import FastAPI
from database import get_connection

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Specimen Tracker API is running!"}

@app.get("/patients")
def get_patients():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"patients": rows}