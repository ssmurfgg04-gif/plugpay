"use client";

import { usePlugPay } from "@/store/context";
import { ProfCtx, useSV } from "@/lib/public";
import { ProfileTabSection1 } from "@/components/public/ProfileTabSection1";
import { ProfileTabSection2 } from "@/components/public/ProfileTabSection2";
import { ProfileTabSection3 } from "@/components/public/ProfileTabSection3";
import { ProfileTabSection4 } from "@/components/public/ProfileTabSection4";
import { ProfileTabSection5 } from "@/components/public/ProfileTabSection5";
import { ProfileTabSection6 } from "@/components/public/ProfileTabSection6";
import { ProfileTabSection7 } from "@/components/public/ProfileTabSection7";

export function ProfileTab({ onViewCatalogue }) {
  const { showToast, copyText, riders } = usePlugPay();
  const sv = useSV();
  const sellerProfile = sv.profile;
  var __v = {
    onViewCatalogue: onViewCatalogue,
    showToast: showToast,
    copyText: copyText,
    riders: riders,
    sv: sv,
    sellerProfile: sellerProfile,
  };
  return (
    <ProfCtx.Provider value={__v}>
      <div
        className="modal-tab-body on"
        style={{
          padding: "0",
        }}
      >
        <>
          <ProfileTabSection1 />
          <ProfileTabSection2 />
          <ProfileTabSection3 />
          <ProfileTabSection4 />
          <ProfileTabSection5 />
          <ProfileTabSection6 />
          <ProfileTabSection7 />
        </>
      </div>
    </ProfCtx.Provider>
  );
}