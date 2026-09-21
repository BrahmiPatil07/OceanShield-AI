const { spawn } = require('child_process');
const http = require('http');

async function runCleanupTests() {
  console.log('================================================================');
  console.log('   OCEAN SHIELD — FINAL UI CLEANUP VERIFICATION TEST SUITE     ');
  console.log('================================================================\n');

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9240',
    '--window-size=1366,800',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);

  await new Promise(r => setTimeout(r, 1600));

  http.get('http://127.0.0.1:9240/json', (res) => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
      const page = JSON.parse(d).find(t => t.type === 'page');
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      let id = 1;
      const consoleErrors = [];
      const pending = new Map();

      function send(method, params = {}) {
        return new Promise((resolve, reject) => {
          const msgId = id++;
          pending.set(msgId, { resolve, reject });
          ws.send(JSON.stringify({ id: msgId, method, params }));
        });
      }

      async function evaluate(expr) {
        const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
        if (r?.exceptionDetails) {
          console.error('Eval Exception for expr:', expr, r.exceptionDetails);
        }
        return r?.result?.value;
      }

      ws.onopen = async () => {
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg.result);
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            consoleErrors.push(msg.params.exceptionDetails.text + ': ' + msg.params.exceptionDetails.exception?.description);
          }
          if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
          }
        };

        await send('Runtime.enable');
        await send('Console.enable');

        await new Promise(r => setTimeout(r, 1200));

        let passed = 0;
        let total = 0;
        function assert(cond, msg) {
          total++;
          if (cond) {
            console.log(`[PASS] ${msg}`);
            passed++;
          } else {
            console.error(`[FAIL] ${msg}`);
          }
        }

        console.log('--- 1. WEBSITE NAME & BRANDING AUDIT ---');
        const pageTitle = await evaluate(`document.title`);
        assert(pageTitle.startsWith('Ocean Shield'), `Browser page title starts with 'Ocean Shield' (got: "${pageTitle}")`);
        assert(!pageTitle.includes('OceanShield'), `Page title does not contain 'OceanShield'`);
        assert(!pageTitle.includes('Ocean Shield AI'), `Page title does not contain 'Ocean Shield AI'`);

        const headerH1 = await evaluate(`document.querySelector('header h1')?.innerText`);
        assert(headerH1 === 'Ocean Shield', `Header h1 text is exactly 'Ocean Shield' (got: "${headerH1}")`);

        const footerBranding = await evaluate(`document.querySelector('footer div')?.innerText`);
        assert(footerBranding.includes('Ocean Shield'), `Footer branding contains 'Ocean Shield' (got: "${footerBranding}")`);
        assert(!footerBranding.includes('OceanShield'), `Footer branding does not contain 'OceanShield'`);
        assert(!footerBranding.includes('Ocean Shield AI'), `Footer branding does not contain 'Ocean Shield AI'`);

        console.log('\n--- 2. BOTTOM DEMO PANEL REMOVAL AUDIT ---');
        const hudInDom = await evaluate(`!!document.getElementById('demo-floating-hud')`);
        assert(hudInDom === false, `Bottom floating HUD #demo-floating-hud is completely removed from DOM`);

        const hudStep6 = await evaluate(`document.querySelectorAll('.hud-badge, .hud-step-title, #btn-hud-prev, #btn-hud-next, #btn-hud-exit').length`);
        assert(hudStep6 === 0, `All bottom HUD components are removed (count: ${hudStep6})`);

        console.log('\n--- 3. DUPLICATE CONTROLS AUDIT ---');
        // Start Demo: exactly 1
        const startBtns = await evaluate(`Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim().includes('Start Demo')).length`);
        assert(startBtns === 1, `Exactly ONE 'Start Demo' button exists on page (count: ${startBtns})`);

        // Reset Demo: exactly 1
        const resetBtns = await evaluate(`Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim().includes('Reset Demo')).length`);
        assert(resetBtns === 1, `Exactly ONE 'Reset Demo' button exists on page (count: ${resetBtns})`);

        // Upload Satellite Image: exactly 1
        const uploadSatBtns = await evaluate(`Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim().includes('Upload Satellite Image')).length`);
        assert(uploadSatBtns === 1, `Exactly ONE 'Upload Satellite Image' button exists on page (count: ${uploadSatBtns})`);

        // Use Sample SAR Image: exactly 1
        const sampleSatBtns = await evaluate(`Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim().includes('Use Sample SAR Image')).length`);
        assert(sampleSatBtns === 1, `Exactly ONE 'Use Sample SAR Image' button exists on page (count: ${sampleSatBtns})`);

        // Generate Investigation Report: exactly 1
        const reportBtns = await evaluate(`Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Generate Investigation Report').length`);
        assert(reportBtns === 1, `Exactly ONE 'Generate Investigation Report' button exists on page (count: ${reportBtns})`);

        console.log('\n--- 4. TOP ACTION AREA AUDIT ---');
        const topBarExists = await evaluate(`!!document.querySelector('header .top-action-bar')`);
        assert(topBarExists === true, `Top action bar container exists in header`);

        const topBarButtons = await evaluate(`Array.from(document.querySelectorAll('header .top-action-bar button')).map(b => b.innerText.trim())`);
        assert(topBarButtons.length === 4, `Top action bar contains 4 buttons (got: ${topBarButtons.length})`);
        assert(topBarButtons[0].includes('Upload Satellite Image'), `Button 1 is Upload Satellite Image (got: "${topBarButtons[0]}")`);
        assert(topBarButtons[1].includes('Use Sample SAR Image'), `Button 2 is Use Sample SAR Image (got: "${topBarButtons[1]}")`);
        assert(topBarButtons[2].includes('Start Demo'), `Button 3 is Start Demo (got: "${topBarButtons[2]}")`);
        assert(topBarButtons[3].includes('Reset Demo'), `Button 4 is Reset Demo (got: "${topBarButtons[3]}")`);

        console.log('\n--- 5. FUNCTIONAL BEHAVIOR AUDIT ---');
        // Click Use Sample SAR Image
        await evaluate(`document.getElementById('btn-sample-satellite').click()`);
        await new Promise(r => setTimeout(r, 600));
        const satSource = await evaluate(`document.getElementById('sat-source-name')?.innerText`);
        assert(satSource.includes('sample_sar_image.jpg'), `Use Sample SAR Image loaded sample raster (source: "${satSource}")`);

        // Click Generate Investigation Report
        await evaluate(`document.getElementById('btn-generate-report-evidence').click()`);
        await new Promise(r => setTimeout(r, 800));
        const reportModalActive = await evaluate(`document.getElementById('report-modal')?.classList.contains('active')`);
        assert(reportModalActive === true, `Clicking 'Generate Investigation Report' opened the SITREP modal`);

        const reportSections = await evaluate(`document.querySelectorAll('.report-section').length`);
        assert(reportSections === 6, `Investigation Report contains all 6 forensic sections (count: ${reportSections})`);

        const reportAgency = await evaluate(`document.querySelector('.report-doc-header')?.innerText`);
        assert(reportAgency.toUpperCase().includes('OCEAN SHIELD'), `Report header displays 'Ocean Shield' (text snippet: "${reportAgency.slice(0, 40)}")`);
        assert(!reportAgency.includes('OceanShield'), `Report header does not contain 'OceanShield'`);

        // Close report modal
        await evaluate(`document.getElementById('btn-close-report').click()`);
        await new Promise(r => setTimeout(r, 300));
        const reportModalClosed = await evaluate(`!document.getElementById('report-modal')?.classList.contains('active')`);
        assert(reportModalClosed === true, `Report modal successfully closed`);

        // Navigation check: main nav still has Investigation Report link
        const navReportLink = await evaluate(`document.getElementById('nav-investigation-report')?.getAttribute('href')`);
        assert(navReportLink === '#evidence-risk-section', `Navigation bar links directly to #evidence-risk-section`);

        console.log('\n--- 6. RUNTIME CONSOLE ERRORS AUDIT ---');
        assert(consoleErrors.length === 0, `Zero console runtime errors (errors: ${JSON.stringify(consoleErrors)})`);

        console.log('\n================================================================');
        console.log(`   FINAL CLEANUP TEST RESULTS: ${passed}/${total} PASSED!       `);
        console.log('================================================================');

        chromeProc.kill();
        process.exit(passed === total ? 0 : 1);
      };
    });
  });
}

runCleanupTests();
