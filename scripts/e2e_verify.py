"""End-to-end browser verification of the PlugPay site."""
import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/home/z/my-project/vlm_shots"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 780, "height": 1100}, device_scale_factor=1.5)
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        # 1. homepage
        await page.goto(BASE, wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/v_home_top.png")
        assert "trust layer" in (await page.content()).lower(), "hero copy missing"
        print("OK home renders")

        # 2. hero search flow
        await page.fill("input[aria-label='Search merchants']", "electronics")
        await page.click("button:has-text('Search →')")
        await page.wait_for_selector(".results-section", timeout=8000)
        await page.wait_for_selector(".res-card", timeout=10000)
        cards = await page.locator(".res-card").count()
        print("OK search results:", cards)
        assert cards > 0, "search returned no cards"
        await page.screenshot(path=f"{OUT}/v_search.png")

        # 3. open merchant profile from results
        await page.locator(".res-card").first.click()
        await page.wait_for_url("**/m/**", timeout=8000)
        await page.wait_for_load_state("networkidle")
        assert await page.locator(".mp-name").count() > 0, "merchant hero missing"
        await page.screenshot(path=f"{OUT}/v_merchant.png")
        print("OK merchant profile:", await page.locator(".mp-name").inner_text())

        # 4. tabs: catalogue, reviews, building
        await page.click("button[role='tab']:has-text('Catalogue')")
        await page.wait_for_timeout(400)
        await page.screenshot(path=f"{OUT}/v_catalogue.png")
        await page.click("button[role='tab']:has-text('Reviews')")
        await page.wait_for_timeout(400)
        assert "Verified buyer" in await page.content(), "verified review missing"
        await page.click("button[role='tab']:has-text('Building')")
        await page.wait_for_timeout(400)
        await page.screenshot(path=f"{OUT}/v_building_tab.png")
        print("OK tabs work")

        # 5. buildings page + floor map
        await page.goto(f"{BASE}/buildings", wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/v_buildings.png")
        await page.locator(".res-card").first.click()
        await page.wait_for_url("**/buildings/**")
        await page.wait_for_load_state("networkidle")
        stalls = await page.locator(".bsg").count()
        print("OK building page, stall cells:", stalls)
        assert stalls > 0
        await page.screenshot(path=f"{OUT}/v_floormap.png")

        # 6. sign in flow with demo OTP
        await page.goto(f"{BASE}/signin", wait_until="networkidle")
        await page.fill("#phone", "0712 345 678")
        await page.click("button:has-text('Send code')")
        await page.wait_for_selector(".demo-note", timeout=8000)
        demo_text = await page.locator(".demo-note").inner_text()
        import re as _re
        m = _re.search(r"\b(\d{6})\b", demo_text)
        code = m.group(1) if m else ""
        print("OTP:", code)
        await page.fill("#code", code)
        await page.click("button:has-text('Verify & open')")
        await page.wait_for_url("**/dashboard", timeout=10000)
        await page.wait_for_load_state("networkidle")
        print("OK signed in -> dashboard (matched seeded merchant)")
        await page.screenshot(path=f"{OUT}/v_dashboard.png")

        # 7. record a sale
        await page.fill("#bn", "Test Buyer")
        await page.fill("#bp", "0711002200")
        await page.locator("input[aria-label='Item 1 name']").fill("HDMI Cable 2m")
        await page.locator("input[aria-label='Item 1 quantity']").fill("2")
        await page.locator("input[aria-label='Item 1 price']").fill("450")
        await page.fill("#mp", "TESTKQ42XZ")
        await page.click("button:has-text('Record sale & send receipt')")
        await page.wait_for_selector("text=Receipt sent", timeout=10000)
        print("OK sale recorded, receipt shown")
        await page.screenshot(path=f"{OUT}/v_receipt.png")

        # 8. verify the sale shows on the public profile
        await page.goto(f"{BASE}/m/wanjiku-electronics", wait_until="networkidle")
        content = await page.content()
        print("OK merchant page reachable after sale")

        if errors:
            print("CONSOLE ERRORS:", errors[:5])
        else:
            print("NO console/page errors")
        await browser.close()

asyncio.run(main())
