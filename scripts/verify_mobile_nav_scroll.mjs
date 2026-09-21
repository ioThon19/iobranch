import fs from 'fs';

async function verifyMobileNavScroll() {
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

    // Set mobile 360px viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 740,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    // Capture initial state
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    const p1 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_mobile_nav_initial.png';
    fs.writeFileSync(p1, Buffer.from(shot.data, 'base64'));
    console.log('Saved initial mobile nav screenshot to:', p1);

    // Test clicking next scroll button
    console.log('Clicking next button...');
    const nextRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.gba-tab-scroll-next');
          if (!btn) return 'NO NEXT BTN';
          btn.click();
          return 'CLICKED NEXT';
        })()
      `,
      returnByValue: true
    });
    console.log('Next button result:', nextRes.result.value);
    await new Promise(r => setTimeout(r, 500));

    // Check scrollLeft
    const scrollInfo1 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bar = document.querySelector('.gba-tab-bar');
          return { scrollLeft: bar?.scrollLeft, max: bar?.scrollWidth - bar?.clientWidth };
        })()
      `,
      returnByValue: true
    });
    console.log('Scroll after next click:', scrollInfo1.result.value);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    const p2 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_mobile_nav_scrolled_right.png';
    fs.writeFileSync(p2, Buffer.from(shot.data, 'base64'));
    console.log('Saved scrolled mobile nav screenshot to:', p2);

    // Test switching to TANTANGAN (Battle) screen to verify auto-centering
    console.log('Switching to BATTLE (TANTANGAN)...');
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('BATTLE')"
    });
    await new Promise(r => setTimeout(r, 1200));

    const scrollInfo2 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bar = document.querySelector('.gba-tab-bar');
          const active = document.querySelector('.gba-tab-item.active');
          return {
            scrollLeft: bar?.scrollLeft,
            activeText: active?.innerText?.trim(),
            activeRect: active?.getBoundingClientRect()
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Scroll after screen change to BATTLE:', scrollInfo2.result.value);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    const p3 = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd\\verified_mobile_nav_autocentered.png';
    fs.writeFileSync(p3, Buffer.from(shot.data, 'base64'));
    console.log('Saved autocentered mobile nav screenshot to:', p3);

    ws.close();
  };
}

verifyMobileNavScroll().catch(console.error);
