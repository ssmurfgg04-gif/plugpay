"use client";

import { usePlugPay } from "@/store/context";
import { profilePublicUrl, shareProfileCard } from "@/lib/profile-card-image";

export function ShareProfileCardButton(props) {
  var pp = usePlugPay();
  var slug = (pp.sessionInfo && pp.sessionInfo.merchantSlug) || "";
  var url = profilePublicUrl(slug);

  function share() {
    // The store hydrates from /api/bootstrap after mount; until then bizName
    // is empty and the card would render a placeholder. Nudge the user to
    // retry instead of sharing a blank card.
    if (!pp.sellerProfile || !pp.sellerProfile.bizName) {
      pp.showToast("Your profile is still loading — try again in a moment.");
      return;
    }
    shareProfileCard({
      seller: {
        bizName: pp.sellerProfile.bizName,
        ownerName: pp.sellerProfile.ownerName,
        role: pp.sellerProfile.role,
        bio: pp.sellerProfile.bio,
        street: pp.sellerProfile.street,
        whatsapp: pp.sellerProfile.whatsapp,
        verified: pp.sellerProfile.verified,
      },
      stats: pp.sellerStats,
      stallAssignment: pp.stallAssignment,
      landlordVerifyPending: pp.landlordVerifyPending,
      slug: slug,
      url: url,
      showToast: pp.showToast,
      copyText: pp.copyText,
    });
  }

  return (
    <button
      type="button"
      className="sp-hero-share"
      aria-label="Share my profile card"
      onClick={share}
    >
      <svg
        viewBox="0 0 24 24"
        width={14}
        height={14}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx={18} cy={5} r={3} />
        <circle cx={6} cy={12} r={3} />
        <circle cx={18} cy={19} r={3} />
        <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
        <line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
      </svg>
      {" Share my card"}
    </button>
  );
}
