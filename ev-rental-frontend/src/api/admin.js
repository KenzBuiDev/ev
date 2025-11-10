import api from './fetchClient'


// Vehicles
export async function getAllVehicles() { return api.request('/vehicles') }
export async function createVehicle(payload) { return api.request('/vehicles', { method: 'POST', body: JSON.stringify(payload) }) }
export async function updateVehicle(id, payload) { return api.request(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export async function deleteVehicle(id) { return api.request(`/vehicles/${id}`, { method: 'DELETE' }) }


// Rentals
export async function getAllRentals() { return api.request('/rentals') }
export async function updateRental(id, payload) { return api.request(`/rentals/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export async function deleteRental(id) { return api.request(`/rentals/${id}`, { method: 'DELETE' }) }


// Damage reports
export async function getAllReports() { return api.request('/damage-reports') }
export async function updateReport(id, payload) { return api.request(`/damage-reports/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export async function deleteReport(id) { return api.request(`/damage-reports/${id}`, { method: 'DELETE' }) }