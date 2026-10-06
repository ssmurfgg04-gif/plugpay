"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { AuthPhoneStep } from "@/components/seller/auth/AuthPhoneStep";
import { AuthPinLoginStep } from "@/components/seller/auth/AuthPinLoginStep";
import { AuthOtpStep } from "@/components/seller/auth/AuthOtpStep";
import { AuthSetPinStep } from "@/components/seller/auth/AuthSetPinStep";

export function RegisterModal() {
  const { authStep, focusMerchantProfileTab } = usePlugPay();
  return (
    <Modal id="modal-register" onExit={focusMerchantProfileTab}>
      {authStep === "phone" && <AuthPhoneStep />}
      {authStep === "pinlogin" && <AuthPinLoginStep />}
      {authStep === "otp" && <AuthOtpStep />}
      {authStep === "setpin" && <AuthSetPinStep />}
    </Modal>
  );
}