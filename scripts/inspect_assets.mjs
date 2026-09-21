async function inspect() {
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
          async function analyzeImg(src) {
            return new Promise(resolve => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.width;
                c.height = img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, img.width, img.height).data;
                let nearWhiteCount = 0;
                let semiTransparentNearWhite = 0;
                let totalVisible = 0;
                let whiteSamples = [];
                for (let y = 0; y < img.height; y++) {
                  for (let x = 0; x < img.width; x++) {
                    const idx = (y * img.width + x) * 4;
                    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
                    if (a > 10) {
                      totalVisible++;
                      // White outline/fringe check
                      if (r > 215 && g > 215 && b > 215) {
                        nearWhiteCount++;
                        if (a < 255) semiTransparentNearWhite++;
                        if (whiteSamples.length < 5) {
                          whiteSamples.push({ x, y, r, g, b, a });
                        }
                      }
                    }
                  }
                }
                resolve({
                  width: img.width,
                  height: img.height,
                  totalVisible,
                  nearWhiteCount,
                  semiTransparentNearWhite,
                  whiteSamples
                });
              };
              img.src = src;
            });
          }
          return {
            hero: await analyzeImg('/assets/images/hero_battle_back.png'),
            monster: await analyzeImg('/assets/images/red_monster.png')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Analysis Result:\n', JSON.stringify(evalRes.result.value, null, 2));
    ws.close();
  };
}

inspect().catch(console.error);
