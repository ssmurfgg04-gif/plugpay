"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { LlPhoneStep } from "@/components/landlord/auth/LlPhoneStep";
import { LlPinLoginStep } from "@/components/landlord/auth/LlPinLoginStep";
import { LlOtpStep } from "@/components/landlord/auth/LlOtpStep";
import { LlSetPinStep } from "@/components/landlord/auth/LlSetPinStep";

export function LandlordModal() {
  const { llStep } = usePlugPay();
  return (
    <Modal id="modal-landlord">
      {llStep === "phone" && <LlPhoneStep />}
      {llStep === "pinlogin" && <LlPinLoginStep />}
      {llStep === "otp" && <LlOtpStep />}
      {llStep === "setpin" && <LlSetPinStep />}
    </Modal>
  );
}