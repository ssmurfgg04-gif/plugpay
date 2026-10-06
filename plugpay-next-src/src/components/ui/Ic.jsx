"use client";

import { ppIcon } from "@/lib/icons";

export function Ic(name, size) {
  return (
    <span
      className="pp-ic"
      style={
        size
          ? {
              width: size,
              height: size,
            }
          : undefined
      }
      dangerouslySetInnerHTML={{
        __html: ppIcon(name),
      }}
    />
  );
}