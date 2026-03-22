from fastapi import FastAPI
from database import get_connection
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000",
                     "https://lab-specimen-tracker.vercel.app"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

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
                   ORDEr BY s.collected_at DESC
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
                    SELECT s.id, p.name as patient_name, s.type, s.status, s.collected_at, p.medical_record_number
                   FROM specimens s
                   JOIN patients p ON s.patient_id = p.id
                   WHERE s.id = %s
                   """, (specimen_id,))
    row = cursor.fetchone()
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

    cursor.execute("""
                   INSERT INTO specimen_log(specimen_id, updated_by, old_status, new_status)
                   VALUES(%s, %s, %s, %s)
                """, (new_id, specimen.collected_by, 'Created', 'Collected'))
    
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Specimen created", "id": new_id}
    
class StatusUpdate(BaseModel):
    new_status: str
    updated_by: int

@app.put("/specimens/{specimen_id}/status")
def update_status(specimen_id: int, update: StatusUpdate):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT status FROM specimens WHERE id = %s", (specimen_id,))
    row = cursor.fetchone()

    if row is None:
        return {"error": "Specimen not found"}
    
    old_status = row[0]

    cursor.execute("""
                   UPDATE specimens SET status = %s WHERE id = %s
                """, (update.new_status, specimen_id))
    
    cursor.execute("""
                   INSERT INTO specimen_log (specimen_id, updated_by, old_status, new_status)
                   VALUES (%s, %s, %s, %s)
                """, (specimen_id, update.updated_by, old_status, update.new_status))
    
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"Status updated from {old_status} to {update.new_status}"}

@app.get("/specimens/{specimen_id}/log")
def get_specimen_log(specimen_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT s1.id, u.name as updated_by, s1.old_status, s1.new_status, s1.timestamp
                   FROM specimen_log s1
                   JOIN users u ON s1.updated_by = u.id
                   WHERE s1.specimen_id = %s
                   ORDER BY s1.timestamp ASC
                """, (specimen_id,))
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"log": rows}

@app.get("/patients/{patient_id}/specimens")
def get_patient_specimens(patient_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT s.id, p.name as patient_name, s.type, s.status, s.collected_at
                   FROM specimens s
                   JOIN patients p ON s.patient_id = p.id
                   WHERE s.patient_id = %s
                   ORDER BY s.collected_at DESC
                """, (patient_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"specimens": rows}

class PatientCreate(BaseModel):
    name: str
    date_of_birth: str
    medical_record_number: str

@app.post("/patients")
def create_patient(patient: PatientCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
                   INSERT INTO patients (name, date_of_birth, medical_record_number)
                   VALUES (%s, %s, %s)
                   RETURNING id
                """, (patient.name, patient.date_of_birth, patient.medical_record_number))
        new_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Specimen created", "id": new_id}
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"message": "MRN already exists"}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT id, name, email, role
                   FROM users WHERE email = %s AND password = %s
                   """, (request.email, request.password))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user is None:
        return {"error": "Invalid email or password"}
    
    return{
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3]
        }
    }