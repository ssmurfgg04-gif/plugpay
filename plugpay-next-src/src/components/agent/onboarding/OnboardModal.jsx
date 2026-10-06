"use client";

import { Modal } from "@/components/ui/Modal";
import { OnboardFlow } from "@/components/agent/onboarding/OnboardFlow";

/* ---- Entry: modal and page ---- */
/* ---- Entry: modal and page ---- */
export function OnboardModal() {
  return (
    <Modal id="modal-onboard" innerClassName="ob-modal">
      <OnboardFlow />
    </Modal>
  );
}