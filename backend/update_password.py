from passlib.context import CryptContext
from database import get_connection


pwd_context = CryptContext(schemes=["bcrypt"])

conn = get_connection()
cursor = conn.cursor()


cursor.execute("""
               SELECT id, password FROM users
               """)

users = cursor.fetchall()
cursor.close()
conn.close()

for user in users:
    user_id = user[0]
    plain_password = user[1]
    hashed_password = pwd_context.hash(plain_password)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
                   UPDATE users
                   SET password = %s
                   WHERE id = %s
                   """, (hashed_password, user_id))
    
    conn.commit()
    cursor.close()
    conn.close()