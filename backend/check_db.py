import sqlite3

connection = sqlite3.connect("foodshare.db")

rows = connection.execute("SELECT * FROM donations").fetchall()

for row in rows:
    print(row)

connection.close()