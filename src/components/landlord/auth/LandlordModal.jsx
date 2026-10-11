"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { AuthEmailStep } from "@/components/seller/auth/AuthEmailStep";

export function LandlordModal() {
  const { llStep, isOpen } = usePlugPay();
  return (
    <Modal id="modal-landlord">
      {/* Landlords share the portal-wide email + password auth.
          Mounted only while the modal is open so the email/password input
          ids stay unique (the seller RegisterModal shares them). */}
      {isOpen("modal-landlord") && llStep === "email" && <AuthEmailStep />}
    </Modal>
  );
}
