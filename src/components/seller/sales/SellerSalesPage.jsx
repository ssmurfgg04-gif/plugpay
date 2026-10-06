"use client";

import { useEffect, useState } from "react";
import { usePlugPay } from "@/store/context";
import { SellerGate } from "@/components/seller/auth/SellerGate";
import { salesDocStatus } from "@/lib/seller";
import { AppShellSeller } from "@/components/seller/shell/AppShellSeller";
import { SalesDocCard } from "@/components/seller/sales/SalesDocCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function SellerSalesPage(props) {
  var pp = usePlugPay();
  var _m = useState(props.mode || "receipts"),
    mode = _m[0],
    setMode = _m[1];
  var _f = useState("all"),
    filter = _f[0],
    setFilter = _f[1];
  useEffect(
    function () {
      setMode(props.mode || "receipts");
    },
    [props.mode],
  );
  if (!pp.merchantLoggedIn)
    return <SellerGate active="sales" msg="Sign in to your seller account to view your sales." />;
  var receipts = pp.receiptsList,
    invoices = pp.invoicesList;
  var all = receipts
    .map(function (r) {
      return salesDocStatus("receipt", r);
    })
    .concat(
      invoices.map(function (i) {
        return salesDocStatus("invoice", i);
      }),
    );
  var completeCount = all.filter(function (x) {
    return x === "COMPLETE";
  }).length;
  var pendingCount = all.length - completeCount;
  var kind = mode === "receipts" ? "receipt" : "invoice";
  var source = mode === "receipts" ? receipts : invoices;
  var shown = source.filter(function (d) {
    return filter === "all" || salesDocStatus(kind, d).toLowerCase() === filter;
  });
  var unsent = receipts.filter(function (r) {
    return !r.sentAt;
  }).length;
  var filters = [
    ["all", "All"],
    ["pending", "Pending"],
    ["complete", "Complete"],
  ];
  return (
    <AppShellSeller
      title="Sales"
      subtitle="View each receipt and invoice, mark it pending or complete, and turn paid invoices into receipts."
    >
      <div className="seller-sales-summary">
        <div>
          <strong>{receipts.length}</strong>
          <span>Receipts</span>
        </div>
        <div>
          <strong>{invoices.length}</strong>
          <span>Invoices</span>
        </div>
        <div>
          <strong>{completeCount}</strong>
          <span>Complete</span>
        </div>
        <div>
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </div>
      </div>
      <div
        className="dx-seg"
        style={{
          marginBottom: 12,
        }}
      >
        <button
          className={mode === "receipts" ? "on" : ""}
          onClick={function () {
            setMode("receipts");
          }}
        >
          {"Receipts (" + receipts.length + ")"}
        </button>
        <button
          className={mode === "invoices" ? "on" : ""}
          onClick={function () {
            setMode("invoices");
          }}
        >
          {"Invoices (" + invoices.length + ")"}
        </button>
      </div>
      <div className="sales-filter">
        {filters.map(function (f) {
          return (
            <button
              key={f[0]}
              type="button"
              className={filter === f[0] ? "on" : ""}
              onClick={function () {
                setFilter(f[0]);
              }}
            >
              {f[1]}
            </button>
          );
        })}
      </div>
      {mode === "receipts" && unsent > 0 && (
        <div
          className="rv-note"
          style={{
            marginBottom: 12,
          }}
        >
          <span>{"\u26A0\uFE0F"}</span>
          <span>
            {unsent + " receipt(s) not sent yet. Stock only drops once a receipt is sent to the buyer."}
          </span>
        </div>
      )}
      <section className="sales-doc-list">
        {shown.map(function (d) {
          return <SalesDocCard key={kind + (d.token || d.code)} kind={kind} doc={d} pp={pp} />;
        })}
        {source.length > 0 && shown.length === 0 && <div className="ll-empty">Nothing in this view.</div>}
        {mode === "receipts" && receipts.length === 0 && (
          <EmptyState
            icon="receipt"
            title="No receipts yet"
            sub="Tap Record a sale, add the M-Pesa code, and the receipt goes to the buyer on WhatsApp with a review link."
            action={{
              label: "Record a sale",
              onClick: function () {
                pp.openModal("modal-record-sale");
              },
            }}
          />
        )}
        {mode === "invoices" && invoices.length === 0 && (
          <EmptyState
            icon="file-text"
            title="No invoices yet"
            sub="Record a sale without an M-Pesa code and it goes out as a payment-link invoice."
            action={{
              label: "Record a sale",
              onClick: function () {
                pp.openModal("modal-record-sale");
              },
            }}
          />
        )}
      </section>
    </AppShellSeller>
  );
}