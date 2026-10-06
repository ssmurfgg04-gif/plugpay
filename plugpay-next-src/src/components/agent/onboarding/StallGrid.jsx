"use client";

export function StallGrid({
  stalls,
  renderCell,
  onStallClick,
  cellMinWidth = 52,
  maxHeight = 320,
  emptyMessage = "No stalls on this floor yet.",
}) {
  if (stalls.length === 0) {
    return <div className="stall-grid-empty">{emptyMessage}</div>;
  }
  const scrollable = stalls.length > 24;
  return (
    <div
      className={`stall-grid-scroll${scrollable ? " scroll" : ""}`}
      style={
        scrollable
          ? {
              maxHeight,
            }
          : void 0
      }
    >
      <div
        className="stall-grid"
        style={{
          ["--stall-min"]: `${cellMinWidth}px`,
        }}
      >
        {stalls.map((s) => {
          var _a;
          const cell = renderCell(s);
          const active = (_a = cell.clickable) != null ? _a : Boolean(onStallClick);
          return (
            <div
              key={s.id}
              className={`sg-cell${cell.className ? ` ${cell.className}` : ""}${active ? "" : " sg-static"}`}
              style={cell.style}
              title={cell.title}
              onClick={active ? () => (onStallClick == null ? void 0 : onStallClick(s)) : void 0}
            >
              {cell.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}