"use client";

var PUBLIC_SELLER_TABS = [
  ["profile", "Profile"],
  ["catalogue", "Catalogue"],
  ["reviews", "Reviews"],
  ["building", "Building"],
];

export function PublicSellerBottomNavigation(props) {
  return (
    <nav className="public-seller-bottom-navigation">
      {PUBLIC_SELLER_TABS.map(function (tab) {
        return (
          <button
            key={tab[0]}
            type="button"
            className={"public-seller-bottom-item" + (props.active === tab[0] ? " active" : "")}
            onClick={function () {
              props.onChange(tab[0]);
            }}
          >
            {tab[1]}
          </button>
        );
      })}
    </nav>
  );
}