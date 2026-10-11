"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { AuthEmailStep } from "@/components/seller/auth/AuthEmailStep";

export function RegisterModal() {
  const { authStep, isOpen, focusMerchantProfileTab } = usePlugPay();
  return (
    <Modal id="modal-register" onExit={focusMerchantProfileTab}>
      {/* Mounted only while the modal is open so input ids stay unique
          (the landlord LandlordModal can render the same shared form). */}
      {isOpen("modal-register") && authStep === "email" && <AuthEmailStep />}
    </Modal>
  );
}
