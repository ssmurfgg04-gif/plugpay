const BRAND = "#831978";
const BRAND_DARK = "#5f0f57";
const INK = "#1c2138";
const MUTED = "#687087";
const RULE = "#e4e1e9";
const PALE = "#f7f3f8";

export function profilePublicUrl(slug) {
  const base =
    (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "https://plugnply.netlify.app";
  const clean = String(base).replace(/\/+$/, "");
  const s = String(slug || "").trim();
  return s ? clean + "/sellers/" + encodeURIComponent(s) : clean;
}

export function profileCardShareText(options) {
  const seller = (options && options.seller) || {};
  const url = (options && options.url) || "";
  const name = seller.bizName || "This seller";
  const bio = seller.bio ? " — " + String(seller.bio).trim() : "";
  return (
    "Check out " + name + " on PlugPay" + bio + " Verified profile: " + url
  ).trim();
}

function fitText(ctx, value, maxWidth) {
  const full = String(value || "");
  if (ctx.measureText(full).width <= maxWidth) return full;
  let out = full;
  while (out.length > 1 && ctx.measureText(out + "…").width > maxWidth) {
    out = out.slice(0, -1);
  }
  return out + "…";
}

function wrapText(ctx, value, maxWidth, maxLines) {
  const words = String(value || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (let i = 0; i < words.length; i += 1) {
    const next = cur ? cur + " " + words[i] : words[i];
    if (ctx.measureText(next).width <= maxWidth || !cur) {
      cur = next;
    } else {
      lines.push(cur);
      cur = words[i];
      if (lines.length === maxLines - 1) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  // Clamp the final line so it never overflows.
  if (lines.length) {
    lines[lines.length - 1] = fitText(ctx, lines[lines.length - 1], maxWidth);
  }
  return lines;
}

function roundedRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawVerifiedTick(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = BRAND;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2, r * 0.18);
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.52, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.12, cy + r * 0.42);
  ctx.lineTo(cx + r * 0.58, cy - r * 0.38);
  ctx.stroke();
}

export function createProfileCardImage(options) {
  try {
    if (typeof document === "undefined" || typeof File === "undefined") return null;

    const o = options || {};
    const seller = o.seller || {};
    const stats = o.stats || {};
    const assignment = o.stallAssignment || {};
    const pending = !!o.landlordVerifyPending;
    const verifiedLevel = seller.verified === "trusted" ? "trusted" : seller.verified === "verified" ? "verified" : "basic";
    const isVerified = verifiedLevel === "verified" || verifiedLevel === "trusted";
    const badgeLabel =
      verifiedLevel === "trusted"
        ? "Trusted Seller Profile"
        : isVerified
          ? "Verified Seller Profile"
          : "PlugPay Seller Profile";
    const url = o.url || profilePublicUrl(o.slug);

    const width = 1080;
    const height = 1350;
    const pad = 72;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Card body
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Header band
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, width, 240);
    ctx.fillStyle = BRAND;
    ctx.fillRect(0, 0, 14, 240);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 34px Arial, sans-serif";
    ctx.fillText("PlugPay", pad, 74);
    ctx.font = "800 44px Arial, sans-serif";
    ctx.fillStyle = "#f3d9ef";
    ctx.fillText("SELLER PROFILE CARD", pad, 148);
    ctx.font = "400 22px Arial, sans-serif";
    ctx.fillStyle = "#c9c4d4";
    ctx.fillText("Trusted WhatsApp commerce · plugpay.co.ke", pad, 196);

    // Avatar
    const avatarR = 108;
    const avatarCx = pad + avatarR;
    const avatarCy = 240 + 96;
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarR + 10, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = BRAND;
    ctx.fill();
    const initial = String(seller.bizName || "W").trim().charAt(0).toUpperCase() || "W";
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 128px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initial, avatarCx, avatarCy + 8);
    if (isVerified) drawVerifiedTick(ctx, avatarCx + avatarR * 0.72, avatarCy + avatarR * 0.72, 40);
    ctx.textBaseline = "alphabetic";

    // Name + role (to the right of avatar if room, else below)
    const textX = pad + avatarR * 2 + 48;
    const textMax = width - textX - pad;
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "800 52px Arial, sans-serif";
    const nameLines = wrapText(ctx, seller.bizName || "Business", textMax, 2);
    let nameY = avatarCy - (nameLines.length - 1) * 30 - 6;
    for (let i = 0; i < nameLines.length; i += 1) {
      ctx.fillText(nameLines[i], textX, nameY);
      nameY += 58;
    }
    ctx.fillStyle = MUTED;
    ctx.font = "400 26px Arial, sans-serif";
    const roleLine = [seller.ownerName, seller.role].filter(Boolean).join(" · ");
    ctx.fillText(fitText(ctx, roleLine, textMax), textX, nameY + 4);

    // Badge pill
    const badgeY = avatarCy + avatarR + 42;
    ctx.font = "800 24px Arial, sans-serif";
    const badgeText = badgeLabel;
    const badgeW = ctx.measureText(badgeText).width + 92;
    roundedRect(ctx, pad, badgeY, badgeW, 56, 28, PALE);
    if (isVerified) drawVerifiedTick(ctx, pad + 34, badgeY + 28, 15);
    ctx.fillStyle = BRAND_DARK;
    ctx.fillText(badgeText, pad + 62, badgeY + 37);

    // Bio
    let y = badgeY + 56 + 56;
    ctx.fillStyle = INK;
    ctx.font = "400 27px Arial, sans-serif";
    const bioLines = wrapText(ctx, seller.bio || "Verified seller on PlugPay.", width - pad * 2, 2);
    for (let i = 0; i < bioLines.length; i += 1) {
      ctx.fillText(bioLines[i], pad, y);
      y += 40;
    }

    // Location
    const locParts = [];
    if (seller.street) locParts.push("📍 " + seller.street);
    if (assignment.building) {
      locParts.push(assignment.building + (assignment.loc ? ", " + assignment.loc : ""));
    }
    if (locParts.length) {
      y += 10;
      ctx.fillStyle = MUTED;
      ctx.font = "400 25px Arial, sans-serif";
      ctx.fillText(fitText(ctx, locParts.join("  ·  "), width - pad * 2), pad, y);
    }

    // Stats band
    const statsY = 856;
    const statsH = 190;
    roundedRect(ctx, pad, statsY, width - pad * 2, statsH, 26, PALE);
    const statItems = [
      [String(Number(stats.sales) || 0), "SALES"],
      [String(Number(stats.reviewCount) || 0), "REVIEWS"],
      [String(Number(stats.trust) || 0) + "/99", "TRUST"],
    ];
    const cellW = (width - pad * 2) / statItems.length;
    for (let i = 0; i < statItems.length; i += 1) {
      const cx = pad + cellW * i + cellW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = BRAND_DARK;
      ctx.font = "800 56px Arial, sans-serif";
      ctx.fillText(statItems[i][0], cx, statsY + 88);
      ctx.fillStyle = MUTED;
      ctx.font = "700 21px Arial, sans-serif";
      ctx.fillText(statItems[i][1], cx, statsY + 140);
      if (i > 0) {
        ctx.strokeStyle = RULE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad + cellW * i, statsY + 42);
        ctx.lineTo(pad + cellW * i, statsY + statsH - 42);
        ctx.stroke();
      }
    }
    ctx.textAlign = "left";

    // Landlord verification line
    ctx.fillStyle = pending ? MUTED : BRAND_DARK;
    ctx.font = "700 24px Arial, sans-serif";
    ctx.fillText(
      pending ? "⏳ Landlord verification pending" : "✓ Landlord verified stall",
      pad,
      statsY + statsH + 56,
    );

    // Footer
    const footerY = height - 150;
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, footerY);
    ctx.lineTo(width - pad, footerY);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = "800 30px Arial, sans-serif";
    ctx.fillText("View & verify on PlugPay", pad, footerY + 52);
    ctx.fillStyle = BRAND;
    ctx.font = "700 27px Arial, sans-serif";
    ctx.fillText(fitText(ctx, url.replace(/^https?:\/\//, ""), width - pad * 2), pad, footerY + 98);

    const dataUrl = canvas.toDataURL("image/png");
    const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const binary = window.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const reference = String(seller.bizName || "profile")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "profile";
    return new File([bytes], "PlugPay-Profile-" + reference + ".png", { type: "image/png" });
  } catch (error) {
    return null;
  }
}

function downloadFile(file) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

export function shareProfileCard(options) {
  const o = options || {};
  const url = o.url || profilePublicUrl(o.slug);
  const text = o.text || profileCardShareText({ seller: o.seller, url });
  const showToast = o.showToast;
  const copyText = o.copyText;
  const file = createProfileCardImage({
    seller: o.seller,
    stats: o.stats,
    stallAssignment: o.stallAssignment,
    landlordVerifyPending: o.landlordVerifyPending,
    url,
  });

  const fallback = () => {
    let downloaded = false;
    if (file) {
      try {
        downloadFile(file);
        downloaded = true;
      } catch (error) {
        // Fall through to the link copy path.
      }
    }
    if (typeof copyText === "function") {
      copyText(url, downloaded ? "Card downloaded · profile link copied ✓" : "Profile link copied ✓");
      return downloaded ? "download+copy" : "copy";
    }
    if (typeof showToast === "function") {
      showToast(downloaded
        ? "Profile card downloaded. Attach it in WhatsApp to share."
        : "Could not prepare the card. Open your profile link instead.");
    }
    return downloaded ? "download" : "unavailable";
  };

  if (typeof window === "undefined") return "unavailable";
  const nav = window.navigator;
  let canShareFile = false;
  try {
    canShareFile =
      !!file &&
      typeof nav.share === "function" &&
      typeof nav.canShare === "function" &&
      nav.canShare({ files: [file] });
  } catch (error) {
    canShareFile = false;
  }

  if (canShareFile) {
    try {
      const result = nav.share({ files: [file], text, title: file.name });
      if (typeof showToast === "function") {
        showToast("Choose WhatsApp and the buyer's chat to share your profile card.");
      }
      Promise.resolve(result).catch((error) => {
        if (error && error.name === "AbortError") return;
        fallback();
      });
      return "share";
    } catch (error) {
      return fallback();
    }
  }

  // No file-sharing support: try text-only share, else download + copy.
  if (typeof nav.share === "function") {
    try {
      const result = nav.share({ text, url, title: (o.seller && o.seller.bizName) || "PlugPay seller" });
      Promise.resolve(result).catch((error) => {
        if (error && error.name === "AbortError") return;
        fallback();
      });
      return "share-text";
    } catch (error) {
      return fallback();
    }
  }

  return fallback();
}
