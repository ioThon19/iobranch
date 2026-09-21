import fs from 'fs';

async function verifyRedesignedHpBars() {
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

    console.log('2. Switching to BATTLE...');
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('BATTLE')"
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('3. Capturing redesigned HP Bars state...');
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    const p1 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_redesigned_hp_bars.png';
    fs.writeFileSync(p1, Buffer.from(shot.data, 'base64'));
    console.log('Saved initial redesigned screenshot to:', p1);

    console.log('4. Triggering attack A...');
    await send('Runtime.evaluate', {
      expression: "document.getElementById('btn-attack-a')?.click()"
    });

    // Sample during damage tick
    await new Promise(r => setTimeout(r, 250));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    const p2 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_hp_bars_during_attack.png';
    fs.writeFileSync(p2, Buffer.from(shot.data, 'base64'));
    console.log('Saved mid-attack screenshot to:', p2);

    await new Promise(r => setTimeout(r, 800));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    const p3 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_hp_bars_post_attack.png';
    fs.writeFileSync(p3, Buffer.from(shot.data, 'base64'));
    console.log('Saved post-attack screenshot to:', p3);

    ws.close();
  };
}

verifyRedesignedHpBars().catch(console.error);
