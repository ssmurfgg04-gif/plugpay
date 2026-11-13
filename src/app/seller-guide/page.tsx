import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller Guide — PlugPay',
};

const steps = [
  { n: 1, title: 'Claim your stall', text: 'Ask your building agent for your claim link. Open it, sign up, and your stall is attached to your account.' },
  { n: 2, title: 'Complete your profile', text: 'Add your business name, category, and a phone number buyers can reach you on.' },
  { n: 3, title: 'Upload your documents', text: 'Add your ID and business license under Compliance Documents. Stored privately; only you see them.' },
  { n: 4, title: 'Record your first sale', text: 'When a buyer pays by M-Pesa, enter their confirmation code. We generate a verifiable receipt.' },
  { n: 5, title: 'Share the receipt', text: 'Send the receipt to the buyer on WhatsApp. They can review you once per receipt.' },
  { n: 6, title: 'Build your reputation', text: 'Every verified receipt raises your trust score. More trust = more buyers choose you.' },
];

export default function SellerGuide() {
  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: '0 20px 60px', fontFamily: 'Inter, sans-serif', color: '#1c2138', lineHeight: 1.6 }}>
      <h1>Seller Guide</h1>
      <p>How to become a verified PlugPay seller in six steps.</p>

      <ol style={{ paddingLeft: 0, listStyle: 'none' }}>
        {steps.map((s) => (
          <li key={s.n} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: 18, background: '#1a1a2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
              <div style={{ color: '#4a5568' }}>{s.text}</div>
            </div>
          </li>
        ))}
      </ol>

      <h2>Need help?</h2>
      <p>Email <a href="mailto:hello@plugpay.co.ke">hello@plugpay.co.ke</a> — we reply within one business day.</p>
    </main>
  );
}