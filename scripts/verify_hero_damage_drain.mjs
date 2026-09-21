async function testHeroDamage() {
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

    console.log('Reload and switch to BATTLE...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));
    await send('Runtime.evaluate', {
      expression: "window.uiManagerInstance.setScreen('BATTLE')"
    });
    await new Promise(r => setTimeout(r, 1200));

    // Click btn-attack-b (which triggers false because enemy HP is 28 > 20)
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-attack-b');
          if (!btn) return 'NOT FOUND';
          btn.click();
          return 'CLICKED B';
        })()
      `,
      returnByValue: true
    });
    console.log('Click result:', clickRes.result.value);

    // Track hero HP drain
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 100));
      const heroInfo = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const b = window.phaserGame?.scene?.getScene('BattleScene');
            return {
              step: ${i * 100},
              heroHp: b?.heroHp,
              displayedHeroHp: Math.round(b?.displayedHeroHp || 0),
              text: b?.heroHpText?.text,
              isTurnExecuting: b?.isTurnExecuting
            };
          })()
        `,
        returnByValue: true
      });
      console.log(`T+${i * 100}ms:`, heroInfo.result.value);
    }

    ws.close();
  };
}

testHeroDamage().catch(console.error);
