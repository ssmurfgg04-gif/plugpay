"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { AuthEmailStep } from "@/components/seller/auth/AuthEmailStep";

export function LandlordModal() {
  const { llStep } = usePlugPay();
  return (
    <Modal id="modal-landlord">
      {/* Landlords share the portal-wide email + password auth. */}
      {llStep === "email" && <AuthEmailStep />}
    </Modal>
  );
}
