// =============================================================================================
// VEHICLES ROUTES
// =============================================================================================

/**
 * Routes for vehicle management and public browsing
 * 
 * Public routes (no auth required):
 * - GET / : Browse all available vehicles
 * - GET /:id : View vehicle details
 * 
 * Admin/Staff routes (requireAuth + requireRole):
 * - POST / : Create new vehicle
 * - PUT /:id : Update vehicle details
 * - DELETE /:id : Remove vehicle from catalog
 * 
 * Workflow:
 * 1. Public users browse GET / (list) or GET /:id (details) on VehicleCard, VehicleDetail
 * 2. Admin logs in → Dashboard → POST/PUT/DELETE to manage inventory
 */

const express = require("express");
const router = express.Router();
const vehicles = require("../controllers/vehicles.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// =============================================================================================
// PUBLIC ROUTES (No auth required)
// =============================================================================================

// =============================================================================================
// GET /api/vehicles
// =============================================================================================

/**
 * Get list of all vehicles available for rental
 * 
 * Query parameters: None (return all vehicles)
 * 
 * Response (200):
 * [
 *   {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "vehicle_id": "v001",
 *     "model": "Tesla Model 3",
 *     "licensePlate": "ABC-1234",
 *     "price_per_hour": 50000,
 *     "status": "available",
 *     "current_location": "Station A",
 *     "battery": 85,
 *     "odometer": 5000,
 *     "...other fields": "..."
 *   },
 *   ...more vehicles
 * ]
 * 
 * Use cases:
 * - Home page: Display vehicle grid/carousel (Home.jsx)
 * - VehicleDetail: Fetch single vehicle details
 * - Admin Dashboard: View inventory
 * 
 * Performance note: Returns ALL vehicles, consider pagination if >100 vehicles
 * Consider adding pagination: GET /api/vehicles?page=1&limit=20
 */
router.get("/", vehicles.getAll);

// =============================================================================================
// GET /api/vehicles/:id
// =============================================================================================

/**
 * Get details of a specific vehicle
 * 
 * Parameters:
 *   id: vehicle_id (e.g., "v001")
 * 
 * Response (200):
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "vehicle_id": "v001",
 *   "model": "Tesla Model 3",
 *   "licensePlate": "ABC-1234",
 *   "price_per_hour": 50000,
 *   "status": "available",
 *   "current_location": "Station A",
 *   "battery": 85,
 *   "odometer": 5000,
 *   "...other fields": "..."
 * }
 * 
 * Use cases:
 * - VehicleDetail page: Load full vehicle info for booking
 * - Before creating Reservation: Verify vehicle exists + get pricing
 * 
 * Error cases:
 * - 404: vehicle_id not found
 * - 500: Database error
 */
router.get("/:id", vehicles.getById);

// =============================================================================================
// PROTECTED ROUTES (Admin/Staff only)
// =============================================================================================

// =============================================================================================
// POST /api/vehicles
// =============================================================================================

/**
 * Create a new vehicle in the system
 * 
 * Authentication: Bearer JWT token
 * Authorization: role must be 'admin' or 'staff'
 * 
 * Request body:
 * {
 *   "model": "Tesla Model 3",
 *   "licensePlate": "ABC-1234",
 *   "price_per_hour": 50000,
 *   "status": "available",
 *   "current_location": "Station A",
 *   "battery": 85,
 *   "odometer": 5000,
 *   "image_url": "https://...",
 *   "...other fields": "..."
 * }
 * 
 * Response (201):
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "vehicle_id": "v001",  // Auto-generated if not provided
 *   "model": "Tesla Model 3",
 *   "licensePlate": "ABC-1234",
 *   "price_per_hour": 50000,
 *   "status": "available",
 *   "current_location": "Station A",
 *   "battery": 85,
 *   "odometer": 5000,
 *   "image_url": "https://...",
 *   "created_at": "2024-12-19T15:30:00Z"
 * }
 * 
 * Process:
 * 1. Verify JWT token (requireAuth)
 * 2. Check user role is admin or staff (requireRole)
 * 3. Count existing vehicles
 * 4. If vehicle_id not provided: auto-generate as "v001", "v002", etc
 * 5. Create Vehicle document in MongoDB
 * 6. Return 201 + created vehicle
 * 
 * Error cases:
 * - 401: Missing or invalid JWT token
 * - 403: User role not admin/staff
 * - 400: Invalid input data or duplicate vehicle_id
 */
router.post("/", requireAuth, requireRole("admin", "staff"), vehicles.create);

// =============================================================================================
// PUT /api/vehicles/:id
// =============================================================================================

/**
 * Update vehicle details
 * 
 * Parameters:
 *   id: vehicle_id (e.g., "v001")
 * 
 * Request body: Any/all fields to update
 * {
 *   "price_per_hour": 55000,
 *   "status": "maintenance",
 *   "battery": 45,
 *   "odometer": 5050,
 *   "...other fields": "..."
 * }
 * 
 * Response (200): Updated vehicle document
 * 
 * Use cases:
 * - Admin updates price/location
 * - Staff updates battery/odometer after rental
 * - Marking vehicle as unavailable during maintenance
 * 
 * Error cases:
 * - 401: Missing or invalid JWT token
 * - 403: User role not admin/staff
 * - 404: vehicle_id not found
 * - 400: Invalid update data
 */
router.put("/:id", requireAuth, requireRole("admin", "staff"), vehicles.update);

// =============================================================================================
// DELETE /api/vehicles/:id
// =============================================================================================

/**
 * Remove vehicle from system
 * 
 * Parameters:
 *   id: vehicle_id (e.g., "v001")
 * 
 * Response (200):
 * { "success": true }
 * 
 * Important: 
 * - Hard delete from DB (not soft delete)
 * - Consider checking for active rentals before allowing deletion
 * - If vehicle has rental history, maybe better to:
 *   a) Archive instead of delete
 *   b) Check if active rentals exist and prevent deletion
 * 
 * Use cases:
 * - Remove vehicle from inventory permanently
 * - Admin cleanup
 * 
 * Warning: This is destructive! Consider adding:
 * 1. Check: Are there active rentals using this vehicle?
 * 2. Soft delete: Set status="deleted" instead of hard delete
 * 
 * Error cases:
 * - 401: Missing or invalid JWT token
 * - 403: User role not admin/staff
 * - 404: vehicle_id not found
 * - 400: Database error
 */
router.delete("/:id", requireAuth, requireRole("admin", "staff"), vehicles.remove);

module.exports = router;
