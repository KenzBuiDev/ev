const reservations = require("../models/reservations.model");
const { generateId } = require("../utils/generateId");
const { ok, created, err } = require("../utils/response");
const { quoteByTimeRange } = require("../utils/billing");
const vehicles = require("../models/vehicles.model");

/**
 * GET /api/reservations
 * Query hỗ trợ (tùy chọn): renter_id, vehicle_id, status
 * Thêm: _stationScoped (nội bộ, do middleware gắn cho staff)
 */
exports.list = (req, res) => {
  try {
    const { renter_id, vehicle_id, status, _stationScoped } = req.query || {};
    let data = [...reservations];

    if (renter_id) data = data.filter(x => x.renter_id === renter_id);
    if (vehicle_id) data = data.filter(x => x.vehicle_id === vehicle_id);
    if (status) data = data.filter(x => x.status === status);

    // Nếu có _stationScoped (staff) → chỉ giữ reservation có vehicle thuộc station này
    if (_stationScoped) {
      const stationId = _stationScoped;
      // map nhanh vehicle_id -> station_id để lọc
      const vehicleStationMap = new Map(vehicles.map(v => [v.vehicle_id, v.station_id]));
      data = data.filter(r => vehicleStationMap.get(r.vehicle_id) === stationId);
    }

    ok(res, data);
  } catch (e) {
    console.error(e);
    err(res);
  }
};

/**
 * GET /api/reservations/:id
 * Quyền xem chi tiết đã xử lý ở routes (canViewReservation)
 */
exports.getById = (req, res) => {
  try {
    const item = reservations.find(x => x.reservation_id === req.params.id);
    if (!item) return err(res, 404, "Reservation not found");
    ok(res, item);
  } catch (e) {
    console.error(e);
    err(res);
  }
};

/**
 * POST /api/reservations
 * Body: renter_id, vehicle_id, start_time, end_time
 * – renter_id đã được ép self ở routes nếu caller là renter
 */
exports.create = (req, res) => {
  try {
    const { renter_id, vehicle_id, start_time, end_time, created_by_staff } = req.body || {};
    if (!renter_id || !vehicle_id || !start_time || !end_time)
      return err(res, 400, "renter_id, vehicle_id, start_time, end_time are required");

    const q = quoteByTimeRange({ vehicle_id, start_time, end_time });

    const reservation_id = generateId("rsv");
    const item = {
      reservation_id,
      renter_id,
      vehicle_id,
      start_time,
      end_time,
      status: "PendingPayment",
      hold_deposit: null,
      created_by_staff: created_by_staff || null,
      estimated_amount: `${q.amount} ${q.currency}`,
      currency: q.currency,
      hours: q.hours
    };
    reservations.push(item);
    created(res, item);
  } catch (e) {
    console.error(e);
    err(res);
  }
};

/**
 * PATCH /api/reservations/:id
 * (admin/renter owner)
 */
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const item = reservations.find(x => x.reservation_id === id);
    if (!item) return err(res, 404, "Reservation not found");

    const prev = { ...item };

    if (req.body.start_time != null) item.start_time = req.body.start_time;
    if (req.body.end_time   != null) item.end_time   = req.body.end_time;
    if (req.body.vehicle_id != null) item.vehicle_id = req.body.vehicle_id;
    if (req.body.hold_deposit != null) item.hold_deposit = req.body.hold_deposit;

    // Nếu thay đổi khoảng thời gian hoặc vehicle → tính lại báo giá
    if (
      item.start_time !== prev.start_time ||
      item.end_time   !== prev.end_time   ||
      item.vehicle_id !== prev.vehicle_id
    ) {
      const q = quoteByTimeRange({
        vehicle_id: item.vehicle_id,
        start_time: item.start_time,
        end_time:   item.end_time
      });
      item.estimated_amount = `${q.amount} ${q.currency}`;
      item.currency = q.currency;
      item.hours = q.hours;
      if (item.status === "Confirmed") item.status = "PendingPayment";
    }

    ok(res, item);
  } catch (e) {
    console.error(e);
    err(res);
  }
};

/**
 * PATCH /api/reservations/:id/status
 * (admin/renter owner)
 */
exports.updateStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const item = reservations.find(x => x.reservation_id === id);
    if (!item) return err(res, 404, "Reservation not found");
    if (!status) return err(res, 400, "status is required");

    item.status = status;
    ok(res, item);
  } catch (e) {
    console.error(e);
    err(res);
  }
};

/**
 * DELETE /api/reservations/:id
 * (admin)
 */
exports.remove = (req, res) => {
  try {
    const idx = reservations.findIndex(x => x.reservation_id === req.params.id);
    if (idx === -1) return err(res, 404, "Reservation not found");
    const deleted = reservations.splice(idx, 1)[0];
    ok(res, deleted);
  } catch (e) {
    console.error(e);
    err(res);
  }
};
