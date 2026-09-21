import fs from 'fs';

async function testClickNext() {
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
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    // Click next button twice
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.gba-tab-scroll-next');
        btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 400));
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.gba-tab-scroll-next');
        btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const val = await send('Runtime.evaluate', {
      expression: 'document.querySelector(".gba-tab-bar").scrollLeft',
      returnByValue: true
    });
    console.log('Scroll after 2 clicks:', val.result.value);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const p = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_mobile_nav_two_clicks.png';
    fs.writeFileSync(p, Buffer.from(shot.data, 'base64'));
    console.log('Saved to:', p);

    ws.close();
  };
}

testClickNext().catch(console.error);
