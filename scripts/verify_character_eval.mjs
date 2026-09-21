import fs from 'fs';

async function verifyCharacterEval() {
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

    console.log('2. Navigate to EVALUASI screen...');
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('EVALUASI')"
    });
    await new Promise(r => setTimeout(r, 1000));

    let shot = await send('Page.captureScreenshot', { format: 'png' });
    const pEval = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_evaluasi_screen.png';
    fs.writeFileSync(pEval, Buffer.from(shot.data, 'base64'));
    console.log('Saved EVALUASI screenshot to:', pEval);

    console.log('3. Navigate to PROGRES screen...');
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('PROGRES')"
    });
    await new Promise(r => setTimeout(r, 1000));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    const pProg = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_progres_screen.png';
    fs.writeFileSync(pProg, Buffer.from(shot.data, 'base64'));
    console.log('Saved PROGRESS screenshot to:', pProg);

    console.log('4. Check image load status...');
    const imgStatus = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const imgs = Array.from(document.querySelectorAll('img[src*="character_evaluation"]'));
          return imgs.map(img => ({
            src: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }));
        })()
      `,
      returnByValue: true
    });
    console.log('Image status:', imgStatus.result.value);

    ws.close();
  };
}

verifyCharacterEval().catch(console.error);
