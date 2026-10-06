"use client";

import { useEffect } from "react";
import { usePlugPay } from "@/store/context";

/* ---- Shared UI kit (shells, modals, skeletons, empty and error states, toast) ---- */
/* ---- Shared UI kit (shells, modals, skeletons, empty and error states, toast) ---- */
export function Modal({
  id,
  onExit,
  innerClassName = "modal",
  closeButtonStyle,
  hideCloseButton = false,
  children,
}) {
  const { isOpen, closeModal, openModals } = usePlugPay();
  const open = isOpen(id);
  const stackIndex = openModals.indexOf(id);
  const zIndex = 1e3 + (stackIndex >= 0 ? stackIndex : 0);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  function handleClose() {
    closeModal(id);
    if (onExit) onExit();
  }
  return (
    <div
      className={`modal-overlay${open ? " on" : ""}`}
      id={id}
      style={{
        zIndex,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={innerClassName}>
        {!hideCloseButton && (
          <div className="modal-bar">
            <button className="modal-back" style={closeButtonStyle} onClick={handleClose} aria-label="Back">
              {"\u2190"}
            </button>
            <button className="modal-close" style={closeButtonStyle} onClick={handleClose} aria-label="Close">
              {"\u2715"}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}