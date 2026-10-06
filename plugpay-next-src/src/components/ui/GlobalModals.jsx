"use client";

import { Toast } from "@/components/ui/Toast";
import { NetBanner } from "@/components/ui/NetBanner";
import { MerchantModal } from "@/components/public/MerchantModal";
import { BuildingModal } from "@/components/building/BuildingModal";
import { QuickModal } from "@/components/quick/QuickModal";
import { ReceiptModal } from "@/components/seller/sales/ReceiptModal";
import { RecordSaleModal } from "@/components/seller/sales/RecordSaleModal";
import { RegisterModal } from "@/components/seller/auth/RegisterModal";
import { LandlordModal } from "@/components/landlord/auth/LandlordModal";
import { OnboardModal } from "@/components/agent/onboarding/OnboardModal";
import { AdmitSellerModal } from "@/components/landlord/AdmitSellerModal";

export function GlobalModals() {
  return (
    <>
      <Toast />
      <NetBanner />
      <MerchantModal />
      <BuildingModal />
      <QuickModal />
      <ReceiptModal />
      <RecordSaleModal />
      <RegisterModal />
      <LandlordModal />
      <OnboardModal />
      <AdmitSellerModal />
    </>
  );
}