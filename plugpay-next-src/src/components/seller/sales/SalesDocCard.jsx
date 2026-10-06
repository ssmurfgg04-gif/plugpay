"use client";

import { useState } from "react";
import { Link } from "@/components/ui/Link";
import { salesDocStatus } from "@/lib/seller";
import { ReviewChip } from "@/components/seller/sales/ReviewChip";
import { InvoiceConvertBox } from "@/components/seller/sales/InvoiceConvertBox";

export function SalesDocCard(props) {
  var pp = props.pp,
    kind = props.kind,
    d = props.doc;
  var _o = useState(false),
    open = _o[0],
    setOpen = _o[1];
  var isInvoice = kind === "invoice";
  var id = isInvoice ? d.token : d.code;
  var paid = isInvoice && d.status === "PAID";
  var status = salesDocStatus(kind, d);
  var complete = status === "COMPLETE";
  var receiptLink = isInvoice
    ? paid && d.paymentRef
      ? "/seller/receipts/" + encodeURIComponent("#" + d.paymentRef)
      : null
    : "/seller/receipts/" + encodeURIComponent(d.code);
  var fullLink = isInvoice
    ? "/seller/invoices/" + encodeURIComponent(id)
    : "/seller/receipts/" + encodeURIComponent(d.code);
  var items = d.items || [];
  return (
    <div className="sales-doc">
      <div className="sales-doc-head">
        <div className="sales-doc-main">
          <strong>
            {isInvoice
              ? "Invoice " + (d.number ? d.number + " " : "") + "\u00b7 " + (d.buyerName || "Buyer")
              : "Receipt " + d.code}
          </strong>
          <div className="sales-doc-sub">
            {(isInvoice ? "" : (d.buyerName || "Buyer") + " \u00b7 ") +
              (d.buyerPhone || "") +
              " \u00b7 " +
              new Date(d.createdAt).toLocaleString()}
          </div>
          {!isInvoice && (
            <div
              style={{
                marginTop: 6,
              }}
            >
              <ReviewChip r={d} />
            </div>
          )}
        </div>
        <div className="sales-doc-right">
          <strong>{"KSh " + Number(d.total || 0).toLocaleString()}</strong>
          <span className={"sales-pill " + (complete ? "complete" : "pending")}>
            {complete ? "COMPLETE" : "PENDING"}
          </span>
        </div>
      </div>
      <div className="sales-doc-actions">
        <Link to={fullLink} className="sp-edit-btn on">
          View full doc
        </Link>
        <button
          type="button"
          className="sp-edit-btn"
          onClick={function () {
            setOpen(!open);
          }}
        >
          {open ? "Hide" : "Quick view"}
        </button>
        {!paid && (
          <button
            type="button"
            className="sp-edit-btn"
            onClick={function () {
              pp.setDocumentStatus(kind, id, complete ? "PENDING" : "COMPLETE");
            }}
          >
            {complete ? "Mark pending" : "Mark complete"}
          </button>
        )}
        {!isInvoice && !d.sentAt && (
          <button
            type="button"
            className="sp-edit-btn"
            onClick={function () {
              pp.sendReceipt(d.code);
            }}
          >
            Send receipt
          </button>
        )}
        {isInvoice && !paid && (
          <button
            type="button"
            className="sp-edit-btn"
            onClick={function () {
              pp.resendInvoice(d.token);
            }}
          >
            Resend
          </button>
        )}
      </div>
      {open && (
        <div className="sales-doc-panel">
          <div className="sales-doc-items">
            {items.map(function (it, i) {
              return (
                <div key={i} className="sales-doc-item">
                  <span>{it.name + " \u00d7 " + (it.qty || 1)}</span>
                  <strong>{"KSh " + Number(it.price || 0).toLocaleString()}</strong>
                </div>
              );
            })}
            <div className="sales-doc-item total">
              <span>Total</span>
              <strong>{"KSh " + Number(d.total || 0).toLocaleString()}</strong>
            </div>
          </div>
          {d.paymentRef && (
            <div
              className="sales-doc-sub"
              style={{
                marginTop: 8,
              }}
            >
              {"M-Pesa code: " + d.paymentRef}
            </div>
          )}
          {d.mpesaMessage && <div className="sales-doc-msg">{d.mpesaMessage}</div>}
          <div
            className="sales-doc-actions"
            style={{
              marginTop: 10,
            }}
          >
            {isInvoice && receiptLink && (
              <Link to={receiptLink} className="sp-edit-btn on">
                Open receipt
              </Link>
            )}
            {isInvoice && (
              <Link to={"/pay/" + d.token} className="sp-edit-btn">
                Open payment link
              </Link>
            )}
          </div>
        </div>
      )}
      {isInvoice && !paid && <InvoiceConvertBox pp={pp} doc={d} />}
      {paid && receiptLink && (
        <div
          className="sales-doc-sub"
          style={{
            marginTop: 8,
          }}
        >
          {"Paid \u00b7 receipt " + "#" + d.paymentRef + " created"}
        </div>
      )}
    </div>
  );
}