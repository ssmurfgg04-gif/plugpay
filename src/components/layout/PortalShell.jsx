"use client";

// Page frame used by the seller / agent / landlord portals: sticky header, body, optional dock + bottom nav.
export function PortalShell(p) {
  const inner = (
    <>
      <div className="sp-sticky">{p.header}</div>
      {p.body}
      {p.dock}
      {p.nav}
    </>
  );
  if (p.wrapClass) {
    return (
      <div className={p.shellClass}>
        <div className={p.wrapClass}>{inner}</div>
      </div>
    );
  }
  return <div className={p.shellClass}>{inner}</div>;
}