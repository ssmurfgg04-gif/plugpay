"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";

export function QuickModal() {
  const {
    closeModal,
    openModal,
    openMerchantModal,
    openBuildingModal,
    openOnboard,
    openAuthModal,
    showToast,
    requireSellerLogin,
    sellerProfile,
  } = usePlugPay();
  const go = (fn) => {
    closeModal("modal-quick");
    fn();
  };
  return (
    <Modal id="modal-quick">
      <div className="qa-modal">
        <div className="qa-modal-title">Quick actions</div>
        <div className="qa-modal-sub">What would you like to do?</div>
        <div className="qa-list">
          <div
            className="qa-item"
            onClick={() =>
              go(() => {
                if (requireSellerLogin("record a sale")) openModal("modal-record-sale");
              })
            }
          >
            <div className="qa-ico qi1">{"\u{1F9FE}"}</div>
            <div>
              <div className="qa-label">Record a sale</div>
              <div className="qa-desc">Send a receipt on WhatsApp, or an invoice if it isn't paid yet</div>
            </div>
            <span className="qa-arr">{"\u2192"}</span>
          </div>
          <div className="qa-item" onClick={() => go(() => openMerchantModal())}>
            <div className="qa-ico qi2">{"\u{1F464}"}</div>
            <div>
              <div className="qa-label">View merchant profile</div>
              <div className="qa-desc">{sellerProfile.ownerName + " \xB7 " + sellerProfile.bizName}</div>
            </div>
            <span className="qa-arr">{"\u2192"}</span>
          </div>
          <div className="qa-item" onClick={() => go(() => openBuildingModal())}>
            <div className="qa-ico qi3">{"\u{1F3E2}"}</div>
            <div>
              <div className="qa-label">Browse building map</div>
              <div className="qa-desc">{"Anniversary Towers \xB7 72 stalls \xB7 58 registered"}</div>
            </div>
            <span className="qa-arr">{"\u2192"}</span>
          </div>
          <div className="qa-item" onClick={() => go(() => openOnboard())}>
            <div
              className="qa-ico qi4"
              style={{
                background: "#EEEDFE",
              }}
            >
              {"\u{1F4CD}"}
            </div>
            <div>
              <div className="qa-label">Onboard a building</div>
              <div className="qa-desc">Register a new building with stalls & merchants</div>
            </div>
            <span className="qa-arr">{"\u2192"}</span>
          </div>
          <div className="qa-item" onClick={() => go(() => openAuthModal())}>
            <div className="qa-ico qi4">{"\u{1F510}"}</div>
            <div>
              <div className="qa-label">Sign in to your stall</div>
              <div className="qa-desc">Enter your number to access your profile</div>
            </div>
            <span className="qa-arr">{"\u2192"}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}