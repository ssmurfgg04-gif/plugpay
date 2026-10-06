"use client";

import { useSellerProfileForm } from "@/lib/seller";
import { EditRow } from "@/components/seller/shell/EditRow";
import { SellerPaymentOptions } from "@/components/seller/shell/SellerPaymentOptions";

export function SellerProfilePayment() {
  var f = useSellerProfileForm(),
    pp = f.pp,
    sp = f.sp,
    S = f.S,
    pm = f.pm,
    PMETHODS = f.PMETHODS,
    noAcct = f.noAcct,
    YEARS = f.YEARS;
  return (
    <div className="tp-card tp-info-card">
      <div
        className="tp-pay-info-header"
        style={{
          padding: "13px 13px 0",
        }}
      >
        <div className="tp-pay-info-title">
          <span className="tp-pay-info-icon">{"\uD83D\uDCB3"}</span>
          {" Payment Information"}
        </div>
        <div className="tp-pay-info-badge">M-Pesa</div>
      </div>
      <EditRow
        icon="💱"
        bg="#e8f5e9"
        label="PAYMENT METHOD"
        value={pm}
        options={PMETHODS}
        required={true}
        onSave={S("payMethod")}
      />
      <EditRow
        icon="🏦"
        bg="#f8f1f7"
        label={
          pm === "Till number"
            ? "TILL NUMBER"
            : pm === "Send money"
              ? "M-PESA PHONE"
              : pm === "Bank transfer"
                ? "BANK ACCOUNT NUMBER"
                : "PAYBILL NUMBER"
        }
        value={sp.paybill}
        onSave={S("paybill")}
        required={true}
        last={noAcct}
      />
      {!noAcct && (
        <EditRow
          icon="🔢"
          bg="#e3f2fd"
          label={pm === "Bank transfer" ? "ACCOUNT NAME" : "ACCOUNT NUMBER"}
          value={sp.account}
          onSave={S("account")}
          required={true}
          last={true}
        />
      )}
      <SellerPaymentOptions />
    </div>
  );
}