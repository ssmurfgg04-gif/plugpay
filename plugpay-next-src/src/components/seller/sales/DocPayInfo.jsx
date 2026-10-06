"use client";

import { Ic } from "@/components/ui/Ic";

export function DocPayInfo(props) {
  var sp = props.sp;
  var pm = sp.payMethod || "Paybill";
  var noAcct = pm === "Till number" || pm === "Send money";
  var numLabel =
    pm === "Till number"
      ? "Till number"
      : pm === "Send money"
        ? "M-Pesa phone"
        : pm === "Bank transfer"
          ? "Bank account number"
          : "Paybill number";
  var acctLabel = pm === "Bank transfer" ? "Account name" : "Account number";
  return (
    <div className="doc-sec">
      <div className="doc-sec-h">{Ic("credit-card", 13)}Payment information</div>
      <div className="doc-pay-box">
        <div className="doc-row">
          <span>Pay via</span>
          <strong>{pm}</strong>
        </div>
        <div className="doc-row">
          <span>{numLabel}</span>
          <strong>{sp.paybill || "\u2014"}</strong>
        </div>
        {!noAcct && (
          <div className="doc-row">
            <span>{acctLabel}</span>
            <strong>{sp.account || "\u2014"}</strong>
          </div>
        )}
      </div>
    </div>
  );
}