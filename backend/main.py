from fastapi import FastAPI
from database import get_connection
from pydantic import BaseModel

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

@app.get("/specimens")
def get_specimens():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT s.id, p.name as patient_name, s.type, s.status, s.collected_at
                   FROM specimens s
                   JOIN patients p ON s.patient_id = p.id
                """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"specimens": rows}

@app.get("/specimens/{specimen_id}")
def get_specific_specimen(specimen_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                    SELECT s.id, p.name as patient_name, s.type, s.status, s.collected_at
                   FROM specimens s
                   JOIN patients p ON s.patient_id = p.id
                   WHERE s.id = %s
                   """, (specimen_id,))
    row = cursor.fetchall()
    cursor.close()
    conn.close()

    if row is None:
        return {"error": "Specimen not found"}

    return {"specimen": row}

class SpecimenCreate(BaseModel):
    patient_id: int
    type: str
    collected_by: int

@app.post("/specimens")
def create_specimen(specimen: SpecimenCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   INSERT INTO specimens (patient_id, type, collected_by, status)
                   VALUES (%s, %s, %s, 'Collected')
                   RETURNING id
                """, (specimen.patient_id, specimen.type, specimen.collected_by))
    new_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Specimen created", "id": new_id}
    
    