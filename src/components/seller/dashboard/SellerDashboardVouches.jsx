"use client";

import { usePlugPay } from "@/store/context";
import { usePersisted } from "@/lib/shared";

export function SellerDashboardVouches() {
  var pp = usePlugPay();
  var _v = usePersisted("vouches", {
      people: [
        {
          id: "v1",
          name: "Peter Otieno",
          role: "Electronics seller",
          vouched: true,
        },
        {
          id: "v2",
          name: "Amina Kibe",
          role: "Fashion seller",
          vouched: true,
        },
        {
          id: "u1",
          name: "Samuel Kamau",
          role: "Mobile accessories",
          vouched: false,
        },
      ],
    }),
    state = _v[0],
    setState = _v[1];
  var people = state.people || [];
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