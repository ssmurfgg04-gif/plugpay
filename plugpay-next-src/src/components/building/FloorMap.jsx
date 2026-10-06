"use client";

import { StallGrid } from "@/components/agent/onboarding/StallGrid";
import { stallClass, stallNameClass } from "@/lib/building";

export function FloorMap(props) {
  return (
    <div className={props.className}>
      {props.title && <div className={props.titleClass}>{props.title}</div>}
      {props.subtitle && <div className={props.subtitleClass}>{props.subtitle}</div>}
      <div className="bldg-floor-tabs">
        {props.tabs.map(function (f) {
          return (
            <button
              key={f.key}
              className={"bft" + (props.floor === f.key ? " on" : "")}
              onClick={function () {
                props.onFloorChange(f.key);
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <StallGrid
        stalls={props.floors[props.floor] || []}
        onStallClick={props.onStallSelect}
        renderCell={function (st) {
          return {
            className: stallClass[st.s],
            clickable: props.isClickable(st),
            title: props.stallTitle(st),
            label: <span className={stallNameClass[st.s]}>{st.id}</span>,
          };
        }}
      />
      {props.footer}
    </div>
  );
}