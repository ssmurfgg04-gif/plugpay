"use client";

export function LandlordSellerList(props) {
  return (
    <section className="ll-status-card">
      <div className="ll-section-title">{props.title}</div>
      <div className="ll-section-sub">{props.subtitle}</div>
      <div className="ll-seller-list">
        {props.items.map(function (seller) {
          return (
            <div className="ll-seller-row" key={seller.id}>
              <div
                className="ll-seller-avatar"
                style={
                  seller.color
                    ? {
                        background: seller.color,
                        color: "#fff",
                      }
                    : undefined
                }
              >
                {seller.initials || seller.name.charAt(0)}
              </div>
              <div className="ll-seller-info">
                <strong>{seller.name}</strong>
                <span>{seller.sub}</span>
              </div>
              <button
                className="sp-edit-btn"
                onClick={function () {
                  if (props.action) props.action(seller);
                }}
              >
                {props.actionLabel}
              </button>
            </div>
          );
        })}
        {props.items.length === 0 && <div className="ll-empty">{props.empty}</div>}
      </div>
    </section>
  );
}