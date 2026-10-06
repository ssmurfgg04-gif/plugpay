"use client";

import { Link } from "@/components/ui/Link";

export function BottomNav(props) {
  return (
    <nav className={props.className} aria-label={props.label} style={props.style}>
      {props.items.map(function (it) {
        var cls = props.itemClass + (props.active === it[0] ? " on" : "");
        return props.onSelect ? (
          <button
            key={it[0]}
            type="button"
            className={cls}
            onClick={function () {
              props.onSelect(it[0], it);
            }}
          >
            {it[1]}
          </button>
        ) : (
          <Link key={it[0]} to={it[2]} className={cls}>
            {it[1]}
          </Link>
        );
      })}
    </nav>
  );
}