"use client";

import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { Ic } from "@/components/ui/Ic";

export function ItemRowsField(props) {
  var prefix = props.prefix,
    pp = usePlugPay();
  var items = pp.rsItems,
    cat = pp.catalogueItems,
    isReceipt = true;
  var listId = "cat-names-" + prefix;
  function patch(row, p) {
    pp.updateItemRow(prefix, row.id, p);
  }
  function fromProduct(row, p, qty) {
    patch(row, {
      productId: p.id,
      name: p.name,
      unit: String(p.price),
      qty: qty,
      price: String(Number(p.price) * qty),
      category: p.category,
    });
  }
  function pick(row, id) {
    if (!id) {
      patch(row, {
        productId: "",
        category: "",
      });
      return;
    }
    var p = cat.filter(function (x) {
      return x.id === id;
    })[0];
    if (p) fromProduct(row, p, Math.max(1, Number(row.qty) || 1));
  }
  function setName(row, v) {
    var m = cat.filter(function (x) {
      return x.name.toLowerCase() === v.trim().toLowerCase();
    })[0];
    if (m) {
      fromProduct(row, m, Math.max(1, Number(row.qty) || 1));
      return;
    }
    var linked =
      row.productId &&
      cat.filter(function (x) {
        return x.id === row.productId && x.name === v;
      })[0];
    patch(row, {
      name: v,
      productId: linked ? row.productId : "",
      category: linked ? row.category : "",
    });
  }
  function setQty(row, v) {
    var q = Math.max(1, parseInt(v, 10) || 1);
    var u = Number(row.unit) || 0;
    patch(row, {
      qty: q,
      price: u ? String(u * q) : row.price,
    });
  }
  function setUnit(row, v) {
    var q = Number(row.qty) || 1;
    patch(row, {
      unit: v,
      price: v === "" ? "" : String((Number(v) || 0) * q),
    });
  }
  return (
    <div className="plc-field">
      <label className="plc-label">Products / Services</label>
      {cat.length === 0 ? (
        <div className="icf-hint">
          {Ic("package")}
          <span>
            {"Your catalogue is empty. "}
            <Link to="/seller/catalogue">Add products</Link>
            {" to autofill items here."}
          </span>
        </div>
      ) : (
        <div className="icf-hint">
          {Ic("zap")}
          <span>
            Pick a product from your catalogue to autofill the name and price. This also keeps your sales
            analytics and stock accurate.
          </span>
        </div>
      )}
      <datalist id={listId}>
        {cat.map(function (c) {
          return <option key={c.id} value={c.name} />;
        })}
      </datalist>
      {items.map(function (row) {
        var p = row.productId
          ? cat.filter(function (x) {
              return x.id === row.productId;
            })[0]
          : null;
        var over = isReceipt && p && (Number(row.qty) || 1) > p.stock;
        var line = Number(row.price) || 0;
        return (
          <div key={row.id} className={"icf-row" + (p ? " linked" : "")}>
            <select
              className="plc-input"
              value={row.productId || ""}
              onChange={function (e) {
                pick(row, e.target.value);
              }}
              aria-label="Catalogue product"
            >
              <option value="">{cat.length ? "Custom item (type below)" : "No catalogue products"}</option>
              {cat.map(function (c) {
                return (
                  <option key={c.id} value={c.id} disabled={isReceipt && c.stock <= 0}>
                    {c.name +
                      " \u2014 KSh " +
                      Number(c.price).toLocaleString() +
                      (c.stock <= 0 ? " (out of stock)" : " (" + c.stock + " in stock)")}
                  </option>
                );
              })}
            </select>
            <div className="icf-line">
              <input
                className="plc-input icf-name"
                type="text"
                list={listId}
                placeholder="Item name"
                value={row.name}
                onChange={function (e) {
                  setName(row, e.target.value);
                }}
              />
              <input
                className="plc-input icf-qty"
                type="number"
                min={1}
                step={1}
                title="Quantity"
                aria-label="Quantity"
                value={row.qty == null ? 1 : row.qty}
                onChange={function (e) {
                  setQty(row, e.target.value);
                }}
              />
              <input
                className="plc-input icf-unit"
                type="number"
                min={1}
                placeholder="Unit KSh"
                title="Unit price"
                aria-label="Unit price"
                value={row.unit == null ? "" : row.unit}
                onChange={function (e) {
                  setUnit(row, e.target.value);
                }}
              />
              <div className="icf-total">{"KSh " + line.toLocaleString()}</div>
              <button
                type="button"
                className="plc-item-remove"
                onClick={function () {
                  pp.removeItemRow(prefix, row.id);
                }}
                title="Remove item"
                aria-label="Remove item"
                style={{
                  visibility: items.length > 1 ? "visible" : "hidden",
                }}
              >
                {"\u2715"}
              </button>
            </div>
            {p && !over && (
              <div className="icf-tag">
                {Ic("link", 12)}
                {"Linked to catalogue \u00b7 " + p.category + " \u00b7 " + p.stock + " in stock"}
              </div>
            )}
            {over && (
              <div className="field-err">
                {Ic("triangle-alert", 13)}
                {"Only " + p.stock + " in stock. Reduce the quantity."}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="plc-add-item"
        onClick={function () {
          pp.addItemRow(prefix);
        }}
      >
        {"\uFF0B Add another item"}
      </button>
    </div>
  );
}