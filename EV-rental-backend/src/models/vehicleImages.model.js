// src/data/vehicleImages.js

// Có thể có nhiều ảnh cho 1 vehicle_id.
// url trỏ về ảnh trong FE: public/vehicles/*.jpg
export const vehicleImages = [
  { image_id: "i001", vehicle_id: "v001", url: "/vehicles/v001.jpg", caption: "Ảnh mặt trước xe X200" },
  { image_id: "i002", vehicle_id: "v001", url: "/vehicles/v002.jpg", caption: "Ảnh bên hông xe X200" },
  { image_id: "i003", vehicle_id: "v002", url: "/vehicles/v003.jpg", caption: "Ảnh chính E-Bike R1" }
]

// Trả ảnh đại diện (nếu có trong bảng), nếu không thì suy luận theo quy ước
export function getPrimaryImageUrl(vehicleId) {
  const found = vehicleImages.find(img => img.vehicle_id === vehicleId)
  return found ? found.url : `/vehicles/${vehicleId}.jpg`
}

// Trả toàn bộ ảnh của 1 xe
export function getImagesByVehicleId(vehicleId) {
  return vehicleImages.filter(img => img.vehicle_id === vehicleId)
}

// Nếu backend của bạn dùng ESM:
export default vehicleImages

// Nếu backend dùng CommonJS, thay 2 dòng export trên bằng:
// module.exports = { vehicleImages, getPrimaryImageUrl, getImagesByVehicleId }
