// ============================================================
// FOODSHARE - MAIN JAVASCRIPT
// ============================================================

const API_URL = "http://127.0.0.1:5000";


// ============================================================
// LOGIN SYSTEM
// ============================================================

const loginForm = document.querySelector("form");

if (
    loginForm &&
    document.getElementById("email") &&
    document.getElementById("password")
) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        );

        if (!selectedRole) {
            alert("Please select Donor or NGO.");
            return;
        }

        const role = selectedRole.value;

        try {

            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem(
                    "userName",
                    data.name || ""
                );

                localStorage.setItem(
                    "userRole",
                    data.role || ""
                );

                localStorage.setItem(
                    "userEmail",
                    data.email || ""
                );

                localStorage.setItem(
                    "userPhone",
                    data.phone || ""
                );

                localStorage.setItem(
                    "contactPerson",
                    data.contact_person || ""
                );

                localStorage.setItem(
                    "ngoId",
                    data.ngo_id || ""
                );

                localStorage.setItem(
                    "ngoLocation",
                    data.location || ""
                );

                alert("Login successful!");

                if (data.role === "donor") {

                    window.location.href =
                        "donor-dashboard.html";

                } else if (data.role === "ngo") {

                    window.location.href =
                        "ngo-dashboard.html";

                } else {

                    alert("Invalid user role.");
                }

            } else {

                alert(
                    data.message ||
                    "Invalid email, password or role."
                );
            }

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to the server. " +
                "Please make sure Flask server is running."
            );
        }
    });
}


// ============================================================
// REGISTER SYSTEM
// ============================================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const selectedRole =
                document.querySelector(
                    'input[name="role"]:checked'
                );

            if (!selectedRole) {

                alert(
                    "Please select Donor or NGO."
                );

                return;
            }

            const role =
                selectedRole.value;

            const password =
                document.getElementById(
                    "register-password"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirm-password"
                ).value;

            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }

            let user = {};

            // =================================================
            // DONOR REGISTRATION
            // =================================================

            if (role === "donor") {

                user = {

                    name:
                        document.getElementById(
                            "donor-name"
                        ).value.trim(),

                    email:
                        document.getElementById(
                            "donor-email"
                        ).value.trim(),

                    phone:
                        document.getElementById(
                            "donor-phone"
                        ).value.trim(),

                    location:
                        document.getElementById(
                            "donor-location"
                        )?.value.trim() || "",

                    password:
                        password,

                    role:
                        "donor"
                };
            }

            // =================================================
            // NGO REGISTRATION
            // =================================================

            else if (role === "ngo") {

                user = {

                    name:
                        document.getElementById(
                            "ngo-name"
                        ).value.trim(),

                    contactPerson:
                        document.getElementById(
                            "contact-name"
                        ).value.trim(),

                    email:
                        document.getElementById(
                            "ngo-email"
                        ).value.trim(),

                    phone:
                        document.getElementById(
                            "ngo-phone"
                        ).value.trim(),

                    location:
                        document.getElementById(
                            "ngo-location"
                        )?.value.trim() || "",

                    ngoId:
                        document.getElementById(
                            "ngo-id"
                        ).value.trim(),

                    password:
                        password,

                    role:
                        "ngo"
                };
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(user)
                        }
                    );

                const data =
                    await response.json();

                if (response.ok) {

                    alert(
                        "Registration successful! Please login."
                    );

                    window.location.href =
                        "login.html";

                } else {

                    alert(
                        data.message ||
                        "Registration failed."
                    );
                }

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Unable to connect to the server. " +
                    "Please make sure Flask server is running."
                );
            }
        }
    );
}

// ============================================================
// ADD FOOD DONATION
// ============================================================

const donationForm = document.getElementById("donationForm");

if (donationForm) {

    donationForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const donorEmail = localStorage.getItem("userEmail");

        if (!donorEmail) {
            alert("Please login again before donating food.");
            return;
        }

        const imageInput = document.getElementById("food-image");

        let imageData = "";

        // Convert selected image into Base64
        if (imageInput && imageInput.files.length > 0) {

            const file = imageInput.files[0];

            imageData = await new Promise((resolve, reject) => {

                const reader = new FileReader();

                reader.onload = function () {
                    resolve(reader.result);
                };

                reader.onerror = function () {
                    reject(new Error("Unable to read image."));
                };

                reader.readAsDataURL(file);
            });
        }

        const donationData = {

            food_name:
                document.getElementById("food-name").value.trim(),

            category:
                document.getElementById("food-category").value,

            quantity:
                parseInt(
                    document.getElementById("quantity").value
                ),

            prepared_date:
                document.getElementById("prepared-date").value,

            best_before:
                document.getElementById("best-before").value,

            description:
                document.getElementById("food-description").value.trim(),

            pickup_address:
                document.getElementById("pickup-address").value.trim(),

            city:
                document.getElementById("city").value.trim(),

            contact_number:
                document.getElementById("contact-number").value.trim(),

            donor_email:
                donorEmail,

            image_data:
                imageData
        };


        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/donations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(donationData)
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert(
                    "Food donation submitted successfully!"
                );

                donationForm.reset();

                window.location.href =
                    "my-donations.html";

            } else {

                alert(
                    data.message ||
                    "Donation failed."
                );
            }

        } catch (error) {

            console.error(
                "Donation error:",
                error
            );

            alert(
                "Unable to connect to the server."
            );
        }

    });
}


// ============================================================
// MY DONATIONS - DONOR
// ============================================================

const myDonationsContainer =
    document.getElementById(
        "myDonationsContainer"
    );

if (myDonationsContainer) {

    const donorEmail =
        localStorage.getItem("userEmail");

    const donorName =
        localStorage.getItem("userName");


    // Show donor name
    const donorNameElement =
        document.getElementById("donorName");

    const donorInitial =
        document.getElementById("donorInitial");


    if (donorNameElement && donorName) {

        donorNameElement.textContent =
            donorName;
    }


    if (donorInitial && donorName) {

        donorInitial.textContent =
            donorName
                .charAt(0)
                .toUpperCase();
    }


    // Check login
    if (!donorEmail) {

        myDonationsContainer.innerHTML = `
            <div class="dashboard-card">
                <h3>Please login</h3>
                <p>
                    Login as a donor to view your donations.
                </p>
            </div>
        `;

    } else {

        fetch(
            `${API_URL}/api/donations/my?email=${encodeURIComponent(donorEmail)}`
        )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "API Error: " +
                        response.status
                    );
                }

                return response.json();
            })

            .then(donations => {

                myDonationsContainer.innerHTML = "";


                if (!Array.isArray(donations) ||
                    donations.length === 0) {

                    myDonationsContainer.innerHTML = `
                        <div class="dashboard-card">
                            <h3>No donations yet</h3>

                            <p>
                                Your food donations will appear here.
                            </p>
                        </div>
                    `;

                    return;
                }


                donations.forEach(
                    donation => {

                        const card =
                            document.createElement(
                                "div"
                            );

                        card.className =
                            "available-donation";


                        const status =
                            donation.status || "Available";


                        const statusClass =
                            status
                                .toLowerCase()
                                .replace(/\s+/g, "-");


                        card.innerHTML = `

                            <div>

                                <h3>
                                    ${donation.food_name}
                                </h3>

                                <p>
                                    ${donation.quantity} meals •
                                    ${donation.city}
                                </p>

                                <small>
                                    Category:
                                    ${donation.category}
                                </small>

                                <br>

                                <small>
                                    Best before:
                                    ${donation.best_before}
                                </small>

                                <br>

                                <small>
                                    Pickup:
                                    ${donation.pickup_address}
                                </small>

                            </div>

                            <span class="status ${statusClass}">
                                ${status}
                            </span>
                        `;


                        myDonationsContainer.appendChild(
                            card
                        );
                    }
                );

            })

            .catch(error => {

                console.error(
                    "Error loading my donations:",
                    error
                );

                myDonationsContainer.innerHTML = `
                    <div class="dashboard-card">
                        <h3>Unable to load donations</h3>

                        <p>
                            Please make sure the Flask server
                            is running.
                        </p>
                    </div>
                `;
            });
    }
}


// ============================================================
// LOAD AVAILABLE DONATIONS - NGO
// ============================================================

const donationsContainer =
    document.getElementById(
        "donationsContainer"
    );

if (donationsContainer) {

    fetch(
        `${API_URL}/api/donations`
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "API Error: " +
                    response.status
                );
            }

            return response.json();
        })

        .then(donations => {

            const availableCount =
                document.getElementById(
                    "availableCount"
                );

            if (availableCount) {

                availableCount.textContent =
                    donations.length;
            }


            donationsContainer.innerHTML = "";


            if (donations.length === 0) {

                donationsContainer.innerHTML =
                    "<p>No donations available.</p>";

                return;
            }


            donations.forEach(
                donation => {

                    const donationCard =
                        document.createElement(
                            "div"
                        );

                    donationCard.className =
                        "available-donation";


                    donationCard.innerHTML = `

                        <div>

                            <h3>
                                ${donation.food_name}
                            </h3>

                            <p>
                                ${donation.quantity} meals •
                                ${donation.city}
                            </p>

                            <small>
                                Category:
                                ${donation.category}
                            </small>

                            <br>

                            <small>
                                Best before:
                                ${donation.best_before}
                            </small>

                        </div>

                        <button
                            onclick="window.location.href='ngo-donation-details.html?id=${donation.id}'">
                            View Details
                        </button>
                    `;

                    donationsContainer.appendChild(
                        donationCard
                    );
                }
            );
        })

        .catch(error => {

            console.error(
                "Error loading donations:",
                error
            );

            donationsContainer.innerHTML =
                "<p>Unable to load donations.</p>";
        });
}


// ============================================================
// ACCEPT DONATION
// ============================================================

async function acceptDonation(donationId) {

    const ngoEmail = localStorage.getItem("userEmail");

    if (!ngoEmail) {
        alert("NGO login information not found.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/donations/${donationId}/accept`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ngo_email: ngoEmail
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to accept donation.");
            return;
        }

        alert("Donation accepted successfully!");

        location.reload();

    } catch (error) {

        console.error("Accept donation error:", error);

        alert("Something went wrong while accepting donation.");
    }
}

// ============================================================
// LOAD ACCEPTED DONATIONS
// ============================================================

const acceptedContainer =
    document.getElementById(
        "acceptedDonationsContainer"
    );

if (acceptedContainer) {

    fetch(
        `${API_URL}/api/donations/accepted`
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "API Error: " +
                    response.status
                );
            }

            return response.json();
        })

        .then(donations => {

            const acceptedCount =
                document.getElementById(
                    "acceptedCount"
                );

            if (acceptedCount) {

                acceptedCount.textContent =
                    donations.length;
            }


            acceptedContainer.innerHTML = "";


            if (donations.length === 0) {

                acceptedContainer.innerHTML =
                    "<p>No accepted donations yet.</p>";

                return;
            }


            donations.forEach(
                donation => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "available-donation";


                    card.innerHTML = `

                        <div>

                            <h3>
                                ${donation.food_name}
                            </h3>

                            <p>
                                ${donation.quantity} meals •
                                ${donation.city}
                            </p>

                            <small>
                                Best before:
                                ${donation.best_before}
                            </small>

                        </div>

                        <button
                            onclick="completeDonation(${donation.id})">
                            Mark as Completed
                        </button>
                    `;


                    acceptedContainer.appendChild(
                        card
                    );
                }
            );
        })

        .catch(error => {

            console.error(
                "Error loading accepted donations:",
                error
            );

            acceptedContainer.innerHTML =
                "<p>Unable to load accepted donations.</p>";
        });
}


// ============================================================
// COMPLETE DONATION
// ============================================================

async function completeDonation(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/donations/${id}/complete`,
                {
                    method: "PUT"
                }
            );

        const data =
            await response.json();

        alert(
            data.message ||
            "Donation completed."
        );

        if (response.ok) {

            location.reload();
        }

    } catch (error) {

        console.error(
            "Complete donation error:",
            error
        );

        alert(
            "Unable to complete donation."
        );
    }
}


// ============================================================
// COMPLETED DONATIONS COUNT
// ============================================================

const completedCount =
    document.getElementById(
        "completedCount"
    );

if (completedCount) {

    fetch(
        `${API_URL}/api/donations/completed`
    )

        .then(response =>
            response.json()
        )

        .then(donations => {

            completedCount.textContent =
                donations.length;

        })

        .catch(error => {

            console.error(
                "Error loading completed donations:",
                error
            );
        });
}


// ============================================================
// PEOPLE HELPED
// ============================================================

const peopleHelpedCount =
    document.getElementById(
        "peopleHelpedCount"
    );

if (peopleHelpedCount) {

    fetch(
        `${API_URL}/api/donations/people-helped`
    )

        .then(response =>
            response.json()
        )

        .then(data => {

            peopleHelpedCount.textContent =
                data.people_helped || 0;

        })

        .catch(error => {

            console.error(
                "Error loading people helped:",
                error
            );
        });
}


// ============================================================
// AVAILABLE DONATIONS PAGE
// ============================================================

const availablePage =
    document.getElementById(
        "availableDonationsPage"
    );

if (availablePage) {

    fetch(
        `${API_URL}/api/donations`
    )

        .then(response =>
            response.json()
        )

        .then(donations => {

            availablePage.innerHTML = "";


            if (donations.length === 0) {

                availablePage.innerHTML =
                    "<p>No donations available.</p>";

                return;
            }


            donations.forEach(
                donation => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "available-donation";


                    card.innerHTML = `

                        <div>

                            <h3>
                                ${donation.food_name}
                            </h3>

                            <p>
                                ${donation.quantity} meals •
                                ${donation.city}
                            </p>

                            <small>
                                Category:
                                ${donation.category}
                            </small>

                            <br>

                            <small>
                                Best before:
                                ${donation.best_before}
                            </small>

                        </div>

                        <button
                            onclick="acceptDonation(${donation.id})">
                            Accept Donation
                        </button>
                    `;


                    availablePage.appendChild(
                        card
                    );
                }
            );
        })

        .catch(error => {

            console.error(
                "Error loading available donations:",
                error
            );

            availablePage.innerHTML =
                "<p>Unable to load donations.</p>";
        });
}


// ============================================================
// ACCEPTED DONATIONS PAGE
// ============================================================

const acceptedPage =
    document.getElementById(
        "acceptedDonationsPage"
    );

if (acceptedPage) {

    fetch(
        `${API_URL}/api/donations/accepted`
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "API Error: " +
                    response.status
                );
            }

            return response.json();
        })

        .then(donations => {

            acceptedPage.innerHTML = "";


            if (donations.length === 0) {

                acceptedPage.innerHTML =
                    "<p>No accepted donations yet.</p>";

                return;
            }


            donations.forEach(
                donation => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "available-donation";


                    card.innerHTML = `

                        <div>

                            <h3>
                                ${donation.food_name}
                            </h3>

                            <p>
                                ${donation.quantity} meals •
                                ${donation.city}
                            </p>

                            <small>
                                Category:
                                ${donation.category}
                            </small>

                            <br>

                            <small>
                                Best before:
                                ${donation.best_before}
                            </small>

                            <br>

                            <small>
                                Pickup Address:
                                ${donation.pickup_address}
                            </small>

                        </div>

                        <button
                            onclick="completeDonation(${donation.id})">
                            Mark as Completed
                        </button>
                    `;


                    acceptedPage.appendChild(
                        card
                    );
                }
            );
        })

        .catch(error => {

            console.error(
                "Error loading accepted donations:",
                error
            );

            acceptedPage.innerHTML =
                "<p>Unable to load accepted donations.</p>";
        });
}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {

    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("contactPerson");
    localStorage.removeItem("ngoId");
    localStorage.removeItem("ngoLocation");
    localStorage.removeItem("userRole");

    window.location.href =
        "index.html";
}


// ============================================================
// NGO WELCOME
// ============================================================

const welcomeNGO =
    document.getElementById(
        "welcomeNGO"
    );

if (welcomeNGO) {

    const userName =
        localStorage.getItem(
            "userName"
        );

    if (userName) {

        welcomeNGO.textContent =
            `Welcome, ${userName}!`;
    }
}


// ============================================================
// DONOR WELCOME
// ============================================================

const userWelcome =
    document.getElementById(
        "userWelcome"
    );

if (userWelcome) {

    const userName =
        localStorage.getItem(
            "userName"
        );

    if (userName) {

        userWelcome.textContent =
            `Welcome, ${userName}!`;
    }
}


// ============================================================
// DONOR PROFILE NAME + INITIAL
// ============================================================

const donorNameElement =
    document.getElementById(
        "donorName"
    );

const donorInitial =
    document.getElementById(
        "donorInitial"
    );

const loggedInName =
    localStorage.getItem(
        "userName"
    );


if (donorNameElement && loggedInName) {

    donorNameElement.textContent =
        loggedInName;
}


if (donorInitial && loggedInName) {

    donorInitial.textContent =
        loggedInName
            .charAt(0)
            .toUpperCase();
}
// ============================================================
// DONOR PROFILE
// ============================================================

const profilePage = document.getElementById("profileModal");

if (profilePage) {

    const donorEmail = localStorage.getItem("userEmail");


    // ==================== LOAD PROFILE ====================

    async function loadDonorProfile() {

        if (!donorEmail) {

            alert("Please login again.");

            window.location.href = "login.html";

            return;
        }

        try {

            const response = await fetch(
                `http://127.0.0.1:5000/api/profile/${encodeURIComponent(donorEmail)}`
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || "Unable to load profile."
                );
            }


            // ==================== DISPLAY PROFILE ====================

            document.getElementById("profileName").textContent =
                data.name || "Donor";

            document.getElementById("profileFullName").textContent =
                data.name || "Not provided";

            document.getElementById("profileEmail").textContent =
                data.email || "Not provided";

            document.getElementById("profilePhone").textContent =
                data.phone || "Not provided";

            document.getElementById("profileLocation").textContent =
                data.location || "Not provided";


            // ==================== PROFILE INITIAL ====================

            const initial =
                data.name
                    ? data.name.charAt(0).toUpperCase()
                    : "D";

            document.getElementById("profileInitial").textContent =
                initial;


            // Sidebar

            const sidebarName =
                document.getElementById("donorName");

            const sidebarInitial =
                document.getElementById("donorInitial");

            if (sidebarName) {
                sidebarName.textContent =
                    data.name || "Donor";
            }

            if (sidebarInitial) {
                sidebarInitial.textContent =
                    initial;
            }


            // ==================== SAVE UPDATED DATA ====================

            localStorage.setItem(
                "userName",
                data.name || ""
            );

            localStorage.setItem(
                "userPhone",
                data.phone || ""
            );

            localStorage.setItem(
                "ngoLocation",
                data.location || ""
            );


            // ==================== EDIT FORM ====================

            document.getElementById("editName").value =
                data.name || "";

            document.getElementById("editEmail").value =
                data.email || "";

            document.getElementById("editPhone").value =
                data.phone || "";

            document.getElementById("editLocation").value =
                data.location || "";

        }

        catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            alert(
                "Unable to load profile. Make sure Flask server is running."
            );
        }
    }


    loadDonorProfile();


    // ==================== OPEN EDIT PROFILE ====================

    const editButton =
        document.getElementById("editProfileButton");

    const modal =
        document.getElementById("profileModal");

    const cancelButton =
        document.getElementById("cancelEdit");


    editButton.addEventListener(
        "click",
        function () {

            modal.classList.add("show");

        }
    );


    // ==================== CLOSE MODAL ====================

    cancelButton.addEventListener(
        "click",
        function () {

            modal.classList.remove("show");

        }
    );


    // ==================== SAVE PROFILE ====================

    const editForm =
        document.getElementById("editProfileForm");


    editForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "editName"
                ).value.trim();

            const phone =
                document.getElementById(
                    "editPhone"
                ).value.trim();

            const location =
                document.getElementById(
                    "editLocation"
                ).value.trim();


            if (!name) {

                alert("Please enter your name.");

                return;
            }


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:5000/api/profile/${encodeURIComponent(donorEmail)}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                phone: phone,

                                location: location

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Profile update failed."
                    );

                    return;
                }


                // ==================== UPDATE LOCAL STORAGE ====================

                localStorage.setItem(
                    "userName",
                    data.name
                );

                localStorage.setItem(
                    "userPhone",
                    data.phone || ""
                );

                localStorage.setItem(
                    "ngoLocation",
                    data.location || ""
                );


                alert(
                    "Profile updated successfully!"
                );


                modal.classList.remove(
                    "show"
                );


                // Reload profile

                loadDonorProfile();

            }

            catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );
            }

        }
    );

}
// ============================================================
// DONOR IMPACT
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const donorMeals = document.getElementById("donorMeals");
    const donorAccepted = document.getElementById("donorAccepted");
    const donorCompleted = document.getElementById("donorCompleted");
    const donorPeopleHelped = document.getElementById("donorPeopleHelped");

    const donorEmail = localStorage.getItem("userEmail");

    // Only run on donor dashboard
    if (!donorEmail || !donorMeals) {
        return;
    }

    fetch(
        `${API_URL}/api/donations/my/stats?email=${encodeURIComponent(donorEmail)}`
    )
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to load donor stats.");
            }

            return response.json();
        })
        .then(data => {

            donorMeals.textContent = data.meals_donated ?? 0;
            donorAccepted.textContent = data.accepted ?? 0;
            donorCompleted.textContent = data.completed ?? 0;
            donorPeopleHelped.textContent = data.people_helped ?? 0;

        })
        .catch(error => {
            console.error("Donor impact error:", error);
        });

});