let payments = [
  { payment_id: "px001", rental_id: "rt001", type: "Rental Fee",     amount: "145000 VND", method: "Credit Card", provider_ref: "VISA-123456-TXN", status: "Success",  paid_at: "2025-11-05T10:00:00Z", handled_by: "u002" },
  { payment_id: "px002", rental_id: "rt001", type: "Deposit Refund", amount: "500000 VND", method: "Transfer",    provider_ref: "BANK-REF-9876",  status: "Success",  paid_at: "2025-11-05T10:05:00Z", handled_by: "u001" }
];
module.exports = payments;
