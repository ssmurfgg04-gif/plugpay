"use client";

import { usePlugPay } from "@/store/context";
import { LOGO_DATA_URI } from "@/lib/assets";

export function Footer() {
  const { doSearch, openAuthModal, openMerchantModal, openModal } = usePlugPay();
  return (
    <footer>
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <img
            src={LOGO_DATA_URI}
            alt="PlugPay"
            style={{
              height: "19px",
              width: "auto",
              display: "block",
            }}
          />
          <p className="footer-desc">
            The trust layer for Kenya's market traders. Turn every sale into permanent, public proof of who
            you are as a merchant.
          </p>
        </div>
        <div className="footer-col">
          <div className="footer-col-h">Product</div>
          <a href="#breakthrough">How it works</a>
          <a href="#contrast">Features</a>
          <a href="#pricing">Pricing</a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              doSearch("");
            }}
          >
            Find buildings
          </a>
        </div>
        <div className="footer-col">
          <div className="footer-col-h">Merchants</div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openAuthModal();
            }}
          >
            Sign in to your stall
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openMerchantModal();
            }}
          >
            Sample profile
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal("modal-quick");
            }}
          >
            POS demo
          </a>
          <a href="/seller-guide">Seller guide</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-h">Company</div>
          <a href="#friction">Our story</a>
          <a href="/privacy-policy">Privacy policy</a>
          <a href="/terms-of-service">Terms of service</a>
          <a href="mailto:hello@plugpay.co.ke">hello@plugpay.co.ke</a>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <div className="foot-copy">{"\xA9 2026 PlugPay \xB7 Nairobi, Kenya"}</div>
        <div className="foot-tagline">
          {"Built for Kenya's market traders \xB7 Every stall deserves a name"}
        </div>
      </div>
    </footer>
  );
}