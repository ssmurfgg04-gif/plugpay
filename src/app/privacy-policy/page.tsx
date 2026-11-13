import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — PlugPay',
};

export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: '0 20px 60px', fontFamily: 'Inter, sans-serif', color: '#1c2138', lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p><em>Last updated: 12 November 2026</em></p>

      <h2>Who we are</h2>
      <p>PlugPay is the trust layer for Kenya's WhatsApp commerce, operated by PlugPay Limited ("PlugPay", "we", "our"). We verify sellers from Nairobi's commercial buildings, anchor every sale to a real receipt, and turn a WhatsApp chat into a storefront buyers can trust.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> email address, hashed password, role (seller, landlord, agent, admin)</li>
        <li><strong>Business profile:</strong> business name, owner name, category, phone/WhatsApp numbers, building and stall assignment</li>
        <li><strong>Transaction data:</strong> receipt items, totals, M-Pesa reference codes, buyer names/phone numbers</li>
        <li><strong>Documents you upload:</strong> ID front/back, business license, KRA PIN certificate — stored in our private storage bucket, visible only to you and PlugPay administrators</li>
      </ul>

      <h2>How we use your data</h2>
      <ul>
        <li>To verify your identity and manage your account</li>
        <li>To display your public seller profile and receipt history to buyers</li>
        <li>To prevent fraud: we match every sale to a valid M-Pesa code and block duplicates</li>
        <li>To notify you about your account (sign-in, password reset)</li>
      </ul>

      <h2>What we never do</h2>
      <ul>
        <li>We never sell your personal data</li>
        <li>We never share your documents with your landlord — landlord verification only confirms your stall assignment</li>
        <li>We never display your phone number publicly without your consent</li>
      </ul>

      <h2>Your rights</h2>
      <p>You can request a copy or deletion of your data at any time by emailing <a href="mailto:hello@plugpay.co.ke">hello@plugpay.co.ke</a>. We respond within 14 days.</p>

      <h2>M-Pesa codes</h2>
      <p>M-Pesa confirmation codes you record are used solely to prevent duplicate or fraudulent sales being attributed to you. They are not used for credit scoring or marketing.</p>

      <h2>Contact</h2>
      <p>Questions? Email <a href="mailto:hello@plugpay.co.ke">hello@plugpay.co.ke</a></p>
    </main>
  );
}