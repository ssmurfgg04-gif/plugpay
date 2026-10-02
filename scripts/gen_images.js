// Generate PlugPay site images: merchant avatars, product shots, building exteriors
const fs = require('fs');
const path = require('path');

const OUT = '/home/z/my-project/public/images';
fs.mkdirSync(OUT, { recursive: true });

const AVATAR_STYLE = 'portrait photo, natural daylight, Nairobi street background softly blurred, authentic warm smile, professional headshot, realistic photography, high quality';
const PRODUCT_STYLE = 'professional product photography, clean neutral light grey background, soft studio lighting, centered composition, realistic, high quality, no text, no watermark';
const BLDG_STYLE = 'photorealistic exterior of a Nairobi CBD commercial building, Kenya, busy street life, bodaboda and pedestrians, natural afternoon light, realistic photography, no text';

const IMAGES = [
  // avatars (square)
  { file: 'av-wanjiku.jpg', size: '1024x1024', prompt: `Kenyan woman electronics shop owner in her 40s wearing a colourful blazer, ${AVATAR_STYLE}` },
  { file: 'av-mwangi.jpg', size: '1024x1024', prompt: `Kenyan woman fashion trader in her 30s with braided hair and an Ankara print dress, ${AVATAR_STYLE}` },
  { file: 'av-akinyi.jpg', size: '1024x1024', prompt: `Kenyan woman cosmetics seller in her late 20s with short natural hair and neat makeup, ${AVATAR_STYLE}` },
  { file: 'av-kamau.jpg', size: '1024x1024', prompt: `Kenyan man phone repair technician in his 30s wearing a work apron over a checked shirt, ${AVATAR_STYLE}` },
  { file: 'av-nduta.jpg', size: '1024x1024', prompt: `Kenyan woman fresh produce vendor in her 50s wearing a headscarf and apron, ${AVATAR_STYLE}` },
  { file: 'av-otieno.jpg', size: '1024x1024', prompt: `Kenyan man in his late 20s, phone clinic owner, wearing a polo shirt and holding a small screwdriver, ${AVATAR_STYLE}` },
  { file: 'av-kibe.jpg', size: '1024x1024', prompt: `Kenyan woman shoe boutique owner in her 30s wearing a stylish hijab and smart jacket, ${AVATAR_STYLE}` },
  { file: 'av-mutua.jpg', size: '1024x1024', prompt: `Kenyan man hardware shop owner in his 40s wearing a dust jacket over casual clothes, ${AVATAR_STYLE}` },
  { file: 'av-chebet.jpg', size: '1024x1024', prompt: `Kenyan woman stationery shop owner in her 30s wearing glasses and a cardigan, ${AVATAR_STYLE}` },
  { file: 'av-kariuki.jpg', size: '1024x1024', prompt: `Kenyan man watch repair expert in his 50s with grey hair and a magnifier headband, ${AVATAR_STYLE}` },

  // products (square)
  { file: 'pr-phone1.jpg', size: '1024x1024', prompt: `modern mid-range black smartphone standing upright, ${PRODUCT_STYLE}` },
  { file: 'pr-phone2.jpg', size: '1024x1024', prompt: `sleek blue-green android smartphone angled view, ${PRODUCT_STYLE}` },
  { file: 'pr-laptop1.jpg', size: '1024x1024', prompt: `silver business laptop open at slight angle, ${PRODUCT_STYLE}` },
  { file: 'pr-laptop2.jpg', size: '1024x1024', prompt: `dark grey 15 inch laptop half open, ${PRODUCT_STYLE}` },
  { file: 'pr-charger.jpg', size: '1024x1024', prompt: `white USB-C wall charger with braided cable coiled neatly, ${PRODUCT_STYLE}` },
  { file: 'pr-earbuds.jpg', size: '1024x1024', prompt: `white wireless earbuds with charging case open, ${PRODUCT_STYLE}` },
  { file: 'pr-dress.jpg', size: '1024x1024', prompt: `colourful African Ankara print wrap dress on a wooden hanger, fabric vivid orange and indigo patterns, ${PRODUCT_STYLE}` },
  { file: 'pr-handbag.jpg', size: '1024x1024', prompt: `handcrafted brown leather handbag with brass buckle, ${PRODUCT_STYLE}` },
  { file: 'pr-necklace.jpg', size: '1024x1024', prompt: `Maasai beaded necklace set in red blue and white beads arranged in a circle, ${PRODUCT_STYLE}` },
  { file: 'pr-shea.jpg', size: '1024x1024', prompt: `natural shea body butter in a clear glass jar with wooden lid, ${PRODUCT_STYLE}` },
  { file: 'pr-lipstick.jpg', size: '1024x1024', prompt: `matte lipstick tube in deep burgundy with cap off, ${PRODUCT_STYLE}` },
  { file: 'pr-thinkpad.jpg', size: '1024x1024', prompt: `rugged black refurbished business laptop closed with worn texture, ${PRODUCT_STYLE}` },
  { file: 'pr-screen.jpg', size: '1024x1024', prompt: `replacement smartphone screen and repair tools laid out flat, ${PRODUCT_STYLE}` },
  { file: 'pr-sneakers.jpg', size: '1024x1024', prompt: `pair of white ladies fashion sneakers with pastel accents, ${PRODUCT_STYLE}` },
  { file: 'pr-clutch.jpg', size: '1024x1024', prompt: `elegant black evening clutch bag with gold clasp, ${PRODUCT_STYLE}` },
  { file: 'pr-drill.jpg', size: '1024x1024', prompt: `blue cordless power drill with battery pack, ${PRODUCT_STYLE}` },
  { file: 'pr-toolbox.jpg', size: '1024x1024', prompt: `open steel toolbox with socket set compartments, ${PRODUCT_STYLE}` },
  { file: 'pr-sukuma.jpg', size: '1024x1024', prompt: `fresh bunches of green sukuma wiki collard greens tied with twine, ${PRODUCT_STYLE}` },
  { file: 'pr-tomatoes.jpg', size: '1024x1024', prompt: `pile of ripe red tomatoes in a wooden market crate, ${PRODUCT_STYLE}` },

  // buildings (landscape)
  { file: 'bldg-anniversary.jpg', size: '1344x768', prompt: `tall 1970s style concrete office tower with many small shopfronts at street level, ${BLDG_STYLE}` },
  { file: 'bldg-kencom.jpg', size: '1344x768', prompt: `busy corner commercial building with glass front and ground floor shops at a pedestrian crossing, ${BLDG_STYLE}` },
  { file: 'bldg-bazaar.jpg', size: '1344x768', prompt: `multi-storey market plaza building with colourful signage-free shopfronts and fabric stalls outside, ${BLDG_STYLE}` },
  { file: 'bldg-bihi.jpg', size: '1344x768', prompt: `narrow high-rise commercial towers along a busy Nairobi street, ${BLDG_STYLE}` },
  { file: 'bldg-jamia.jpg', size: '1344x768', prompt: `grand stone commercial mall building with arched windows on a tree-lined street, ${BLDG_STYLE}` },
  { file: 'bldg-rehema.jpg', size: '1344x768', prompt: `modest five storey commercial building with hardware and grocery shops at ground level, ${BLDG_STYLE}` },
];

async function gen() {
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();
  let ok = 0, fail = 0;
  for (const img of IMAGES) {
    const outPath = path.join(OUT, img.file);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 20000) { console.log('skip', img.file); ok++; continue; }
    let done = false;
    for (let attempt = 0; attempt < 6 && !done; attempt++) {
      try {
        const res = await zai.images.generations.create({ prompt: img.prompt, size: img.size });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error('empty response');
        fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
        console.log('OK', img.file);
        ok++; done = true;
      } catch (e) {
        const wait = Math.min(60, 15 * (attempt + 1));
        console.log(`FAIL ${img.file} (${e.message.slice(0, 50)}), wait ${wait}s`);
        await new Promise(r => setTimeout(r, wait * 1000));
      }
    }
    if (!done) fail++;
    await new Promise(r => setTimeout(r, 4000));
  }
  console.log(`DONE ok=${ok} fail=${fail}`);
}
gen().catch(e => { console.error(e); process.exit(1); });
