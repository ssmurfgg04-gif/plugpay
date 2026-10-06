"use client";

import { SellerProfileHero } from "@/components/seller/profile/SellerProfileHero";
import { SellerProfileReviews } from "@/components/seller/profile/SellerProfileReviews";
import { SellerProfileContact } from "@/components/seller/profile/SellerProfileContact";
import { SellerProfileSocial } from "@/components/seller/profile/SellerProfileSocial";
import { SellerProfilePayment } from "@/components/seller/profile/SellerProfilePayment";
import { SellerProfileAbout } from "@/components/seller/profile/SellerProfileAbout";
import { SellerProfileCompliance } from "@/components/seller/profile/SellerProfileCompliance";
import { SellerProfileRiders } from "@/components/seller/profile/SellerProfileRiders";
import { SellerProfileRelocate } from "@/components/seller/profile/SellerProfileRelocate";

export function SellerProfileTab() {
  return (
    <>
      <SellerProfileHero />
      <SellerProfileReviews />
      <SellerProfileContact />
      <SellerProfileSocial />
      <SellerProfilePayment />
      <SellerProfileAbout />
      <SellerProfileCompliance />
      <SellerProfileRiders />
      <SellerProfileRelocate />
    </>
  );
}