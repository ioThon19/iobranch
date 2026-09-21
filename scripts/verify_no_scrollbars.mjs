import fs from 'fs';

async function verifyNoScrollbars() {
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

    console.log('1. Reloading...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    const screens = ['BATTLE', 'EVALUASI', 'PROGRES'];
    for (const s of screens) {
      console.log(`2. Navigating to ${s}...`);
      await send('Runtime.evaluate', {
        expression: `window.uiManagerInstance.setScreen('${s}')`
      });
      await new Promise(r => setTimeout(r, 1000));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const p = `C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_no_scrollbar_${s.toLowerCase()}.png`;
      fs.writeFileSync(p, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot for ${s} to:`, p);
    }

    ws.close();
  };
}

verifyNoScrollbars().catch(console.error);
