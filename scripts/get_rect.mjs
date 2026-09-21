async function getRect() {
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
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
    const rect = await send('Runtime.evaluate', {
      expression: 'JSON.stringify(document.querySelector(".gba-tab-bar").getBoundingClientRect())',
      returnByValue: true
    });
    console.log('TabBar Rect:', rect.result.value);
    ws.close();
  };
}
getRect().catch(console.error);
