// =============================================================================================
// AUTHENTICATION CONTROLLER
// =============================================================================================

/**
 * Handles user authentication operations:
 * - register: Create new user account
 * - login: Authenticate and return JWT token
 * - me: Get current user profile (protected)
 * - logout: Sign out user (token cleanup on client)
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// =============================================================================================
// HELPER: signAccess()
// =============================================================================================

/**
 * Generate JWT access token for a user
 * 
 * Parameters:
 *   user: User object with user_id, role, email properties
 * 
 * Returns:
 *   String: Signed JWT token
 * 
 * Token payload:
 * {
 *   "user_id": "u001",
 *   "role": "renter",
 *   "email": "user@example.com",
 *   "iat": 1702994400,     // issued at (Unix timestamp)
 *   "exp": 1703031200      // expires at (Unix timestamp, +12 hours)
 * }
 * 
 * Token lifetime:
 * - Valid for 12 hours from issue time
 * - After expiry, user must login again
 * - Client stores token and includes in Authorization header
 * 
 * Security notes:
 * - JWT_SECRET from environment variable (never hardcode)
 * - Fallback to "devsecret" only for development
 * - Must be strong secret in production
 * - Signing algorithm: HS256 (HMAC SHA-256)
 * 
 * Used by:
 * - login(): Generate token after password verification
 * - Used in: POST /api/auth/login response
 */
function signAccess(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

// =============================================================================================
// POST /api/auth/register (Create new user account)
// =============================================================================================

/**
 * Register a new user account
 * 
 * Input: req.body
 * {
 *   "email": "newuser@example.com",  // required
 *   "password": "MyPassword123",      // required
 *   "full_name": "John Doe",          // optional, defaults to email
 *   "role": "renter"                  // optional, defaults to "renter"
 * }
 * 
 * Process:
 * 1. Validate input: email + password required
 * 2. Check if email already exists
 *    → If yes: Return 409 Conflict "Email đã được đăng ký"
 * 3. Hash password using bcrypt (10 salt rounds)
 *    - Takes ~100ms (intentional slowdown for security)
 *    - Prevents rainbow table attacks
 *    - Plain text password never stored in DB
 * 4. Generate user_id:
 *    - Count existing users in DB
 *    - Format: "u001", "u002", "u100", etc
 * 5. Create User document with:
 *    - user_id: Auto-generated
 *    - email: From request
 *    - passwordHash: Bcrypted password
 *    - role: From request or default "renter"
 *    - full_name: From request or fallback to email
 *    - is_active: true
 *    - created_at, updated_at: Current timestamp
 * 6. Return 200 + user info (NOT token)
 * 
 * Output (200):
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
 * Password requirements (could be enforced):
 * - Minimum length: 8 characters
 * - Mix of uppercase, lowercase, numbers, special chars
 * - Not in common password list
 * Currently: NO validation (should add in production)
 * 
 * User roles:
 * - "renter": Regular customer (default)
 * - "staff": Employee (checkout/checkin)
 * - "admin": System administrator
 * 
 * Error responses:
 * - 400: Email or password missing
 * - 409: Email already registered
 * - 500: Database or bcrypt error
 * 
 * Production considerations:
 * - Email verification: Send confirmation email before activation
 * - Rate limiting: Max 5 registrations per IP per hour
 * - CAPTCHA: Prevent automated account creation
 * - Password policy: Enforce strong passwords
 * - Audit log: Track account creation
 */
exports.register = async (req, res) => {
  try {
    // Step 1: Extract and validate input
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc" });
    }

    // Validate email format: must be @gmail.com
    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ success: false, message: "Email phải có dạng @gmail.com" });
    }

    // Validate phone if provided: must be exactly 10 digits
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, ""); // Remove non-digits
      if (phoneDigits.length !== 10) {
        return res
          .status(400)
          .json({ success: false, message: "Số điện thoại phải có đúng 10 chữ số" });
      }
    }

    // Step 2: Check if email already registered
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Email đã được đăng ký" });
    }

    // Step 3: Check if phone already registered (if provided)
    if (phone) {
      const phoneExists = await User.findOne({ phone }).lean();
      if (phoneExists) {
        return res
          .status(409)
          .json({ success: false, message: "Số điện thoại đã được đăng ký" });
      }
    }

    // Step 4: Hash password using bcrypt
    // bcrypt.hash(password, saltRounds):
    // - saltRounds = 10: 2^10 iterations (~100ms on modern CPU)
    // - Higher = more secure but slower
    // - 10 is good balance for security vs speed
    const passwordHash = await bcrypt.hash(password, 10);

    // Step 5: Generate user_id
    const userCount = await User.countDocuments();
    const user_id = `u${String(userCount + 1).padStart(3, "0")}`;

    // Step 6: Create User document
    const user = await User.create({
      user_id,
      full_name: full_name || email, // Use email as fallback display name
      email,
      phone: phone || null,
      role: role || "renter",         // Default to "renter" if not specified
      passwordHash,                   // Store hashed password
      is_active: true,                // Activated immediately (no email verification)
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Step 7: Return user info (no token, user must login to get token)
    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("[auth.register] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal error", error: err.message });
  }
};

// =============================================================================================
// POST /api/auth/login (Authenticate and return JWT token)
// =============================================================================================

/**
 * Authenticate user with email + password
 * 
 * Input: req.body
 * {
 *   "email": "user@example.com",  // required
 *   "password": "MyPassword123"    // required
 * }
 * 
 * Process:
 * 1. Validate input: email + password required
 * 2. Find user by email in database
 *    → If not found: Return 401 "Sai email hoặc mật khẩu"
 * 3. Compare provided password with stored passwordHash
 *    - Try bcrypt.compare() if passwordHash exists
 *    - Fallback to plain text comparison (for legacy data)
 *    → If no match: Return 401 "Sai email hoặc mật khẩu"
 * 4. If password matches:
 *    - Generate JWT token using signAccess()
 *    - Return 200 + token + user info
 * 5. Client stores token (localStorage) and includes in Authorization header
 * 
 * Output (200):
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidTAwMSIsInJvbGUiOiJyZW50ZXIiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDI5OTQ0MDAsImV4cCI6MTcwMzAzMTIwMH0.abcdef1234567890",
 *   "user": {
 *     "user_id": "u001",
 *     "email": "user@example.com",
 *     "role": "renter",
 *     "full_name": "John Doe"
 *   }
 * }
 * 
 * JWT Token usage:
 * - Client stores: localStorage.setItem("token", response.token)
 * - Client includes: Authorization: Bearer eyJhbGci...
 * - Middleware verifies: auth.js decodes token, sets req.user
 * - Valid for 12 hours, then user must login again
 * 
 * Password comparison logic:
 * - Primary: bcrypt.compare(password, user.passwordHash)
 *   - Secure, constant-time comparison
 *   - Takes ~100ms due to bcrypt's intentional slowdown
 * - Fallback: password === user.password
 *   - For legacy plain text passwords (should be migrated!)
 *   - Insecure, only for backward compatibility
 * 
 * Error responses:
 * - 400: Email or password missing
 * - 401: Email not found or password incorrect
 * - 500: Server error
 * 
 * Security notes:
 * - Always return same error message (don't reveal if email exists)
 * - Log failed login attempts (consider rate limiting)
 * - Could implement: Account lockout after N failed attempts
 * - Could implement: 2FA (two-factor authentication)
 * - Could implement: IP-based blacklist
 */
exports.login = async (req, res) => {
  try {
    // Step 1: Extract and validate input
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc" });
    }

    // Step 2: Find user by email
    const user = await User.findOne({ email }).lean();
    if (!user) {
      // Don't reveal that email doesn't exist (security best practice)
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });
    }

    // Step 3: Compare password
    // Support both new (bcrypt) and old (plain text) password formats
    let ok = false;
    if (user.passwordHash) {
      // bcrypt.compare(plainText, hash):
      // - Takes ~100ms (constant-time comparison)
      // - Returns true if password matches hash
      // - Protects against timing attacks
      ok = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password) {
      // Fallback for legacy plain text passwords
      // TODO: Migrate all users to bcrypt hashes and remove this
      ok = password === user.password;
    }

    if (!ok) {
      // Don't reveal if password is wrong (generic error message)
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });
    }

    // Step 4: Generate JWT token
    const token = signAccess(user);

    // Step 5: Return success with token
    return res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("[auth.login] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal error", error: err.message });
  }
};

// =============================================================================================
// GET /api/auth/me (Get current authenticated user)
// =============================================================================================

/**
 * Get current user's profile information
 * 
 * Authentication: Required (Bearer JWT token)
 * 
 * Process:
 * 1. authMiddleware (from auth.js) verifies JWT token:
 *    - Checks Authorization header: "Bearer <token>"
 *    - Decodes token using JWT_SECRET
 *    - Extracts user_id from token payload
 *    - Sets req.user = { user_id, role, email, ... }
 *    - Returns 401 if token invalid/expired
 * 2. If middleware passes, req.user is guaranteed to exist
 * 3. Fetch full User document from DB by user_id
 *    - MongoDB query: { user_id: req.user.user_id }
 *    - Use .lean() for performance (plain object, not Document)
 * 4. Check if user found (should always be true)
 *    - If not: User was deleted but token still valid → 404
 * 5. Return user info (safe fields only)
 * 
 * Output (200):
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
 * Security - Safe fields returned:
 * - user_id: Unique identifier
 * - email: Email address
 * - role: User role (used for authorization checks)
 * - full_name: Display name
 * - is_active: Account status
 * 
 * Security - Fields NOT returned:
 * - passwordHash: Never exposed to client
 * - payment info: Sensitive data
 * - internal IDs: MongoDB _id not returned
 * 
 * Used by:
 * - Profile.jsx: Load on app startup to verify login
 * - Navbar.jsx: Show logged-in user's name
 * - App.jsx: Check user role for conditional rendering
 * - ProtectedRoute.jsx: Verify user authenticated
 * 
 * Error responses:
 * - 401: Missing or invalid JWT token (auth middleware)
 * - 404: User not found (deleted after login)
 * - 500: Server error
 * 
 * Token verification flow:
 * 1. Client sends: Authorization: Bearer eyJhbGci...
 * 2. Middleware: jwt.verify(token, JWT_SECRET)
 * 3. Middleware: Sets req.user = decoded payload
 * 4. Controller: Uses req.user.user_id to fetch from DB
 * 5. Controller: Returns safe user fields
 * 
 * Middleware location: middleware/auth.js
 * Check auth.js for token verification logic and error handling
 */
exports.me = async (req, res) => {
  try {
    // Step 1: Verify req.user was set by auth middleware
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // Step 2: Fetch full User document from DB
    const user = await User.findOne({ user_id: req.user.user_id }).lean();

    // Step 3: Check if user found
    if (!user) {
      // Token references deleted user
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Step 4: Return user info (safe fields only)
    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error("[auth.me] error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal error", error: err.message });
  }
};

// =============================================================================================
// POST /api/auth/logout (Sign out user)
// =============================================================================================

/**
 * Sign out current user
 * 
 * Process:
 * - Since using JWT (stateless), backend doesn't maintain sessions
 * - Just validates request and returns success
 * - Client is responsible for token cleanup
 * 
 * JWT logout workflow:
 * 1. Client calls POST /api/auth/logout
 * 2. Backend returns 200 success (no server-side state to clear)
 * 3. Client deletes token from localStorage/sessionStorage
 * 4. Client redirects to login page
 * 5. Subsequent requests without token go to login
 * 
 * Why no server-side logout?
 * - JWT is stateless (no session stored on server)
 * - Token valid until expiration (12 hours)
 * - Can't revoke token without additional infrastructure
 * 
 * Security implications:
 * - If token stolen, attacker can use until expiration
 * - No server-side way to invalidate token immediately
 * - Browser refresh/close doesn't affect token validity
 * 
 * Production improvements:
 * 1. Token blacklist:
 *    - Maintain list of revoked tokens in Redis/DB
 *    - Check blacklist on every authenticated request
 *    - Logout adds token to blacklist
 *    - Memory/performance overhead
 * 
 * 2. Refresh token + short expiry:
 *    - Access token: Valid 15 minutes (short expiry)
 *    - Refresh token: Valid 7 days (stored in DB)
 *    - Client uses refresh token to get new access token
 *    - Logout invalidates refresh token
 *    - More complex but better security
 * 
 * 3. Server sessions:
 *    - Store session ID in DB
 *    - Logout removes session
 *    - Less RESTful, more stateful
 * 
 * Current implementation (token expiry only):
 * - Simple but less secure
 * - Suitable for development
 * - Should upgrade for production
 * 
 * Output (200):
 * {
 *   "success": true,
 *   "message": "Đã đăng xuất"
 * }
 * 
 * Used by:
 * - Navbar.jsx: Logout button click
 * - Profile.jsx: Logout action
 */
exports.logout = (req, res) => {
  // No database operation needed (JWT is stateless)
  // Client handles token deletion from localStorage
  return res.json({ success: true, message: "Đã đăng xuất" });
};
