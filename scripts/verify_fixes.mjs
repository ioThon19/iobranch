// scripts/verify_fixes.mjs
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\ioThon\\.gemini\\antigravity-ide\\brain\\f6d6d768-5d5b-44a0-9bb8-127c34f3a6dd';

async function getCDPPage() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('localhost:5173') && t.type === 'page');
  return target.webSocketDebuggerUrl;
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outPath}`);
    return outPath;
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('Connecting to browser via CDP...');
  const wsUrl = await getCDPPage();
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  console.log('Setting desktop viewport (1024x768)...');
  await cdp.setViewport(1024, 768);

  // Reload page to make sure latest index.html and assets are loaded
  console.log('Reloading page...');
  await cdp.send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  // 1. Verify MENU (Beranda)
  console.log('\n--- Checking MENU (Beranda) ---');
  const menuInfo = await cdp.evaluate(`(() => {
    const footer = document.getElementById('global-footer');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const hasSmaKotaHarmoni = document.body.innerText.includes('SMA KOTA HARMONI');
    const hasPakBudiRaka = document.body.innerText.includes('PAK BUDI & RAKA');
    const startBtn = document.getElementById('btn-start-game');
    const startBtnGold = startBtn ? startBtn.classList.contains('game-btn-gold') : false;

    return {
      footerExists: !!footer,
      footerWidth: footerRect ? footerRect.width : 0,
      windowWidth: window.innerWidth,
      hasSmaKotaHarmoni,
      hasPakBudiRaka,
      startBtnGold,
      footerText: footer ? footer.innerText.replace(/\\n/g, ' | ') : ''
    };
  })()`);
  console.log('Menu info:', JSON.stringify(menuInfo, null, 2));
  await cdp.captureScreenshot('verified_menu_screen.png');

  // 2. Navigate to OVERWORLD (PETA)
  console.log('\n--- Checking OVERWORLD (Peta) ---');
  await cdp.evaluate(`window.uiManagerInstance.setScreen('OVERWORLD')`);
  await new Promise(r => setTimeout(r, 1000));

  const overworldInfo = await cdp.evaluate(`(() => {
    const footer = document.getElementById('global-footer');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const isSplit = document.getElementById('app').classList.contains('split-mode');
    const cards = document.querySelectorAll('#ui-overlay .tactile-card').length;
    return {
      isSplit,
      footerWidth: footerRect ? footerRect.width : 0,
      windowWidth: window.innerWidth,
      cardsCount: cards
    };
  })()`);
  console.log('Overworld info:', JSON.stringify(overworldInfo, null, 2));
  await cdp.captureScreenshot('verified_overworld_screen.png');

  // 3. Navigate to TRACING
  console.log('\n--- Checking TRACING ---');
  await cdp.evaluate(`window.uiManagerInstance.setScreen('TRACING')`);
  await new Promise(r => setTimeout(r, 1000));

  const tracingInfo = await cdp.evaluate(`(() => {
    const footer = document.getElementById('global-footer');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const btnNext = document.getElementById('btn-step-next');
    const btnRun = document.getElementById('btn-run-full-sim');
    const btnIf = document.getElementById('btn-predict-if');
    const btnElse = document.getElementById('btn-predict-else');

    return {
      footerWidth: footerRect ? footerRect.width : 0,
      windowWidth: window.innerWidth,
      btnNextDisabledBefore: btnNext ? btnNext.disabled : null,
      btnRunDisabledBefore: btnRun ? btnRun.disabled : null,
      hasPredictionButtons: !!(btnIf && btnElse)
    };
  })()`);
  console.log('Tracing info before prediction:', JSON.stringify(tracingInfo, null, 2));
  await cdp.captureScreenshot('verified_tracing_screen_gated.png');

  // Test selecting prediction
  await cdp.evaluate(`document.getElementById('btn-predict-if')?.click()`);
  await new Promise(r => setTimeout(r, 500));

  const tracingAfter = await cdp.evaluate(`(() => {
    const btnNext = document.getElementById('btn-step-next');
    const btnRun = document.getElementById('btn-run-full-sim');
    return {
      btnNextDisabledAfter: btnNext ? btnNext.disabled : null,
      btnRunDisabledAfter: btnRun ? btnRun.disabled : null
    };
  })()`);
  console.log('Tracing info after prediction:', JSON.stringify(tracingAfter, null, 2));
  await cdp.captureScreenshot('verified_tracing_screen_unlocked.png');

  // 4. Navigate to BATTLE
  console.log('\n--- Checking BATTLE ---');
  await cdp.evaluate(`window.uiManagerInstance.setScreen('BATTLE')`);
  await new Promise(r => setTimeout(r, 1000));

  const battleInfo = await cdp.evaluate(`(() => {
    const footer = document.getElementById('global-footer');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const isSplit = document.getElementById('app').classList.contains('split-mode');
    return {
      isSplit,
      footerWidth: footerRect ? footerRect.width : 0,
      windowWidth: window.innerWidth
    };
  })()`);
  console.log('Battle info:', JSON.stringify(battleInfo, null, 2));
  await cdp.captureScreenshot('verified_battle_screen.png');

  await cdp.close();
  console.log('\nVerification completed successfully!');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
