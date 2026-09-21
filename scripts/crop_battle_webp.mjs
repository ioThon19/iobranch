import fs from 'fs';

async function cropAndInspect() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('localhost:5173') && t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.onopen = async () => {
    let id = 1;
    function send(m, p = {}) {
      return new Promise(r => {
        const curId = id++;
        const h = msg => {
          const d = JSON.parse(msg.data);
          if (d.id === curId) { ws.removeEventListener('message', h); r(d.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params: p }));
      });
    }

    // Crop both to tight bounding box with 10px padding
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          async function trimImg(src) {
            return new Promise(res => {
              const img = new Image();
              img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.width;
                c.height = img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, img.width, img.height).data;
                let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
                for (let y = 0; y < img.height; y++) {
                  for (let x = 0; x < img.width; x++) {
                    const a = data[(y * img.width + x) * 4 + 3];
                    if (a > 15) {
                      if (x < minX) minX = x;
                      if (x > maxX) maxX = x;
                      if (y < minY) minY = y;
                      if (y > maxY) maxY = y;
                    }
                  }
                }
                const pad = 12;
                minX = Math.max(0, minX - pad);
                minY = Math.max(0, minY - pad);
                maxX = Math.min(img.width, maxX + pad);
                maxY = Math.min(img.height, maxY + pad);
                const w = maxX - minX;
                const h = maxY - minY;

                const outCanvas = document.createElement('canvas');
                outCanvas.width = w;
                outCanvas.height = h;
                const outCtx = outCanvas.getContext('2d');
                outCtx.drawImage(img, minX, minY, w, h, 0, 0, w, h);
                res({
                  w,
                  h,
                  ratio: w / h,
                  dataUrl: outCanvas.toDataURL('image/webp', 0.95)
                });
              };
              img.src = src;
            });
          }
          return {
            hero: await trimImg('/assets/character_battle.webp'),
            bug: await trimImg('/assets/bug_battle.webp')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    const { hero, bug } = evalRes.result.value;
    console.log(`Trimmed Hero: ${hero.w}x${hero.h}, ratio: ${hero.ratio.toFixed(2)}`);
    console.log(`Trimmed Bug: ${bug.w}x${bug.h}, ratio: ${bug.ratio.toFixed(2)}`);

    const heroBase64 = hero.dataUrl.replace(/^data:image\/webp;base64,/, '');
    const bugBase64 = bug.dataUrl.replace(/^data:image\/webp;base64,/, '');

    fs.writeFileSync('public/assets/images/character_battle_trimmed.webp', Buffer.from(heroBase64, 'base64'));
    fs.writeFileSync('public/assets/images/bug_battle_trimmed.webp', Buffer.from(bugBase64, 'base64'));
    console.log('Saved trimmed assets to public/assets/images/');
    ws.close();
  };
}

cropAndInspect().catch(console.error);
