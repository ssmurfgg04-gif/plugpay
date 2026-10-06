"use client";

import { usePlugPay } from "@/store/context";
import { useSV } from "@/lib/public";

export function PublicSellerProfileHeader(props) {
  const { toggleFollowMerchant, following, showToast, copyText } = usePlugPay();
  const sv = useSV();
  const sellerProfile = sv.profile,
    sellerStats = sv.stats,
    landlordVerifyPending = sv.pending;
  return (
    <div className="tp-hero public-seller-profile-header">
      <div className="tp-hero-avatar-wrap">
        <div className="tp-hero-avatar">{(sellerProfile.bizName || "W").charAt(0).toUpperCase()}</div>
        <div className="tp-hero-av-check">{"\u2713"}</div>
      </div>
      <div className="tp-hero-name">{sellerProfile.bizName}</div>
      <div className="tp-hero-role">{sellerProfile.ownerName + " \xB7 " + sellerProfile.role}</div>
      <div className="tp-hero-badge">
        <span className="tp-v-icon">{"\u2713"}</span>
        {" Verified Seller Profile"}
      </div>
      <div className="tp-hero-bio">{sellerProfile.bio}</div>
      <div className="tp-hero-loc">
        <span>{"\u{1F4CD} " + sellerProfile.street}</span>
        <span>{sv.assignment.building + ", " + sv.assignment.loc}</span>
      </div>
      <div className="tp-landlord-tag">
        <span className={`tp-landlord-tick${landlordVerifyPending ? " pending" : ""}`}>
          {landlordVerifyPending ? "\u23F3" : "\u2713"}
        </span>{" "}
        <span className={landlordVerifyPending ? undefined : "tp-verified-badge"}>
          {landlordVerifyPending ? "Pending" : "Landlord verified"}
        </span>
      </div>
      <div className="tp-hero-actions">
        <button className="tp-hero-btn tp-hero-btn-solid" onClick={() => toggleFollowMerchant()}>
          <span>{following ? "\u2713" : "\uFF0B"}</span> <span>{following ? "Following" : "Follow"}</span>
        </button>
        <button
          className="tp-hero-btn tp-hero-btn-outline"
          onClick={() => showToast("Opening WhatsApp chat with " + sellerProfile.bizName + "\u2026")}
        >
          Message
        </button>
        <button
          className="tp-hero-btn tp-hero-btn-outline tp-hero-share"
          aria-label="Share profile"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: sellerProfile.bizName,
                  url: "https://plug.pay/m/wanjiku-electronics",
                })
                .catch(() => {});
            } else copyText("plug.pay/m/wanjiku-electronics", "Profile link copied \u2713");
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx={18} cy={5} r={3} />
            <circle cx={6} cy={12} r={3} />
            <circle cx={18} cy={19} r={3} />
            <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
            <line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
          </svg>
        </button>
      </div>
      <div className="tp-hero-stats">
        <div className="tp-hero-stat">
          <div className="tp-hero-stat-n">{String(sellerStats.sales)}</div>
          <div className="tp-hero-stat-l">Sales</div>
        </div>
        <div className="tp-hero-stat">
          <div className="tp-hero-stat-n">{String(sellerStats.followers || 235)}</div>
          <div className="tp-hero-stat-l">Followers</div>
        </div>
        <div className="tp-hero-stat">
          <div className="tp-hero-stat-n">{String(sellerStats.reviewCount)}</div>
          <div className="tp-hero-stat-l">Reviews</div>
        </div>
        <div className="tp-hero-stat">
          <div className="tp-hero-stat-n">{String(sellerStats.trust)}</div>
          <div className="tp-hero-stat-l">Trust</div>
        </div>
      </div>
    </div>
  );
}