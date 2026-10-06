"use client";

import { useState } from "react";

export function EditRow(props) {
  var _e = useState(false),
    editing = _e[0],
    setEditing = _e[1];
  var _v = useState(props.value),
    val = _v[0],
    setVal = _v[1];
  function start() {
    setVal(props.editValue != null ? props.editValue : props.value);
    setEditing(true);
  }
  function save() {
    var v = String(val).trim();
    if (props.required && !v) return;
    props.onSave(v);
    setEditing(false);
  }
  var Tag = props.options ? "select" : props.multiline ? "textarea" : "input";
  return (
    <div
      className="tp-info-row"
      style={
        props.last
          ? {
              border: "none",
            }
          : undefined
      }
    >
      {props.icon && (
        <div
          className="tp-info-ico"
          style={{
            background: props.bg || "#f8f1f7",
          }}
        >
          <span>{props.icon}</span>
        </div>
      )}
      <div
        className="tp-info-text"
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div className="tp-info-label">{props.label}</div>
        {editing ? (
          <div>
            <Tag
              className="plc-input"
              style={{
                marginTop: 6,
                minHeight: props.multiline ? 84 : undefined,
              }}
              value={val}
              autoFocus={true}
              type={props.inputType}
              inputMode={props.inputMode}
              onChange={function (e) {
                setVal(e.target.value);
              }}
            >
              {props.options
                ? [
                    <option key="_" value="">
                      {"Select\u2026"}
                    </option>,
                  ].concat(
                    props.options.map(function (o) {
                      return (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      );
                    }),
                  )
                : undefined}
            </Tag>
            <div className="sp-edit-actions">
              <button className="sp-edit-btn on" onClick={save}>
                Save
              </button>
              <button
                className="sp-edit-btn"
                onClick={function () {
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="tp-info-val"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {props.value || (
              <span
                style={{
                  color: "var(--muted)",
                }}
              >
                Not set
              </span>
            )}
          </div>
        )}
      </div>
      {!editing &&
        (props.locked ? (
          <span className="sp-lock" title={props.lockNote || "Managed by PlugPay"}>
            {"\uD83D\uDD12 " + (props.lockNote || "Locked")}
          </span>
        ) : (
          <button className="sp-edit-btn" onClick={start}>
            {"\u270F\uFE0F Edit"}
          </button>
        ))}
    </div>
  );
}