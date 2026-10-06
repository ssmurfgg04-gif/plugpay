"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { BuildingViewContainer } from "@/components/building/BuildingViewContainer";

export function BuildingModal() {
  var pp = usePlugPay();
  return (
    <Modal id="modal-building" onExit={pp.focusMerchantProfileTab}>
      <BuildingViewContainer id={pp.bldgId} />
    </Modal>
  );
}