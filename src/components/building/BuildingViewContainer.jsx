"use client";

import { merchants } from "@/lib/public";
import { usePlugPay } from "@/store/context";
import { buildings, ppResolveBuilding } from "@/lib/building";
import { BuildingView } from "@/components/building/BuildingView";

function resolvePublicStallSeller(stall) {
  if (stall && stall.n && String(stall.n).trim()) return null;
  return {
    biz: "Wanjiku Electronics",
    ownerName: "Jane Wanjiku",
    type: "Electronics",
    phone: "",
    status: "done",
  };
}

function ppBuildingMerchants(name) {
  return merchants
    .filter(function (m) {
      return String(m.sub).indexOf(name) > -1;
    })
    .map(function (m) {
      var parts = String(m.sub).split(" \u00B7 ");
      return {
        initials: m.initials,
        color: m.color,
        name: m.name,
        sub: parts
          .filter(function (x) {
            return x !== name;
          })
          .join(" \u00B7 "),
        rating: m.rating,
        rev: m.reviews,
      };
    });
}

var namedFloors = {
  G: [
    {
      id: "G01",
      n: "M-Pesa",
      s: "t",
    },
    {
      id: "G02",
      n: "Newsstand",
      s: "b",
    },
    {
      id: "G03",
      n: "Chemist",
      s: "v",
    },
    {
      id: "G04",
      n: "",
      s: "e",
    },
    {
      id: "G05",
      n: "Shoe Repair",
      s: "b",
    },
    {
      id: "G06",
      n: "Snack Bar",
      s: "v",
    },
    {
      id: "G07",
      n: "",
      s: "e",
    },
    {
      id: "G08",
      n: "Accessories",
      s: "v",
    },
    {
      id: "G09",
      n: "Airtime",
      s: "b",
    },
    {
      id: "G10",
      n: "",
      s: "e",
    },
    {
      id: "G11",
      n: "Bureau",
      s: "v",
    },
    {
      id: "G12",
      n: "",
      s: "e",
    },
  ],
  1: [
    {
      id: "101",
      n: "Wanjiku Fab",
      s: "t",
    },
    {
      id: "102",
      n: "Peter Phones",
      s: "v",
    },
    {
      id: "103",
      n: "",
      s: "e",
    },
    {
      id: "104",
      n: "Ali Hardware",
      s: "b",
    },
    {
      id: "105",
      n: "Grace Beauty",
      s: "v",
    },
    {
      id: "106",
      n: "",
      s: "e",
    },
    {
      id: "107",
      n: "Tom Stat.",
      s: "b",
    },
    {
      id: "108",
      n: "Ropa Fashion",
      s: "v",
    },
    {
      id: "109",
      n: "",
      s: "e",
    },
    {
      id: "110",
      n: "Ken Bags",
      s: "b",
    },
    {
      id: "111",
      n: "",
      s: "e",
    },
    {
      id: "112",
      n: "E. Bureau",
      s: "v",
    },
  ],
  2: [
    {
      id: "201",
      n: "Amina Spices",
      s: "b",
    },
    {
      id: "202",
      n: "David Mutua",
      s: "t",
    },
    {
      id: "203",
      n: "Nafisa Bags",
      s: "v",
    },
    {
      id: "204",
      n: "",
      s: "e",
    },
    {
      id: "205",
      n: "Joyce Tailor",
      s: "b",
    },
    {
      id: "206",
      n: "Ben Watches",
      s: "v",
    },
    {
      id: "207",
      n: "",
      s: "e",
    },
    {
      id: "208",
      n: "Ken Bureau",
      s: "b",
    },
    {
      id: "209",
      n: "M. Printing",
      s: "v",
    },
    {
      id: "210",
      n: "",
      s: "e",
    },
    {
      id: "211",
      n: "Kariuki Shoe",
      s: "b",
    },
    {
      id: "212",
      n: "",
      s: "e",
    },
  ],
  3: [
    {
      id: "301",
      n: "Jane Mwangi",
      s: "v",
    },
    {
      id: "302",
      n: "Peter Otieno",
      s: "v",
    },
    {
      id: "303",
      n: "Amina Kibe",
      s: "b",
    },
    {
      id: "304",
      n: "Sarah W.",
      s: "b",
    },
    {
      id: "305",
      n: "Wanjiku Electronics",
      s: "v",
    },
    {
      id: "306",
      n: "M. Ali",
      s: "v",
    },
    {
      id: "307",
      n: "Rosa Import",
      s: "t",
    },
    {
      id: "308",
      n: "",
      s: "e",
    },
    {
      id: "309",
      n: "Ben Tailor",
      s: "b",
    },
    {
      id: "310",
      n: "",
      s: "e",
    },
    {
      id: "311",
      n: "Eva Cosm.",
      s: "v",
    },
    {
      id: "312",
      n: "",
      s: "e",
    },
  ],
  4: [
    {
      id: "401",
      n: "Rosa Import",
      s: "v",
    },
    {
      id: "402",
      n: "",
      s: "e",
    },
    {
      id: "403",
      n: "Ken Courier",
      s: "b",
    },
    {
      id: "404",
      n: "Liz Cosm.",
      s: "v",
    },
    {
      id: "405",
      n: "",
      s: "e",
    },
    {
      id: "406",
      n: "Victor Pr.",
      s: "b",
    },
    {
      id: "407",
      n: "",
      s: "e",
    },
    {
      id: "408",
      n: "Big Whole.",
      s: "t",
    },
    {
      id: "409",
      n: "",
      s: "e",
    },
    {
      id: "410",
      n: "Ravi Text.",
      s: "b",
    },
    {
      id: "411",
      n: "",
      s: "e",
    },
    {
      id: "412",
      n: "",
      s: "e",
    },
  ],
};

var FILLER_STATUS_CYCLE = ["b", "e", "v", "e", "b", "t", "e", "b", "v", "e"];

var FILLER_STALLS_PER_FLOOR = 42;

function padFloor(floorKey, named) {
  const stalls = [...named];
  const usedNumbers = new Set(named.map((s) => parseInt(s.id.replace(/\D/g, ""), 10)));
  let next = floorKey === "G" ? 1 : parseInt(floorKey, 10) * 100 + 1;
  let i = 0;
  while (stalls.length < FILLER_STALLS_PER_FLOOR) {
    while (usedNumbers.has(next)) next++;
    const status = FILLER_STATUS_CYCLE[i % FILLER_STATUS_CYCLE.length];
    const id = floorKey === "G" ? `G${String(next).padStart(2, "0")}` : String(next);
    stalls.push({
      id,
      n: status === "e" ? "" : `Stall ${id}`,
      s: status,
    });
    usedNumbers.add(next);
    next++;
    i++;
  }
  return stalls;
}

var floors = Object.fromEntries(
  Object.entries(namedFloors).map(([key, named]) => [key, padFloor(key, named)]),
);

var FLOOR_TABS = [
  {
    key: "G",
    label: "Ground",
  },
  {
    key: "1",
    label: "Floor 1",
  },
  {
    key: "2",
    label: "Floor 2",
  },
  {
    key: "3",
    label: "Floor 3",
  },
  {
    key: "4",
    label: "Floor 4",
  },
];

/* Container: the ONE building view. Modal, /buildings/:id page, seller Building tab, search, landlord and agent all render this. */
/* Container: the ONE building view. Modal, /buildings/:id page, seller Building tab, search, landlord and agent all render this. */
export function BuildingViewContainer(p) {
  var pp = usePlugPay();
  var ll = !!p.landlord;
  var b =
    ppResolveBuilding(p.id, pp.lbAccounts, pp.agentBuildings) ||
    (p.id
      ? {
          name: String(p.id),
          street: "",
          registered: null,
          stalls: null,
          pct: null,
        }
      : buildings[0]);
  var dash = function (v, suffix) {
    return v == null ? "\u2014" : String(v) + (suffix || "");
  };
  var stats = [
    {
      n: dash(b.registered),
      l: "Merchants",
    },
    {
      n: dash(b.stalls),
      l: "Total stalls",
    },
    {
      n: "4.7\u2605",
      l: "Avg rating",
    },
    {
      n: dash(b.pct, "%"),
      l: "Coverage",
    },
  ];
  var street = b.street || (b.sub ? String(b.sub).split(" \u00B7 ")[0] : "");
  return (
    <BuildingView
      name={b.name}
      address={(street ? street + " \u00B7 " : "") + "Nairobi CBD"}
      stats={stats}
      tabs={FLOOR_TABS}
      floors={floors}
      floor={pp.bldgFloor}
      onFloorChange={pp.setBldgFloor}
      onStallSelect={function (st) {
        if (st.s === "e")
          return ll
            ? pp.llOpenAdmitSeller(st.id, floorStallLabel(pp.bldgFloor, st.id))
            : pp.showToast("This stall is vacant");
        return pp.viewStallProfile(st, pp.bldgFloor, b.name, resolvePublicStallSeller(st) || undefined);
      }}
      isClickable={
        ll
          ? function () {
              return true;
            }
          : undefined
      }
      stallTitle={
        ll
          ? function (st) {
              return st.s === "e"
                ? "Vacant \u2014 tap to admit a seller"
                : "Occupied \u2014 tap to view seller profile";
            }
          : undefined
      }
      subtitle={ll ? "Select a stall to admit, verify, view or vacate a seller." : undefined}
      merchants={ppBuildingMerchants(b.name)}
      onMerchantSelect={p.onMerchantSelect || pp.openDirectorySeller}
    />
  );
}

function floorStallLabel(floor, stallId) {
  return floor === "G" ? `Ground Floor, Stall ${stallId}` : `Floor ${floor}, Stall ${stallId}`;
}