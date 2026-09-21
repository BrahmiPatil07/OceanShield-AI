const { spawn } = require('child_process');
const http = require('http');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'file:///c:/oil%20spill/index.html'
  ]);

  // Wait 1.5 seconds for Chrome to start
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Query /json to get WebSocket URL
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const targets = JSON.parse(data);
        const page = targets.find(t => t.type === 'page');
        if (!page) {
          console.error('No page target found');
          chromeProc.kill();
          return;
        }

        console.log('Connecting to page:', page.title, page.webSocketDebuggerUrl);
        const ws = new WebSocket(page.webSocketDebuggerUrl);

        let id = 1;
        const pending = new Map();

        function send(method, params = {}) {
          return new Promise((resolve, reject) => {
            const msgId = id++;
            pending.set(msgId, { resolve, reject });
            ws.send(JSON.stringify({ id: msgId, method, params }));
          });
        }

        ws.onopen = async () => {
          console.log('WebSocket connected. Enabling Console & Runtime...');
          await send('Console.enable');
          await send('Runtime.enable');

          // Wait 2 seconds for initial page scripts to run
          await new Promise(r => setTimeout(r, 2000));

          // Check current step state
          console.log('\n--- Checking Initial State ---');
          const evalRes1 = await send('Runtime.evaluate', {
            expression: `({
              isDemoModeActive: typeof isDemoModeActive !== 'undefined' ? isDemoModeActive : 'undefined',
              currentDemoStep: typeof currentDemoStep !== 'undefined' ? currentDemoStep : 'undefined',
              stepCounterText: document.getElementById('demo-step-counter')?.innerText,
              workflowStatusText: document.getElementById('workflow-status-text')?.innerText,
              prevDisabled: document.getElementById('btn-demo-prev')?.disabled,
              nextText: document.getElementById('btn-demo-next')?.innerText
            })`,
            returnByValue: true
          });
          console.log('Initial State:', evalRes1.result.value);

          // Check if button is covered or has 0 size or pointer-events: none
          const evalResBox = await send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              if (!btn) return 'Button not found';
              const rect = btn.getBoundingClientRect();
              const style = window.getComputedStyle(btn);
              const elAtPoint = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
              return {
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                display: style.display,
                visibility: style.visibility,
                pointerEvents: style.pointerEvents,
                zIndex: style.zIndex,
                elementFromPointId: elAtPoint?.id,
                elementFromPointTag: elAtPoint?.tagName,
                elementFromPointClass: elAtPoint?.className
              };
            })()`,
            returnByValue: true
          });
          console.log('Button Box & Coverage:', evalResBox.result.value);

          // Try clicking the button
          console.log('\n--- Clicking #btn-demo-next ---');
          const clickRes = await send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              if (!btn) return 'btn-demo-next not found';
              btn.click();
              return 'clicked';
            })()`,
            returnByValue: true
          });
          console.log('Click execution:', clickRes.result.value);

          // Wait 500ms
          await new Promise(r => setTimeout(r, 500));

          // Check state after click
          const evalRes2 = await send('Runtime.evaluate', {
            expression: `({
              isDemoModeActive: typeof isDemoModeActive !== 'undefined' ? isDemoModeActive : 'undefined',
              currentDemoStep: typeof currentDemoStep !== 'undefined' ? currentDemoStep : 'undefined',
              stepCounterText: document.getElementById('demo-step-counter')?.innerText,
              workflowStatusText: document.getElementById('workflow-status-text')?.innerText,
              prevDisabled: document.getElementById('btn-demo-prev')?.disabled,
              nextText: document.getElementById('btn-demo-next')?.innerText,
              expTitle: document.getElementById('demo-exp-title')?.innerText
            })`,
            returnByValue: true
          });
          console.log('State After Click:', evalRes2.result.value);

          // Close up
          ws.close();
          chromeProc.kill();
          process.exit(0);
        };

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
          if (msg.method === 'Runtime.consoleAPICalled') {
            console.log(`[Browser Console ${msg.params.type}]:`, msg.params.args.map(a => a.value || a.description).join(' '));
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            console.error('[Browser Exception]:', msg.params.exceptionDetails);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          chromeProc.kill();
        };

      } catch (err) {
        console.error('Error handling /json:', err);
        chromeProc.kill();
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error connecting to Chrome:', err);
    chromeProc.kill();
  });
}

run();
