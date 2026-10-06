"use client";

import { Ic } from "@/components/ui/Ic";

export function DocItems(props) {
  return (
    <div className="doc-sec">
      <div className="doc-sec-h">{Ic("package", 13)}Products sold</div>
      {props.items.map(function (it, i) {
        var unit = it.unit || (it.qty ? it.price / it.qty : it.price);
        return (
          <div className="doc-item" key={i}>
            <div>
              <div className="doc-item-name">{it.name}</div>
              {it.qty > 1 && (
                <div className="doc-item-sub">{it.qty + " \u00d7 KSh " + Number(unit).toLocaleString()}</div>
              )}
            </div>
            <div className="doc-item-amt">{"KSh " + Number(it.price).toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}