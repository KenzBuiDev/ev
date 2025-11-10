let userDocs = [
  { doc_id: "d001", user_id: "u003", doc_type: "ID_CARD_FRONT", file_url: "https://storage.example.com/docs/u003_id_front.pdf", status: "Verified", uploaded_at: "2023-09-02T10:00:00Z", verification_notes: "ID rõ ràng, khớp thông tin.", verified_by: "u002", verified_at: "2023-09-03T11:00:00Z" },
  { doc_id: "d002", user_id: "u003", doc_type: "DRIVER_LICENSE_FRONT", file_url: "https://storage.example.com/docs/u003_dl_front.pdf", status: "Pending",  uploaded_at: "2023-09-02T10:05:00Z", verification_notes: null, verified_by: null, verified_at: null },
  { doc_id: "d003", user_id: "u002", doc_type: "CONTRACT_STAFF", file_url: "https://storage.example.com/docs/u002_contract.pdf", status: "Verified", uploaded_at: "2023-11-01T09:00:00Z", verification_notes: "Hợp đồng đã ký.", verified_by: "u001", verified_at: "2023-11-01T10:00:00Z" }
];
module.exports = userDocs;
