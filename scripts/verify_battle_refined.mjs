import fs from 'fs';

async function verify() {
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

    console.log('1. Reloading page...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    console.log('2. Navigating to BATTLE...');
    await send('Runtime.evaluate', {
      expression: `window.uiManagerInstance.setScreen('BATTLE')`
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('3. Capturing initial refined state...');
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    const path1 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_battle_refined.png';
    fs.writeFileSync(path1, Buffer.from(shot.data, 'base64'));
    console.log('Saved refined battle screenshot to:', path1);

    console.log('4. Clicking SERANGAN A (KRITIS)...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btn-attack-a')?.click()`
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('5. Capturing post-attack refined state...');
    shot = await send('Page.captureScreenshot', { format: 'png' });
    const path2 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_battle_attack_refined.png';
    fs.writeFileSync(path2, Buffer.from(shot.data, 'base64'));
    console.log('Saved attack refined screenshot to:', path2);

    ws.close();
  };
}

verify().catch(console.error);
