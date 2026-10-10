"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navigate } from "@/lib/nav";
import { appBase, codeOf, initials, usePersisted } from "@/lib/shared";
import { merchants } from "@/lib/public";
import { buildings, ppSlug } from "@/lib/building";
import { openWhatsApp, reviewLink, reviewStatus } from "@/lib/seller";
import { PlugPayContext } from "@/store/context";
import { claimLink } from "@/lib/agent";

// Fire-and-forget POST to the backend. Returns the parsed JSON response, or
// null when the API is unreachable so callers can fall back to local demo mode.
function apiPost(url, body) {
  try {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    })
      .then((r) => r.json().catch(() => ({})))
      .catch(() => null);
  } catch (e) {
    return Promise.resolve(null);
  }
}
var BOOT_SYNC = { done: false };

function digitsOnly(p) {
  return String(p || "").replace(/\D/g, "");
}

function sameNumber(a, b) {
  var x = digitsOnly(a).slice(-9),
    y = digitsOnly(b).slice(-9);
  return !!x && x === y;
}

var PAGE = 4;

export function PlugPayProvider({ children }) {
  const [openModals, setOpenModals] = useState([]);
  const isOpen = useCallback((id) => openModals.includes(id), [openModals]);
  const openModal = useCallback((id) => {
    setOpenModals((s) => (s.includes(id) ? s : [...s, id]));
  }, []);
  const closeModal = useCallback((id) => {
    setOpenModals((s) => s.filter((m) => m !== id));
  }, []);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(void 0);
  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3e3);
  }, []);
  const copyText = useCallback(
    (text, msg) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      showToast(msg);
    },
    [showToast],
  );
  const [merchantTab, setMerchantTab] = useState("profile");
  const [viewedSeller, setViewedSeller] = useState(null);
  const openMerchantModal = useCallback(() => {
    setViewedSeller(null);
    openModal("modal-merchant");
  }, [openModal]);
  const openMerchantModalOnReviews = useCallback(() => {
    setViewedSeller(null);
    openModal("modal-merchant");
    setMerchantTab("reviews");
  }, [openModal]);
  const focusMerchantProfileTab = useCallback(() => {
    if (isOpen("modal-merchant")) setMerchantTab("profile");
  }, [isOpen]);
  const [following, setFollowing] = useState(false);
  const toggleFollowMerchant = useCallback(() => {
    setFollowing((f) => {
      const nv = !f;
      const biz = viewedSeller?.profile?.bizName || sellerProfile.bizName || "this seller";
      showToast(nv ? `Following ${biz} \u2713` : `Unfollowed ${biz}`);
      return nv;
    });
  }, [showToast, viewedSeller, sellerProfile.bizName]);
  const viewSellerProfile = useCallback(() => {
    setViewedSeller(null);
    openModal("modal-merchant");
    setMerchantTab("profile");
  }, [openModal]);
  const [stallHistory, setStallHistory] = usePersisted("stallhistory", []);
  const normLoc = (x) =>
    String(x || "")
      .toLowerCase()
      .replace(/ground floor/, "g")
      .replace(/floor\s*/, "")
      .replace(/[^a-z0-9]/g, "");
  const locFromSub = (sub) => {
    const m = /(ground floor|floor\s*\w+),\s*stall\s*\w+/i.exec(String(sub || ""));
    return m ? m[0] : "";
  };
  const streetOf = (building) => {
    const a = lbAccounts.filter(
      (x) =>
        x.name.trim().toLowerCase() ===
        String(building || "")
          .trim()
          .toLowerCase(),
    )[0];
    return a ? a.street : "Nairobi CBD";
  };
  const showSeller = (d) => {
    setViewedSeller(
      buildViewedSeller({
        street: streetOf(d.building),
        ...d,
      }),
    );
    setMerchantTab("profile");
    openModal("modal-merchant");
    window.setTimeout(() => {
      document.querySelectorAll(".tpModal, .tpModal .tp-body").forEach((el) => {
        el.scrollTop = 0;
      });
    }, 60);
  };
  const openOwnProfile = () => {
    setViewedSeller(null);
    setMerchantTab("profile");
    openModal("modal-merchant");
    window.setTimeout(() => {
      document.querySelectorAll(".tpModal, .tpModal .tp-body").forEach((el) => {
        el.scrollTop = 0;
      });
    }, 60);
  };
  const viewStallProfile = (stall, floor, building, merchant) => {
    const p = buildStallProfile(
      {
        obMerchantList,
      },
      {
        stall,
        floor,
        building,
        merchant: merchant || null,
      },
    );
    const sameBuilding =
      String(p.building).trim().toLowerCase() === stallAssignment.building.trim().toLowerCase();
    if (sameBuilding && normLoc(p.loc) === normLoc(stallAssignment.loc)) {
      openOwnProfile();
      return;
    }
    const bid = lbIdByName(p.building);
    const lists = bid ? lbData[bid] || emptyLb : emptyLb;
    const at = (l) => l.filter((t) => normLoc(locFromSub(t.sub)) === normLoc(p.loc))[0];
    const tv = at(lists.verified),
      tp = at(lists.pending);
    const t = tv || tp;
    if (t && t.phone && sameNumber(t.phone, sellerProfile.phone)) {
      openOwnProfile();
      return;
    }
    const owner = t ? t.name : p.owner;
    const dir = merchants.filter((m) => m.name === owner && m.sub.indexOf(p.building) > -1)[0];
    const claimed = p.registered && agentClaims.some((c) => c.verified && sameNumber(c.phone, p.phone));
    const verified = t ? !!tv : dir ? dir.badgeClass === "rcb-verified" : p.registered ? claimed : p.verified;
    const catSrc = dir
      ? dir.sub.split(" \u00b7 ")[0]
      : t
        ? String(t.sub)
            .replace(/^Claims\s*/i, "")
            .split(" \u00b7 ")
            .filter((x) => !locFromSub(x))[0]
        : p.cat;
    showSeller({
      biz: t || dir ? owner : p.biz,
      owner,
      cat: catSrc || p.cat,
      loc: p.loc,
      building: p.building,
      verified,
      phone: (t && t.phone) || p.phone,
      rating: dir ? dir.rating : p.rating,
      sales: dir && dir.sales,
      reviews: dir ? dir.reviews : p.reviews,
      vouches: dir && dir.vouches,
      years: p.years,
      photos: p.photos,
      registered: p.registered,
    });
  };
  const openSellerRef = (ref) => {
    const own =
      sameNumber(ref.phone, sellerProfile.phone) || (ref.name && ref.name === sellerProfile.ownerName);
    if (own) {
      openOwnProfile();
      return;
    }
    const dir = merchants.filter((x) => x.name === ref.name)[0];
    if (dir) {
      openDirectorySeller(dir);
      return;
    }
    const raw = String(ref.sub || "").replace(/^Claims\s*/i, "");
    const parts = raw.split(" \u00b7 ");
    const loc = locFromSub(raw);
    const cat = parts.filter((x) => x && !locFromSub(x))[0] || "Retail";
    const building = ref.building || stallAssignment.building;
    showSeller({
      biz: ref.name,
      owner: ref.name,
      cat,
      loc: loc || "Stall not listed",
      building,
      verified: !!ref.verified,
      phone: ref.phone || "",
    });
  };
  const openDirectorySeller = (m) => {
    const name = m.name || m.owner;
    const dir = merchants.filter((x) => x.name === name)[0];
    if (!dir) {
      openOwnProfile();
      return;
    }
    const parts = dir.sub.split(" \u00b7 ");
    if (dir.name === sellerProfile.ownerName) {
      openOwnProfile();
      return;
    }
    showSeller({
      biz: dir.name,
      owner: dir.name,
      cat: parts[0],
      building: parts[1],
      loc: parts[2],
      verified: dir.badgeClass === "rcb-verified",
      rating: dir.rating,
      sales: dir.sales,
      reviews: dir.reviews,
      vouches: dir.vouches,
    });
  };
  const loadSellerPage = (id) => {
    const k = ppSlug(id);
    if (k && ppSlug(sellerProfile.ownerName) === k) {
      setViewedSeller(null);
      setMerchantTab("profile");
      return true;
    }
    const dir = merchants.filter((x) => ppSlug(x.name) === k)[0];
    if (!dir) return false;
    const parts = dir.sub.split(" \u00b7 ");
    setViewedSeller(
      buildViewedSeller({
        street: streetOf(parts[1]),
        biz: dir.name,
        owner: dir.name,
        cat: parts[0],
        building: parts[1],
        loc: parts[2],
        verified: dir.badgeClass === "rcb-verified",
        rating: dir.rating,
        sales: dir.sales,
        reviews: dir.reviews,
        vouches: dir.vouches,
      }),
    );
    setMerchantTab("profile");
    return true;
  };
  const [searchMode, setSearchMode] = useState("merchant");
  const [query, setQuery] = useState("");
  const [resultsShown, setResultsShown] = useState(false);
  const [currentResults, setCurrentResults] = useState([]);
  const [shownCount, setShownCount] = useState(0);
  const [filter, setFilterState] = useState("all");
  const [resultsTitle, setResultsTitle] = useState("Search results");
  const [resultsMeta, setResultsMeta] = useState("Showing top matches");
  const pool = useMemo(() => [...merchants, ...buildings], []);
  const doSearch = useCallback(
    (q) => {
      var _a;
      const query_ = ((_a = q != null ? q : query) != null ? _a : "").toLowerCase().trim();
      setResultsShown(true);
      const results = query_ ? pool.filter((r) => (r.name + r.sub).toLowerCase().includes(query_)) : pool;
      setCurrentResults(results);
      setFilterState("all");
      setShownCount(Math.min(PAGE, results.length));
      setResultsTitle(query_ ? `Results for "${query_}"` : "All merchants & buildings");
      setResultsMeta(`${results.length} match${results.length !== 1 ? "es" : ""}`);
    },
    [pool, query],
  );
  const setFilter = useCallback(
    (type) => {
      setFilterState(type);
      const results = type === "all" ? pool : pool.filter((r) => r.type === type);
      setCurrentResults(results);
      setShownCount(Math.min(PAGE, results.length));
      setResultsTitle(type === "all" ? "All results" : type === "merchant" ? "Merchants" : "Buildings");
      setResultsMeta(`${results.length} match${results.length !== 1 ? "es" : ""}`);
    },
    [pool],
  );
  const loadMore = useCallback(() => {
    setShownCount((c) => Math.min(c + PAGE, currentResults.length));
  }, [currentResults.length]);
  const shownResults = currentResults.slice(0, shownCount);
  const hasMore = shownCount < currentResults.length;
  const moreHint = `Showing ${shownCount} of ${currentResults.length} results \xB7 ${currentResults.length - shownCount} more`;
  const [bldgFloor, setBldgFloor] = useState("G");
  const [bldgId, setBldgId] = useState(null);
  const openBuildingModal = useCallback(
    (id) => {
      setBldgId(typeof id === "string" ? id : null);
      openModal("modal-building");
      setBldgFloor("G");
    },
    [openModal],
  );
  const openInvoiceInProfile = useCallback(() => {
    openModal("modal-merchant");
    openModal("modal-record-sale");
  }, [openModal]);
  const openReceiptInProfile = useCallback(() => {
    openModal("modal-merchant");
    openModal("modal-record-sale");
  }, [openModal]);
  const [riders, setRiders] = useState([]);
  const riderIdRef = useRef(1);
  const [riderRows, setRiderRows] = useState([emptyRiderRow(0)]);
  const updateRiderRow = useCallback((id, patch) => {
    setRiderRows((rows) =>
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
            }
          : r,
      ),
    );
  }, []);
  const saveTrustedRiders = useCallback(() => {
    const valid = riderRows.filter((r) => r.name.trim());
    if (valid.length === 0) {
      showToast("Add at least one name first");
      return;
    }
    setRiders((r) => [
      ...valid.map((v) => ({
        name: v.name,
        role: v.role,
      })),
      ...r,
    ]);
    setRiderRows([emptyRiderRow(riderIdRef.current++)]);
    showToast(
      `${valid.length > 1 ? `${valid.length} trusted people` : valid[0].name} added to your profile \u2713`,
    );
  }, [riderRows, showToast]);
  const [merchantLoggedIn, setMerchantLoggedIn] = useState(false);
  const [authStep, setAuthStep] = useState("email");
  const [authRole, setAuthRole] = useState("trader");
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusinessName, setAuthBusinessName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const finishLoginRef = useRef(null);
  const authSetMode = useCallback((m) => {
    setAuthMode(m === "register" ? "register" : "signin");
    setAuthError("");
  }, []);
  const openAuthModal = useCallback(
    (role) => {
      claimTokenRef.current = null;
      setClaimInfo(null);
      setAuthStep("email");
      setAuthRole(role === "landlord" || role === "agent" ? role : "trader");
      setAuthMode("signin");
      setAuthEmail("");
      setAuthPassword("");
      setAuthBusinessName("");
      setAuthError("");
      openModal("modal-register");
    },
    [openModal],
  );
  const authSubmit = useCallback(() => {
    if (authBusy) return;
    setAuthError("");
    setAuthBusy(true);
    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    apiPost(endpoint, {
      email: authEmail.trim(),
      password: authPassword,
      role: authRole,
      businessName: authBusinessName.trim(),
      ownerName: authBusinessName.trim(),
    }).then((res) => {
      setAuthBusy(false);
      if (!res) {
        setAuthError("Network error. Check your connection and try again.");
        return;
      }
      if (res.ok === false) {
        setAuthError(res.error || "Could not sign you in. Try again.");
        return;
      }
      // Success: the session cookie is set server-side.
      const slug = res.merchantSlug || null;
      const role = res.role || authRole;
      finishLoginRef.current && finishLoginRef.current(slug, role, res.email || authEmail.trim());
    });
  }, [authBusy, authMode, authEmail, authPassword, authRole, authBusinessName, showToast]);
  const authLogout = useCallback(() => {
    apiPost("/api/auth/logout", {});
    setMerchantLoggedIn(false);
    setSessionInfo(null);
    showToast("Signed out");
    navigate("/");
  }, [showToast]);
  const requireSellerLogin = useCallback(
    (actionLabel) => {
      if (!merchantLoggedIn) {
        showToast("Sign in to your seller account to " + actionLabel);
        openAuthModal();
        return false;
      }
      return true;
    },
    [merchantLoggedIn, openAuthModal, showToast],
  );
  const [sessionInfo, setSessionInfo] = useState(null);
  const authGoBack = useCallback(() => setAuthStep("email"), []);
  const [docStatus, setDocStatus] = useState({});
  const fakeUpload = useCallback(
    (key, name) => {
      if (docStatus[key] === "done") {
        showToast(`${name} already uploaded \u2713`);
        return;
      }
      setDocStatus((s) => ({
        ...s,
        [key]: "uploading",
      }));
      setTimeout(() => {
        setDocStatus((s) => ({
          ...s,
          [key]: "done",
        }));
        showToast(`${name} uploaded successfully \u2713`);
      }, 1200);
    },
    [docStatus, showToast],
  );
  const [showVacateForm, setShowVacateForm] = useState(false);
  const [vacateBuilding, setVacateBuilding] = useState("");
  const [vacateStall, setVacateStall] = useState("");
  const [stallAssignment, setStallAssignment] = usePersisted("stall2", {
    building: "Anniversary Towers",
    loc: "Floor 3, Stall 305",
  });
  const stockRef = useRef([]);
  const invoicesListRef = useRef([]);
  const rsIdRef = useRef(1);
  const [rsName, setRsName] = useState("");
  const [rsPhone, setRsPhone] = useState("");
  const [rsCode, setRsCode] = useState("");
  const [rsItems, setRsItems] = useState([emptyItemRow(0)]);
  const [rsSubmitting, setRsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState({
    kind: "receipt",
    code: "",
    name: "",
    rawPhone: "",
    phone: "",
    items: [],
    total: 0,
  });
  const addItemRow = useCallback((prefix) => {
    setRsItems((r) => [...r, emptyItemRow(rsIdRef.current++)]);
  }, []);
  const removeItemRow = useCallback((prefix, id) => {
    setRsItems((r) => (r.length <= 1 ? r : r.filter((i) => i.id !== id)));
  }, []);
  const updateItemRow = useCallback((prefix, id, patch) => {
    setRsItems((r) =>
      r.map((i) =>
        i.id === id
          ? {
              ...i,
              ...patch,
            }
          : i,
      ),
    );
  }, []);
  const rsTotal = rsItems.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const startSaleFromProduct = useCallback((p) => {
    setRsName("");
    setRsPhone("");
    setRsCode("");
    setRsItems([
      {
        id: rsIdRef.current++,
        name: p.name,
        price: String(p.price),
        productId: p.id,
        qty: 1,
        unit: String(p.price),
        category: p.category,
      },
    ]);
  }, []);
  const [receiptsList, setReceiptsList] = usePersisted("receipts", []);
  const [invoicesList, setInvoicesList] = usePersisted("invoices", []);
  const catIdRef = useRef(1);
  // A new account starts with an EMPTY catalogue. Products are added by the
  // seller (and persisted to the database through /api/products).
  const [catalogueItems, setCatalogueItems] = usePersisted("catalogue", []);
  stockRef.current = catalogueItems;
  invoicesListRef.current = invoicesList;
  const addCatalogueItem = useCallback(
    (item) => {
      if (!String(item.name || "").trim() || !item.price) {
        showToast("Enter a product name and price");
        return false;
      }
      const localId = "ci" + Date.now().toString(36) + catIdRef.current++;
      const record = {
        id: localId,
        icon: "\u{1F4E6}",
        image: item.image || "",
        name: String(item.name).trim(),
        price: String(item.price),
        category: (item.category || "").trim() || "General",
        stock: Number(item.stock) || 0,
      };
      setCatalogueItems((c) => [record, ...c]);
      showToast(`${record.name} added to your catalogue \u2713`);
      // Persist server-side; swap the local id for the database id when done.
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: record.name,
          price: Number(record.price) || 0,
          stock: record.stock,
          category: record.category,
          image: record.image,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.ok && res.product?.id) {
            setCatalogueItems((c) => c.map((x) => (x.id === localId ? { ...x, dbId: res.product.id } : x)));
          }
        })
        .catch(() => {});
      return true;
    },
    [showToast],
  );
  const updateCatalogueItem = useCallback((id, patch) => {
    setCatalogueItems((c) =>
      c.map((x) =>
        x.id === id
          ? {
              ...x,
              ...patch,
            }
          : x,
      ),
    );
  }, []);
  const removeCatalogueItem = useCallback(
    (id) => {
      setCatalogueItems((c) => c.filter((x) => x.id !== id));
      showToast("Product removed");
      const item = catalogueItems.filter((x) => x.id === id)[0];
      const dbId = item && (item.dbId || (String(item.id).startsWith("db") ? String(item.id).slice(2) : ""));
      if (dbId) {
        fetch("/api/products?id=" + encodeURIComponent(dbId), { method: "DELETE" }).catch(() => {});
      }
    },
    [showToast, catalogueItems],
  );
  const [sellerProfile, setSellerProfile] = usePersisted("seller", {
    bizName: "",
    ownerName: "",
    role: "",
    bio: "",
    street: "",
    phone: "",
    established: "",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    paybill: "",
    account: "",
    about: "",
    llPhoneVerified: false,
  });
  const updateSellerProfile = useCallback(
    (patch) => {
      setSellerProfile((p) => ({
        ...p,
        ...patch,
      }));
      showToast("Profile updated \u2713");
      // Persist to the seller's own merchant row (ownership via session).
      const fieldMap = {
        bizName: "business_name",
        ownerName: "owner_name",
        role: "category",
        street: "street",
        phone: "phone",
        whatsapp: "whatsapp",
        bio: "bio",
        about: "about",
        instagram: "instagram",
        tiktok: "tiktok",
        facebook: "facebook",
        paybill: "mpesa_paybill",
        account: "mpesa_account",
      };
      const apiPatch = {};
      Object.keys(fieldMap).forEach((k) => {
        if (patch[k] !== undefined) apiPatch[fieldMap[k]] = patch[k];
      });
      if (patch.establishedYear !== undefined) apiPatch.established_year = patch.establishedYear;
      if (Object.keys(apiPatch).length) {
        fetch("/api/seller/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPatch),
        }).catch(() => {});
      }
    },
    [showToast],
  );
  const setLandlordPhoneVerified = useCallback(
    (v) => {
      setSellerProfile((p) => ({
        ...p,
        llPhoneVerified: v,
      }));
      showToast(
        v
          ? "Phone number & profile confirmed as matching the real owner \u2713"
          : "Landlord verification revoked",
      );
    },
    [showToast],
  );
  const removeRider = useCallback(
    (i) => {
      setRiders((r) => r.filter((_, idx) => idx !== i));
      showToast("Rider removed");
    },
    [showToast],
  );
  finishLoginRef.current = (slug, role, email) => {
    setSessionInfo({ merchantSlug: slug || null, role: role || "trader", email: email || "" });
    if ((role || "trader") === "landlord") {
      setLlAuthed(true);
      closeModal("modal-register");
      closeModal("modal-landlord");
      navigate("/landlord/dashboard");
      return;
    }
    if (role === "agent") {
      setObAgentGate(false);
      setObAgentPhoneStep(false);
      setObStep_(1);
      closeModal("modal-register");
      showToast("Signed in as agent \u2713");
      navigate("/agent");
      return;
    }
    setMerchantLoggedIn(true);
    const tok = claimTokenRef.current;
    if (tok) {
      claimTokenRef.current = null;
      setClaimInfo(null);
      applyClaim(tok);
    }
    closeModal("modal-register");
    navigate("/seller/dashboard");
  };
  const confirmVacate = () => {
    if (!vacateBuilding.trim() || !vacateStall.trim()) {
      showToast("Enter the building and stall you're moving to");
      return;
    }
    changeStall(vacateBuilding.trim(), vacateStall.trim());
    showToast(
      `Moved to ${vacateBuilding}, ${vacateStall} \u2014 your trust score, reviews, vouches, sales history & documents moved with you \u2713 Landlord verification there starts as Pending.`,
    );
    setVacateBuilding("");
    setVacateStall("");
    setShowVacateForm(false);
  };
  const sentReceipts = receiptsList.filter((r) => r.sentAt && !r.demo);
  const sellerReviews = receiptsList
    .filter((r) => r.review)
    .map((r) => r.review)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
  // Real numbers only. A new seller starts at zero; trust grows with real
  // receipts and reviews — no baseline inflation.
  const sellerStats = (() => {
    const count = sellerReviews.length;
    const sum = sellerReviews.reduce((t, r) => t + (Number(r.rating) || 0), 0);
    const avg = count ? sum / count : 0;
    const sales = sentReceipts.length;
    const trust = Math.min(99, Math.round(20 + (avg / 5) * 30 + Math.min(30, sales * 2) + Math.min(19, count * 3)));
    const dist = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    sellerReviews.forEach((r) => {
      const k = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      dist[k] = (dist[k] || 0) + 1;
    });
    return {
      avg,
      reviewCount: count,
      sales,
      trust,
      dist,
    };
  })();
  const decrementStock = (items) =>
    setCatalogueItems((c) =>
      c.map((x) => {
        const sold = items.filter((i) => i.productId === x.id).reduce((t, i) => t + (Number(i.qty) || 1), 0);
        return sold
          ? {
              ...x,
              stock: Math.max(0, x.stock - sold),
            }
          : x;
      }),
    );
  const stockShort = (items) =>
    items.filter((i) => {
      const p = i.productId && catalogueItems.filter((x) => x.id === i.productId)[0];
      return p && (Number(i.qty) || 1) > p.stock;
    });
  const maskPhone = (p) => String(p).replace(/(\d{4}).*(\d{3})/, "$1 *** $2");
  const submitRecordSale = () => {
    const items = rsItems.filter((i) => i.name.trim() || i.price);
    if (!rsName.trim() || !rsPhone.trim() || items.length === 0) {
      showToast("Please fill all fields");
      return;
    }
    if (items.some((i) => !i.name.trim() || Number(i.price) <= 0)) {
      showToast("Add a name and price for every item");
      return;
    }
    const clean = items.map((i) => ({
      name: i.name,
      price: Number(i.price),
      productId: i.productId || "",
      qty: Number(i.qty) || 1,
      unit: Number(i.unit) || Number(i.price),
      category: i.category || "",
    }));
    const total = clean.reduce((t, i) => t + i.price, 0);
    const now = new Date().toISOString();
    const hasCode = rsCode.trim().length > 0;
    if (hasCode) {
      const short = stockShort(clean);
      if (short.length) {
        showToast("Not enough stock for " + short[0].name);
        return;
      }
      const code = "#" + rsCode.trim().toUpperCase();
      if (receiptsList.some((r) => r.code === code)) {
        showToast("A receipt with that M-Pesa code already exists");
        return;
      }
      const rc = {
        code,
        buyerName: rsName,
        buyerPhone: rsPhone,
        paymentRef: rsCode.trim().toUpperCase(),
        items: clean,
        total,
        createdAt: now,
        sentAt: now,
        stockApplied: true,
        review: null,
      };
      setReceiptsList((l) => [rc, ...l]);
      apiPost("/api/sales", {
        buyerName: rsName,
        buyerPhone: rsPhone,
        mpesaCode: rsCode.trim().toUpperCase(),
        items: clean.map((i) => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          price: i.price,
        })),
        delivery: "pickup",
      });
      decrementStock(clean);
      openWhatsApp(rc.buyerPhone, waReceiptText(rc, sellerProfile.bizName));
      setReceipt({
        kind: "receipt",
        code,
        name: rsName,
        rawPhone: rsPhone,
        phone: maskPhone(rsPhone),
        items: clean,
        total,
      });
      showToast(`Receipt sent to ${rsName} on WhatsApp \u2713 Review link attached`);
    } else {
      const token = "inv" + Date.now().toString(36);
      const inv = {
        token,
        buyerName: rsName,
        buyerPhone: rsPhone,
        source: "WhatsApp",
        items: clean,
        total,
        status: "PENDING",
        createdAt: now,
      };
      setInvoicesList((l) => [inv, ...l]);
      openWhatsApp(inv.buyerPhone, waInvoiceText(inv, sellerProfile.bizName));
      setReceipt({
        kind: "invoice",
        code: token,
        name: rsName,
        rawPhone: rsPhone,
        phone: maskPhone(rsPhone),
        items: clean,
        total,
      });
      showToast(`Invoice sent to ${rsName} on WhatsApp \u2713`);
    }
    setRsName("");
    setRsPhone("");
    setRsCode("");
    setRsItems([emptyItemRow(rsIdRef.current++)]);
    closeModal("modal-record-sale");
    openModal("modal-receipt");
  };
  const resendInvoice = (token) => {
    const inv = invoicesList.filter((x) => x.token === token)[0];
    if (!inv) return;
    openWhatsApp(inv.buyerPhone, waInvoiceText(inv, sellerProfile.bizName));
    showToast(`Invoice resent to ${inv.buyerName} on WhatsApp`);
  };
  const convertInvoiceToReceipt = (token, code) => {
    const inv = invoicesList.filter((x) => x.token === token)[0];
    if (!inv) {
      showToast("Invoice not found");
      return null;
    }
    if (!code || !code.trim()) {
      showToast("Enter the M-Pesa code or paste the payment message");
      return null;
    }
    const rawCode = code.trim().toUpperCase();
    const found = rawCode.match(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{10}\b/);
    const ref = found ? found[0] : /\s/.test(rawCode) ? "" : rawCode;
    if (!ref) {
      showToast("Could not find an M-Pesa code in that message");
      return null;
    }
    const receiptCode = "#" + ref;
    if (receiptsList.some((r) => r.code === receiptCode)) {
      showToast("A receipt with that M-Pesa code already exists");
      return null;
    }
    setInvoicesList((l) =>
      l.map((x) =>
        x.token === token
          ? {
              ...x,
              status: "PAID",
              docStatus: "COMPLETE",
              paymentRef: ref,
            }
          : x,
      ),
    );
    apiPost("/api/sales/convert", { token: token, code: ref });
    setReceiptsList((l) => [
      {
        code: receiptCode,
        buyerName: inv.buyerName,
        buyerPhone: inv.buyerPhone,
        paymentRef: ref,
        mpesaMessage: /\s/.test(rawCode) ? code.trim() : "",
        items: inv.items,
        total: inv.total,
        createdAt: new Date().toISOString(),
        sentAt: null,
        stockApplied: false,
        review: null,
      },
      ...l,
    ]);
    showToast(`Marked as paid \u2713 Send the receipt to ${inv.buyerName} to complete the sale`);
    return receiptCode;
  };
  const setDocumentStatus = (kind, id, status) => {
    if (kind === "invoice")
      setInvoicesList((l) =>
        l.map((x) =>
          x.token === id
            ? {
                ...x,
                docStatus: status,
              }
            : x,
        ),
      );
    else
      setReceiptsList((l) =>
        l.map((x) =>
          x.code === id
            ? {
                ...x,
                docStatus: status,
              }
            : x,
        ),
      );
    showToast(status === "COMPLETE" ? "Marked as complete \u2713" : "Marked as pending");
  };
  const sendReceipt = (code) => {
    const c = codeOf(code);
    const r = receiptsList.filter((x) => codeOf(x.code) === c)[0];
    if (!r) {
      showToast("Receipt not found");
      return false;
    }
    const now = new Date().toISOString();
    if (!r.stockApplied) {
      const short = stockShort(r.items);
      if (short.length) {
        showToast("Not enough stock for " + short[0].name + " \u2014 update your catalogue first");
        return false;
      }
      decrementStock(r.items);
    }
    const sentAt = r.sentAt || now;
    setReceiptsList((l) =>
      l.map((x) =>
        x.code === r.code
          ? {
              ...x,
              sentAt,
              stockApplied: true,
            }
          : x,
      ),
    );
    openWhatsApp(
      r.buyerPhone,
      waReceiptText(
        {
          ...r,
          sentAt,
        },
        sellerProfile.bizName,
      ),
    );
    showToast(
      r.sentAt
        ? `Receipt resent to ${r.buyerName || "buyer"} \u2713`
        : `Receipt sent to ${r.buyerName || "buyer"} \u2713 Stock updated, review link attached`,
    );
    return true;
  };
  const submitReview = (code, data) => {
    const c = codeOf(code);
    const r = receiptsList.filter((x) => codeOf(x.code) === c)[0];
    if (!r)
      return {
        ok: false,
        reason: "notfound",
      };
    const st = reviewStatus(r);
    if (st.state === "done")
      return {
        ok: false,
        reason: "done",
      };
    if (st.state === "notsent")
      return {
        ok: false,
        reason: "notsent",
      };
    if (st.state === "expired")
      return {
        ok: false,
        reason: "expired",
      };
    if (!data || !data.rating)
      return {
        ok: false,
        reason: "norating",
      };
    const rev = {
      id: "rv" + Date.now().toString(36),
      code: r.code,
      buyerName: r.buyerName,
      rating: data.rating,
      comment: String(data.comment || "").trim(),
      at: new Date().toISOString(),
    };
    setReceiptsList((l) =>
      l.map((x) =>
        x.code === r.code
          ? {
              ...x,
              review: rev,
            }
          : x,
      ),
    );
    showToast("Thanks for your review \u2713");
    return {
      ok: true,
    };
  };
  const [obAgentGate, setObAgentGate] = useState(true);
  const [obAgentPhoneStep, setObAgentPhoneStep] = useState(true);
  const [obAgentEmail, setObAgentEmail] = useState("");
  const [obAgentPassword, setObAgentPassword] = useState("");
  const [obAgentMode, setObAgentMode] = useState("signin");
  const [obAgentError, setObAgentError] = useState("");
  const [obAgentBusy, setObAgentBusy] = useState(false);
  const obAgentSending = obAgentBusy;
  const obAgentVerifying = obAgentBusy;
  const setObAgentSending = setObAgentBusy;
  const setObAgentVerifying = setObAgentBusy;
  const [obStep_, setObStep_] = useState(1);
  const [obBldgName, setObBldgName] = useState("");
  const [obFloorsCount, setObFloorsCount] = useState("6");
  const [obFloorStalls, setObFloorStallsState] = useState({});
  const [obPayMethod, setObPayMethod] = useState("till");
  const [obMerchantList, setObMerchantList] = useState(seedObMerchants);
  const obMerchantIdRef = useRef(1);
  const [obEditingMerchantId, setObEditingMerchantId] = useState(null);
  const [obNewName, setObNewName] = useState("");
  const [obNewPhone, setObNewPhone] = useState("");
  const [obNewStallNum, setObNewStallNum] = useState("");
  const [obNewFloor, setObNewFloor] = useState("G");
  const [obNewBiz, setObNewBiz] = useState("");
  const [obNewType, setObNewType] = useState("Fashion");
  const [obNewExtra, setObNewExtra] = useState({});
  const obAgentSetMethod = useCallback((m) => {
    // Kept for layout compatibility: the gate no longer picks a delivery
    // method, it toggles sign-in / create-account.
    setObAgentMode(m === "register" ? "register" : "signin");
    setObAgentError("");
  }, []);
  const openOnboard = useCallback(() => {
    openModal("modal-onboard");
    setObAgentGate(true);
    setObAgentPhoneStep(true);
    setObAgentEmail("");
    setObAgentPassword("");
    setObAgentError("");
    setObAgentMode("signin");
    setObMerchantList(seedObMerchants);
    setObEditingMerchantId(null);
    setObStep_(1);
  }, [openModal]);
  const obAgentSendOtp = useCallback(() => {
    // Agent sign-in: email + password (no OTP).
    if (obAgentBusy) return;
    if (!obAgentEmail.trim() || !obAgentPassword) {
      setObAgentError("Enter your email and password");
      return;
    }
    setObAgentBusy(true);
    setObAgentError("");
    apiPost(obAgentMode === "register" ? "/api/auth/register" : "/api/auth/login", {
      email: obAgentEmail.trim(),
      password: obAgentPassword,
      role: "agent",
    }).then((res) => {
      setObAgentBusy(false);
      if (!res || res.ok === false) {
        setObAgentError((res && res.error) || "Could not sign you in. Try again.");
        return;
      }
      setSessionInfo({ merchantSlug: null, role: "agent", email: res.email || obAgentEmail.trim() });
      setObAgentVerifying(false);
      showToast("Signed in as agent \u2713");
      setObAgentGate(false);
      setObStep_(1);
    });
  }, [obAgentBusy, obAgentMode, obAgentEmail, obAgentPassword, showToast]);
  const setObFloorStall = useCallback((key, v) => {
    setObFloorStallsState((s) => ({
      ...s,
      [key]: v,
    }));
  }, []);
  const obTotalStalls = useMemo(
    () => Object.values(obFloorStalls).reduce((s, v) => s + (parseInt(v) || 0), 0),
    [obFloorStalls],
  );
  const obGoToStep = useCallback((n) => setObStep_(n), []);
  const obStep = useCallback(
    (dir) => {
      const total = 4;
      if (obStep_ === total && dir > 0) {
        if (obMerchantList.length === 0) {
          showToast("Add at least one seller before publishing");
          return;
        }
        const n = obMerchantList.length;
        showToast(
          `\u{1F389} Building published with ${n} seller${n === 1 ? "" : "s"} live on PlugPay! QR code sent to the manager and a claim link sent to each seller on WhatsApp.`,
        );
        claimsApiRef.current &&
          claimsApiRef.current.publish(obMerchantList, obBldgName || "New building", obTotalStalls);
        setAgentBuildings((b) => [
          {
            name: obBldgName || "New building",
            street: "Nairobi CBD",
            floorsCount: obFloorsCount,
            stalls: obTotalStalls,
            merchants: obMerchantList.length,
          },
          ...b,
        ]);
        closeModal("modal-onboard");
        navigate("/agent/claims");
        return;
      }
      let next = obStep_ + dir;
      if (dir > 0 && obStep_ === 1) next = 4;
      if (dir < 0 && obStep_ === 4) next = 1;
      if (next < 1 || next > total) return;
      setObStep_(next);
    },
    [closeModal, obBldgName, obFloorsCount, obMerchantList, obStep_, obTotalStalls, showToast],
  );
  const obAddMerchant = useCallback(() => {
    if (!obNewBiz.trim()) {
      showToast("Enter business name");
      return false;
    }
    if (!obNewName.trim()) {
      showToast("Enter owner name");
      return false;
    }
    if (!obNewPhone.trim()) {
      showToast("Enter phone number");
      return false;
    }
    if (!obNewStallNum.trim()) {
      showToast("Enter stall number");
      return false;
    }
    const colors = ["#3B3DB8", "#185FA5", "#8b008b"];
    if (obEditingMerchantId) {
      setObMerchantList((l) =>
        l.map((m) =>
          m.id === obEditingMerchantId
            ? {
                ...m,
                biz: obNewBiz,
                ownerName: obNewName,
                phone: obNewPhone,
                floor: obNewFloor,
                stallNum: obNewStallNum,
                type: obNewType,
                extra: obNewExtra,
                initials: initials(obNewName),
              }
            : m,
        ),
      );
      claimsApiRef.current &&
        claimsApiRef.current.upsert(
          {
            id: obEditingMerchantId,
            biz: obNewBiz,
            ownerName: obNewName,
            phone: obNewPhone,
            floor: obNewFloor,
            stallNum: obNewStallNum,
            type: obNewType,
          },
          obBldgName,
        );
      showToast("Merchant profile updated \u2713 \u2014 " + obNewBiz);
      setObEditingMerchantId(null);
    } else {
      const color = colors[obMerchantList.length % colors.length];
      const nm = {
        id: "ob-" + obMerchantIdRef.current++,
        biz: obNewBiz,
        ownerName: obNewName,
        phone: obNewPhone,
        floor: obNewFloor,
        stallNum: obNewStallNum,
        type: obNewType,
        extra: obNewExtra,
        initials: initials(obNewName),
        color,
        status: "invited",
      };
      setObMerchantList((l) => [...l, nm]);
      claimsApiRef.current && claimsApiRef.current.upsert(nm, obBldgName);
      showToast(`${obNewBiz} registered \u2713 Claim link sent to ${obNewPhone} on WhatsApp`);
    }
    setObNewName("");
    setObNewPhone("");
    setObNewStallNum("");
    setObNewFloor("G");
    setObNewBiz("");
    setObNewType("Fashion");
    setObNewExtra({});
    return true;
  }, [
    obBldgName,
    obEditingMerchantId,
    obMerchantList.length,
    obNewBiz,
    obNewFloor,
    obNewName,
    obNewPhone,
    obNewStallNum,
    obNewType,
    obNewExtra,
    showToast,
  ]);
  const obStartEditMerchant = useCallback(
    (id) => {
      const m = obMerchantList.find((x) => x.id === id);
      if (!m) return;
      setObEditingMerchantId(id);
      setObNewBiz(m.biz);
      setObNewName(m.ownerName);
      setObNewPhone(m.phone);
      setObNewStallNum(m.stallNum);
      setObNewFloor(m.floor);
      setObNewType(m.type);
      setObNewExtra(m.extra || {});
    },
    [obMerchantList],
  );
  const obCancelEditMerchant = useCallback(() => {
    setObEditingMerchantId(null);
    setObNewName("");
    setObNewPhone("");
    setObNewStallNum("");
    setObNewFloor("G");
    setObNewBiz("");
    setObNewType("Fashion");
    setObNewExtra({});
  }, []);
  const obPrefillNewMerchantStall = useCallback((floor, stallNum) => {
    setObEditingMerchantId(null);
    setObNewBiz("");
    setObNewName("");
    setObNewPhone("");
    setObNewType("Fashion");
    setObNewExtra({});
    setObNewFloor(floor);
    setObNewStallNum(stallNum);
  }, []);
  const obRemoveMerchant = useCallback(
    (id) => {
      const m = obMerchantList.find((x) => x.id === id);
      setObMerchantList((l) => l.filter((x) => x.id !== id));
      if (obEditingMerchantId === id) obCancelEditMerchant();
      if (m) showToast(`${m.biz} removed from this building`);
    },
    [obCancelEditMerchant, obEditingMerchantId, obMerchantList, showToast],
  );
  const claimTokenRef = useRef(null);
  const claimsApiRef = useRef(null);
  const [claimInfo, setClaimInfo] = useState(null);
  const [agentClaims, setAgentClaims] = usePersisted("claims", []);
  const [agentBuildings, setAgentBuildings] = useState([]);
  const stallLoc = (m) => (m.floor === "G" ? "Ground Floor" : "Floor " + m.floor) + ", Stall " + m.stallNum;
  const newAgentClaim = (m, bldg, extra) => ({
    id: m.id,
    token: "clm" + m.id,
    businessName: m.biz,
    ownerName: m.ownerName,
    phone: m.phone,
    category: m.type,
    floor: m.floor,
    number: m.stallNum,
    loc: stallLoc(m),
    buildingName: bldg || "New building",
    status: "INVITED",
    verified: false,
    source: "agent",
    sentAt: new Date().toISOString(),
    ...(extra || {}),
  });
  const upsertAgentClaim = (m, bldg) => {
    setAgentClaims((l) => {
      const ex = l.filter((x) => x.id === m.id)[0];
      if (!ex)
        return [
          newAgentClaim(m, bldg, {
            draft: true,
          }),
          ...l,
        ];
      return l.map((x) =>
        x.id === m.id
          ? {
              ...x,
              businessName: m.biz,
              ownerName: m.ownerName,
              phone: m.phone,
              category: m.type,
              floor: m.floor,
              number: m.stallNum,
              loc: stallLoc(m),
              buildingName: x.draft ? bldg || x.buildingName : x.buildingName,
              sentAt: x.phone !== m.phone ? new Date().toISOString() : x.sentAt,
            }
          : x,
      );
    });
  };
  const publishAgentClaims = (list, bldg, stalls) => {
    setAgentClaims((l) => {
      const out = l.slice();
      list.forEach((m) => {
        const i = out.findIndex((x) => x.id === m.id);
        if (i >= 0) {
          if (out[i].draft)
            out[i] = {
              ...out[i],
              buildingName: bldg,
              draft: false,
            };
        } else out.unshift(newAgentClaim(m, bldg));
      });
      return out;
    });
    list.forEach((m) => {
      apiPost("/api/claims", { claim: newAgentClaim(m, bldg) });
    });
    ensureLbAccount(bldg, "Nairobi CBD", stalls);
  };
  claimsApiRef.current = {
    upsert: upsertAgentClaim,
    publish: publishAgentClaims,
  };
  const resendClaim = (token) => {
    const c = agentClaims.filter((x) => x.token === token)[0];
    if (!c) return;
    openWhatsApp(c.phone, waClaimText(c));
    showToast(`Claim link resent to ${c.ownerName || c.businessName} on WhatsApp`);
  };
  const openClaimSignIn = (token) => {
    const c = agentClaims.filter((x) => x.token === token)[0];
    if (!c) return;
    claimTokenRef.current = token;
    setClaimInfo({
      token,
      name: c.businessName || c.ownerName,
      loc: c.loc,
      building: c.buildingName,
    });
    setAuthStep("phone");
    setAuthOtp("");
    setAuthPinLoginValue("");
    setAuthSetPinValue("");
    setAuthMethodState("whatsapp");
    setAuthPhone(c.phone || "");
    openModal("modal-register");
  };
  const applyClaim = (token) => {
    const c = agentClaims.filter((x) => x.token === token)[0];
    if (!c) return;
    const same = sameNumber(c.phone, sellerProfile.phone);
    const loc = c.loc || "";
    setAgentClaims((l) =>
      l.map((x) =>
        x.token === token
          ? {
              ...x,
              status: "CLAIMED",
              claimedAt: new Date().toISOString(),
            }
          : x,
      ),
    );
    setSellerProfile((p) =>
      Object.assign(
        {},
        p,
        same
          ? {}
          : {
              bizName: c.businessName || p.bizName,
              ownerName: c.ownerName || p.ownerName,
              phone: c.phone || p.phone,
              whatsapp: c.phone || p.whatsapp,
            },
        {
          llPhoneVerified: !!c.verified,
        },
      ),
    );
    if (same && (stallAssignment.building !== c.buildingName || stallAssignment.loc !== loc)) {
      setStallHistory((hs) => [
        {
          building: stallAssignment.building,
          loc: stallAssignment.loc,
          until: new Date().toISOString(),
        },
        ...hs,
      ]);
    }
    setStallAssignment({
      building: c.buildingName,
      loc,
    });
    const bid = lbIdByName(c.buildingName);
    if (bid && !c.verified) {
      const cur = lbData[bid] || emptyLb;
      const exists = cur.pending
        .concat(cur.verified)
        .some((t) => t.claimToken === token || sameNumber(t.phone, c.phone));
      if (!exists)
        updLb(bid, (cu) => ({
          pending: [
            {
              id: "clm-" + token,
              claimToken: token,
              name: c.ownerName || c.businessName,
              phone: c.phone,
              sub: (c.category || "Seller") + " \u00b7 " + loc,
              initials: initials(c.ownerName || c.businessName || "S"),
              color: "#8a8a8a",
            },
            ...cu.pending,
          ],
        }));
    }
    showToast(
      c.verified
        ? `Stall claimed \u2713 ${c.buildingName}'s landlord has already verified you`
        : `Stall claimed \u2713 Pending until ${c.buildingName}'s landlord verifies you`,
    );
  };
  const changeStall = (building, loc) => {
    const prev = stallAssignment;
    if (prev.building === building && prev.loc === loc) return;
    const moved = prev.building.trim().toLowerCase() !== String(building).trim().toLowerCase();
    setStallHistory((hs) => [
      {
        building: prev.building,
        loc: prev.loc,
        until: new Date().toISOString(),
      },
      ...hs,
    ]);
    setStallAssignment({
      building,
      loc,
    });
    if (!moved) return;
    setSellerProfile((p) => ({
      ...p,
      llPhoneVerified: false,
    }));
    const oldId = lbIdByName(prev.building);
    if (oldId)
      updLb(oldId, (cur) => {
        const gone = cur.verified.concat(cur.pending).filter((t) => sameNumber(t.phone, sellerProfile.phone));
        return gone.length
          ? {
              verified: cur.verified.filter((t) => !sameNumber(t.phone, sellerProfile.phone)),
              pending: cur.pending.filter((t) => !sameNumber(t.phone, sellerProfile.phone)),
              vacated: gone.concat(cur.vacated),
            }
          : {};
      });
    const newId = lbIdByName(building);
    if (newId)
      updLb(newId, (cur) =>
        cur.pending.concat(cur.verified).some((t) => sameNumber(t.phone, sellerProfile.phone))
          ? {}
          : {
              pending: [
                {
                  id: "mv-" + Date.now().toString(36),
                  name: sellerProfile.ownerName || sellerProfile.bizName,
                  phone: sellerProfile.phone,
                  sub: (sellerProfile.role || "Seller") + " \u00b7 " + loc,
                  initials: initials(sellerProfile.ownerName || sellerProfile.bizName || "S"),
                  color: "#8a8a8a",
                },
                ...cur.pending,
              ],
            },
      );
  };
  const [llStep, setLlStep] = useState("email");
  const [llAuthed, setLlAuthed] = useState(false);
  const llGoBack = useCallback(() => setLlStep("email"), []);
  const openLandlordModal = useCallback(() => {
    if (llAuthed) {
      navigate("/landlord/dashboard");
      return;
    }
    // Landlords use the same email + password auth as every other portal;
    // the modal hosts the shared AuthEmailStep with the landlord role.
    openAuthModal("landlord");
  }, [llAuthed, openAuthModal]);
  const emptyLb = {
    pending: [],
    verified: [],
    vacated: [],
    vacant: [],
    onPlugPay: 0,
  };
  const [lbAccounts, setLbAccounts] = usePersisted("lbaccounts", initialLbAccounts);
  const [lbData, setLbData] = usePersisted("lbdata", initialLbData);
  // Boot restore: check the session cookie, then hydrate ONLY the signed-in
  // user's own records from the backend. Anonymous visitors get the public
  // directory — never another merchant's data.
  useEffect(() => {
    if (BOOT_SYNC.done) return;
    BOOT_SYNC.done = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s && s.ok && s.signedIn) {
          setSessionInfo({ merchantSlug: s.merchantSlug || null, role: s.role || "trader", email: s.email || "" });
          if (s.role === "landlord") setLlAuthed(true);
          if (s.role === "agent") {
            setObAgentGate(false);
            setObAgentPhoneStep(false);
          }
          if (s.role === "trader" && s.merchantSlug) setMerchantLoggedIn(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        fetch("/api/bootstrap")
          .then((r) => r.json())
          .then((d) => {
            if (!d || !d.ok) return;
            try {
              if (d.session && d.session.merchantSlug) {
                // Signed in: the database is the source of truth for own records.
                if (Array.isArray(d.receipts)) setReceiptsList(d.receipts);
                if (Array.isArray(d.invoices)) setInvoicesList(d.invoices);
                if (Array.isArray(d.catalogue)) setCatalogueItems(d.catalogue);
                if (Array.isArray(d.riders)) setRiders(d.riders);
              }
              if (d.session && d.session.role === "agent" && Array.isArray(d.claims)) {
                setAgentClaims(d.claims);
              }
              if (d.session && d.session.role === "landlord") {
                if ((d.lbAccounts || []).length) {
                  setLbAccounts(d.lbAccounts);
                  if (d.lbData && Object.keys(d.lbData).length) setLbData(d.lbData);
                }
              }
              if (d.seller) {
                const sp = d.seller;
                const yr = Number(sp.established_year) || 0;
                setSellerProfile((p) =>
                  Object.assign({}, p, {
                    bizName: sp.business_name || "",
                    ownerName: sp.owner_name || "",
                    role: sp.role || "",
                    bio: sp.bio || "",
                    about: sp.about || "",
                    street: sp.street || "",
                    phone: sp.phone || "",
                    whatsapp: sp.whatsapp || "",
                    instagram: sp.instagram || "",
                    tiktok: sp.tiktok || "",
                    facebook: sp.facebook || "",
                    paybill: sp.mpesa_paybill || "",
                    account: sp.mpesa_account || "",
                    llPhoneVerified: !!sp.ll_phone_verified,
                    established: yr
                      ? yr + " \u00b7 " + (new Date().getFullYear() - yr) + " years in business"
                      : "",
                  }),
                );
              }
            } catch (e) {}
          })
          .catch(() => {});
      });
  }, []);
  const [lbActiveId, setLbActiveId] = useState("lb1");
  const lbActive = lbAccounts.filter((a) => a.id === lbActiveId)[0] || lbAccounts[0];
  const lbCur = lbData[lbActive.id] || emptyLb;
  const pendingTraders = lbCur.pending;
  const verifiedTraders = lbCur.verified;
  const vacatedTraders = lbCur.vacated;
  const vacantStalls = lbCur.vacant;
  const updLb = (id, patch) =>
    setLbData((d) => {
      const cur = d[id] || emptyLb;
      const p = typeof patch === "function" ? patch(cur) : patch;
      return {
        ...d,
        [id]: {
          ...cur,
          ...p,
        },
      };
    });
  const llEnterDashboard = () => {
    setLlAuthed(true);
    closeModal("modal-landlord");
    navigate("/landlord/dashboard");
  };
  const [asStall, setAsStall] = useState(null);
  const [asName, setAsName] = useState("");
  const [asPhone, setAsPhone] = useState("");
  const [asCategory, setAsCategory] = useState("");
  const [asSubmitting, setAsSubmitting] = useState(false);
  const asStallLabel = asStall ? `Into ${asStall.label} \u2014 ${lbActive.name}` : "";
  const llOpenAdmitSeller = useCallback(
    (stallId, stallLabel) => {
      setAsStall({
        id: stallId,
        label: stallLabel,
      });
      setAsName("");
      setAsPhone("");
      setAsCategory("");
      openModal("modal-admit-seller");
    },
    [openModal],
  );
  const lbIdByName = (name) => {
    const n = String(name || "")
      .trim()
      .toLowerCase();
    const a = lbAccounts.filter((x) => x.name.trim().toLowerCase() === n)[0];
    return a ? a.id : null;
  };
  const lbSwitch = (id) => {
    const a = lbAccounts.filter((x) => x.id === id)[0];
    if (!a) return;
    setLbActiveId(id);
    showToast(`Switched to ${a.name} \u2014 its own landlord account`);
  };
  const ensureLbAccount = (name, street, stalls) => {
    if (!String(name || "").trim() || lbIdByName(name)) return;
    const id = "lb" + Date.now().toString(36);
    setLbAccounts((a) => [
      ...a,
      {
        id,
        name: name.trim(),
        street: street || "Nairobi CBD",
        totalStalls: Number(stalls) || 0,
      },
    ]);
    setLbData((d) => ({
      ...d,
      [id]: {
        ...emptyLb,
      },
    }));
  };
  const llAddBuilding = (name, street, stalls) => {
    if (!String(name || "").trim()) {
      showToast("Enter the building name");
      return false;
    }
    if (lbIdByName(name)) {
      showToast("You already manage a building with that name");
      return false;
    }
    const id = "lb" + Date.now().toString(36);
    setLbAccounts((a) => [
      ...a,
      {
        id,
        name: name.trim(),
        street: String(street || "").trim() || "Nairobi CBD",
        totalStalls: Number(stalls) || 0,
      },
    ]);
    setLbData((d) => ({
      ...d,
      [id]: {
        ...emptyLb,
      },
    }));
    setLbActiveId(id);
    showToast(`${name.trim()} added \u2014 it has its own landlord account \u2713`);
    return true;
  };
  const landlordVerifyPending = !sellerProfile.llPhoneVerified;
  const llVerifyTrader = (id) => {
    const t = pendingTraders.filter((p) => p.id === id)[0];
    if (!t) return;
    updLb(lbActive.id, (cur) => ({
      pending: cur.pending.filter((x) => x.id !== id),
      verified: [
        {
          ...t,
          badge: "\u2713 Verified",
        },
        ...cur.verified,
      ],
    }));
    if (t.phone && sameNumber(t.phone, sellerProfile.phone))
      setSellerProfile((p) => ({
        ...p,
        llPhoneVerified: true,
      }));
    showToast(`${t.name} verified \u2713`);
    apiPost("/api/landlord", { action: "verify", name: t.name, building: lbActive.name });
  };
  const llSubmitAdmitSeller = () => {
    if (!asName.trim() || !asPhone.trim() || !asCategory.trim()) {
      showToast("Please fill in all fields");
      return;
    }
    if (!asStall) {
      closeModal("modal-admit-seller");
      return;
    }
    const stall = asStall,
      name = asName.trim(),
      phone = asPhone.trim(),
      category = asCategory.trim();
    const token = "clm" + Date.now().toString(36);
    const colors = ["#51104a", "#185FA5", "#534AB7", "#BA7517", "#8b008b"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setAgentClaims((l) => [
      {
        id: token,
        token,
        businessName: "",
        ownerName: name,
        phone,
        category,
        floor: "",
        number: stall.id,
        loc: stall.label,
        buildingName: lbActive.name,
        status: "INVITED",
        verified: true,
        source: "landlord",
        sentAt: new Date().toISOString(),
      },
      ...l,
    ]);
    updLb(lbActive.id, (cur) => ({
      vacant: cur.vacant.filter((s) => s.id !== stall.id),
      onPlugPay: cur.onPlugPay + 1,
      verified: [
        {
          id: "nv-" + token,
          claimToken: token,
          name,
          phone,
          sub: `${category} \u00b7 ${stall.label}`,
          initials: initials(name),
          color,
          badge: "\u2713 Verified",
        },
        ...cur.verified,
      ],
    }));
    showToast(`${name} admitted & verified \u2713 Claim link sent to ${phone} on WhatsApp`);
    apiPost("/api/landlord", {
      action: "admit",
      name: name,
      phone: phone,
      category: category,
      building: lbActive.name,
      stall: stall.label,
    });
    setAsStall(null);
    closeModal("modal-admit-seller");
  };
  const value = {
    openModals,
    isOpen,
    openModal,
    closeModal,
    toast,
    showToast,
    copyText,
    viewedSeller,
    loadSellerPage,
    openDirectorySeller,
    openSellerRef,
    stallHistory,
    merchantTab,
    setMerchantTab,
    openMerchantModal,
    openMerchantModalOnReviews,
    focusMerchantProfileTab,
    following,
    toggleFollowMerchant,
    viewSellerProfile,
    viewStallProfile,
    searchMode,
    setSearchMode,
    query,
    setQuery,
    resultsShown,
    resultsTitle,
    resultsMeta,
    shownResults,
    hasMore,
    moreHint,
    filter,
    setFilter,
    doSearch,
    loadMore,
    bldgFloor,
    setBldgFloor,
    bldgId,
    openBuildingModal,
    updateCatalogueItem,
    sentReceipts,
    sellerReviews,
    sellerStats,
    sendReceipt,
    submitReview,
    resendInvoice,
    sellerProfile,
    updateSellerProfile,
    setLandlordPhoneVerified,
    removeRider,
    receiptsList,
    invoicesList,
    catalogueItems,
    addCatalogueItem,
    removeCatalogueItem,
    openInvoiceInProfile,
    openReceiptInProfile,
    riders,
    riderRows,
    updateRiderRow,
    saveTrustedRiders,
    merchantLoggedIn,
    requireSellerLogin,
    openAuthModal,
    authStep,
    authRole,
    authMode,
    authSetMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authBusinessName,
    setAuthBusinessName,
    authBusy,
    authError,
    authSubmit,
    authLogout,
    sessionInfo,
    authGoBack,
    docStatus,
    fakeUpload,
    vacateBuilding,
    setVacateBuilding,
    vacateStall,
    setVacateStall,
    confirmVacate,
    stallAssignment,
    rsName,
    setRsName,
    rsPhone,
    setRsPhone,
    rsCode,
    setRsCode,
    rsItems,
    rsTotal,
    rsSubmitting,
    addItemRow,
    removeItemRow,
    updateItemRow,
    submitRecordSale,
    startSaleFromProduct,
    convertInvoiceToReceipt,
    setDocumentStatus,
    receipt,
    openOnboard,
    obAgentGate,
    obAgentMode,
    obAgentSetMethod,
    obAgentPhoneStep,
    obAgentEmail,
    setObAgentEmail,
    obAgentPassword,
    setObAgentPassword,
    obAgentError,
    obAgentSending,
    obAgentVerifying,
    obAgentSendOtp,
    obStep_,
    obGoToStep,
    obStep,
    obBldgName,
    setObBldgName,
    obFloorsCount,
    setObFloorsCount,
    obFloorStalls,
    setObFloorStall,
    obTotalStalls,
    obPayMethod,
    obNewExtra,
    setObNewExtra,
    setObPayMethod,
    obMerchantList,
    obNewName,
    setObNewName,
    obNewPhone,
    setObNewPhone,
    obNewBiz,
    setObNewBiz,
    obNewType,
    setObNewType,
    obAddMerchant,
    obStartEditMerchant,
    obCancelEditMerchant,
    obPrefillNewMerchantStall,
    obRemoveMerchant,
    resendClaim,
    changeStall,
    openClaimSignIn,
    claimInfo,
    agentClaims,
    agentBuildings,
    lbAccounts,
    lbData,
    lbActive,
    lbSwitch,
    llAddBuilding,
    landlordVerifyPending,
    llStep,
    llAuthed,
    openLandlordModal,
    llGoBack,
    pendingTraders,
    verifiedTraders,
    vacatedTraders,
    vacantStalls,
    llVerifyTrader,
    updLb,
    llOpenAdmitSeller,
    asStallLabel,
    asName,
    setAsName,
    asPhone,
    setAsPhone,
    asCategory,
    setAsCategory,
    asSubmitting,
    llSubmitAdmitSeller,
  };
  return <PlugPayContext.Provider value={value}>{children}</PlugPayContext.Provider>;
}


var STALL_POOL = [
  ["Njeri Fashions", "Fashion"],
  ["Kamau Electronics", "Electronics"],
  ["Otieno Hardware", "Hardware"],
  ["Wambui Beauty Hub", "Beauty"],
  ["Mama Ann Foods", "Food"],
  ["Salim Mobile Accessories", "Electronics"],
  ["Achieng Textiles", "Fashion"],
  ["Mwangi Tools & Fittings", "Hardware"],
  ["Zawadi Cosmetics", "Beauty"],
  ["Kip Sneakers", "Fashion"],
];

var STALL_PRODUCTS = {
  Fashion: [
    ["Ankara dress", 1800],
    ["Men's shirt", 1200],
    ["Kitenge skirt", 950],
  ],
  Electronics: [
    ["Phone charger", 450],
    ["Bluetooth earbuds", 1500],
    ["Power bank 10,000mAh", 1900],
  ],
  Hardware: [
    ["Claw hammer", 650],
    ["Padlock", 400],
    ["Paint 4L", 2200],
  ],
  Beauty: [
    ["Shea butter 250ml", 600],
    ["Hair oil", 450],
    ["Body lotion 400ml", 550],
  ],
  Food: [
    ["Chapati (10)", 250],
    ["Mandazi pack", 100],
    ["Samosas (6)", 180],
  ],
  Other: [
    ["Everyday essentials", 500],
    ["Bestseller", 800],
    ["Gift set", 1200],
  ],
};

function hashStr(s) {
  var x = 7;
  for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 100003;
  return x;
}

function buildStallProfile(pp, sp) {
  var st = sp.stall,
    hsh = hashStr(sp.floor + ":" + st.id);
  var reg =
    sp.merchant ||
    (pp.obMerchantList || []).filter(function (m) {
      return m.floor === sp.floor && String(parseInt(m.stallNum, 10)) === String(parseInt(st.id, 10));
    })[0];
  var named = st.n && st.n.indexOf("Stall ") !== 0 ? st.n : "";
  var pool = STALL_POOL[hsh % STALL_POOL.length];
  var biz = reg ? reg.biz : named || pool[0];
  var cat = reg ? reg.type : named ? "Retail" : pool[1];
  var ex = (reg && reg.extra) || {};
  return {
    biz: biz,
    owner: reg ? reg.ownerName : named ? named : biz.split(" ")[0] + " (owner)",
    cat: cat,
    loc: (sp.floor === "G" ? "Ground floor" : "Floor " + sp.floor) + ", Stall " + st.id,
    building: sp.building || "Anniversary Towers",
    verified: st.s === "v" || (reg && reg.status === "done"),
    rating: (4.2 + (hsh % 8) / 10).toFixed(1),
    reviews: 8 + (hsh % 60),
    years: ex.years || 1 + (hsh % 9),
    phone: reg ? reg.phone : "",
    photos: ex.photos || [],
    products: STALL_PRODUCTS[cat] || STALL_PRODUCTS.Other,
    registered: !!reg,
  };
}

var CAT_ICON = {
  Fashion: "\uD83D\uDC57",
  Electronics: "\uD83D\uDCF1",
  Hardware: "\uD83D\uDD27",
  Beauty: "\uD83D\uDC84",
  Food: "\uD83C\uDF72",
  Other: "\uD83D\uDCE6",
};

function slugOf(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildViewedSeller(d) {
  var hs = hashStr((d.building || "") + "|" + (d.loc || "") + "|" + (d.owner || d.biz));
  var cat = d.cat || "Retail";
  var avg = Number(d.rating) || 4.2 + (hs % 8) / 10;
  var reviewCount = Number(d.reviews) || 8 + (hs % 60);
  var sales = Number(d.sales) || 20 + (hs % 400);
  var vouches = Number(d.vouches) || 3 + (hs % 25);
  var trust = Math.min(
    99,
    Math.round(53 + (avg / 5) * 25 + Math.min(15, sales / 20) + Math.min(12, vouches / 4)),
  );
  var n5 = Math.round(reviewCount * 0.74),
    n4 = Math.round(reviewCount * 0.15),
    n3 = Math.round(reviewCount * 0.06),
    n2 = Math.round(reviewCount * 0.03);
  var dist = {
    5: n5,
    4: n4,
    3: n3,
    2: n2,
    1: Math.max(0, reviewCount - n5 - n4 - n3 - n2),
  };
  var years = Number(d.years) || 1 + (hs % 9);
  var slug = slugOf(d.biz);
  var stockBase = STALL_PRODUCTS[cat] || STALL_PRODUCTS.Other;
  return {
    key: (d.building || "") + "|" + (d.loc || ""),
    verified: !!d.verified,
    registered: !!d.registered,
    assignment: {
      building: d.building || "",
      loc: d.loc || "",
    },
    stats: {
      avg: avg,
      reviewCount: reviewCount,
      sales: sales,
      vouches: vouches,
      trust: trust,
      dist: dist,
      followers: 40 + (hs % 300),
    },
    profile: {
      bizName: d.biz,
      ownerName: d.owner || d.biz,
      role: cat === "Retail" ? "Retail Trader" : cat + " Retailer",
      bio:
        cat +
        " seller at " +
        d.building +
        ". In business for " +
        years +
        " year" +
        (years > 1 ? "s" : "") +
        ".",
      street: d.street || "Nairobi CBD",
      phone: d.phone || "Not shared",
      whatsapp: d.phone || "Not shared",
      established: 2026 - years + " \u00b7 " + years + " year" + (years > 1 ? "s" : "") + " in business",
      instagram: "@" + slug,
      tiktok: "@" + slug,
      facebook: "/" + d.biz.replace(/\s+/g, ""),
      paybill: "",
      account: "",
      about:
        d.biz +
        " sells " +
        cat.toLowerCase() +
        " products from " +
        d.loc +
        ", " +
        d.building +
        ". Message the seller on WhatsApp to place an order.",
      llPhoneVerified: !!d.verified,
    },
    catalogue: stockBase.map(function (p, i) {
      return {
        id: "v" + i,
        icon: CAT_ICON[cat] || CAT_ICON.Other,
        image: "",
        name: p[0],
        price: p[1],
        stock: 4 + ((hs + i * 7) % 20),
        category: cat,
      };
    }),
  };
}

var emptyRiderRow = (id) => ({
  id,
  name: "",
  phone: "",
  role: "Boda rider",
});

/* ---- Sales: record a sale, receipts, invoices ---- */
/* ---- Sales: record a sale, receipts, invoices ---- */
var emptyItemRow = (id) => ({
  id,
  name: "",
  price: "",
  productId: "",
  qty: 1,
  unit: "",
  category: "",
});

function receiptLink(c) {
  return appBase() + "/r/" + encodeURIComponent(codeOf(c));
}

function invoiceLink(t) {
  return appBase() + "/pay/" + encodeURIComponent(t);
}

function waReceiptText(r, seller) {
  return (
    "Hi " +
    (r.buyerName || "there") +
    ", thanks for buying from " +
    seller +
    ". Here's your PlugPay receipt for KSh " +
    Number(r.total).toLocaleString() +
    ":\n" +
    receiptLink(r.code) +
    "\n\nHow did we do? Rate your purchase (one review per receipt, link open for 6 hours):\n" +
    reviewLink(r.code)
  );
}

function waInvoiceText(inv, seller) {
  return (
    "Hi " +
    (inv.buyerName || "there") +
    ", here's your PlugPay invoice from " +
    seller +
    " for KSh " +
    Number(inv.total).toLocaleString() +
    ":\n" +
    invoiceLink(inv.token)
  );
}


/* ---- Stages (buildings, floors and stalls, merchants, review) ---- */
/* ---- Stages (buildings, floors and stalls, merchants, review) ---- */
var seedObMerchants = [
  {
    id: "seed-jane",
    biz: "Jane Mwangi",
    ownerName: "Jane Mwangi",
    phone: "0712 345 678",
    floor: "3",
    stallNum: "14",
    type: "Fashion",
    initials: "JM",
    color: "#51104a",
    status: "done",
  },
  {
    id: "seed-peter",
    biz: "Peter Otieno",
    ownerName: "Peter Otieno",
    phone: "0723 456 789",
    floor: "3",
    stallNum: "12",
    type: "Electronics",
    initials: "PO",
    color: "#185FA5",
    status: "done",
  },
  {
    id: "seed-david",
    biz: "David Mutua",
    ownerName: "David Mutua",
    phone: "0734 567 890",
    floor: "2",
    stallNum: "5",
    type: "Hardware",
    initials: "DM",
    color: "#6B3DB8",
    status: "pending",
  },
];

function waClaimText(c) {
  return (
    "Hi " +
    (c.ownerName || "there") +
    ", you've been added to PlugPay" +
    (c.businessName ? " as " + c.businessName : "") +
    " at " +
    c.buildingName +
    " (" +
    c.loc +
    "). Tap to claim your stall and sign in:\n" +
    claimLink(c.token)
  );
}

/* ---- Landlord data and helpers ---- */
/* ---- Landlord data and helpers ---- */
var initialVacantStalls = [
  {
    id: "103",
    label: "Floor 1, Stall 103",
  },
  {
    id: "204",
    label: "Floor 2, Stall 204",
  },
  {
    id: "402",
    label: "Floor 4, Stall 402",
  },
];

var initialPendingTraders = [
  {
    id: "mary",
    name: "Mary Njeri",
    sub: "Claims Floor 1, Stall 8 \xB7 Textiles",
    initials: "MN",
    color: "#8a8a8a",
  },
  {
    id: "samuel",
    name: "Samuel Kiptoo",
    sub: "Claims Floor 2, Stall 14 \xB7 Phone Accessories",
    initials: "SK",
    color: "#8a8a8a",
  },
  {
    id: "lucy",
    name: "Lucy Wambui",
    sub: "Claims Floor 3, Stall 3 \xB7 Cosmetics",
    initials: "LW",
    color: "#8a8a8a",
  },
];

var initialVerifiedTraders = [
  {
    id: "jane",
    name: "Jane Mwangi",
    sub: "Fashion \xB7 Floor 3, Stall 301",
    initials: "JM",
    color: "#51104a",
  },
  {
    id: "peter",
    name: "Peter Otieno",
    sub: "Electronics \xB7 Floor 3, Stall 302",
    initials: "PO",
    color: "#185FA5",
  },
  {
    id: "david",
    name: "David Mutua",
    sub: "Hardware \xB7 Floor 2, Stall 202",
    initials: "DM",
    color: "#534AB7",
  },
  {
    id: "amina",
    name: "Amina Kibe",
    sub: "Food \xB7 Floor 3, Stall 303",
    initials: "AK",
    color: "#BA7517",
  },
];

var initialLbAccounts = [
  {
    id: "lb1",
    name: "Anniversary Towers",
    street: "Moi Avenue \xB7 Nairobi CBD",
    totalStalls: 72,
  },
  {
    id: "lb2",
    name: "Lonrho House",
    street: "Kenyatta Ave \xB7 Nairobi CBD",
    totalStalls: 58,
  },
];

var initialLbData = {
  lb1: {
    pending: initialPendingTraders,
    verified: initialVerifiedTraders,
    vacated: [],
    vacant: initialVacantStalls,
    onPlugPay: 58,
  },
  lb2: {
    pending: [],
    verified: [
      {
        id: "grace",
        name: "Grace Akinyi",
        sub: "Beauty \xB7 Floor 1, Stall 5",
        initials: "GA",
        color: "#D85A30",
      },
    ],
    vacated: [],
    vacant: [
      {
        id: "l2s4",
        label: "Floor 2, Stall 4",
      },
      {
        id: "l2s9",
        label: "Floor 3, Stall 9",
      },
    ],
    onPlugPay: 39,
  },
};