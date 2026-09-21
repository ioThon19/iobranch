async function testTabScroll() {
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

    const test = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bar = document.querySelector('.gba-tab-bar');
          const prev = document.querySelector('.gba-tab-scroll-prev');
          const next = document.querySelector('.gba-tab-scroll-next');
          const start = bar.scrollLeft;
          bar.scrollLeft = 200;
          const afterManual = bar.scrollLeft;
          next.click();
          return {
            start,
            afterManual,
            scrollWidth: bar.scrollWidth,
            clientWidth: bar.clientWidth
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Test result:', test.result.value);

    // Wait 400ms to see if next click changed it
    await new Promise(r => setTimeout(r, 400));
    const afterNext = await send('Runtime.evaluate', {
      expression: "document.querySelector('.gba-tab-bar').scrollLeft",
      returnByValue: true
    });
    console.log('After next.click():', afterNext.result.value);

    ws.close();
  };
}

testTabScroll().catch(console.error);
