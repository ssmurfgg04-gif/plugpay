"use client";

import { Link } from "@/components/ui/Link";
import { Ic } from "@/components/ui/Ic";

export function EmptyState(props) {
  var act = props.action;
  return (
    <div className="es" role="status">
      <div className="es-ic">{Ic(props.icon || "inbox")}</div>
      <div className="es-t">{props.title}</div>
      {props.sub && <div className="es-s">{props.sub}</div>}
      {act &&
        (act.to ? (
          <Link to={act.to} className="es-btn">
            {Ic("plus")}
            {act.label}
          </Link>
        ) : (
          <button className="es-btn" onClick={act.onClick}>
            {Ic("plus")}
            {act.label}
          </button>
        ))}
    </div>
  );
}