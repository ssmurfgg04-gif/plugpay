"""Diagnose what sp-wrap/sp-shell is and why it intercepts clicks."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto("http://localhost:3000/seller/dashboard", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path="/tmp/seller_dash_gate.png")

        info = await page.evaluate("""
        () => {
          const out = {};
          const sp = document.querySelector('.sp-wrap');
          const sh = document.querySelector('.sp-shell');
          out.spWrap = sp ? { tag: sp.tagName, rect: sp.getBoundingClientRect().toJSON(), z: getComputedStyle(sp).zIndex, pos: getComputedStyle(sp).position } : null;
          out.spShell = sh ? { tag: sh.tagName, rect: sh.getBoundingClientRect().toJSON(), z: getComputedStyle(sh).zIndex, pos: getComputedStyle(sh).position } : null;
          const submit = document.querySelector("button[type='submit']");
          if (submit) {
            const r = submit.getBoundingClientRect();
            const cx = r.x + r.width/2, cy = r.y + r.height/2;
            const el = document.elementFromPoint(cx, cy);
            out.submit = { rect: r.toJSON(), hit: el ? el.tagName + '.' + el.className : 'none', text: submit.textContent.trim() };
          }
          out.title = document.title;
          return out;
        }
        """)
        import json
        print(json.dumps(info, indent=1))
        await browser.close()

asyncio.run(main())
