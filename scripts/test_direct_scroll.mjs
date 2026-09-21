async function testDirect() {
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
          const before = bar.scrollLeft;
          bar.scrollBy({ left: 140 });
          const afterScrollBy = bar.scrollLeft;
          bar.scrollLeft += 140;
          const afterPlusEquals = bar.scrollLeft;
          return { before, afterScrollBy, afterPlusEquals };
        })()
      `,
      returnByValue: true
    });
    console.log('Scroll comparison:', test.result.value);
    ws.close();
  };
}

testDirect().catch(console.error);
