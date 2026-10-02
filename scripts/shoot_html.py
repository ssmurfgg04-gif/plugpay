"""Screenshot the uploaded PlugPay HTML into feature-level images for VLM analysis."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

SRC = Path("/home/z/my-project/upload/index_magenta (2).html").as_uri()
OUT = Path("/home/z/my-project/vlm_shots")
OUT.mkdir(parents=True, exist_ok=True)

# (name, js_selector_or_None, actions)
TARGETS = [
    ("01_nav_hero", "section#hero", None),
    ("02_whatsapp_demo", "section#hero .wa-phone", None),
    ("03_friction_breakthrough", "section#breakthrough", None),
    ("04_contrast_pricing", "section#pricing", None),
    ("05_voices_market", "section#market", None),
    ("06_faq_cta_footer", "section#faq", None),
    ("07_merchant_modal", None, "openMerchantModal()"),
    ("08_building_modal", None, "openBuildingModal()"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 780, "height": 1100}, device_scale_factor=2)
        await page.goto(SRC)
        await page.wait_for_timeout(1500)

        for name, sel, js in TARGETS:
            try:
                if js:
                    await page.evaluate(js)
                    await page.wait_for_timeout(1200)
                    el = await page.query_selector(".modal-overlay.on") or await page.query_selector("body")
                else:
                    el = await page.query_selector(sel)
                if el is None:
                    el = await page.query_selector("body")
                await el.screenshot(path=str(OUT / f"{name}.png"))
                print("saved", name)
            except Exception as e:
                print("ERR", name, e)
            # close any modal before next target
            try:
                await page.evaluate("closeModal()")
            except Exception:
                pass
            await page.wait_for_timeout(300)

        # full page for reference
        await page.screenshot(path=str(OUT / "00_fullpage.png"), full_page=True)
        print("saved fullpage")
        await browser.close()

asyncio.run(main())
