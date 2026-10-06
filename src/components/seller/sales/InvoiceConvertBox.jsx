"use client";

import { useState } from "react";
import { navigate } from "@/lib/nav";

export function InvoiceConvertBox(props) {
  var pp = props.pp,
    d = props.doc;
  var _c = useState(""),
    code = _c[0],
    setCode = _c[1];
  var _b = useState(false),
    busy = _b[0],
    setBusy = _b[1];
  return (
    <div className="sales-code-box">
      <div className="sales-code-label">
        Add transaction code or paste the M-Pesa message to turn this invoice into a receipt
      </div>
      <textarea
        className="plc-input"
        rows={3}
        placeholder="e.g. QGH7XYZ123 or the full M-Pesa message"
        value={code}
        onChange={function (e) {
          setCode(e.target.value);
        }}
      />
      <button
        type="button"
        className="sp-edit-btn on"
        disabled={busy || !code.trim()}
        onClick={function () {
          setBusy(true);
          setTimeout(function () {
            setBusy(false);
            var rc = pp.convertInvoiceToReceipt(d.token, code);
            if (rc) {
              setCode("");
              navigate("/seller/receipts/" + encodeURIComponent(rc));
            }
          }, 400);
        }}
      >
        {busy ? "Checking\u2026" : "Make receipt"}
      </button>
    </div>
  );
}