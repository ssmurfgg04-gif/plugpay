"use client";

import { usePlugPay } from "@/store/context";
import { PublicShellX } from "@/components/layout/PublicShellX";
import { EmptyState } from "@/components/ui/EmptyState";

export function SearchPage() {
  var pp = usePlugPay();
  return (
    <PublicShellX
      title="Search PlugPay"
      subtitle="Find a verified seller or a connected commercial building."
    >
      <div className="public-content">
        <div className="public-search-box">
          <div className="public-search-row">
            <input
              className="pp-input"
              value={pp.query}
              onChange={function (e) {
                pp.setQuery(e.target.value);
              }}
              placeholder="Search seller, business or building"
              onKeyDown={function (e) {
                if (e.key === "Enter") pp.doSearch();
              }}
            />
            <button
              className="pp-btn primary"
              onClick={function () {
                pp.doSearch();
              }}
            >
              Search
            </button>
          </div>
        </div>
        {pp.resultsShown && <div className="public-count">{pp.resultsMeta}</div>}
        <div className="public-result-grid">
          {pp.shownResults.map(function (r, i) {
            return (
              <div
                className="public-result"
                key={i}
                style={{
                  cursor: "pointer",
                }}
                onClick={function () {
                  if (r.type === "merchant") pp.viewSellerProfile();
                  else pp.openBuildingModal(r.name);
                }}
              >
                <div className="public-result-title">{r.name}</div>
                <div className="public-result-meta">{r.sub}</div>
              </div>
            );
          })}
        </div>
        {pp.resultsShown && pp.shownResults.length === 0 && (
          <EmptyState
            icon="search"
            title="No matches found"
            sub="Try a different seller, business or building name."
          />
        )}
      </div>
    </PublicShellX>
  );
}