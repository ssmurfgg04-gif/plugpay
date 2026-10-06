"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { ItemRowsField } from "@/components/seller/sales/ItemRowsField";

export function RecordSaleModal() {
  const {
    rsName,
    setRsName,
    rsPhone,
    setRsPhone,
    rsCode,
    setRsCode,
    rsTotal,
    rsSubmitting,
    submitRecordSale,
    focusMerchantProfileTab,
    sellerProfile,
  } = usePlugPay();
  const hasCode = rsCode.trim().length > 0;
  return (
    <Modal
      id="modal-record-sale"
      innerClassName="plc-modal"
      closeButtonStyle={{
        background: "rgba(255,255,255,.22)",
        color: "#fff",
        borderColor: "rgba(255,255,255,.65)",
      }}
      onExit={focusMerchantProfileTab}
    >
      <div
        className="plc-head"
        style={{
          background: "#8b008b",
        }}
      >
        <div className="plc-title">Record a sale</div>
        <div className="plc-sub">
          {"For "}
          {sellerProfile.bizName}
          {
            " \xB7 Add the M-Pesa code once it's paid to send a receipt, or leave it blank to send a payment-link invoice."
          }
        </div>
      </div>
      <div className="plc-body">
        <div className="plc-field">
          <label className="plc-label">Buyer Name</label>
          <input
            className="plc-input"
            type="text"
            placeholder="e.g. John Kamau"
            value={rsName}
            onChange={(e) => setRsName(e.target.value)}
          />
        </div>
        <div className="plc-field">
          <label className="plc-label">Buyer Phone</label>
          <input
            className="plc-input"
            type="tel"
            placeholder="07XX XXX XXX"
            value={rsPhone}
            onChange={(e) => setRsPhone(e.target.value)}
          />
        </div>
        <ItemRowsField prefix="rs" />
        <div className="plc-total-row">
          <span>Total</span>
          <span>
            {"KSh "}
            {rsTotal.toLocaleString()}
          </span>
        </div>
        <div className="plc-field">
          <label className="plc-label">M-Pesa Transaction Code (optional)</label>
          <input
            className="plc-input"
            type="text"
            style={{
              textTransform: "uppercase",
            }}
            placeholder="e.g. SJK7H92LQA — leave blank to send an invoice instead"
            value={rsCode}
            onChange={(e) => setRsCode(e.target.value)}
          />
          <div
            className="icf-hint"
            style={{
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {hasCode
              ? "This will be recorded as a completed sale and a receipt will be sent."
              : "No code yet? This will send a payment-link invoice instead \u2014 add the code later to turn it into a receipt."}
          </div>
        </div>
        <button className="plc-submit" onClick={() => submitRecordSale()} disabled={rsSubmitting}>
          {rsSubmitting
            ? "Sending\u2026"
            : hasCode
              ? "Record sale & send receipt \u2192"
              : "Send invoice via WhatsApp \u2192"}
        </button>
      </div>
    </Modal>
  );
}