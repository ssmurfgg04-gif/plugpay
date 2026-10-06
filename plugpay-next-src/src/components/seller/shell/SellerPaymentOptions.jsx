"use client";

import { usePlugPay } from "@/store/context";

export function SellerPaymentOptions() {
  var pp = usePlugPay();
  var methods = pp.sellerProfile.paymentOptions || [];
  function addOption() {
    pp.updateSellerProfile({
      paymentOptions: methods.concat({
        id: "pay-" + Date.now().toString(36),
        method: "Paybill",
        number: "",
        accountName: "",
      }),
    });
  }
  function updateOption(id, patch) {
    pp.updateSellerProfile({
      paymentOptions: methods.map(function (x) {
        return x.id === id ? Object.assign({}, x, patch) : x;
      }),
    });
  }
  function removeOption(id) {
    pp.updateSellerProfile({
      paymentOptions: methods.filter(function (x) {
        return x.id !== id;
      }),
    });
  }
  return (
    <>
      <div
        className="tp-pay-info-header"
        style={{
          padding: "0 13px 10px",
        }}
      >
        <div className="tp-pay-info-title">More payment options</div>
        <button className="sp-edit-btn on" onClick={addOption}>
          {"+ Add payment option"}
        </button>
      </div>
      {methods.length === 0 && (
        <div className="sp-payment-empty">Add the payment methods buyers can use to pay you.</div>
      )}
      {methods.map(function (p) {
        return (
          <div key={p.id} className="sp-payment-option">
            <select
              className="plc-input"
              value={p.method}
              onChange={function (e) {
                updateOption(p.id, {
                  method: e.target.value,
                });
              }}
            >
              {["Paybill", "Till number", "Send money", "Bank transfer"].map(function (x) {
                return (
                  <option key={x} value={x}>
                    {x}
                  </option>
                );
              })}
            </select>
            <input
              className="plc-input"
              placeholder="Account / number"
              defaultValue={p.number}
              onBlur={function (e) {
                if (e.target.value !== p.number)
                  updateOption(p.id, {
                    number: e.target.value,
                  });
              }}
            />
            <input
              className="plc-input"
              placeholder="Registered name"
              defaultValue={p.accountName}
              onBlur={function (e) {
                if (e.target.value !== p.accountName)
                  updateOption(p.id, {
                    accountName: e.target.value,
                  });
              }}
            />
            <button
              className="sp-edit-btn danger"
              onClick={function () {
                removeOption(p.id);
              }}
            >
              Remove
            </button>
          </div>
        );
      })}
    </>
  );
}