import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function PaymentReturn() {
  const [params] = useSearchParams();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const q = Object.fromEntries(params.entries());
    setInfo({
      status: q.vnp_ResponseCode === "00" ? "success" : "failed",
      txnRef: q.vnp_TxnRef,
      amount: (Number(q.vnp_Amount || 0) / 100) + " VND",
      bank: q.vnp_BankCode,
      payDate: q.vnp_PayDate,
    });
  }, [params]);

  if (!info) return <p>Đang xử lý...</p>;

  return (
    <div>
      <h2>Kết quả thanh toán</h2>
      {info.status === "success" ? (
        <>
          <p>✅ Thành công</p>
          <p>Tham chiếu: {info.txnRef}</p>
          <p>Số tiền: {info.amount}</p>
          <p>Ngân hàng: {info.bank}</p>
          <p>Thời gian: {info.payDate}</p>
        </>
      ) : (
        <p>❌ Thanh toán thất bại</p>
      )}
      <Link to="/">Về trang chủ</Link>
    </div>
  );
}
