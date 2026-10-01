from flask import Flask, request, jsonify
from flask_cors import CORS
from database import (
    get_db_connection,
    create_users_table,
    create_donations_table
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

create_users_table()
create_donations_table()


@app.route("/")
def home():
    return "FoodShare Backend is Working!"
# ==================== REGISTER ====================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    raw_password = data.get("password")
    role = data.get("role")

    contact_person = data.get("contactPerson")
    ngo_id = data.get("ngoId")
    location = data.get("location")

    # Basic validation
    if not name or not email or not raw_password or not role:
        return jsonify({
            "message": "Please fill all required fields."
        }), 400

    # Only these two roles are allowed
    if role not in ["donor", "ngo"]:
        return jsonify({
            "message": "Invalid role."
        }), 400

    password = generate_password_hash(raw_password)

    connection = get_db_connection()

    try:

        connection.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                phone,
                password,
                role,
                contact_person,
                ngo_id,
                location
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name,
                email,
                phone,
                password,
                role,
                contact_person,
                ngo_id,
                location
            )
        )

        connection.commit()

        return jsonify({
            "message": "Registration successful!",
            "role": role
        }), 201

    except Exception as e:

        print("Registration error:", e)

        return jsonify({
            "message": "Email already registered."
        }), 400

    finally:

        connection.close()


# ==================== LOGIN ====================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({
            "message": "Email, password and role are required."
        }), 400

    if role not in ["donor", "ngo"]:
        return jsonify({
            "message": "Invalid role."
        }), 400

    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        AND role = ?
        """,
        (email, role)
    ).fetchone()

    connection.close()

    if user and check_password_hash(
        user["password"],
        password
    ):

        return jsonify({

            "message": "Login successful!",

            "role": user["role"],

            "name": user["name"],

            "email": user["email"],

            "phone": user["phone"],

            "contact_person": user["contact_person"],

            "ngo_id": user["ngo_id"],

            "location": user["location"]

        }), 200


    return jsonify({
        "message": "Invalid email, password or role."
    }), 401

# ==================== NGO PROFILE ====================

@app.route("/api/profile/<email>", methods=["GET"])
def get_profile(email):

    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT id, name, email, phone, role,
               contact_person, ngo_id, location
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    connection.close()

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    return jsonify(dict(user)), 200
# ==================== UPDATE PROFILE ====================

@app.route("/api/profile/<email>", methods=["PUT"])
def update_profile(email):

    data = request.get_json()

    name = data.get("name")
    phone = data.get("phone")
    location = data.get("location")

    if not name:
        return jsonify({
            "message": "Name is required."
        }), 400

    connection = get_db_connection()

    try:

        user = connection.execute(
            """
            SELECT *
            FROM users
            WHERE email = ?
            """,
            (email,)
        ).fetchone()

        if not user:
            return jsonify({
                "message": "User not found."
            }), 404

        connection.execute(
            """
            UPDATE users
            SET name = ?,
                phone = ?,
                location = ?
            WHERE email = ?
            """,
            (
                name,
                phone,
                location,
                email
            )
        )

        connection.commit()

        return jsonify({
            "message": "Profile updated successfully!",
            "name": name,
            "email": email,
            "phone": phone,
            "location": location
        }), 200

    except Exception as e:

        connection.rollback()

        print("Profile update error:", e)

        return jsonify({
            "message": "Unable to update profile."
        }), 500

    finally:

        connection.close()
        # ==================== SINGLE DONATION ====================

@app.route("/api/donations/<int:donation_id>", methods=["GET"])
def get_single_donation(donation_id):

    connection = get_db_connection()

    donation = connection.execute(
        """
        SELECT *
        FROM donations
        WHERE id = ?
        """,
        (donation_id,)
    ).fetchone()

    connection.close()

    if not donation:
        return jsonify({
            "message": "Donation not found."
        }), 404

    return jsonify(dict(donation)), 200
# ==================== ADD DONATION ====================

@app.route("/api/donations", methods=["POST"])
def add_donation():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No donation data received."
        }), 400

    donor_email = data.get("donor_email")

    if not donor_email:
        return jsonify({
            "message": "Donor email is required."
        }), 400

    connection = get_db_connection()

    try:

        connection.execute(
            """
            INSERT INTO donations
            (
                food_name,
                category,
                quantity,
                prepared_date,
                best_before,
                description,
                pickup_address,
                city,
                contact_number,
                status,
                donor_email,
                image_data
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.get("food_name"),
                data.get("category"),
                data.get("quantity"),
                data.get("prepared_date"),
                data.get("best_before"),
                data.get("description", ""),
                data.get("pickup_address"),
                data.get("city"),
                data.get("contact_number"),
                "Available",
                donor_email,
                data.get("image_data", "")
            )
        )

        connection.commit()

        return jsonify({
            "message": "Food donation submitted successfully!"
        }), 201

    except Exception as e:

        connection.rollback()

        print("Donation error:", e)

        return jsonify({
            "message": "Donation failed.",
            "error": str(e)
        }), 500

    finally:
        connection.close()
        # ==================== MY DONATIONS ====================

@app.route("/api/donations/my", methods=["GET"])
def get_my_donations():

    donor_email = request.args.get("email")

    if not donor_email:
        return jsonify({
            "message": "Donor email is required."
        }), 400

    connection = get_db_connection()

    donations = connection.execute(
        """
        SELECT * FROM donations
        WHERE donor_email = ?
        ORDER BY id DESC
        """,
        (donor_email,)
    ).fetchall()

    connection.close()

    return jsonify([
        dict(donation)
        for donation in donations
    ])
# ==================== AVAILABLE DONATIONS ====================

@app.route("/api/donations", methods=["GET"])
def get_donations():

    connection = get_db_connection()

    donations = connection.execute(
        """
        SELECT * FROM donations
        WHERE status = 'Available'
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(donation)
        for donation in donations
    ])

# ==================== ACCEPT DONATION ====================

@app.route("/api/donations/<int:donation_id>/accept", methods=["PUT"])
def accept_donation(donation_id):

    data = request.get_json() or {}
    ngo_email = data.get("ngo_email")

    if not ngo_email:
        return jsonify({
            "message": "NGO email is required."
        }), 400

    connection = get_db_connection()

    ngo = connection.execute(
        """
        SELECT email
        FROM users
        WHERE email = ?
        AND role = 'NGO'
        """,
        (ngo_email,)
    ).fetchone()

    if not ngo:
        connection.close()
        return jsonify({
            "message": "NGO not found."
        }), 404

    result = connection.execute(
        """
        UPDATE donations
        SET status = 'Accepted',
            accepted_by = ?
        WHERE id = ?
        AND status = 'Available'
        """,
        (ngo_email, donation_id)
    )

    connection.commit()
    connection.close()

    if result.rowcount == 0:
        return jsonify({
            "message": "Donation is no longer available."
        }), 400

    return jsonify({
        "message": "Donation accepted successfully!"
    }), 200

# ==================== ACCEPTED DONATIONS ====================

@app.route("/api/donations/accepted", methods=["GET"])
def get_accepted_donations():

    connection = get_db_connection()

    donations = connection.execute(
        """
        SELECT * FROM donations
        WHERE status = 'Accepted'
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(donation)
        for donation in donations
    ])
# ==================== COMPLETE DONATION ====================

@app.route("/api/donations/<int:donation_id>/complete", methods=["PUT"])
def complete_donation(donation_id):

    connection = get_db_connection()

    connection.execute(
        """
        UPDATE donations
        SET status = 'Completed'
        WHERE id = ? AND status = 'Accepted'
        """,
        (donation_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Donation completed successfully!"
    }), 200
# ==================== GET COMPLETED DONATIONS ====================

@app.route("/api/donations/completed", methods=["GET"])
def get_completed_donations():

    connection = get_db_connection()

    donations = connection.execute(
        """
        SELECT * FROM donations
        WHERE status = 'Completed'
        """
    ).fetchall()

    connection.close()

    return jsonify([dict(donation) for donation in donations])
# ==================== PEOPLE HELPED ====================

@app.route("/api/donations/people-helped", methods=["GET"])
def people_helped():

    connection = get_db_connection()

    result = connection.execute(
        """
        SELECT COALESCE(SUM(quantity), 0) AS total
        FROM donations
        WHERE status = 'Completed'
        """
    ).fetchone()

    connection.close()

    return jsonify({
        "people_helped": result["total"]
    })
# ==================== DONOR IMPACT ====================

@app.route("/api/donations/my/stats", methods=["GET"])
def get_my_donation_stats():

    donor_email = request.args.get("email")

    if not donor_email:
        return jsonify({
            "message": "Donor email is required."
        }), 400

    connection = get_db_connection()

    total = connection.execute(
        """
        SELECT COALESCE(SUM(quantity), 0) AS total
        FROM donations
        WHERE donor_email = ?
        """,
        (donor_email,)
    ).fetchone()

    accepted = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM donations
        WHERE donor_email = ?
        AND status = 'Accepted'
        """,
        (donor_email,)
    ).fetchone()

    completed = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM donations
        WHERE donor_email = ?
        AND status = 'Completed'
        """,
        (donor_email,)
    ).fetchone()

    people_helped = connection.execute(
        """
        SELECT COALESCE(SUM(quantity), 0) AS total
        FROM donations
        WHERE donor_email = ?
        AND status = 'Completed'
        """,
        (donor_email,)
    ).fetchone()

    connection.close()

    return jsonify({
        "meals_donated": total["total"],
        "accepted": accepted["total"],
        "completed": completed["total"],
        "people_helped": people_helped["total"]
    }), 200
# ==================== FIND NGOs ====================

@app.route("/api/ngos", methods=["GET"])
def get_ngos():

    connection = get_db_connection()

    ngos = connection.execute(
        """
        SELECT
            u.name,
            u.email,
            u.phone,
            u.contact_person,
            u.ngo_id,
            u.location,

            COUNT(
                CASE
                    WHEN d.status = 'Accepted'
                    THEN 1
                END
            ) AS accepted_donations,

            COUNT(
                CASE
                    WHEN d.status = 'Completed'
                    THEN 1
                END
            ) AS completed_donations,

            COALESCE(
                SUM(
                    CASE
                        WHEN d.status = 'Completed'
                        THEN d.quantity
                        ELSE 0
                    END
                ),
                0
            ) AS people_helped

        FROM users u

        LEFT JOIN donations d
            ON d.accepted_by = u.email

       WHERE LOWER(u.role) = 'ngo'

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.phone,
            u.contact_person,
            u.ngo_id,
            u.location

        ORDER BY u.name
        """
    ).fetchall()

    connection.close()

    return jsonify([
        dict(ngo)
        for ngo in ngos
    ]), 200
# ==================== START SERVER ====================

if __name__ == "__main__":
    app.run(debug=True)