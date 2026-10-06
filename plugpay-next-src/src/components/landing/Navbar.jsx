"use client";

import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { LOGO_DATA_URI } from "@/lib/assets";

export function Navbar() {
  const { openLandlordModal, openAuthModal } = usePlugPay();
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-top">
          <a href="#" className="logo">
            <img
              src={LOGO_DATA_URI}
              alt="PlugPay"
              style={{
                height: "16px",
                width: "auto",
                display: "block",
              }}
            />
          </a>
          <div className="nav-links">
            <a href="#friction">Problem</a>
            <a href="#breakthrough">How it works</a>
            <a href="#contrast">Why PlugPay</a>
            <a href="#pricing">Pricing</a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLandlordModal();
              }}
            >
              List a building
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openAuthModal();
              }}
            >
              Sign in
            </a>
            <Link to="/seller/dashboard">Seller dashboard</Link>
            <Link to="/landlord/dashboard">Landlord dashboard</Link>
            <Link to="/agent/claims">Agent claims</Link>
            <Link to="/search">Search</Link>
          </div>
          <a
            href="#"
            className="nav-cta"
            onClick={(e) => {
              e.preventDefault();
              openAuthModal();
            }}
          >
            Join us
          </a>
        </div>
      </div>
    </nav>
  );
}