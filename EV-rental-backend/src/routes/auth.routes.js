// =============================================================================================
// AUTHENTICATION ROUTES
// =============================================================================================

/**
 * Routes for user authentication and authorization
 * 
 * Public routes (no auth required):
 * - POST /register : Sign up new user account
 * - POST /login : Sign in existing user
 * - POST /logout : Sign out current user
 * 
 * Protected routes (requireAuth - JWT token required):
 * - GET /me : Get current user profile info
 * 
 * JWT Flow:
 * 1. POST /login: User provides email + password → Returns JWT token
 * 2. Client stores token (localStorage, sessionStorage, or memory)
 * 3. Client includes "Authorization: Bearer <token>" in requests
 * 4. Middleware auth.js validates token
 * 5. GET /me: Returns current user info based on token
 * 
 * Token structure:
 * {
 *   "user_id": "u001",
 *   "role": "renter",
 *   "email": "user@example.com",
 *   "iat": 1234567890,  // issued at
 *   "exp": 1234604090   // expires in 12 hours
 * }
 */

const express = require("express");
const router = express.Router();

// Controller & middleware
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

// =============================================================================================
// POST /api/auth/login
// =============================================================================================

/**
 * Authenticate user and return JWT token
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "MyPassword123"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "user_id": "u001",
 *     "email": "user@example.com",
 *     "role": "renter",
 *     "full_name": "John Doe"
 *   }
 * }
 * 
 * Process:
 * 1. Validate email + password provided
 * 2. Find user by email
 * 3. Compare provided password with stored passwordHash (bcrypt)
 * 4. If match: Generate JWT token (valid 12 hours)
 * 5. Return token + user info
 * 6. If no match: Return 401 Unauthorized
 * 
 * JWT token payload:
 * {
 *   "user_id": "u001",
 *   "role": "renter",
 *   "email": "user@example.com"
 * }
 * 
 * Token expiration: 12 hours (configurable in signAccess function)
 * After expiration, user must login again
 * 
 * Error responses:
 * - 400: Missing email or password
 * - 401: Invalid email/password combination
 * - 500: Server error
 * 
 * Used by:
 * - Frontend Login.jsx: POST /auth/login, store token
 * - api/fetchClient.jsx: Include token in "Authorization: Bearer" header
 */
router.post("/login", authController.login);

// =============================================================================================
// POST /api/auth/register
// =============================================================================================

/**
 * Create new user account
 * 
 * Request body:
 * {
 *   "email": "newuser@example.com",
 *   "password": "MyPassword123",
 *   "full_name": "John Doe",
 *   "role": "renter"  // optional, defaults to "renter"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "user": {
 *     "user_id": "u001",
 *     "email": "newuser@example.com",
 *     "role": "renter",
 *     "full_name": "John Doe"
 *   }
 * }
 * 
 * Process:
 * 1. Validate email + password provided
 * 2. Check if email already exists
 *    - If yes: Return 409 Conflict
 * 3. Hash password using bcrypt (10 rounds)
 * 4. Generate user_id: "u001", "u002", etc
 * 5. Create User document with:
 *    - user_id (auto-generated)
 *    - email
 *    - passwordHash (bcrypted)
 *    - role (defaults to "renter" if not provided)
 *    - full_name (defaults to email if not provided)
 *    - is_active: true
 *    - created_at, updated_at
 * 6. Return 200 + user info (NOT token, user must login after)
 * 
 * Password hashing:
 * - Uses bcryptjs with 10 salt rounds
 * - Plain text password never stored
 * - Takes ~100ms to hash (intentional security measure)
 * 
 * User roles:
 * - "renter": Regular customer who rents vehicles
 * - "staff": Employee who does checkout/checkin
 * - "admin": System administrator
 * 
 * Error responses:
 * - 400: Missing email or password
 * - 409: Email already registered
 * - 500: Server error
 * 
 * Note: Most production systems disable self-registration
 * Consider removing this endpoint or restricting to admin only
 */
router.post("/register", authController.register);

// =============================================================================================
// GET /api/auth/me
// =============================================================================================

/**
 * Get current authenticated user's profile
 * 
 * Authentication: Required
 *   Header: "Authorization: Bearer <JWT_TOKEN>"
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "user": {
 *     "user_id": "u001",
 *     "email": "user@example.com",
 *     "role": "renter",
 *     "full_name": "John Doe",
 *     "is_active": true
 *   }
 * }
 * 
 * Process:
 * 1. authMiddleware verifies JWT token
 *    - Extracts user_id from token payload
 *    - Sets req.user = { user_id, role, email, ... }
 * 2. Check if req.user exists (should always be true after middleware)
 * 3. Fetch full User document from DB by user_id
 * 4. Return user info (safe public fields only)
 * 
 * Used by:
 * - Frontend Profile.jsx: Load user info on app startup
 * - Profile.jsx: Verify user is logged in + display name/email
 * - Navbar.jsx: Show logged-in user name
 * - Protected routes: Verify user is authenticated
 * 
 * Response includes:
 * - user_id: Unique identifier
 * - email: Email address
 * - role: User role (renter/staff/admin)
 * - full_name: Display name
 * - is_active: Account status
 * 
 * Error responses:
 * - 401: Missing or invalid JWT token (checked by middleware)
 * - 404: User not found (token references deleted user)
 * - 500: Server error
 * 
 * Important: Returns safe fields only
 * - Includes: user_id, email, role, full_name, is_active
 * - Excludes: passwordHash, payment info, etc
 */
router.get("/me", authMiddleware, authController.me);

// =============================================================================================
// POST /api/auth/logout
// =============================================================================================

/**
 * Sign out current user
 * 
 * Request body: {} (empty)
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Đã đăng xuất"
 * }
 * 
 * Process:
 * - Since using JWT (stateless), backend doesn't maintain session
 * - Just returns success message
 * - Client responsible for deleting token from local storage
 * 
 * JWT-based logout:
 * 1. Client deletes token from localStorage/sessionStorage
 * 2. Frontend redirects to login page
 * 3. Subsequent requests without Authorization header go to login
 * 
 * Alternative approaches (not implemented):
 * - Token blacklist: Keep list of revoked tokens (requires storage)
 * - Short expiry: Tokens expire quickly, requires periodic refresh
 * - Logout endpoint: Could invalidate token server-side (stateful)
 * 
 * Used by:
 * - Navbar.jsx: Logout button
 * - Profile.jsx: Logout action
 * 
 * Note: This endpoint doesn't enforce logout on server
 * A malicious user can still use old token until expiration (12 hours)
 * To fix: Implement token blacklist or use refresh tokens
 */
router.post("/logout", authController.logout);

module.exports = router;
