// src/models/vehicles.model.js
module.exports = [
  {
    vehicle_id: "v001",
    station_id: "st_1",
    plate_no: "59A-123.45",
    model: "Evo 200 Lite",
    type: "Evo",
    status: "Available",
    battery_percent: 85,
    odometer: 1250,
    // NEW:
    price_per_hour: 20000,
    currency: "VND",
    billing_unit: "hour",
  },
  {
    vehicle_id: "v002",
    station_id: "st_1",
    plate_no: "59B-678.90",
    model: "Klara S2",
    type: "Klara",
    status: "Rented",
    battery_percent: 10,
    odometer: 500,
    price_per_hour: 20000,
    currency: "VND",
    billing_unit: "hour",
  },
  {
    vehicle_id: "v003",
    station_id: "st_2",
    plate_no: "59C-000.11",
    model: "Vento Neo",
    type: "Vento",
    status: "Maintenance",
    battery_percent: 50,
    odometer: 3000,
    price_per_hour: 20000,
    currency: "VND",
    billing_unit: "hour",
  }
];
