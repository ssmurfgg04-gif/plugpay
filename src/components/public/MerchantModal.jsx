"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { MerchantProfileBody } from "@/components/public/MerchantProfileBody";

export function MerchantModal() {
  var pp = usePlugPay();
  return (
    <Modal id="modal-merchant" innerClassName="modal tpModal" hideCloseButton={true}>
      <MerchantProfileBody
        onClose={function () {
          pp.closeModal("modal-merchant");
        }}
      />
    </Modal>
  );
}