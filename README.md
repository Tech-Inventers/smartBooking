# 🧠 Smart Booking Assistant Backend
### A test-driven, AI-powered booking system built with Node.js, designed to interpret human language and manage real appointments through smart natural language interactions including Book, Reschedule, Cancel. All through one intelligent assistant. 💡🤖

## 📋 Prerequisites  

Before you begin, ensure you have the following installed/configured:

**🧰 Development Essentials::**
- ⚙️ **Node.js 18+** Runtime environment to execute backend logic
- ⚙️ **VS Code (Recommended)**  Lightweight code editor with great Node.js support

### 🛠️ Setup Instructions
1. **Clone the repository**
   ```bash
   git clone https://github.com/Tech-Inventers/smartBooking.git
   cd smartBooking
2. **Install Dependencies**
   ````bash
   npm install
3. **Configure Environment Variables - Create a .env file in the root directory and define**
   ```bash
   DB_HOST=your-db-host.supabase.com
   DB_PORT=6543
   DB_NAME=your-db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
4. **Launch the Server**
   ````bash
   npm start
5. **Run Tests**
   ````
   npm test

# 🧠 AI Assistant Logic
### The AI model powers the conversational understanding layer of the booking assistant. It interprets natural language from users and converts it into structured commands the backend can process.
### 🛠️ What It Does:
1. **✅ Understands free-form user messages like:**
- 🔹Can I book an appointment on Friday at 10?
- 🔹Please cancel my session next week?
- 🔹Show me my upcoming appointments?
2. **✅ Extracts relevant details such as:**
  - 🔹Dates and times
  - 🔹Provider email
  - 🔹Intent (e.g. booking, cancel, view)
3. **✅ Responds with a JSON payload containing a queryType and other data**
    ````bash
    {
        "queryType": "booking",
        "provider_email": "provider1@example.com",
        "date": "2025-07-25",
        "startTime": "10:00",
        "endTime": "10:30"
    }

### 🗂️ Supported Query Types
- **✅ The AI assistant supports five primary intents:**
- **✅ Each one is triggered by natural language and mapped to structured backend actions.**

1. **✅ Booking:** Schedule a new appointment
2. **✅ Availability:** Check open times for a provider
3. **✅ Cancel:** Cancel an existing booking
4. **✅ Reschedule:** Modify an existing appointment
5. **✅ View:** Show upcoming bookings

### ⚙️ What Happens in the Backend
1. **Once the AI assistant responds with a structured JSON like:**
     ````bash
        {
           "queryType": "booking",
           "provider_email": "provider1@example.com",
           "date": "2025-07-25",
           "startTime": "10:00",
           "endTime": "10:30"
        }
2. **The  controller receives this payload and takes over with business logic:**
   - ✅Finds the provider by their email and ensures they’re approved.
   - ✅Checks availability to confirm the time slot is open.
   - ✅Detects conflicts to prevent overlapping bookings.
   - ✅Creates the booking if everything checks out.
   - ✅Returns a friendly confirmation 

# 🔐 Authentication & Security
### This project implements robust authentication and access control features using industry-standard practices to ensure user safety and role integrity.
1. **✅ Registration & Role Approval**
   
   - New users register via /api/auth/register by providing an email and password.
   - All passwords are securely hashed using bcryptjs before being stored in the database.
   - The system supports pre-approved email-based role assignment:
     - Pre-approved emails (e.g., admin1@example.com, provider1@example.com) are automatically assigned admin or provider roles.
     - All other users are registered as user by default and require approval if elevated privileges are needed.
  - Admins are auto-approved, while providers must be manually approved by an admin after registration.


2. **✅ Login & JWT Authentication**
   - Users log in via /api/auth/login.
   - Credentials are validated securely by comparing the provided password with the hashed one in the DB.
   - A JSON Web Token (JWT) is issued upon successful login, embedding the user's id and role.
     - All other users are registered as user by default and require approval if elevated privileges are needed.
     - Tokens expire after 1 hour for enhanced security.
     - The token must be passed in the Authorization header for protected routes:
       ````bash
       Authorization: Bearer <token>

3. **✅ Middleware: Token & Role-Based Access**
   - Token Verification Middleware
     - Validates incoming JWT tokens using a secret key (JWT_SECRET).
     - If the token is missing or invalid, a 401 Unauthorized error is returned.
 
   - Role Authorization Middleware
     - Restricts access to specific routes based on user role (e.g., only admin can approve providers).
     - Returns 403 Forbidden if the user doesn't have the required role.

4. **✅ Password Security**
   - Passwords are hashed using bcrypt with a salt round of 10.
   - Password comparison is done using secure bcrypt methods (comparePassword()).
   - Passwords are never stored or returned in plaintext.
     
# 🧪 Test Suite Documentation

### ✅ Admin Registration Tests (`admin-register-approval.test.js`)
- **Auto-approve pre-approved admin email**: Should automatically approve admin registration for pre-approved emails. Expected: Status 201, role="admin", isApproved=true
- **Force user role for non-pre-approved emails**: Should ignore requested admin role and set role to "user" for non-pre-approved emails. Expected: Status 201, role="user", isApproved=false
- **Allow second admin registration**: Should successfully register a second admin. Expected: Status 201, role="admin"

### ✅ Availability Management Tests (`availability.test.js`)
- **Provider adds availability**: Should allow providers to add availability slots. Expected: Status 201, returns availability ID
- **Prevent overlapping availability**: Should reject overlapping availability slots. Expected: Status 400, error message about overlapping slots
- **User views availability**: Should allow users to view availability slots. Expected: Status 200, returns array of availability slots

### ✅ Booking System Tests (`booking.test.js`)
- **User books available slot**: Should allow users to book available time slots. Expected: Status 201, returns booking ID
- **Prevent double booking**: Should reject attempts to book already-booked slots. Expected: Status 400, error message about slot being booked
- **Retrieve user's bookings**: Should return a list of the user's bookings. Expected: Status 200, returns array of bookings

### ✅ Provider Registration Tests (`provider-register-approval.test.js`)
- **Register pre-approved provider (no auto-approval)**: Should register providers but not auto-approve them. Expected: Status 201, role="provider", isApproved=false
- **Admin approves provider**: Should allow admins to approve provider registrations. Expected: Status 200, isApproved=true
- **Non-admin cannot approve providers**: Should reject provider approval attempts by non-admins. Expected: Status 403

### ✅ NLP Chat Assistant Booking Tests (`smart-booking-chat.test.js`)
- **Process message and create booking**: Should parse chat message and create a booking. Expected: Status 201, returns confirmation and booking details

### ✅ User Login Tests (`user-login.test.js`)
- **Login existing user**: Should return a token for valid credentials. Expected: Status 200, includes token and user details (no password)
- **Reject incorrect password**: Should reject login with wrong password. Expected: Status 401, "Invalid credentials"
- **Reject non-existent email**: Should reject login for unregistered emails. Expected: Status 401, "Invalid credentials"
- **Reject login without password**: Should reject login attempts missing password. Expected: Status 400

### ✅ User Registration Tests (`user-register.test.js`)
- **Register new user**: Should create a user and return a token. Expected: Status 201, includes token and user details (no password)
- **Reject duplicate email**: Should reject registration with existing email. Expected: Status 400, "Email already exists"
- **Reject missing email**: Should reject registration without email. Expected: Status 400, "Email is required"
- **Reject missing password**: Should reject registration without password. Expected: Status 400, "Password is required"
- **Reject missing email and password**: Should reject registration with both fields missing. Expected: Status 400, "Email and password are required"


# 🧪 Postman Requests and Responses Collection
### A complete Postman Collection is provided to help you explore and test all the available API endpoints quickly and consistently.
**📂 What's Included?**
- ✅ Authentication  
- ✅ Booking & Availability
- ✅ NLP Chat Assistant (smart booking with AI)
- ✅ User Roles (Admin, Provider, User)
- ✅ Error handling & validations




