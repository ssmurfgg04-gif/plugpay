"use client";

import { useState } from "react";
import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";
import { ProductForm } from "@/components/seller/catalogue/ProductForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Ic } from "@/components/ui/Ic";

export function SellerCatalogueTab() {
  var pp = usePlugPay();
  var _m = useState(null),
    mode = _m[0],
    setMode = _m[1];
  var _f = useState("All"),
    filter = _f[0],
    setFilter = _f[1];
  var items = pp.catalogueItems;
  var cats = ["All"].concat(
    Array.from(
      new Set(
        items.map(function (i) {
          return i.category;
        }),
      ),
    ),
  );
  var shown =
    filter === "All"
      ? items
      : items.filter(function (i) {
          return i.category === filter;
        });
  var editing =
    mode && mode !== "new"
      ? items.filter(function (i) {
          return i.id === mode;
        })[0]
      : null;
  return (
    <div
      style={{
        padding: 12,
      }}
    >
      <div className="cat-merchant-bar">
        <button
          className="cat-mb-btn cat-mb-primary"
          onClick={function () {
            setMode(mode === "new" ? null : "new");
          }}
        >
          {"\uFF0B Add Product"}
        </button>
        <span
          className="cat-mb-btn"
          style={{
            textAlign: "center",
            cursor: "default",
          }}
        >
          {items.length + " product" + (items.length === 1 ? "" : "s")}
        </span>
      </div>
      {mode === "new" && (
        <ProductForm
          key="new"
          title="Add product"
          submitLabel="Add product"
          onCancel={function () {
            setMode(null);
          }}
          onSubmit={function (f) {
            if (pp.addCatalogueItem(f)) setMode(null);
          }}
        />
      )}
      {editing && (
        <ProductForm
          key={editing.id}
          title="Edit product"
          submitLabel="Save changes"
          initial={{
            name: editing.name,
            price: editing.price,
            category: editing.category,
            stock: String(editing.stock),
            image: editing.image,
          }}
          onCancel={function () {
            setMode(null);
          }}
          onSubmit={function (f) {
            if (!f.name.trim() || !f.price) {
              pp.showToast("Enter a product name and price");
              return;
            }
            pp.updateCatalogueItem(editing.id, {
              name: f.name.trim(),
              price: String(f.price),
              category: f.category.trim() || "General",
              stock: Number(f.stock) || 0,
              image: f.image,
            });
            pp.showToast("Product updated \u2713");
            setMode(null);
          }}
        />
      )}
      <div className="cat-filters">
        {cats.map(function (c) {
          var n =
            c === "All"
              ? items.length
              : items.filter(function (i) {
                  return i.category === c;
                }).length;
          return (
            <button
              key={c}
              className={"cat-filter" + (filter === c ? " on" : "")}
              onClick={function () {
                setFilter(c);
              }}
            >
              {c + " (" + n + ")"}
            </button>
          );
        })}
      </div>
      {shown.length === 0 && (
        <EmptyState
          icon="package"
          title={filter === "All" ? "No products yet" : "Nothing in " + filter}
          sub="Products you add here autofill your invoices and receipts, and feed your sales analytics."
          action={
            mode === "new"
              ? null
              : {
                  label: "Add product",
                  onClick: function () {
                    setMode("new");
                  },
                }
          }
        />
      )}
      <div className="cat-grid">
        {shown.map(function (p) {
          return (
            <div
              key={p.id}
              className="cat-item"
              style={{
                cursor: "default",
              }}
            >
              <div className="cat-img">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  p.icon
                )}
              </div>
              <div className="cat-body">
                <div className="cat-name">{p.name}</div>
                <div className="cat-price">{"KSh " + Number(p.price).toLocaleString()}</div>
                <div className="cat-stock">
                  {(p.stock > 0 ? p.stock + " in stock" : "Out of stock") + " \u00b7 " + p.category}
                </div>
                <button
                  className="cat-sale-btn"
                  disabled={p.stock <= 0}
                  onClick={function () {
                    pp.startSaleFromProduct(p);
                    navigate("/seller/receipts/new");
                  }}
                >
                  {Ic("shopping-cart", 15)}
                  {p.stock > 0 ? "Record sale" : "Out of stock"}
                </button>
                <div
                  className="catalogue-action-row"
                  style={{
                    marginTop: 8,
                  }}
                >
                  <button
                    className="sp-edit-btn"
                    onClick={function () {
                      setMode(p.id);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    {"\u270F\uFE0F Edit"}
                  </button>
                  <button
                    className="sp-edit-btn danger"
                    onClick={function () {
                      pp.removeCatalogueItem(p.id);
                      if (mode === p.id) setMode(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}