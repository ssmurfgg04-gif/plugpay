"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";
import { useSV } from "@/lib/public";

export function CatalogueTab() {
  const { showToast, openAuthModal, merchantLoggedIn } = usePlugPay();
  const catalogueItems = useSV().catalogue;
  const PRODUCTS = catalogueItems.map((i) => ({
    icon: i.icon,
    image: i.image,
    name: i.name,
    price: "KSh " + Number(i.price).toLocaleString(),
    stock: i.stock > 0 ? i.stock + " in stock" : "Out of stock",
    cat: i.category,
  }));
  const FILTERS = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.cat)))];
  const [filter, setFilter] = useState("All");
  const items = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);
  return (
    <div
      className="modal-tab-body on"
      style={{
        padding: "12px",
      }}
    >
      <div className="cat-filters">
        {FILTERS.map((f) => {
          const count = f === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === f).length;
          return (
            <button className={`cat-filter${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f}
              {" ("}
              {count}
              {")"}
            </button>
          );
        })}
      </div>
      <div className="cat-grid">
        {items.map((p) => (
          <div className="cat-item">
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
              <div className="cat-price">{p.price}</div>
              <div className="cat-stock">{p.stock}</div>
              <button
                className="cat-buy"
                onClick={() => showToast(`Opening WhatsApp checkout for ${p.name} \u2713`)}
              >
                Checkout via WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}