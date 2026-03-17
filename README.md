# Lab-Specimen-Tracker

3/16/2026 - Created the database in postgres sql. You can find the database schema in the database.sql file.
3/16/2026 - Created the backend setup, database.py builds the connection to the Postgres SQL server, and main.py creates the root endpoint and the patients endpoint that pulls all the patient data from the table in the database and returns it. Had an issue with the password not matching in the .env folder and the database.py when it builds the connection. Was able to reset the password in Postgres SQL to match and enabled the whole code to work perfectly.
3/17/2026 - Created the specimen API endpoints, specifically the get all specimens, get a certain specimen, and inject a new specimen into the database.
3/17/2026 - Added the status update endpoint and audit trail endpoints.