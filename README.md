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
# Test Suite Documentation

### Admin Registration Tests (`admin-register-approval.test.js`)
- **Auto-approve pre-approved admin email**: Should automatically approve admin registration for pre-approved emails. Expected: Status 201, role="admin", isApproved=true
- **Force user role for non-pre-approved emails**: Should ignore requested admin role and set role to "user" for non-pre-approved emails. Expected: Status 201, role="user", isApproved=false
- **Allow second admin registration**: Should successfully register a second admin. Expected: Status 201, role="admin"

### Availability Management Tests (`availability.test.js`)
- **Provider adds availability**: Should allow providers to add availability slots. Expected: Status 201, returns availability ID
- **Prevent overlapping availability**: Should reject overlapping availability slots. Expected: Status 400, error message about overlapping slots
- **User views availability**: Should allow users to view availability slots. Expected: Status 200, returns array of availability slots

### Booking System Tests (`booking.test.js`)
- **User books available slot**: Should allow users to book available time slots. Expected: Status 201, returns booking ID
- **Prevent double booking**: Should reject attempts to book already-booked slots. Expected: Status 400, error message about slot being booked
- **Retrieve user's bookings**: Should return a list of the user's bookings. Expected: Status 200, returns array of bookings

### Provider Registration Tests (`provider-register-approval.test.js`)
- **Register pre-approved provider (no auto-approval)**: Should register providers but not auto-approve them. Expected: Status 201, role="provider", isApproved=false
- **Admin approves provider**: Should allow admins to approve provider registrations. Expected: Status 200, isApproved=true
- **Non-admin cannot approve providers**: Should reject provider approval attempts by non-admins. Expected: Status 403

### NLP Chat Assistant Booking Tests (`smart-booking-chat.test.js`)
- **Process message and create booking**: Should parse chat message and create a booking. Expected: Status 201, returns confirmation and booking details

### User Login Tests (`user-login.test.js`)
- **Login existing user**: Should return a token for valid credentials. Expected: Status 200, includes token and user details (no password)
- **Reject incorrect password**: Should reject login with wrong password. Expected: Status 401, "Invalid credentials"
- **Reject non-existent email**: Should reject login for unregistered emails. Expected: Status 401, "Invalid credentials"
- **Reject login without password**: Should reject login attempts missing password. Expected: Status 400

### User Registration Tests (`user-register.test.js`)
- **Register new user**: Should create a user and return a token. Expected: Status 201, includes token and user details (no password)
- **Reject duplicate email**: Should reject registration with existing email. Expected: Status 400, "Email already exists"
- **Reject missing email**: Should reject registration without email. Expected: Status 400, "Email is required"
- **Reject missing password**: Should reject registration without password. Expected: Status 400, "Password is required"
- **Reject missing email and password**: Should reject registration with both fields missing. Expected: Status 400, "Email and password are required"
