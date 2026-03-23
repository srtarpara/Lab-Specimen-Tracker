import psycopg2 #The bridge between Python and PostgreSQL. Translates Python to SQL for the database to understand. 
from dotenv import load_dotenv #Importing the function that reads the .env file to load in all variables.
import os #This module enables the function to actually read the environment variables from memory.

load_dotenv() #Actually executes the function that reads the .env file.

#A reusable function that creates and returns a database connection.
#This is called by every end point in main.py that needs to query the database.
def get_connection():
    conn = psycopg2.connect(
        host = os.getenv("DB_HOST"),            #address of the database server
        database = os.getenv("DB_NAME"),        #Name of the specific server
        user = os.getenv("DB_USER"),            #Database username
        password = os.getenv("DB_PASSWORD"),    #Database password
        port = os.getenv("DB_PORT")             #Port PostgreSQL listens on
    )

    return conn #Returns the open connection to the caller.