"use client";

import { readImage } from "@/lib/readImage";
import { useRef, useState } from "react";
import { usePlugPay } from "@/store/context";
import { floorLabel } from "@/lib/shared";
import { Ic } from "@/components/ui/Ic";

export function StallSellerCard(props) {
  var pp = usePlugPay();
  var ex = pp.obNewExtra || {};
  var setEx = function (k, v) {
    var n = Object.assign({}, ex);
    n[k] = v;
    pp.setObNewExtra(n);
  };
  var field = function (label, val, on, ph, type) {
    return (
      <div className="ob-field">
        <label className="ob-label">{label}</label>
        <input
          className="ob-input"
          type={type || "text"}
          placeholder={ph}
          value={val || ""}
          onChange={function (e) {
            on(e.target.value);
          }}
        />
      </div>
    );
  };
  var pm = pp.obPayMethod;
  var photos = ex.photos || [];
  var fileRef = useRef(null);
  var _pe = useState(""),
    phErr = _pe[0],
    setPhErr = _pe[1];
  var _pb = useState(false),
    photoBusy = _pb[0],
    setPhotoBusy = _pb[1];
  function addPhotos(fl) {
    var list = Array.prototype.slice.call(fl || []);
    if (!list.length) return;
    var room = 6 - photos.length;
    if (room <= 0) {
      setPhErr("Maximum 6 photos. Remove one to add another.");
      return;
    }
    var notImg = list.filter(function (f) {
      return !/^image\//.test(f.type);
    });
    var big = list.filter(function (f) {
      return /^image\//.test(f.type) && f.size > 8 * 1024 * 1024;
    });
    var ok = list.filter(function (f) {
      return /^image\//.test(f.type) && f.size <= 8 * 1024 * 1024;
    });
    var msg = [];
    if (notImg.length) msg.push(notImg.length + " file(s) skipped: only JPG or PNG images are allowed.");
    if (big.length) msg.push(big.length + " photo(s) skipped: larger than 8 MB.");
    if (ok.length > room) {
      msg.push("Only " + room + " more photo(s) fit; extras were skipped.");
      ok = ok.slice(0, room);
    }
    setPhErr(msg.join(" "));
    if (!ok.length) return;
    setPhotoBusy(true);
    var got = [],
      failed = 0,
      done = 0;
    ok.forEach(function (f, idx) {
      try {
        readImage(f, function (d) {
          if (d) got[idx] = d;
          else failed++;
          if (++done === ok.length) fin();
        });
      } catch (err) {
        failed++;
        if (++done === ok.length) fin();
      }
    });
    function fin() {
      setPhotoBusy(false);
      var add = got.filter(Boolean);
      if (failed)
        setPhErr(
          (msg.length ? msg.join(" ") + " " : "") + failed + " photo(s) could not be read. Try again.",
        );
      if (add.length) setEx("photos", photos.concat(add));
    }
  }
  return (
    <div className="ob-stall-action-card">
      <div className="ob-stall-action-head">
        <span>
          {(props.merchant ? "\u270F\uFE0F Edit seller" : "\u2795 Register seller") +
            " \u2014 " +
            floorLabel(props.action.floor) +
            ", Stall " +
            props.action.stallNum}
        </span>
        <button className="ob-stall-action-close" onClick={props.onClose} aria-label="Close card">
          {"\u2715"}
        </button>
      </div>
      <div className="ob-row-2">
        {field("Business name", pp.obNewBiz, pp.setObNewBiz, "e.g. Jane's Fashion Hub")}
        {field("Owner name", pp.obNewName, pp.setObNewName, "e.g. Jane Mwangi")}
      </div>
      <div className="ob-row-2">
        {field("WhatsApp / Phone", pp.obNewPhone, pp.setObNewPhone, "07XX XXX XXX", "tel")}
        <div className="ob-field">
          <label className="ob-label">Category</label>
          <select
            className="ob-select"
            value={pp.obNewType}
            onChange={function (e) {
              pp.setObNewType(e.target.value);
            }}
          >
            {["Fashion", "Electronics", "Food", "Hardware", "Beauty", "Other"].map(function (o) {
              return <option key={o}>{o}</option>;
            })}
          </select>
        </div>
      </div>
      <details
        className="ob-more"
        open={!!(ex.nid || ex.email || ex.years || ex.payNo || (ex.photos && ex.photos.length))}
      >
        <summary>{"More details \u2014 ID, payment & shop photos (optional)"}</summary>
        <div className="ob-seg">
          <div className="ob-seg-h">{Ic("id-card")}Identity & business</div>
          <div className="ob-row-2">
            {field(
              "National ID",
              ex.nid,
              function (v) {
                setEx("nid", v);
              },
              "e.g. 28456789",
            )}
            {field(
              "Email",
              ex.email,
              function (v) {
                setEx("email", v);
              },
              "merchant@email.com",
              "email",
            )}
          </div>
          {field(
            "Years in business",
            ex.years,
            function (v) {
              setEx("years", v);
            },
            "e.g. 4",
            "number",
          )}
        </div>
        <div className="ob-seg">
          <div className="ob-seg-h">{Ic("credit-card")}Payment information</div>
          <div className="ob-seg-sub">Where this seller receives customer payments.</div>
          <div className="ob-field">
            <label className="ob-label">Payment method</label>
            <select
              className="ob-select"
              value={pm}
              onChange={function (e) {
                pp.setObPayMethod(e.target.value);
              }}
            >
              <option value="till">M-Pesa Till Number</option>
              <option value="paybill">M-Pesa Paybill</option>
              <option value="bank">Bank Account</option>
            </select>
          </div>
          <div className="ob-row-2">
            {field(
              pm === "bank" ? "Account number" : pm === "paybill" ? "Paybill number" : "Till number",
              ex.payNo,
              function (v) {
                setEx("payNo", v);
              },
              "e.g. 5263710",
            )}
            {field(
              pm === "bank" ? "Bank name" : "Registered name",
              ex.payName,
              function (v) {
                setEx("payName", v);
              },
              "As registered",
            )}
          </div>
        </div>
        <div className="ob-seg">
          <div className="ob-seg-h">{Ic("camera")}Shop photos</div>
          <div className="ob-seg-sub">
            Add up to 6 photos of the stall front and stock. Buyers see these on the seller's profile.
          </div>
          {photos.length === 0 && (
            <div className="ph-empty">{Ic("image", 22)}No photos yet. Tap the box below to add some.</div>
          )}
          <div className="ph-grid">
            {photos.map(function (src, i) {
              return (
                <div className="ph-item" key={i}>
                  <img src={src} alt={"Shop photo " + (i + 1)} />
                  <button
                    type="button"
                    className="ph-x"
                    aria-label={"Remove photo " + (i + 1)}
                    onClick={function () {
                      setEx(
                        "photos",
                        photos.filter(function (_, k) {
                          return k !== i;
                        }),
                      );
                      setPhErr("");
                    }}
                  >
                    {Ic("x", 12)}
                  </button>
                </div>
              );
            })}
            {photos.length < 6 && (
              <button
                type="button"
                className="ph-add"
                onClick={function () {
                  fileRef.current && fileRef.current.click();
                }}
              >
                {Ic("image-plus")}
                {photoBusy ? "Adding\u2026" : "Add photo"}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple={true}
            style={{
              display: "none",
            }}
            onChange={function (e) {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="ph-count">{photos.length + " / 6 photos"}</div>
          {phErr && (
            <div className="field-err" role="alert">
              {Ic("triangle-alert", 13)}
              {phErr}
            </div>
          )}
        </div>
        <div className="ob-doc-note">
          A claim link is sent to the WhatsApp number above the moment you register the seller. It opens the
          sign-in page; documents are added by the seller after they claim.
        </div>
      </details>
      <div className="ob-stall-action-row">
        <button className="ob-add-merchant-btn" onClick={props.onSave}>
          {props.merchant ? "\uD83D\uDCBE Save changes" : "\uFF0B Register seller"}
        </button>
        {props.merchant && (
          <button
            className="ob-stall-action-profile"
            onClick={function () {
              pp.viewStallProfile(
                {
                  id: props.action.stallNum,
                  n: props.merchant.biz,
                  s: "v",
                },
                props.action.floor,
                pp.obBldgName || "New building",
                props.merchant,
              );
            }}
          >
            {Ic("user", 14)}Profile
          </button>
        )}
        {props.merchant && (
          <button className="ob-stall-action-remove" onClick={props.onRemove}>
            {Ic("trash-2", 14)}Remove
          </button>
        )}
      </div>
    </div>
  );
}