import { useEffect, useState } from "react";

/* ---- Shared helpers ---- */
export function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function floorLabel(floorKey) {
  return floorKey === "G" ? "Ground" : `Floor ${floorKey}`;
}

export function appBase() {
  try {
    return window.location.origin;
  } catch (e) {
    return "";
  }
}

export function codeOf(c) {
  return String(c || "").replace("#", "");
}

export function relTime(iso) {
  var d = Date.now() - new Date(iso).getTime(),
    m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  if (m < 1440) return Math.floor(m / 60) + "h ago";
  return new Date(iso).toLocaleDateString();
}

/* ---- Store: single source of truth, split into one section per group ---- */
/* ---- Store: single source of truth, split into one section per group ---- */
export function usePersisted(key, initial) {
  // pp7: namespace bumped from pp6 to leave any pre-email-auth local demo
  // data behind. Fresh devices and returning users start clean.
  var k = "pp7:" + key;
  var st = useState(function () {
    try {
      var raw = window.localStorage.getItem(k);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return typeof initial === "function" ? initial() : initial;
  });
  useEffect(
    function () {
      try {
        window.localStorage.setItem(k, JSON.stringify(st[0]));
      } catch (e) {}
    },
    [st[0]],
  );
  useEffect(function () {
    function on(e) {
      if (e.key === k && e.newValue) {
        try {
          st[1](JSON.parse(e.newValue));
        } catch (err) {}
      }
    }
    window.addEventListener("storage", on);
    return function () {
      window.removeEventListener("storage", on);
    };
  }, []);
  return st;
}