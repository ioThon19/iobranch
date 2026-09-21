async function test() {
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
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const screens = ['MENU', 'MATERI', 'TRACING', 'BATTLE', 'EVALUASI', 'PROGRES', 'SETTINGS', 'OFFLINE'];
    for (const s of screens) {
      await send('Runtime.evaluate', { expression: `window.uiManagerInstance?.navigate('${s}')` });
      await new Promise(r => setTimeout(r, 400));
      const current = await send('Runtime.evaluate', {
        expression: `window.uiManagerInstance?.currentScreen`,
        returnByValue: true
      });
      const elCount = await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('#ui-overlay *').length`,
        returnByValue: true
      });
      console.log(`Screen: ${s} -> current: ${current.result?.value}, elements in #ui-overlay: ${elCount.result?.value}`);
    }
    ws.close();
  };
}

test();
