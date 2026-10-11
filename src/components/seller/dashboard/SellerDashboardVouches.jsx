"use client";

import { usePlugPay } from "@/store/context";
import { usePersisted } from "@/lib/shared";

// The prototype pre-seeded three fake people (ids v1/v2/u1). Filter them out
// at render time; the next list write replaces the stored value without them.
var LEGACY_SEED_IDS = ["v1", "v2", "u1"];

export function SellerDashboardVouches() {
  var pp = usePlugPay();
  var _v = usePersisted("vouches", {
      people: [],
    }),
    state = _v[0],
    setState = _v[1];
  var people = (state.people || []).filter(function (x) {
    return LEGACY_SEED_IDS.indexOf(x.id) < 0;
  });
  function setVouch(id, value) {
    setState({
      people: people.map(function (x) {
        return x.id === id
          ? Object.assign({}, x, {
              vouched: value,
            })
          : x;
      }),
    });
    var who = people.filter(function (x) {
      return x.id === id;
    })[0];
    if (who)
      pp.showToast(value ? "You vouched for " + who.name + " \u2713" : "Vouch removed for " + who.name);
  }
  function col(title, list, mark, cls, empty) {
    return (
      <div className="sp-vouch-column">
        <div className="sp-vouch-heading">{title + " (" + list.length + ")"}</div>
        {list.map(function (x) {
          return (
            <div className="sp-vouch-person" key={x.id}>
              <span className={cls}>{mark}</span>
              <div className="sp-vouch-who">
                <strong>{x.name}</strong>
                <small>{x.role}</small>
              </div>
              {x.vouched ? (
                <button
                  type="button"
                  className="sp-edit-btn danger"
                  onClick={function () {
                    setVouch(x.id, false);
                  }}
                >
                  Remove vouch
                </button>
              ) : (
                <button
                  type="button"
                  className="sp-edit-btn on"
                  onClick={function () {
                    setVouch(x.id, true);
                  }}
                >
                  Vouch
                </button>
              )}
            </div>
          );
        })}
        {list.length === 0 && <small className="sp-vouch-empty">{empty}</small>}
      </div>
    );
  }
  return (
    <div className="dx-card">
      <div className="dx-head">
        <div
          className="dx-k"
          style={{
            margin: 0,
          }}
        >
          Vouching
        </div>
        <span className="dx-chip ok">
          {people.filter(function (x) {
            return x.vouched;
          }).length + " vouched"}
        </span>
      </div>
      <section className="sp-vouch-summary">
        {col(
          "Vouched sellers",
          people.filter(function (x) {
            return x.vouched;
          }),
          "\u2713",
          "sp-vouch-check",
          "No vouched sellers yet.",
        )}
        {col(
          "Yet to be vouched",
          people.filter(function (x) {
            return !x.vouched;
          }),
          "\u2022",
          "sp-vouch-pending",
          "Everyone is vouched.",
        )}
      </section>
    </div>
  );
}