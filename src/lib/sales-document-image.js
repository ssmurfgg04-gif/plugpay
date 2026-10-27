const BRAND = "#831978";
const INK = "#1c2138";
const MUTED = "#687087";
const RULE = "#e4e1e9";
const PALE = "#f7f3f8";

function money(value) {
  return Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 });
}

function dateLabel(value) {
  const d = new Date(value || Date.now());
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function safeFilePart(value) {
  return String(value || "document")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "document";
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

export function createSalesDocumentImage(options) {
  try {
    if (typeof document === "undefined" || typeof File === "undefined") return null;

    const kind = options.kind === "invoice" ? "invoice" : "receipt";
    const isInvoice = kind === "invoice";
    const seller = options.seller || {};
    const doc = options.doc || {};
    const assignment = options.stallAssignment || {};
    const items = (Array.isArray(doc.items) ? doc.items : []).filter((item) => item && item.name);
    const width = 900;
    const pad = 54;
    const rowHeight = 58;
    const height = 850 + items.length * rowHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, width, 176);
    ctx.fillStyle = BRAND;
    ctx.fillRect(0, 0, 10, height > 0 ? 176 : 0);

    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 24px Arial, sans-serif";
    ctx.fillText("PlugPay", pad, 49);
    ctx.font = "700 34px Arial, sans-serif";
    ctx.fillText(isInvoice ? "INVOICE" : "RECEIPT", pad, 104);
    ctx.font = "400 16px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fillText(isInvoice ? "Payment request" : "Proof of payment", pad, 137);

    ctx.textAlign = "right";
    ctx.font = "700 32px Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("KSh " + money(doc.total), width - pad, 106);
    ctx.font = "600 15px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText(isInvoice ? "TOTAL DUE" : "TOTAL PAID", width - pad, 137);
    ctx.textAlign = "left";

    let y = 220;
    ctx.fillStyle = INK;
    ctx.font = "700 27px Arial, sans-serif";
    ctx.fillText(fitText(ctx, seller.bizName || "Seller", width - pad * 2), pad, y);
    y += 31;
    ctx.fillStyle = MUTED;
    ctx.font = "400 17px Arial, sans-serif";
    const location = [assignment.building, assignment.loc, seller.street].filter(Boolean).join(" · ");
    if (seller.role) {
      ctx.fillText(fitText(ctx, seller.role, width - pad * 2), pad, y);
      y += 25;
    }
    if (location) {
      ctx.fillText(fitText(ctx, location, width - pad * 2), pad, y);
      y += 25;
    }
    y += 10;
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();

    y += 35;
    ctx.fillStyle = MUTED;
    ctx.font = "600 14px Arial, sans-serif";
    ctx.fillText(isInvoice ? "INVOICE NO." : "RECEIPT NO.", pad, y);
    ctx.fillText("DATE", width / 2 + 16, y);
    y += 27;
    ctx.fillStyle = INK;
    ctx.font = "700 18px Arial, sans-serif";
    ctx.fillText(fitText(ctx, String(isInvoice ? (doc.number || doc.token || "—") : (doc.code || "—")), width / 2 - pad - 20), pad, y);
    ctx.fillText(dateLabel(doc.createdAt), width / 2 + 16, y);

    y += 43;
    ctx.fillStyle = MUTED;
    ctx.font = "600 14px Arial, sans-serif";
    ctx.fillText(isInvoice ? "BILL TO" : "SOLD TO", pad, y);
    y += 27;
    ctx.fillStyle = INK;
    ctx.font = "700 20px Arial, sans-serif";
    ctx.fillText(fitText(ctx, doc.buyerName || "Buyer", width - pad * 2), pad, y);
    y += 25;
    ctx.fillStyle = MUTED;
    ctx.font = "400 17px Arial, sans-serif";
    ctx.fillText(fitText(ctx, doc.buyerPhone || "", width - pad * 2), pad, y);

    y += 40;
    roundedRect(ctx, pad, y, width - pad * 2, 44, 8, PALE);
    ctx.fillStyle = BRAND;
    ctx.font = "700 15px Arial, sans-serif";
    ctx.fillText("ITEM", pad + 16, y + 28);
    ctx.textAlign = "right";
    ctx.fillText("AMOUNT (KES)", width - pad - 16, y + 28);
    ctx.textAlign = "left";
    y += 44;

    items.forEach((item, index) => {
      if (index % 2 === 1) {
        ctx.fillStyle = "#fbfafc";
        ctx.fillRect(pad, y, width - pad * 2, rowHeight);
      }
      const qty = Math.max(1, Number(item.qty) || 1);
      const name = fitText(ctx, qty + " × " + item.name, 500);
      ctx.fillStyle = INK;
      ctx.font = "600 18px Arial, sans-serif";
      ctx.fillText(name, pad + 16, y + 25);
      ctx.fillStyle = MUTED;
      ctx.font = "400 14px Arial, sans-serif";
      const unit = Number(item.unit || (Number(item.price || 0) / qty));
      if (qty > 1 && Number.isFinite(unit)) ctx.fillText(qty + " × KSh " + money(unit), pad + 16, y + 45);
      ctx.textAlign = "right";
      ctx.fillStyle = INK;
      ctx.font = "700 18px Arial, sans-serif";
      ctx.fillText("KSh " + money(item.price), width - pad - 16, y + 33);
      ctx.textAlign = "left";
      ctx.strokeStyle = RULE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, y + rowHeight);
      ctx.lineTo(width - pad, y + rowHeight);
      ctx.stroke();
      y += rowHeight;
    });

    y += 22;
    roundedRect(ctx, pad, y, width - pad * 2, 82, 10, "#f5eef7");
    ctx.fillStyle = INK;
    ctx.font = "700 20px Arial, sans-serif";
    ctx.fillText(isInvoice ? "TOTAL DUE" : "TOTAL PAID", pad + 18, y + 34);
    ctx.textAlign = "right";
    ctx.fillStyle = BRAND;
    ctx.font = "700 28px Arial, sans-serif";
    ctx.fillText("KSh " + money(doc.total), width - pad - 18, y + 48);
    ctx.textAlign = "left";
    y += 110;

    if (!isInvoice && doc.paymentRef) {
      ctx.fillStyle = MUTED;
      ctx.font = "600 15px Arial, sans-serif";
      ctx.fillText("PAYMENT", pad, y);
      ctx.fillStyle = INK;
      ctx.font = "600 17px Arial, sans-serif";
      ctx.fillText(fitText(ctx, "M-Pesa · " + doc.paymentRef, width - pad * 2), pad, y + 27);
      y += 55;
    } else if (isInvoice) {
      const due = new Date(doc.createdAt || Date.now());
      due.setDate(due.getDate() + 14);
      ctx.fillStyle = MUTED;
      ctx.font = "600 15px Arial, sans-serif";
      ctx.fillText("PAYMENT DUE", pad, y);
      ctx.fillStyle = INK;
      ctx.font = "600 17px Arial, sans-serif";
      ctx.fillText(dateLabel(due), pad, y + 27);
      if (seller.payMethod || seller.paybill || seller.account) {
        ctx.fillStyle = MUTED;
        ctx.font = "600 15px Arial, sans-serif";
        ctx.fillText("PAYMENT DETAILS", width / 2 + 20, y);
        const pay = [seller.payMethod, seller.paybill ? "Paybill " + seller.paybill : "", seller.account ? "Account " + seller.account : ""].filter(Boolean).join(" · ");
        ctx.fillStyle = INK;
        ctx.font = "400 16px Arial, sans-serif";
        ctx.fillText(fitText(ctx, pay, width / 2 - pad - 24), width / 2 + 20, y + 27);
      }
      y += 55;
    }

    y += 16;
    ctx.strokeStyle = RULE;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
    y += 30;
    ctx.fillStyle = BRAND;
    ctx.font = "700 15px Arial, sans-serif";
    ctx.fillText(isInvoice ? "VIEW AND PAY ONLINE" : "VIEW RECEIPT ONLINE", pad, y);
    y += 27;
    ctx.fillStyle = INK;
    ctx.font = "400 16px Arial, sans-serif";
    ctx.fillText(fitText(ctx, options.publicUrl || "", width - pad * 2), pad, y);
    y += 36;
    ctx.fillStyle = MUTED;
    ctx.font = "400 14px Arial, sans-serif";
    ctx.fillText("Generated by PlugPay · Keep this image for your records.", pad, y);

    // Crop away unused canvas space without affecting the rendered content.
    const crop = document.createElement("canvas");
    crop.width = width;
    crop.height = Math.min(height, y + 48);
    const cropCtx = crop.getContext("2d");
    if (!cropCtx) return null;
    cropCtx.drawImage(canvas, 0, 0, width, crop.height);

    const dataUrl = crop.toDataURL("image/png");
    const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const binary = window.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const reference = safeFilePart(isInvoice ? (doc.number || doc.token) : doc.code);
    const fileName = (isInvoice ? "Invoice-" : "Receipt-") + reference + ".png";
    return new File([bytes], fileName, { type: "image/png" });
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

export function shareSalesDocument(options) {
  const file = createSalesDocumentImage(options);
  const openWhatsApp = options.openWhatsApp;
  const showToast = options.showToast;
  const phone = options.phone || "";
  const text = options.text || "";

  const fallback = () => {
    if (file) {
      try {
        downloadFile(file);
      } catch (error) {
        // Keep the text fallback available even when downloads are blocked.
      }
      if (typeof openWhatsApp === "function") openWhatsApp(phone, text);
      if (typeof showToast === "function") {
        showToast("PNG downloaded. WhatsApp has the summary ready; attach the image before sending.");
      }
      return "download";
    }
    if (typeof openWhatsApp === "function") openWhatsApp(phone, text);
    if (typeof showToast === "function") {
      showToast("WhatsApp opened with the summary. The image could not be prepared; use the online document link.");
    }
    return "text";
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
        showToast("Choose WhatsApp and the buyer's chat to share the PNG and summary.");
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

  return fallback();
}
