"use client";

import { usePlugPay } from "@/store/context";

export function SearchBar() {
  const { searchMode, setSearchMode, query, setQuery, doSearch } = usePlugPay();
  return (
    <div className="hero-search-box search-wrap">
      <div className="hsb-tabs">
        <div
          className={`hsb-tab${searchMode === "merchant" ? " on" : ""}`}
          onClick={() => setSearchMode("merchant")}
        >
          {"\u{1F3EC} Find a merchant"}
        </div>
        <div
          className={`hsb-tab${searchMode === "building" ? " on" : ""}`}
          onClick={() => setSearchMode("building")}
        >
          {"\u{1F3E2} Find a building"}
        </div>
      </div>
      <div className="hsb-input-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8ca0" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          id="heroSearch"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchMode === "merchant"
              ? "e.g. Jane Mwangi, Zawadi Fashion, electronics\u2026"
              : "e.g. Anniversary Towers, Lonrho House\u2026"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
        />
        <button className="hsb-btn" onClick={() => doSearch()}>
          {"Search \u2192"}
        </button>
      </div>
    </div>
  );
}