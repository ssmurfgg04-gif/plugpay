"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { AuthEmailStep } from "@/components/seller/auth/AuthEmailStep";

export function RegisterModal() {
  const { authStep, focusMerchantProfileTab } = usePlugPay();
  return (
    <Modal id="modal-register" onExit={focusMerchantProfileTab}>
      {authStep === "email" && <AuthEmailStep />}
    </Modal>
  );
}
