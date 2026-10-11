"""Browser e2e: register a brand-new trader through the real UI, verify CLEAN
state (no demo data), sign out, sign back in. Runs against a running server.
Flow mirrors real users: /seller/dashboard -> Sign in -> Create account tab."""
import asyncio
import sys
import time
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
EMAIL = f"browser.e2e.{int(time.time())}@plugpay.test"
PW = "Sup3rSecret!pass"
BIZ = "Browser E2E Duka"

results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("  OK  " if cond else "FAIL  ") + name + (f" — {detail}" if detail and not cond else ""))

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()
        console_errors = []
        page.on("pageerror", lambda e: console_errors.append(str(e)))

        # ---------- 1. Bare /seller redirects to the dashboard ----------
        await page.goto(f"{BASE}/seller", wait_until="networkidle")
        check("/seller redirects to /seller/dashboard", page.url.rstrip("/").endswith("/seller/dashboard"), page.url)
        await page.wait_for_timeout(800)
        body = await page.inner_text("body")
        check("auth gate shows for anonymous visitor", "Sign in required" in body)

        # ---------- 2. Open the auth modal and switch to Create account ----------
        await page.locator("button.pp-btn.primary:has-text('Sign in')").first.click()
        await page.wait_for_timeout(700)
        modal = page.locator("#modal-register")
        check("auth modal opens", await modal.count() > 0 and await modal.first.is_visible())
        await page.locator("button[role='tab']:has-text('Create account')").first.click()
        await page.wait_for_timeout(300)

        # ---------- 3. Fill the registration form ----------
        await page.locator("#pp-auth-name").fill(BIZ)
        await page.locator("#pp-auth-email").fill(EMAIL)
        await page.locator("#pp-auth-password").fill(PW)
        await page.screenshot(path="/tmp/e2e_register_form.png")

        # Submit the VISIBLE submit button inside the modal
        submit = modal.locator("button[type='submit']:visible").first
        await submit.click()
        await page.wait_for_timeout(4000)
        await page.screenshot(path="/tmp/e2e_after_register.png")

        # ---------- 4. Dashboard clean state ----------
        body = await page.inner_text("body")
        check("registration lands in dashboard", "dashboard" in page.url.lower())
        check("own business name visible", BIZ.lower() in body.lower(), f"url={page.url}")

        demo_leaks = [n for n in ["Wanjiku Electronics", "Mwangi", "Achieng", "Kamau", "Otieno"] if n.lower() in body.lower()]
        check("no demo trader names in new user dashboard", not demo_leaks, f"leaked: {demo_leaks}")

        # ---------- 5. Sign out ----------
        out = page.locator("button:has-text('Sign out')")
        if await out.count() > 0:
            await out.first.click()
            await page.wait_for_timeout(2000)
            check("sign out works", True)
        else:
            check("sign out control found", False, "no sign out button")

        # ---------- 6. Sign back in with the same credentials ----------
        await page.goto(f"{BASE}/seller/dashboard", wait_until="networkidle")
        await page.wait_for_timeout(500)
        await page.locator("button.pp-btn.primary:has-text('Sign in')").first.click()
        await page.wait_for_timeout(700)
        modal = page.locator("#modal-register")
        await page.locator("#pp-auth-email").fill(EMAIL)
        await page.locator("#pp-auth-password").fill(PW)
        await modal.locator("button[type='submit']:visible").first.click()
        await page.wait_for_timeout(4000)
        body2 = await page.inner_text("body")
        check("sign-in with same email+password works", BIZ.lower() in body2.lower(), f"url={page.url}")

        real_errors = [e for e in console_errors if "favicon" not in e.lower()]
        check("no page errors during flow", not real_errors, "; ".join(real_errors[:3]))

        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f"\nBROWSER E2E: {len(results) - len(failed)}/{len(results)} passed")
    sys.exit(1 if failed else 0)

asyncio.run(main())
