import fs from 'fs';

async function testRealtimeHp() {
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

    console.log('2. Go to BATTLE...');
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('BATTLE')"
    });
    await new Promise(r => setTimeout(r, 1500));

    // Capture initial state
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_hp_initial.png', Buffer.from(shot.data, 'base64'));

    console.log('3. Trigger Attack A...');
    await send('Runtime.evaluate', {
      expression: "document.getElementById('btn-attack-a')?.click()"
    });

    // Wait for dash & slash impact (~250ms), then capture midpoint of HP drain
    await new Promise(r => setTimeout(r, 380));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_hp_draining_mid.png', Buffer.from(shot.data, 'base64'));
    console.log('Captured mid-drain screenshot!');

    // Wait for HP drain completion (~500ms further)
    await new Promise(r => setTimeout(r, 600));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_hp_drained_final.png', Buffer.from(shot.data, 'base64'));
    console.log('Captured final-drain screenshot!');

    ws.close();
  };
}

testRealtimeHp().catch(console.error);
