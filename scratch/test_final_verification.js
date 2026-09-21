const { spawn } = require('child_process');
const http = require('http');

async function runVerification() {
  console.log('================================================================');
  console.log('   OCEANSHIELD AI — FINAL COMPREHENSIVE VERIFICATION SUITE       ');
  console.log('================================================================\n');

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--window-size=1366,800',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  http.get('http://127.0.0.1:9230/json', (res) => {
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
        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
        if (res?.exceptionDetails) {
          console.error('Eval Exception for expr:', expr, res.exceptionDetails);
        }
        return res?.result?.value;
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

        // Wait 1.5s for initial silent setup
        await new Promise(r => setTimeout(r, 1500));

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

        console.log('--- TEST 1: Duplicate Buttons Audit ---');
        const startBtnCount = await evaluate(`document.querySelectorAll('#btn-start-demo').length`);
        assert(startBtnCount === 1, `Exactly ONE #btn-start-demo exists (count: ${startBtnCount})`);

        const startBtnHeaderCount = await evaluate(`document.querySelectorAll('#btn-start-demo-header').length`);
        assert(startBtnHeaderCount === 0, `Zero duplicate #btn-start-demo-header exists (count: ${startBtnHeaderCount})`);

        const resetBtnCount = await evaluate(`document.querySelectorAll('#btn-reset-demo').length`);
        assert(resetBtnCount === 1, `Exactly ONE #btn-reset-demo exists (count: ${resetBtnCount})`);

        const resetNavCount = await evaluate(`document.querySelectorAll('#btn-reset-demo-nav').length`);
        assert(resetNavCount === 0, `Zero duplicate #btn-reset-demo-nav exists (count: ${resetNavCount})`);

        const uploadSatAtTop = await evaluate(`!!document.querySelector('header #btn-upload-satellite')`);
        assert(uploadSatAtTop === true, `Upload Satellite Image is present in top header`);

        const sampleSatAtTop = await evaluate(`!!document.querySelector('header #btn-sample-satellite')`);
        assert(sampleSatAtTop === true, `Sample SAR Image is present in top header`);

        const aisInVessels = await evaluate(`!!document.querySelector('#vessels-panel #btn-upload-ais')`);
        assert(aisInVessels === true, `Upload AIS Data is present in vessels panel`);

        const sampleCsvInVessels = await evaluate(`!!document.querySelector('#vessels-panel #btn-sample-csv')`);
        assert(sampleCsvInVessels === true, `Sample CSV is present in vessels panel`);

        console.log('\n--- TEST 2: Initial Workflow State (Step 1) ---');
        const step1State = await evaluate(`JSON.stringify({
          step: window.currentDemoStep,
          counter: document.getElementById('demo-step-counter')?.innerText,
          statusText: document.getElementById('workflow-status-text')?.innerText,
          prevDisabled: document.getElementById('btn-demo-prev')?.disabled,
          nextText: document.getElementById('btn-demo-next')?.innerText,
          card1Active: document.getElementById('wf-step-1')?.classList.contains('active'),
          card1Tag: document.getElementById('wf-status-1')?.innerText
        })`);
        const s1 = JSON.parse(step1State);
        assert(s1.step === 1, `Initial step is 1 (got ${s1.step})`);
        assert(s1.counter.includes('Step 1 of 6'), `Step counter shows Step 1 of 6: "${s1.counter}"`);
        assert(s1.prevDisabled === true, `Previous button is disabled on Step 1`);
        assert(s1.card1Active === true, `Step 1 card has .active class`);
        assert(s1.card1Tag === 'ACTIVE', `Step 1 status tag is ACTIVE`);

        console.log('\n--- TEST 3: Advance to Step 2 (Spill Detection) ---');
        await evaluate(`document.getElementById('btn-demo-next').click()`);
        await new Promise(r => setTimeout(r, 600));

        const step2State = await evaluate(`JSON.stringify({
          step: window.currentDemoStep,
          counter: document.getElementById('demo-step-counter')?.innerText,
          prevDisabled: document.getElementById('btn-demo-prev')?.disabled,
          card1Completed: document.getElementById('wf-step-1')?.classList.contains('completed'),
          card1Tag: document.getElementById('wf-status-1')?.innerText,
          card2Active: document.getElementById('wf-step-2')?.classList.contains('active'),
          card2Tag: document.getElementById('wf-status-2')?.innerText,
          hasAiResults: !!window.simulatedAiResults,
          areaVal: document.getElementById('sat-area-val')?.innerText
        })`);
        const s2 = JSON.parse(step2State);
        assert(s2.step === 2, `Advanced to Step 2 (got ${s2.step})`);
        assert(s2.counter.includes('Step 2 of 6'), `Counter shows Step 2 of 6: "${s2.counter}"`);
        assert(s2.prevDisabled === false, `Previous button is now enabled`);
        assert(s2.card1Completed === true, `Step 1 card is marked completed`);
        assert(s2.card1Tag === 'DONE ✓', `Step 1 status tag is DONE ✓`);
        assert(s2.card2Active === true, `Step 2 card is active`);
        assert(s2.hasAiResults === true, `AI Spill Detection pipeline ran and generated results`);

        console.log('\n--- TEST 4: Advance to Step 3 (Location & Map) ---');
        await evaluate(`document.getElementById('btn-demo-next').click()`);
        await new Promise(r => setTimeout(r, 600));

        const step3State = await evaluate(`JSON.stringify({
          step: window.currentDemoStep,
          counter: document.getElementById('demo-step-counter')?.innerText,
          card3Active: document.getElementById('wf-step-3')?.classList.contains('active'),
          mapCoords: document.getElementById('map-coords')?.innerText
        })`);
        const s3 = JSON.parse(step3State);
        assert(s3.step === 3, `Advanced to Step 3 (got ${s3.step})`);
        assert(s3.counter.includes('Step 3 of 6'), `Counter shows Step 3 of 6: "${s3.counter}"`);
        assert(s3.card3Active === true, `Step 3 card is active`);

        console.log('\n--- TEST 5: Advance to Step 4 (Drift Forecast) ---');
        await evaluate(`document.getElementById('btn-demo-next').click()`);
        await new Promise(r => setTimeout(r, 600));

        const step4State = await evaluate(`JSON.stringify({
          step: window.currentDemoStep,
          counter: document.getElementById('demo-step-counter')?.innerText,
          card4Active: document.getElementById('wf-step-4')?.classList.contains('active'),
          driftHorizon: window.activeDriftHorizon
        })`);
        const s4 = JSON.parse(step4State);
        assert(s4.step === 4, `Advanced to Step 4 (got ${s4.step})`);
        assert(s4.counter.includes('Step 4 of 6'), `Counter shows Step 4 of 6: "${s4.counter}"`);
        assert(s4.card4Active === true, `Step 4 card is active`);
        assert(s4.driftHorizon === 24, `24h drift simulation triggered (horizon: ${s4.driftHorizon})`);

        console.log('\n--- TEST 6: Advance to Step 5 (AIS Correlation) ---');
        await evaluate(`document.getElementById('btn-demo-next').click()`);
        await new Promise(r => setTimeout(r, 600));

        const step5State = await evaluate(`JSON.stringify({
          step: window.currentDemoStep,
          counter: document.getElementById('demo-step-counter')?.innerText,
          card5Active: document.getElementById('wf-step-5')?.classList.contains('active'),
          hvDisplay: document.getElementById('demo-exp-hv-badge')?.style.display,
          vesselRowsCount: document.querySelectorAll('#rows tr').length
        })`);
        const s5 = JSON.parse(step5State);
        assert(s5.step === 5, `Advanced to Step 5 (got ${s5.step})`);
        assert(s5.counter.includes('Step 5 of 6'), `Counter shows Step 5 of 6: "${s5.counter}"`);
        assert(s5.card5Active === true, `Step 5 card is active`);
        assert(s5.hvDisplay === 'inline-flex', `REQUIRES HUMAN VERIFICATION badge is visible`);
        assert(s5.vesselRowsCount > 0, `Candidate vessel table has ${s5.vesselRowsCount} rows`);

        console.log('\n--- TEST 7: Advance to Step 6 (Investigation Report) ---');
        await evaluate(`document.getElementById('btn-demo-next').click()`);
        await new Promise(r => setTimeout(r, 800));

        const step6State = await evaluate(`JSON.stringify({
          step: window.currentDemoStep,
          counter: document.getElementById('demo-step-counter')?.innerText,
          card6Active: document.getElementById('wf-step-6')?.classList.contains('active'),
          nextText: document.getElementById('btn-demo-next')?.innerText,
          reportModalActive: document.getElementById('report-modal')?.classList.contains('active')
        })`);
        const s6 = JSON.parse(step6State);
        assert(s6.step === 6, `Advanced to Step 6 (got ${s6.step})`);
        assert(s6.counter.includes('Step 6 of 6'), `Counter shows Step 6 of 6: "${s6.counter}"`);
        assert(s6.card6Active === true, `Step 6 card is active`);
        assert(s6.nextText.includes('Restart Demo'), `Next button changes to Restart Demo on Step 6`);
        assert(s6.reportModalActive === true, `Investigation Report SITREP modal is opened`);

        console.log('\n--- TEST 8: Backward Navigation (Step 6 -> 5 -> 4) ---');
        await evaluate(`document.getElementById('btn-demo-prev').click()`);
        await new Promise(r => setTimeout(r, 500));
        const prevStep5 = await evaluate(`window.currentDemoStep`);
        assert(prevStep5 === 5, `Previous button moved back 6 -> 5 (got ${prevStep5})`);

        await evaluate(`document.getElementById('btn-demo-prev').click()`);
        await new Promise(r => setTimeout(r, 500));
        const prevStep4 = await evaluate(`window.currentDemoStep`);
        assert(prevStep4 === 4, `Previous button moved back 5 -> 4 (got ${prevStep4})`);

        console.log('\n--- TEST 9: Loop / Restart from Step 6 ---');
        await evaluate(`window.renderDemoStep(6)`);
        await new Promise(r => setTimeout(r, 500));
        await evaluate(`document.getElementById('btn-demo-next').click()`);
        await new Promise(r => setTimeout(r, 500));
        const restartStep = await evaluate(`window.currentDemoStep`);
        assert(restartStep === 1, `Clicking Restart on Step 6 resets to Step 1 (got ${restartStep})`);

        console.log('\n--- TEST 10: Direct Step Card Click ---');
        await evaluate(`document.getElementById('wf-step-3').click()`);
        await new Promise(r => setTimeout(r, 500));
        const directStep3 = await evaluate(`window.currentDemoStep`);
        assert(directStep3 === 3, `Clicking Step 3 card jumps directly to Step 3 (got ${directStep3})`);

        console.log('\n--- TEST 11: Browser Console Error Audit ---');
        assert(consoleErrors.length === 0, `Zero runtime console errors (errors: ${JSON.stringify(consoleErrors)})`);

        console.log('\n================================================================');
        console.log(`   TEST RESULTS: ${passed}/${total} ASSERTIONS PASSED!          `);
        console.log('================================================================');

        chromeProc.kill();
        process.exit(passed === total ? 0 : 1);
      };
    });
  });
}

runVerification();
