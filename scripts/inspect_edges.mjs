async function inspectEdges() {
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
          async function checkBoundary(src) {
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

                // Let's find boundary pixels: pixels that have alpha > 20 and have an adjacent pixel with alpha < 20
                let fringeCount = 0;
                let sampleFringes = [];
                for (let y = 1; y < img.height - 1; y++) {
                  for (let x = 1; x < img.width - 1; x++) {
                    const idx = (y * img.width + x) * 4;
                    const a = data[idx+3];
                    if (a > 30) {
                      // check neighbors
                      const up = data[((y-1)*img.width + x)*4 + 3];
                      const down = data[((y+1)*img.width + x)*4 + 3];
                      const left = data[(y*img.width + (x-1))*4 + 3];
                      const right = data[(y*img.width + (x+1))*4 + 3];
                      if (up < 20 || down < 20 || left < 20 || right < 20) {
                        // This is an edge/boundary pixel
                        const r = data[idx], g = data[idx+1], b = data[idx+2];
                        // If it is light / whitish
                        if (r > 180 && g > 180 && b > 180) {
                          fringeCount++;
                          if (sampleFringes.length < 10) {
                            sampleFringes.push({ x, y, r, g, b, a });
                          }
                        }
                      }
                    }
                  }
                }
                resolve({ fringeCount, sampleFringes });
              };
              img.src = src;
            });
          }
          return {
            hero: await checkBoundary('/assets/images/hero_battle_back.png'),
            monster: await checkBoundary('/assets/images/red_monster.png')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Boundary Analysis:\n', JSON.stringify(evalRes.result.value, null, 2));
    ws.close();
  };
}

inspectEdges().catch(console.error);
