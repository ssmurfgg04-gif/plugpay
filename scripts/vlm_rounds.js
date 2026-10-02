// 8 VLM rounds analyzing specific PlugPay HTML features
const fs = require('fs');
const path = require('path');

const VLM_DIR = '/home/z/my-project/vlm_shots/vlm';
const OUT_DIR = '/home/z/my-project/vlm_findings';
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUNDS = [
  {
    id: 'round1_design_system',
    img: '01_nav_hero.jpg',
    focus: 'GLOBAL DESIGN SYSTEM. Extract: exact color palette roles (bg dark, accent magenta, blue, light sections), typography system (headline font style/weight/case, body font, mono labels), section rhythm (which sections are dark vs light), corner radius system, button styles (pill?), spacing rhythm, and the overall mood. Note anything that looks templated/AI-ish that we should keep or fix.',
  },
  {
    id: 'round2_hero',
    img: '01_nav_hero.jpg',
    focus: 'HERO COMPOSITION. Analyze: nav structure (logo treatment, links, search pill, CTA), hero badge (avatars row + text), H1 with accent word, subtext, tabbed search box (Find a merchant / Find a building tabs, input, button), live stats row (4 stats with mono labels), CTA buttons. Give precise notes on hierarchy, what should be real data vs static, and mobile behavior.',
  },
  {
    id: 'round3_whatsapp_demo',
    img: '02_whatsapp_demo.jpg',
    focus: 'WHATSAPP DEMO PHONE. Analyze the WhatsApp chat mockup anatomy: header (avatar, name, online), day chip, incoming/outgoing bubbles, system chips, the PlugPay invoice card (rows, total, pay-to till, note), quick-reply buttons, receipt card (items, M-Pesa code, trust score line), rating stars. Note exact bubble colors, radii, sizes, and how trust signals are embedded in the chat. What makes this demo convincing?',
  },
  {
    id: 'round4_friction_breakthrough',
    img: '04_breakthrough.jpg',
    focus: 'PROBLEM/SOLUTION SECTIONS (dark). Analyze: the friction numbered cards (01-04) with headings + descriptions, the breakthrough stats (0% fake alert losses, 3x more buyer trust, 100% receipt-backed reviews) as big magenta numerals with mono labels in cards. Extract layout: card styling, border, radius, alignment, stat typography. How should these feel in a rebuilt version?',
  },
  {
    id: 'round5_contrast_pricing',
    img: '05_contrast.jpg',
    focus: 'TRUST CONTRAST + PRICING. Analyze the Without/With comparison columns (light bordered card vs dark card, X vs check icons in colored circles, item title+desc rows) and the pricing card (featured border, badge, tier label, big price KSh 0, feature checklist with magenta checks, note below). Extract exact patterns for rebuilding: how the two columns differ visually, icon treatment, list item rhythm.',
  },
  {
    id: 'round6_voices_market_faq',
    img: '08_market.jpg',
    focus: 'MARKET FOCUS + FAQ (use your knowledge of the full page too). Analyze: market section (magenta sub-headline, checklist items with circle check icons, big stat callout card KSh 400B+ with caption, final CTA heading + two buttons), FAQ accordion cards (rounded, plus icon, grouped by mono group labels). Also the testimonials treatment from the full page if visible. Extract card styling and interaction patterns.',
  },
  {
    id: 'round7_merchant_profile',
    img: '09_merchant_modal.jpg',
    focus: 'MERCHANT PROFILE MODAL. Analyze: dark hero header (avatar with verified check, name, role, badges, big rating number + stars), stats row (sales/followers/reviews), tabs (Profile/Catalogue/Reviews/Building), profile tab content (My Works category tiles, location/phone/established info rows, social links, M-Pesa paybill card with copy buttons, about text, verification documents grid with verified stamps), catalogue tab (filter chips, product cards with price + stock + WhatsApp checkout button), reviews tab (summary with big number + star distribution bars, review items with verified buyer + receipt number). This is the product core: note every trust-signal detail.',
  },
  {
    id: 'round8_building_auth',
    img: '10_building_modal.jpg',
    focus: 'BUILDING FLOOR-MAP MODAL + AUTH. Analyze: building modal header (magenta bg, name, address, 4 stats), floor tabs (Ground-Floor 4), stall grid (6 columns, color-coded states: trusted/verified/basic/unregistered with legend), top merchants list, and the auth modal flow (WhatsApp/SMS method toggle, phone input, OTP step, PIN set/login steps, agent-registered note, profile edit tabs: Business info/Personal/Documents with upload cards). Extract interaction design details worth preserving.',
  },
];

async function askVLM(zai, b64, prompt, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const completion = await zai.chat.completions.createVision({
        model: 'glm-4.6v',
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: prompt },
        ]}],
        thinking: { type: 'disabled' },
      });
      return completion.choices[0]?.message?.content || 'NO CONTENT';
    } catch (e) {
      const wait = Math.min(90, 20 * (i + 1));
      console.log(`  attempt ${i + 1} failed (${e.message.slice(0, 60)}), waiting ${wait}s`);
      await new Promise(r => setTimeout(r, wait * 1000));
    }
  }
  return 'FAILED';
}

async function main() {
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();

  for (const r of ROUNDS) {
    const p = path.join(VLM_DIR, r.img);
    const outFile = path.join(OUT_DIR, `${r.id}.md`);
    if (fs.existsSync(outFile)) { console.log('SKIP', r.id); continue; }
    if (!fs.existsSync(p)) { console.log('MISSING', p); continue; }
    const b64 = fs.readFileSync(p).toString('base64');
    const prompt = `You are a senior product designer auditing a screenshot of "PlugPay", a trust-layer product for Kenya's WhatsApp commerce (Nairobi CBD market traders). Analyze this screenshot with high precision. ${r.focus}\n\nReturn a dense, structured markdown audit: (1) Layout & hierarchy notes, (2) Visual styling specifics (colors as roles, type treatment, spacing, radii), (3) Trust-signal inventory (what conveys credibility), (4) Data points shown (names, numbers, badges), (5) Rebuild notes: concrete instructions + any fixes (this will be rebuilt in Next.js + Tailwind from a Supabase database). Be specific and terse. NO em-dashes anywhere in your output.`;

    const out = await askVLM(zai, b64, prompt);
    fs.writeFileSync(outFile, `# ${r.id}\n\n${out}`);
    console.log('OK', r.id, out.length);
    await new Promise(res => setTimeout(res, 8000));
  }
}
main().catch(e => { console.error(e); process.exit(1); });
