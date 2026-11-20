"use client";

import { useRef } from "react";
import { useSellerProfileForm } from "@/lib/seller";

var docFields = [
  { key: "idfront", name: "ID Front", icon: "\u{1FAAA}" },
  { key: "idback", name: "ID Back", icon: "\u{1FAAA}" },
  { key: "selfie", name: "Selfie", icon: "\u{1F933}" },
  { key: "biz", name: "Business License", icon: "\u{1F4C4}" },
  { key: "kra", name: "KRA PIN Certificate", icon: "\u{1F9FE}" },
];

export function SellerProfileCompliance() {
  var f = useSellerProfileForm(),
    pp = f.pp;
  var inputsRef = useRef({});

  var compressImage = function (file, cb) {
    if (!file.type.startsWith("image/")) { cb(file); return; }
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      URL.revokeObjectURL(url);
      var max = 1280;
      var w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w >= h) { h = Math.round((h * max) / w); w = max; }
        else { w = Math.round((w * max) / h); h = max; }
      }
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(function (blob) {
        if (!blob || blob.size >= file.size) { cb(file); return; }
        cb(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
      }, "image/webp", 0.82);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(file); };
    img.src = url;
  };

  var handleUpload = function (docKey, name, file) {
    if (!file) return;
    pp.setDocStatus(function (s) {
      return Object.assign({}, s, { [docKey]: "uploading" });
    });
    compressImage(file, function (compressed) {
      var formData = new FormData();
      formData.append("file", compressed);
      formData.append("docKey", docKey);
    fetch("/api/upload", { method: "POST", body: formData })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res || res.ok === false) {
          pp.setDocStatus(function (s) {
            return Object.assign({}, s, { [docKey]: "idle" });
          });
          pp.showToast("Upload failed: " + ((res && res.error) || "Unknown error"), "error");
          return;
        }
        pp.setDocStatus(function (s) {
          return Object.assign({}, s, { [docKey]: "done" });
        });
        pp.showToast(name + " uploaded successfully ✓");
      })
      .catch(function () {
        pp.setDocStatus(function (s) {
          return Object.assign({}, s, { [docKey]: "idle" });
        });
        pp.showToast("Upload failed — please try again", "error");
      });
    });
  };

  return (
    <div className="tp-card" style={{ padding: 13 }}>
      <div className="tp-section-title">Compliance Documents</div>
      <div className="tp-section-body" style={{ marginBottom: 10 }}>
        Kept on file for your own records — your landlord doesn’t review these. Your Landlord Verified badge comes from your landlord confirming you occupy your stall.
      </div>
      {docFields.map(function (d) {
        var st = pp.docStatus[d.key];
        return (
          <div key={d.key} className="sp-doc-row">
            <div style={{ flex: 1 }}>
              <div className="tp-doc-label">{(d.icon || "") + " " + d.name}</div>
              <div className="tp-doc-badge" style={{ marginTop: 4 }}>
                {st === "done" ? "✓ Uploaded" : st === "uploading" ? "Uploading…" : "Not uploaded"}
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              style={{ display: "none" }}
              ref={function (el) {
                inputsRef.current[d.key] = el;
              }}
              onChange={function (e) {
                var file = e.target.files && e.target.files[0];
                handleUpload(d.key, d.name, file);
                e.target.value = "";
              }}
            />
            <button
              className="sp-edit-btn"
              type="button"
              disabled={st === "uploading"}
              onClick={function () {
                var input = inputsRef.current[d.key];
                if (input) input.click();
              }}
            >
              {st === "done" ? "Replace" : "Upload"}
            </button>
          </div>
        );
      })}
    </div>
  );
}