const BRAND = "#a52a8e"; // brighter than the on-white brand so it pops on ink
const BRAND_DARK = "#831978";
const BRAND_LIGHT = "#e879d0";
const INK = "#141830";
const INK_2 = "#1e2340";
const INK_3 = "#262c4e";
const PAPER = "#f3f1f7";
const MUTED = "#a9a4bb";
const SOFT = "#c9c4d4";
const GOLD = "#ffd166";
const OK = "#7ee2a8";
const WARN = "#ffcf6b";

export function profilePublicUrl(slug) {
  const base =
    (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "https://plugpay.co.ke";
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
  if (lines.length) {
    lines[lines.length - 1] = fitText(ctx, lines[lines.length - 1], maxWidth);
  }
  return lines;
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, fill) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawVerifiedTick(ctx, cx, cy, r, ringColor) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = BRAND_DARK;
  ctx.fill();
  ctx.strokeStyle = ringColor || INK;
  ctx.lineWidth = Math.max(3, r * 0.16);
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2, r * 0.18);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.12, cy + r * 0.4);
  ctx.lineTo(cx + r * 0.56, cy - r * 0.36);
  ctx.stroke();
  ctx.lineCap = "butt";
}

function drawStar(ctx, cx, cy, r, fillStyle) {
  // Standard 5-point star: 10 vertices alternating outer/inner radius,
  // starting at 12 o'clock.
  const inner = r * 0.44;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function setSpacing(ctx, px) {
  try {
    ctx.letterSpacing = px + "px";
  } catch (error) {
    // Older canvas implementations: spacing is cosmetic, ignore.
  }
}

export function createProfileCardImage(options) {
  try {
    if (typeof document === "undefined" || typeof File === "undefined") return null;

    const o = options || {};
    const seller = o.seller || {};
    const stats = o.stats || {};
    const assignment = o.stallAssignment || {};
    const pending = !!o.landlordVerifyPending;
    const verifiedLevel =
      seller.verified === "trusted" ? "trusted" : seller.verified === "verified" ? "verified" : "basic";
    const isVerified = verifiedLevel === "verified" || verifiedLevel === "trusted";
    const badgeLabel =
      verifiedLevel === "trusted"
        ? "✓ TRUSTED SELLER"
        : isVerified
          ? "✓ VERIFIED SELLER"
          : "PLUGPAY SELLER";
    const url = o.url || profilePublicUrl(o.slug);
    const shortUrl = url.replace(/^https?:\/\//, "");

    const width = 1080;
    const height = 1350;
    const pad = 76;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // ---- Background: ink with a soft brand glow, top-right -----------------
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width + 120, -140, 60, width + 120, -140, 900);
    glow.addColorStop(0, "rgba(165, 42, 142, 0.5)");
    glow.addColorStop(0.5, "rgba(165, 42, 142, 0.18)");
    glow.addColorStop(1, "rgba(165, 42, 142, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    const glow2 = ctx.createRadialGradient(-140, height + 60, 40, -140, height + 60, 700);
    glow2.addColorStop(0, "rgba(131, 25, 120, 0.4)");
    glow2.addColorStop(1, "rgba(131, 25, 120, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // ---- Wordmark row ------------------------------------------------------
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 34px Arial, sans-serif";
    ctx.fillText("PlugPay", pad, 88);
    // Wordmark dot, brandy
    const wordW = ctx.measureText("PlugPay").width;
    ctx.beginPath();
    ctx.arc(pad + wordW + 12, 78, 7, 0, Math.PI * 2);
    ctx.fillStyle = BRAND_LIGHT;
    ctx.fill();

    ctx.textAlign = "right";
    setSpacing(ctx, 3);
    ctx.font = "700 19px Arial, sans-serif";
    ctx.fillStyle = MUTED;
    ctx.fillText("PLUGPAY.CO.KE", width - pad, 84);
    setSpacing(ctx, 0);
    ctx.textAlign = "left";

    // Hairline under wordmark
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, 118);
    ctx.lineTo(width - pad, 118);
    ctx.stroke();

    // ---- Kicker ------------------------------------------------------------
    setSpacing(ctx, 4);
    ctx.font = "700 20px Arial, sans-serif";
    ctx.fillStyle = BRAND_LIGHT;
    ctx.fillText("S E L L E R   P R O F I L E", pad, 168);
    setSpacing(ctx, 0);

    // ---- Avatar ------------------------------------------------------------
    const avatarR = 96;
    const avatarCx = pad + avatarR;
    const avatarCy = 168 + 26 + avatarR;
    // Soft brand halo
    const halo = ctx.createRadialGradient(avatarCx, avatarCy, avatarR * 0.6, avatarCx, avatarCy, avatarR * 1.9);
    halo.addColorStop(0, "rgba(232, 121, 208, 0.35)");
    halo.addColorStop(1, "rgba(232, 121, 208, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(avatarCx - avatarR * 2, avatarCy - avatarR * 2, avatarR * 4, avatarR * 4);
    // Ring
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarR + 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fill();
    // Gradient disc
    const disc = ctx.createLinearGradient(avatarCx - avatarR, avatarCy - avatarR, avatarCx + avatarR, avatarCy + avatarR);
    disc.addColorStop(0, "#c04aad");
    disc.addColorStop(1, BRAND_DARK);
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = disc;
    ctx.fill();
    const initial = String(seller.bizName || "W").trim().charAt(0).toUpperCase() || "W";
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 116px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initial, avatarCx, avatarCy + 10);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    if (isVerified) drawVerifiedTick(ctx, avatarCx + avatarR * 0.78, avatarCy + avatarR * 0.78, 36, INK);

    // ---- Name, role, rating -------------------------------------------------
    const textX = pad + avatarR * 2 + 44;
    const textMax = width - textX - pad;
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 50px Arial, sans-serif";
    const nameLines = wrapText(ctx, seller.bizName || "Business", textMax, 2);
    let nameY = avatarCy - (nameLines.length - 1) * 30 - 8;
    for (let i = 0; i < nameLines.length; i += 1) {
      ctx.fillText(nameLines[i], textX, nameY);
      nameY += 56;
    }
    const roleLine = [seller.ownerName, seller.role].filter(Boolean).join("  ·  ");
    if (roleLine) {
      ctx.fillStyle = SOFT;
      ctx.font = "400 24px Arial, sans-serif";
      ctx.fillText(fitText(ctx, roleLine, textMax), textX, nameY + 6);
      nameY += 38;
    }
    // Stars
    const avg = Number(stats.avg) || 0;
    const count = Number(stats.reviewCount) || 0;
    const starY = nameY + 34;
    const starR = 13;
    for (let i = 0; i < 5; i += 1) {
      drawStar(ctx, textX + 16 + i * 38, starY, starR, i < Math.round(avg) ? GOLD : "rgba(255,255,255,0.18)");
    }
    ctx.fillStyle = SOFT;
    ctx.font = "700 22px Arial, sans-serif";
    const ratingText = count > 0 ? avg.toFixed(1) + " (" + count + " review" + (count === 1 ? "" : "s") + ")" : "New seller";
    ctx.fillText(ratingText, textX + 5 * 38 + 12, starY + 8);

    // ---- Verified badge pill ------------------------------------------------
    const badgeY = avatarCy + avatarR + 46;
    ctx.font = "800 21px Arial, sans-serif";
    const badgeText = badgeLabel;
    const badgeW = ctx.measureText(badgeText).width + 64;
    const badgeGrad = ctx.createLinearGradient(pad, badgeY, pad + badgeW, badgeY);
    badgeGrad.addColorStop(0, BRAND_DARK);
    badgeGrad.addColorStop(1, "#a52a8e");
    fillRoundRect(ctx, pad, badgeY, badgeW, 54, 27, badgeGrad);
    ctx.fillStyle = "#ffffff";
    setSpacing(ctx, 1.5);
    ctx.fillText(badgeText, pad + 32, badgeY + 35);
    setSpacing(ctx, 0);

    // ---- Bio -----------------------------------------------------------------
    let y = badgeY + 54 + 58;
    ctx.fillStyle = PAPER;
    ctx.font = "400 26px Arial, sans-serif";
    const bioLines = wrapText(ctx, seller.bio || "Verified seller on PlugPay.", width - pad * 2, 2);
    for (let i = 0; i < bioLines.length; i += 1) {
      ctx.fillText(bioLines[i], pad, y);
      y += 38;
    }

    // ---- Location + WhatsApp -------------------------------------------------
    y += 12;
    ctx.fillStyle = MUTED;
    ctx.font = "400 23px Arial, sans-serif";
    const locParts = [];
    if (seller.street) locParts.push("📍 " + seller.street);
    if (assignment.building) locParts.push(assignment.building + (assignment.loc ? ", " + assignment.loc : ""));
    if (locParts.length) {
      ctx.fillText(fitText(ctx, locParts.join("   ·   "), width - pad * 2), pad, y);
      y += 36;
    }
    if (seller.whatsapp) {
      ctx.fillText(fitText(ctx, "💬 WhatsApp  " + seller.whatsapp, width - pad * 2), pad, y);
      y += 36;
    }

    // ---- Stats band -----------------------------------------------------------
    const statsY = 884;
    const statsH = 168;
    fillRoundRect(ctx, pad, statsY, width - pad * 2, statsH, 24, INK_2);
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, pad, statsY, width - pad * 2, statsH, 24);
    ctx.stroke();
    const statItems = [
      [String(Number(stats.sales) || 0), "SALES"],
      [String(count), "REVIEWS"],
      [String(Number(stats.trust) || 0) + "/99", "TRUST SCORE"],
    ];
    const cellW = (width - pad * 2) / statItems.length;
    for (let i = 0; i < statItems.length; i += 1) {
      const cx = pad + cellW * i + cellW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 54px Arial, sans-serif";
      ctx.fillText(statItems[i][0], cx, statsY + 80);
      setSpacing(ctx, 2);
      ctx.fillStyle = MUTED;
      ctx.font = "700 18px Arial, sans-serif";
      ctx.fillText(statItems[i][1], cx, statsY + 126);
      setSpacing(ctx, 0);
      if (i > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad + cellW * i, statsY + 36);
        ctx.lineTo(pad + cellW * i, statsY + statsH - 36);
        ctx.stroke();
      }
    }
    ctx.textAlign = "left";

    // ---- Landlord verification -------------------------------------------------
    ctx.font = "700 22px Arial, sans-serif";
    if (pending) {
      ctx.fillStyle = WARN;
      ctx.fillText("⏳  Landlord verification pending", pad, statsY + statsH + 46);
    } else {
      ctx.fillStyle = OK;
      ctx.fillText("✓  Landlord-verified stall", pad, statsY + statsH + 46);
    }

    // ---- CTA pill with link ---------------------------------------------------
    const ctaY = statsY + statsH + 88;
    setSpacing(ctx, 3);
    ctx.fillStyle = MUTED;
    ctx.font = "700 18px Arial, sans-serif";
    ctx.fillText("V I E W   &   V E R I F Y   O N   P L U G P A Y", pad, ctaY);
    setSpacing(ctx, 0);
    const ctaH = 74;
    const ctaW = width - pad * 2;
    const ctaGrad = ctx.createLinearGradient(pad, ctaY + 16, pad + ctaW, ctaY + 16);
    ctaGrad.addColorStop(0, "#c04aad");
    ctaGrad.addColorStop(0.5, BRAND_DARK);
    ctaGrad.addColorStop(1, "#5f0f57");
    fillRoundRect(ctx, pad, ctaY + 16, ctaW, ctaH, ctaH / 2, ctaGrad);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 28px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fitText(ctx, shortUrl, ctaW - 64), width / 2, ctaY + 16 + ctaH / 2 + 10);
    ctx.textAlign = "left";

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
