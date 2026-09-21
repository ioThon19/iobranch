async function testAddCounter() {
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

    const resEval = await send('Runtime.evaluate', {
      expression: `
        new Promise(resolve => {
          const scene = window.phaserGame?.scene?.getScenes(true)[0];
          let values = [];
          scene.tweens.addCounter({
            from: 10,
            to: 0,
            duration: 100,
            onUpdate: (tween, target) => {
              values.push({
                tweenValue: typeof tween.getValue === 'function' ? tween.getValue() : undefined,
                targetValue: target?.value,
                tweenTargetValue: tween?.targets?.[0]?.value
              });
            },
            onComplete: () => resolve(values)
          });
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('addCounter test:', resEval.result.value?.[0]);
    ws.close();
  };
}

testAddCounter().catch(console.error);
