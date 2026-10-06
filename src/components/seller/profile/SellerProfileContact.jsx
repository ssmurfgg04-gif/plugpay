"use client";

import { useSellerProfileForm } from "@/lib/seller";
import { EditRow } from "@/components/seller/shell/EditRow";
import { StallRow } from "@/components/seller/profile/StallRow";

export function SellerProfileContact() {
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
      <EditRow
        icon="📍"
        bg="#fff8e1"
        label="LOCATION"
        value={sp.street}
        onSave={S("street")}
        required={true}
      />
      <EditRow
        icon="📞"
        bg="#f8f1f7"
        label="PHONE"
        value={sp.phone}
        onSave={S("phone")}
        required={true}
        inputType="tel"
      />
      <EditRow
        icon="📅"
        bg="#ede7f6"
        label="YEAR IN BUSINESS"
        value={sp.established}
        editValue={String(parseInt(sp.established, 10) || "")}
        options={YEARS}
        required={true}
        onSave={function (v) {
          var y = parseInt(v, 10),
            n = new Date().getFullYear() - y;
          pp.updateSellerProfile({
            established:
              y +
              " \u00b7 " +
              (n <= 0 ? "Started this year" : n + (n === 1 ? " year" : " years") + " in business"),
          });
        }}
      />
      <StallRow />
    </div>
  );
}