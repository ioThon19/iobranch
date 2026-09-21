async function inspect() {
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
        (() => {
          const game = window.game;
          const scenes = game?.scene?.getScenes(true).map(s => s.scene.key);
          const battle = game?.scene?.getScene('BattleScene');
          return {
            scenes,
            battleEnemyHp: battle?.enemyHp,
            battleDisplayedEnemyHp: battle?.displayedEnemyHp,
            battleText: battle?.enemyHpText?.text
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Inspection:', resEval.result.value);
    ws.close();
  };
}

inspect().catch(console.error);
