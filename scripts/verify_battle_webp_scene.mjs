import fs from 'fs';

async function verify() {
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

    console.log('1. Reloading page...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    console.log('2. Navigating to BATTLE...');
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('BATTLE')"
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('3. Capturing initial battle state...');
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    const p1 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_battle_new_webp.png';
    fs.writeFileSync(p1, Buffer.from(shot.data, 'base64'));
    console.log('Saved to:', p1);

    console.log('4. Clicking attack...');
    await send('Runtime.evaluate', {
      expression: "document.getElementById('btn-attack-a')?.click()"
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('5. Capturing attack state...');
    shot = await send('Page.captureScreenshot', { format: 'png' });
    const p2 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_battle_new_webp_attack.png';
    fs.writeFileSync(p2, Buffer.from(shot.data, 'base64'));
    console.log('Saved to:', p2);

    ws.close();
  };
}

verify().catch(console.error);
