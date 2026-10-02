import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { SignInClient } from '@/components/auth/SignInClient';

export const metadata = {
  title: 'Sign in to your stall',
  description: 'Sign in with your WhatsApp number, complete your profile, and go live in minutes. No password, buyers never sign up.',
};

export default function SignInPage() {
  return (
    <>
      <SiteNav />
      <main style={{ background: 'var(--bg-dark)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="hero-rule" style={{ margin: '0 auto 14px' }} />
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.7 }}>
                Sign in with your number, complete your profile, and go live in minutes.
              </p>
            </div>
            <SignInClient />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
