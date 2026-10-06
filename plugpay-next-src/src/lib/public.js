import { createContext } from "react";
import { usePlugPay } from "@/store/context";

export var merchants = [
  {
    type: "merchant",
    name: "Jane Mwangi",
    sub: "Fashion \xB7 Anniversary Towers \xB7 Floor 3, Stall 301",
    initials: "JM",
    color: "#51104a",
    badge: "Verified",
    badgeClass: "rcb-verified",
    rating: "4.9",
    sales: 847,
    reviews: 38,
    vouches: 38,
  },
  {
    type: "merchant",
    name: "Peter Otieno",
    sub: "Electronics \xB7 Anniversary Towers \xB7 Floor 3, Stall 302",
    initials: "PO",
    color: "#185FA5",
    badge: "Verified",
    badgeClass: "rcb-verified",
    rating: "4.8",
    sales: 312,
    reviews: 24,
    vouches: 18,
  },
  {
    type: "merchant",
    name: "David Mutua",
    sub: "Hardware \xB7 Anniversary Towers \xB7 Floor 2, Stall 202",
    initials: "DM",
    color: "#534AB7",
    badge: "Verified",
    badgeClass: "rcb-verified",
    rating: "4.7",
    sales: 560,
    reviews: 41,
    vouches: 52,
  },
  {
    type: "merchant",
    name: "Amina Kibe",
    sub: "Food \xB7 Anniversary Towers \xB7 Floor 3, Stall 303",
    initials: "AK",
    color: "#BA7517",
    badge: "Verified",
    badgeClass: "rcb-verified",
    rating: "4.6",
    sales: 210,
    reviews: 17,
    vouches: 8,
  },
  {
    type: "merchant",
    name: "Grace Akinyi",
    sub: "Beauty \xB7 Lonrho House \xB7 Floor 1, Stall 5",
    initials: "GA",
    color: "#D85A30",
    badge: "Verified",
    badgeClass: "rcb-verified",
    rating: "4.9",
    sales: 428,
    reviews: 33,
    vouches: 24,
  },
];

export var ProfCtx = createContext(null);

// The official profile reads its data through this hook so own and other sellers render identically.
// The official profile reads its data through this hook so own and other sellers render identically.
export function useSV() {
  var pp = usePlugPay(),
    v = pp.viewedSeller;
  if (v)
    return {
      own: false,
      profile: v.profile,
      stats: v.stats,
      assignment: v.assignment,
      pending: !v.verified,
      catalogue: v.catalogue,
      reviews: [],
    };
  return {
    own: true,
    profile: pp.sellerProfile,
    stats: pp.sellerStats,
    assignment: pp.stallAssignment,
    pending: pp.landlordVerifyPending,
    catalogue: pp.catalogueItems,
    reviews: pp.sellerReviews,
  };
}