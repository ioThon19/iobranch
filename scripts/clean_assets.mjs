import fs from 'fs';

async function defringe() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('localhost:5173') && t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.onopen = async () => {
    let id = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const curId = id++;
        const handler = (msg) => {
          const data = JSON.parse(msg.data);
          if (data.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          async function cleanImage(src) {
            return new Promise(resolve => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.width;
                c.height = img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, img.width, img.height);
                const data = imgData.data;
                const w = img.width;
                const h = img.height;

                for (let pass = 0; pass < 3; pass++) {
                  const toErase = [];
                  for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                      const idx = (y * w + x) * 4;
                      const a = data[idx+3];
                      if (a > 10) {
                        const r = data[idx], g = data[idx+1], b = data[idx+2];
                        const up = data[((y-1)*w + x)*4 + 3];
                        const down = data[((y+1)*w + x)*4 + 3];
                        const left = data[(y*w + (x-1))*4 + 3];
                        const right = data[(y*w + (x+1))*4 + 3];

                        const isBorder = (up < 50 || down < 50 || left < 50 || right < 50);
                        if (isBorder) {
                          const brightness = (r + g + b) / 3;
                          // If boundary pixel is light/whitish or washed out
                          if (brightness > 175) {
                            toErase.push(idx);
                          } else if (a < 200 && brightness > 140) {
                            toErase.push(idx);
                          }
                        }
                      }
                    }
                  }
                  for (const idx of toErase) {
                    data[idx+3] = 0;
                  }
                }

                ctx.putImageData(imgData, 0, 0);
                resolve(c.toDataURL('image/png'));
              };
              img.src = src + '?t=' + Date.now();
            });
          }

          return {
            heroDataUrl: await cleanImage('/assets/images/hero_battle_back.png'),
            monsterDataUrl: await cleanImage('/assets/images/red_monster.png')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    const { heroDataUrl, monsterDataUrl } = evalRes.result.value;
    const heroBase64 = heroDataUrl.replace(/^data:image\/png;base64,/, '');
    const monsterBase64 = monsterDataUrl.replace(/^data:image\/png;base64,/, '');

    fs.writeFileSync('public/assets/images/hero_battle_back.png', Buffer.from(heroBase64, 'base64'));
    fs.writeFileSync('public/assets/images/red_monster.png', Buffer.from(monsterBase64, 'base64'));
    console.log('Done deep de-fringing!');

    ws.close();
  };
}

defringe().catch(console.error);
