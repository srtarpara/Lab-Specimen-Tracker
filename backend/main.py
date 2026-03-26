from fastapi import FastAPI                             #Imports the FastAPI framework - turns the python file into a web server that can recieve HTTP requests
from database import get_connection                     #Imports the get_connection function that was written in database.py. This is how every endpoint gets access to the database.
from pydantic import BaseModel                          #Imports the BaseModel class that defines what shape the incomming request data should be. If someone sends the wrong data type then FastAPI will automatically reject it.
from fastapi.middleware.cors import CORSMiddleware      #Imports the CORS middleware which is like a bouncer that controls which domains are allowed to make requests to the API.
from passlib.context import CryptContext                #Imports the CryptContext class from the passlib library. CryptContext is the tool that handles all password hashing and verification.

app = FastAPI()     #Creates the FastAPI application. Everything else hangs off this app object, every route, every middleware, everything.

#Registers the CORS bouncer on the app. Only localhost and the Vercel URL are on the guest list and every other domain gets blocked.
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000",
                     "https://lab-specimen-tracker.vercel.app"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

#Root Endpoint - A simple health check endpoint.
@app.get("/")
def root():
    return {"message": "Specimen Tracker API is running!"}

#Get /patients - returns all patients in the patients table. The data is returned as a JSON data type.
@app.get("/patients")
def get_patients():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"patients": rows}

#Get /specimens - returns all specimens in the specimens table. The data is returned as a JSON data type.
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

#Get /specimens/{specimen_id} - returns a specific specimen by using the specimen id from the specimen table. The data is returned as a JSON data type.
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

#This class defines the shape of the data we expect when someone creates a specimen. FastAPI uses this to automatically validate incoming requests.
class SpecimenCreate(BaseModel):
    patient_id: int
    type: str
    collected_by: int

#Post /specimens - Takes the input from the user and inserts it into the specimen table as a new row and it does the same thing to the audit table.
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

#This class defines what data is expected when updating a status.
class StatusUpdate(BaseModel):
    new_status: str
    updated_by: int

#Put /specimens/{specimen_id}/status - Updates the specimen status in the specimens table and adds a new entry to the specimen_log table.
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

#Get /specimens/{specimen_id}/log - Returns the specimen log for a specific specimen based on specimen_id.
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

#Get /patients/{patient_id}/specimens - returns all the specimens corresponding to a particular patient. The data is returned as a JSON data type.
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

#This class defines the shape of the data we expect when someone creates a patient. FastAPI uses this to automatically validate incoming requests.
class PatientCreate(BaseModel):
    name: str
    date_of_birth: str
    medical_record_number: str

#Post /patients - adds a new patient to the patients table. If not successfully then the table is rolled back to the previosu version.
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

#This class defines the shape of the data we expect when someone trys to login. FastAPI uses this to automatically validate incoming requests.
class LoginRequest(BaseModel):
    email: str
    password: str

#Post /login - takes into account a username and password from the user and checks if it is valid in the user table. If so then the user can log in and if not then they can try again.
@app.post("/login")
def login(request: LoginRequest):
    pwd_context = CryptContext(schemes=["bcrypt"])
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT id, name, email, password, role
                   FROM users WHERE email = %s
                   """, (request.email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user is None:
        return {"error": "Invalid email or password"}
    
    if not pwd_context.verify(request.password, user[3]):
        return {"error": "Invalid email or password"}
    
    return{
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[4]
        }
    }