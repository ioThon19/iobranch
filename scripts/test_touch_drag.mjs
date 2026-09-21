async function testTouchDrag() {
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

    // Inspect tabBar attributes
    const testRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bar = document.querySelector('.gba-tab-bar');
          return {
            scrollLeft: bar?.scrollLeft,
            scrollWidth: bar?.scrollWidth,
            clientWidth: bar?.clientWidth,
            overflowX: getComputedStyle(bar).overflowX,
            overflowY: getComputedStyle(bar).overflowY,
            pointerEvents: getComputedStyle(bar).pointerEvents,
            touchAction: getComputedStyle(bar).touchAction
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Tab bar props:', testRes.result.value);

    // Let's test synthesized touch scroll
    await send('Input.synthesizeScrollGesture', {
      x: 300,
      y: 100,
      xDistance: -200,
      yDistance: 0,
      gestureSourceType: 'touch'
    });
    await new Promise(r => setTimeout(r, 500));

    const afterScroll = await send('Runtime.evaluate', {
      expression: "document.querySelector('.gba-tab-bar')?.scrollLeft",
      returnByValue: true
    });
    console.log('ScrollLeft after gesture:', afterScroll.result.value);

    ws.close();
  };
}

testTouchDrag().catch(console.error);
