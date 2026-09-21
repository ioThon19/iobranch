async function checkMobileNavbar() {
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

    // Set mobile device metrics (360x780)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 780,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    const info = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const nav = document.querySelector('.retro-navbar');
          const tabBar = document.querySelector('.gba-tab-bar');
          const items = Array.from(document.querySelectorAll('.gba-tab-item'));
          return {
            windowWidth: window.innerWidth,
            navWidth: nav?.offsetWidth,
            tabBarWidth: tabBar?.offsetWidth,
            tabBarScrollWidth: tabBar?.scrollWidth,
            tabBarScrollLeft: tabBar?.scrollLeft,
            canScroll: tabBar?.scrollWidth > tabBar?.clientWidth,
            itemsCount: items.length,
            firstItemRect: items[0]?.getBoundingClientRect(),
            lastItemRect: items[items.length - 1]?.getBoundingClientRect(),
            computedNav: nav ? {
              display: getComputedStyle(nav).display,
              overflow: getComputedStyle(nav).overflow,
              flexWrap: getComputedStyle(nav).flexWrap,
              width: getComputedStyle(nav).width
            } : null,
            computedTabBar: tabBar ? {
              display: getComputedStyle(tabBar).display,
              overflowX: getComputedStyle(tabBar).overflowX,
              overflowY: getComputedStyle(tabBar).overflowY,
              width: getComputedStyle(tabBar).width,
              maxWidth: getComputedStyle(tabBar).maxWidth,
              touchAction: getComputedStyle(tabBar).touchAction
            } : null
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Mobile Navbar Info:', JSON.stringify(info.result.value, null, 2));

    // Try scrolling tabBar
    const scrollTest = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabBar = document.querySelector('.gba-tab-bar');
          if (!tabBar) return 'No tab bar';
          const before = tabBar.scrollLeft;
          tabBar.scrollLeft = 150;
          return {
            before,
            after: tabBar.scrollLeft,
            maxScroll: tabBar.scrollWidth - tabBar.clientWidth
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Scroll test via JS:', scrollTest.result.value);

    ws.close();
  };
}

checkMobileNavbar().catch(console.error);
