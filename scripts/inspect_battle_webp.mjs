async function inspect() {
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

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          async function getDim(src) {
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
                    if (a > 10) {
                      if (x < minX) minX = x;
                      if (x > maxX) maxX = x;
                      if (y < minY) minY = y;
                      if (y > maxY) maxY = y;
                    }
                  }
                }
                res({
                  w: img.width,
                  h: img.height,
                  ratio: img.width / img.height,
                  bounds: { minX, minY, maxX, maxY, boundW: maxX - minX, boundH: maxY - minY }
                });
              };
              img.src = src;
            });
          }
          return {
            hero: await getDim('/assets/character_battle.webp'),
            bug: await getDim('/assets/bug_battle.webp')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Inspection:', JSON.stringify(evalRes.result.value, null, 2));
    ws.close();
  };
}

inspect().catch(console.error);
