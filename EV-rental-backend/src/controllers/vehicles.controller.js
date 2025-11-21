// =============================================================================================
// VEHICLES CONTROLLER
// =============================================================================================

/**
 * Handles all vehicle management operations:
 * - List vehicles (public browse)
 * - Get vehicle details (public)
 * - Create vehicle (admin/staff only)
 * - Update vehicle (admin/staff only)
 * - Delete vehicle (admin/staff only)
 */

const Vehicle = require("../models/Vehicle");

// =============================================================================================
// GET /api/vehicles (List all vehicles)
// =============================================================================================

/**
 * Retrieve all vehicles in the system
 * 
 * Process:
 * 1. Query Vehicle collection with no filter (all documents)
 * 2. Use .lean() for performance (returns plain objects, not Mongoose documents)
 * 3. Return array of vehicles to client
 * 
 * Output format:
 * [
 *   {
 *     "vehicle_id": "v001",
 *     "model": "Tesla Model 3",
 *     "price_per_hour": 50000,
 *     "status": "available",
 *     "...other_fields": "..."
 *   },
 *   ...more vehicles
 * ]
 * 
 * Performance consideration:
 * - Returns ALL vehicles at once
 * - For 100+ vehicles, should add pagination: .skip().limit()
 * - Could add filtering: status="available", location=...
 * 
 * Used by:
 * - Home.jsx: Display vehicle grid
 * - VehicleCard: List browsing
 * - Admin Dashboard: Inventory overview
 * 
 * Error handling:
 * - 500: Database connection error
 */
exports.getAll = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().lean();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================================================
// GET /api/vehicles/:id (Get single vehicle details)
// =============================================================================================

/**
 * Retrieve details for a specific vehicle
 * 
 * Parameters:
 *   req.params.id: vehicle_id (e.g., "v001")
 * 
 * Process:
 * 1. Query by vehicle_id (not by _id)
 *    - vehicle_id is custom field: "v001", "v002", etc
 *    - _id is MongoDB auto-generated field (UUID)
 * 2. Use .lean() for performance
 * 3. Check if vehicle found
 * 4. Return 404 if not found
 * 5. Return 200 + vehicle object if found
 * 
 * Output format:
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
 *   "image_url": "https://...",
 *   "description": "...",
 *   "capacity": 5,
 *   "created_at": "2024-12-10T10:00:00Z"
 * }
 * 
 * Used by:
 * - VehicleDetail.jsx: Display vehicle info before booking
 * - Checkout.jsx: Verify vehicle still available
 * - Billing calculation: Get price_per_hour rate
 * 
 * Error handling:
 * - 404: vehicle_id not found
 * - 500: Database error
 */
exports.getById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      vehicle_id: req.params.id,
    }).lean();
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================================================
// POST /api/vehicles (Create new vehicle)
// =============================================================================================

/**
 * Create a new vehicle in the system
 * 
 * Authentication: requireAuth + requireRole("admin", "staff")
 * 
 * Process:
 * 1. Extract request body (all vehicle fields)
 * 2. Count existing vehicles in DB
 * 3. If vehicle_id not provided in request:
 *    - Auto-generate as "v" + (count+1) padded to 3 digits
 *    - Examples: "v001" (1st vehicle), "v002", "v010", "v100"
 * 4. Create Vehicle document with all provided fields + auto-generated vehicle_id
 * 5. Return 201 Created + new vehicle object
 * 
 * Input example:
 * {
 *   "model": "Tesla Model 3",
 *   "licensePlate": "ABC-1234",
 *   "price_per_hour": 50000,
 *   "status": "available",
 *   "current_location": "Station A",
 *   "battery": 85,
 *   "odometer": 5000,
 *   "image_url": "https://...",
 *   "capacity": 5,
 *   "description": "White sedan, good condition"
 * }
 * 
 * Output (201):
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "vehicle_id": "v001",  // Auto-generated
 *   "model": "Tesla Model 3",
 *   "licensePlate": "ABC-1234",
 *   "price_per_hour": 50000,
 *   "status": "available",
 *   "current_location": "Station A",
 *   "battery": 85,
 *   "odometer": 5000,
 *   "image_url": "https://...",
 *   "capacity": 5,
 *   "description": "White sedan, good condition",
 *   "created_at": "2024-12-19T15:30:00Z"
 * }
 * 
 * Key features:
 * - Auto-generates sequential vehicle_id if not provided
 * - Allows admin to specify custom vehicle_id if needed
 * - Returns 201 status code (resource created)
 * 
 * Error handling:
 * - 401: Missing JWT token
 * - 403: User role not admin/staff
 * - 400: Invalid input or duplicate vehicle_id
 */
exports.create = async (req, res) => {
  try {
    // Step 1: Extract request body
    const data = req.body;

    // Step 2: Count existing vehicles to generate next vehicle_id
    const count = await Vehicle.countDocuments();

    // Step 3: Auto-generate vehicle_id if not provided
    // Format: "v001", "v002", ..., "v099", "v100"
    data.vehicle_id =
      data.vehicle_id || `v${(count + 1).toString().padStart(3, "0")}`;

    // Step 4: Create Vehicle document in MongoDB
    const doc = await Vehicle.create(data);

    // Step 5: Return 201 + created vehicle
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =============================================================================================
// PUT /api/vehicles/:id (Update vehicle)
// =============================================================================================

/**
 * Update vehicle details (full or partial)
 * 
 * Parameters:
 *   req.params.id: vehicle_id (e.g., "v001")
 * 
 * Authentication: requireAuth + requireRole("admin", "staff")
 * 
 * Process:
 * 1. Find vehicle by vehicle_id
 * 2. Update with fields from request body (partial update ok)
 * 3. Return { new: true } to get updated document
 * 4. Check if vehicle found before returning
 * 5. Return 200 + updated vehicle, or 404 if not found
 * 
 * Input example (partial update):
 * {
 *   "price_per_hour": 55000,    // Change price
 *   "battery": 45,              // Update battery level
 *   "current_location": "Station B",  // Change location
 *   "status": "maintenance"     // Mark unavailable
 * }
 * 
 * Output (200):
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "vehicle_id": "v001",
 *   "model": "Tesla Model 3",
 *   "price_per_hour": 55000,    // Updated
 *   "battery": 45,              // Updated
 *   "current_location": "Station B",  // Updated
 *   "status": "maintenance",    // Updated
 *   "...other_fields": "...unchanged..."
 * }
 * 
 * Common use cases:
 * - Admin changes price: { "price_per_hour": 55000 }
 * - Staff updates after rental: { "battery": 20, "odometer": 5100 }
 * - Mark maintenance: { "status": "maintenance" }
 * - Move vehicle: { "current_location": "Station C" }
 * 
 * MongoDB behavior:
 * - Only provided fields are updated (no need to send all fields)
 * - Omitted fields are unchanged
 * - findOneAndUpdate with { new: true } returns updated doc
 * 
 * Error handling:
 * - 401: Missing JWT token
 * - 403: User role not admin/staff
 * - 404: vehicle_id not found
 * - 400: Invalid update data
 */
exports.update = async (req, res) => {
  try {
    // Step 1: Find by vehicle_id and update with new values
    const doc = await Vehicle.findOneAndUpdate(
      { vehicle_id: req.params.id },
      req.body,
      { new: true }  // Return updated document
    );

    // Step 2: Check if vehicle found
    if (!doc) return res.status(404).json({ message: "Vehicle not found" });

    // Step 3: Return updated vehicle
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =============================================================================================
// DELETE /api/vehicles/:id (Delete vehicle)
// =============================================================================================

/**
 * Remove vehicle from system
 * 
 * Parameters:
 *   req.params.id: vehicle_id (e.g., "v001")
 * 
 * Authentication: requireAuth + requireRole("admin", "staff")
 * 
 * Process:
 * 1. Find vehicle by vehicle_id
 * 2. Perform hard delete (completely remove from DB)
 * 3. Check if vehicle found before returning
 * 4. Return 200 + success message, or 404 if not found
 * 
 * Output (200):
 * { "success": true }
 * 
 * ⚠️ WARNING: Hard delete!
 * This permanently removes vehicle from database. Consider:
 * 
 * IMPROVEMENTS NEEDED:
 * 1. Check for active rentals first:
 *    - Query Rental collection: { vehicle_id: req.params.id, status: "active" }
 *    - If found, return 400 error: "Cannot delete vehicle with active rentals"
 * 
 * 2. Use soft delete instead:
 *    - Set status="deleted" instead of hard delete
 *    - Keep history for audit trail
 *    - Filter out deleted vehicles in GET routes
 * 
 * 3. Archive approach:
 *    - Move to Archive collection
 *    - Preserve rental history
 * 
 * Current implementation:
 * - Just deletes vehicle completely
 * - Rental records may reference deleted vehicle_id (orphaned)
 * - Can cause consistency issues
 * 
 * Error handling:
 * - 401: Missing JWT token
 * - 403: User role not admin/staff
 * - 404: vehicle_id not found
 * - 400: Database error
 */
exports.remove = async (req, res) => {
  try {
    // Step 1: Find and hard delete vehicle
    const doc = await Vehicle.findOneAndDelete({ vehicle_id: req.params.id });

    // Step 2: Check if vehicle found
    if (!doc) return res.status(404).json({ message: "Vehicle not found" });

    // Step 3: Return success
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
