import sqlite3

DATABASE = "foodshare.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_users_table():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            contact_person TEXT,
            ngo_id TEXT,
            location TEXT
        )
    """)

    # Add new columns if older database already exists
    columns = [
        ("contact_person", "TEXT"),
        ("ngo_id", "TEXT"),
        ("location", "TEXT")
    ]

    existing_columns = [
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(users)"
        ).fetchall()
    ]

    for column_name, column_type in columns:
        if column_name not in existing_columns:
            connection.execute(
                f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"
            )

    connection.commit()
    connection.close()


def create_donations_table():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food_name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            prepared_date TEXT NOT NULL,
            best_before TEXT NOT NULL,
            description TEXT,
            pickup_address TEXT NOT NULL,
            city TEXT NOT NULL,
            contact_number TEXT NOT NULL,
            status TEXT DEFAULT 'Available',
            donor_email TEXT,
            image_data TEXT
        )
    """)

    existing_columns = [
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(donations)"
        ).fetchall()
    ]

    columns = [
        ("donor_email", "TEXT"),
        ("image_data", "TEXT"),
        ("accepted_by", "TEXT")
    ]

    for column_name, column_type in columns:
        if column_name not in existing_columns:
            connection.execute(
                f"ALTER TABLE donations ADD COLUMN {column_name} {column_type}"
            )

    connection.commit()
    connection.close()