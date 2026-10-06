"use client";

import { usePlugPay } from "@/store/context";
import { ResultCard } from "@/components/search/ResultCard";

export function ResultsSection() {
  const {
    resultsShown,
    resultsTitle,
    resultsMeta,
    shownResults,
    hasMore,
    moreHint,
    filter,
    setFilter,
    loadMore,
  } = usePlugPay();
  return (
    <div className={`results-section results-container${resultsShown ? " on" : ""}`} id="results-section">
      <div className="results-inner">
        <div className="results-header">
          <div>
            <div className="results-title" id="results-title">
              {resultsTitle}
            </div>
            <div className="results-meta" id="results-meta">
              {resultsMeta}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button className={`rf${filter === "all" ? " on" : ""}`} onClick={() => setFilter("all")}>
              All
            </button>
            <button
              className={`rf${filter === "merchant" ? " on" : ""}`}
              onClick={() => setFilter("merchant")}
            >
              Merchants
            </button>
            <button
              className={`rf${filter === "building" ? " on" : ""}`}
              onClick={() => setFilter("building")}
            >
              Buildings
            </button>
          </div>
        </div>
        <div className="results-grid" id="results-grid">
          {shownResults.map((r, i) => (
            <ResultCard result={r} />
          ))}
        </div>
        <div
          className="load-more-wrap"
          id="load-more-wrap"
          style={{
            display: hasMore ? "block" : "none",
          }}
        >
          <button className="load-more-btn" onClick={() => loadMore()}>
            {"Show more results \u2192"}
          </button>
          <div className="load-more-hint" id="load-more-hint">
            {hasMore ? moreHint : ""}
          </div>
        </div>
      </div>
    </div>
  );
}