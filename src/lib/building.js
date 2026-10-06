export var buildings = [
  {
    type: "building",
    name: "Anniversary Towers",
    street: "Mama Ngina Street",
    sub: "Mama Ngina St \xB7 6 floors \xB7 72 stalls \xB7 58 registered",
    floors: 6,
    stalls: 72,
    registered: 58,
    pct: 67,
  },
  {
    type: "building",
    name: "Lonrho House",
    street: "Kenyatta Avenue",
    sub: "Kenyatta Ave \xB7 4 floors \xB7 58 stalls \xB7 39 registered",
    floors: 4,
    stalls: 58,
    registered: 39,
    pct: 67,
  },
  {
    type: "building",
    name: "Kencom House",
    street: "Moi Avenue",
    sub: "Moi Ave \xB7 5 floors \xB7 84 stalls \xB7 51 registered",
    floors: 5,
    stalls: 84,
    registered: 51,
    pct: 61,
  },
  {
    type: "building",
    name: "Odeon Cinema Bldg",
    street: "Tom Mboya Street",
    sub: "Tom Mboya St \xB7 3 floors \xB7 64 stalls \xB7 28 registered",
    floors: 3,
    stalls: 64,
    registered: 28,
    pct: 44,
  },
];

export function ppSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* One lookup for every building the app knows: public directory, landlord accounts, agent-onboarded buildings. */
/* One lookup for every building the app knows: public directory, landlord accounts, agent-onboarded buildings. */
export function ppResolveBuilding(id, accounts, agentList) {
  var k = ppSlug(id);
  if (!k) return null;
  var b = buildings.filter(function (x) {
    return ppSlug(x.name) === k;
  })[0];
  if (b) return b;
  var a = (accounts || []).filter(function (x) {
    return ppSlug(x.name) === k;
  })[0];
  if (a)
    return {
      type: "building",
      name: a.name,
      street: a.street,
      floors: a.floors,
      stalls: a.totalStalls || a.stalls,
      registered: null,
      pct: null,
    };
  var g = (agentList || []).filter(function (x) {
    return ppSlug(x.name) === k;
  })[0];
  if (g)
    return {
      type: "building",
      name: g.name,
      street: g.street,
      floors: g.floorsCount,
      stalls: g.stalls,
      registered: g.merchants,
      pct: g.stalls ? Math.round((g.merchants / g.stalls) * 100) : null,
    };
  return null;
}

export var stallClass = {
  t: "bsg-occ",
  v: "bsg-occ",
  b: "bsg-occ",
  e: "bsg-vac",
};

export var stallNameClass = {
  t: "bsgn-occ",
  v: "bsgn-occ",
  b: "bsgn-occ",
  e: "bsgn-vac",
};