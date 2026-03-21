import psycopg2
from passlib.context import CryptContext
from database import get_connection
import random
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"])

conn = get_connection()
cursor = conn.cursor()

# Clear existing data
cursor.execute("DELETE FROM specimen_log")
cursor.execute("DELETE FROM specimens")
cursor.execute("DELETE FROM patients")
cursor.execute("DELETE FROM users")

# Reset ID sequences
cursor.execute("ALTER SEQUENCE users_id_seq RESTART WITH 1")
cursor.execute("ALTER SEQUENCE patients_id_seq RESTART WITH 1")
cursor.execute("ALTER SEQUENCE specimens_id_seq RESTART WITH 1")
cursor.execute("ALTER SEQUENCE specimen_log_id_seq RESTART WITH 1")

# Create users
password = "password123"
users = [
    ("Alice Nurse", "alice@hospital.com", password, "nurse"),
    ("Bob LabTech", "bob@hospital.com", password, "lab_tech"),
    ("Carol Pathologist", "carol@hospital.com", password, "pathologist"),
    ("David Nurse", "david@hospital.com", password, "nurse"),
    ("Eve LabTech", "eve@hospital.com", password, "lab_tech"),
]

cursor.executemany("""
    INSERT INTO users (name, email, password, role)
    VALUES (%s, %s, %s, %s)
""", users)

print(f"✅ Inserted {len(users)} users")

# Create patients
first_names = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer",
    "Michael", "Linda", "William", "Barbara", "David", "Susan",
    "Richard", "Jessica", "Joseph", "Sarah", "Thomas", "Karen",
    "Charles", "Lisa", "Christopher", "Nancy", "Daniel", "Betty",
    "Matthew", "Sandra", "Anthony", "Ashley", "Mark", "Dorothy"
]

last_names = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
    "Miller", "Davis", "Martinez", "Anderson", "Taylor", "Thomas",
    "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White",
    "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis",
    "Robinson", "Walker", "Perez", "Hall", "Young", "Allen"
]

patients = []
used_mrns = set()

for i in range(50):
    first = random.choice(first_names)
    last = random.choice(last_names)
    name = f"{first} {last}"
    year = random.randint(1940, 2005)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    dob = f"{year}-{month:02d}-{day:02d}"
    mrn = f"MRN{str(i + 1).zfill(3)}"
    patients.append((name, dob, mrn))

cursor.executemany("""
    INSERT INTO patients (name, date_of_birth, medical_record_number)
    VALUES (%s, %s, %s)
""", patients)

print(f"✅ Inserted {len(patients)} patients")

# Create specimens
specimen_types = ["Blood", "Urine", "Tissue", "Saliva"]
statuses = ["Collected", "Received", "Processing", "Resulted", "Verified"]

specimens_inserted = 0

for patient_id in range(1, 51):
    num_specimens = random.randint(1, 5)
    for _ in range(num_specimens):
        specimen_type = random.choice(specimen_types)
        status = random.choice(statuses)
        collected_by = random.randint(1, len(users))
        days_ago = random.randint(0, 30)
        collected_at = datetime.now() - timedelta(days=days_ago)

        cursor.execute("""
            INSERT INTO specimens (patient_id, type, collected_by, status, collected_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (patient_id, specimen_type, collected_by, status, collected_at))

        specimen_id = cursor.fetchone()[0]
        specimens_inserted += 1

        # Add log entries for each status change
        current_status = "Collected"
        status_order = ["Collected", "Received", "Processing", "Resulted", "Verified"]
        target_index = status_order.index(status)

        for i in range(target_index):
            old_status = status_order[i]
            new_status = status_order[i + 1]
            updated_by = random.randint(1, len(users))
            timestamp = collected_at + timedelta(hours=random.randint(1, 12) * (i + 1))

            cursor.execute("""
                INSERT INTO specimen_log (specimen_id, updated_by, old_status, new_status, timestamp)
                VALUES (%s, %s, %s, %s, %s)
            """, (specimen_id, updated_by, old_status, new_status, timestamp))

print(f"✅ Inserted {specimens_inserted} specimens with audit trails")

conn.commit()
cursor.close()
conn.close()

print("🎉 Database seeded successfully!")