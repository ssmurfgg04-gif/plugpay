"use client";

import { readImage } from "@/lib/readImage";
import { useRef, useState } from "react";

/* ---- Catalogue tab ---- */
/* ---- Catalogue tab ---- */
export function ProductForm(props) {
  var init = props.initial || {
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  };
  var _s = useState(init),
    f = _s[0],
    setF = _s[1];
  var fileRef = useRef(null);
  function set(k, v) {
    var n = {};
    n[k] = v;
    setF(Object.assign({}, f, n));
  }
  return (
    <div
      className="tp-card"
      style={{
        padding: 13,
      }}
    >
      <div className="tp-section-title">{props.title}</div>
      <div className="sp-img-up">
        <div
          className="sp-img-prev"
          onClick={function () {
            fileRef.current && fileRef.current.click();
          }}
        >
          {f.image ? (
            <img
              src={f.image}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span>
              {"\uD83D\uDCF7"}
              <br />
              Upload photo
            </span>
          )}
        </div>
        <div
          style={{
            flex: 1,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{
              display: "none",
            }}
            onChange={function (e) {
              var file = e.target.files && e.target.files[0];
              if (file)
                readImage(file, function (d) {
                  set("image", d);
                });
              e.target.value = "";
            }}
          />
          <button
            className="sp-edit-btn on"
            onClick={function () {
              fileRef.current && fileRef.current.click();
            }}
          >
            {f.image ? "Change image" : "Upload image"}
          </button>
          {f.image && (
            <button
              className="sp-edit-btn"
              style={{
                marginLeft: 8,
              }}
              onClick={function () {
                set("image", "");
              }}
            >
              Remove image
            </button>
          )}
          <div
            className="tp-section-body"
            style={{
              marginTop: 6,
            }}
          >
            JPG or PNG. Shown to buyers on your catalogue.
          </div>
        </div>
      </div>
      <label
        className="plc-field"
        style={{
          display: "block",
          marginBottom: 10,
        }}
      >
        <span className="plc-label">Product name</span>
        <input
          className="plc-input"
          value={f.name}
          onChange={function (e) {
            set("name", e.target.value);
          }}
          placeholder="e.g. Samsung Galaxy A15"
        />
      </label>
      <div className="sp-two">
        <label className="plc-field">
          <span className="plc-label">Price (KSh)</span>
          <input
            className="plc-input"
            type="number"
            min={1}
            value={f.price}
            onChange={function (e) {
              set("price", e.target.value);
            }}
          />
        </label>
        <label className="plc-field">
          <span className="plc-label">Stock</span>
          <input
            className="plc-input"
            type="number"
            min={0}
            value={f.stock}
            onChange={function (e) {
              set("stock", e.target.value);
            }}
          />
        </label>
      </div>
      <label
        className="plc-field"
        style={{
          display: "block",
          margin: "10px 0",
        }}
      >
        <span className="plc-label">Category</span>
        <input
          className="plc-input"
          value={f.category}
          onChange={function (e) {
            set("category", e.target.value);
          }}
          placeholder="e.g. Phones"
        />
      </label>
      <div className="sp-edit-actions">
        <button
          className="sp-edit-btn on"
          onClick={function () {
            props.onSubmit(f);
          }}
        >
          {props.submitLabel}
        </button>
        <button className="sp-edit-btn" onClick={props.onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}