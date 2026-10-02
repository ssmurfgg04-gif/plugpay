"""Crop fullpage screenshot into 8 feature areas using element bounding boxes."""
import asyncio, json
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

SRC = Path("/home/z/my-project/upload/index_magenta (2).html").as_uri()
OUT = Path("/home/z/my-project/vlm_shots")
full = Image.open(OUT / "00_fullpage.png")
SCALE = full.width / 780  # device pixel ratio applied

SECTIONS = [
    ("01_nav_hero", "#hero"),
    ("02_whatsapp_demo", ".wa-phone"),
    ("03_friction", "#friction"),
    ("04_breakthrough", "#breakthrough"),
    ("05_contrast", "#contrast"),
    ("06_pricing_voices", "#pricing"),
    ("07_market_faq", "#market"),
    ("08_cta_footer", "#merchant-cta"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 780, "height": 1100})
        await page.goto(SRC)
        await page.wait_for_timeout(1200)
        boxes = {}
        for name, sel in SECTIONS:
            el = await page.query_selector(sel)
            if el:
                b = await el.bounding_box()
                boxes[name] = b
        # modals
        for label, js in [("09_merchant_modal", "openMerchantModal()"), ("10_building_modal", "openBuildingModal()"), ("11_auth_modal", "openAuthModal()")]:
            await page.evaluate("closeModal()")
            await page.wait_for_timeout(200)
            await page.evaluate(js)
            await page.wait_for_timeout(1000)
            el = await page.query_selector(".modal-overlay.on")
            if el:
                boxes[label] = await el.bounding_box()
        await browser.close()

    for name, b in boxes.items():
        y0 = max(0, int(b["y"] * SCALE))
        y1 = min(full.height, int((b["y"] + b["height"]) * SCALE))
        x1 = min(full.width, int((b["x"] + b["width"]) * SCALE))
        crop = full.crop((0, y0, full.width, y1))
        crop.save(OUT / f"{name}.png")
        print(name, crop.size)

asyncio.run(main())
