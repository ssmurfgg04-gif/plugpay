"use client";

import { useSellerProfileForm } from "@/lib/seller";
import { EditRow } from "@/components/seller/shell/EditRow";

export function SellerProfileSocial() {
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
        className="tp-section-title"
        style={{
          padding: "13px 13px 0",
        }}
      >
        Social Media
      </div>
      <EditRow
        icon="💬"
        bg="#25D36622"
        label="WHATSAPP NUMBER"
        value={sp.whatsapp}
        onSave={S("whatsapp")}
        inputType="tel"
      />
      <EditRow icon="📷" bg="#fde7f3" label="INSTAGRAM" value={sp.instagram} onSave={S("instagram")} />
      <EditRow icon="🎵" bg="#00000014" label="TIKTOK" value={sp.tiktok} onSave={S("tiktok")} />
      <EditRow
        icon="f"
        bg="#1877F222"
        label="FACEBOOK"
        value={sp.facebook}
        onSave={S("facebook")}
        last={true}
      />
    </div>
  );
}