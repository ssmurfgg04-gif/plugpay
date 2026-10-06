/* ---- Auth: sign in ---- */
export var llAuthIconWrap = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "var(--accent-bg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  margin: "0 auto 12px",
};

export var llAuthLabel = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--muted)",
  fontFamily: "var(--fm)",
  display: "block",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: ".06em",
};

export var llAuthTextInput = {
  width: "100%",
  padding: "13px 14px",
  border: "1.5px solid var(--border2)",
  borderRadius: "var(--r6)",
  fontSize: "16px",
  fontFamily: "var(--fb)",
  outline: "none",
  background: "var(--bg)",
  transition: "border-color .2s",
  marginBottom: "16px",
};

export var llAuthCodeInput = {
  width: "100%",
  padding: "16px 14px",
  border: "1.5px solid var(--border2)",
  borderRadius: "var(--r6)",
  fontSize: "28px",
  fontFamily: "var(--fm)",
  outline: "none",
  background: "var(--bg)",
  transition: "border-color .2s",
  marginBottom: "16px",
  letterSpacing: "10px",
  textAlign: "center",
};

export var llAuthSubmitBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "100px",
  background: "var(--grad)",
  color: "#fff",
  fontFamily: "var(--fb)",
  fontSize: "15px",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
};

export var llAuthLink = {
  color: "var(--accent)",
  textDecoration: "none",
  fontWeight: 700,
};

export function llFocusRing() {
  return {
    onFocus: (e) => (e.currentTarget.style.borderColor = "var(--accent)"),
    onBlur: (e) => (e.currentTarget.style.borderColor = "var(--border2)"),
  };
}

export function landlordVacateSeller(pp, seller) {
  if (!seller) {
    return;
  }
  var sellerId = seller.id;
  var location = String(seller.sub || seller.location || "");
  var stallMatch = location.match(/Stall\s*([A-Za-z0-9-]+)/i);
  var stallId = stallMatch ? stallMatch[1] : seller.stallId;
  var buildingId = pp.lbActive && pp.lbActive.id;
  if (!buildingId) {
    return;
  }
  pp.updLb(buildingId, function (current) {
    var vacant = current.vacant || [];
    var alreadyVacant = vacant.some(function (stall) {
      return String(stall.id) === String(stallId);
    });
    return {
      pending: current.pending || [],
      verified: (current.verified || []).filter(function (x) {
        return x.id !== sellerId;
      }),
      vacated: [seller, ...(current.vacated || [])],
      vacant:
        stallId && !alreadyVacant
          ? [
              {
                id: stallId,
                label: "Stall " + stallId,
                available: true,
              },
              ...vacant,
            ]
          : vacant,
    };
  });
  pp.showToast(seller.name + " vacated. Stall " + (stallId || "") + " is now available.");
}