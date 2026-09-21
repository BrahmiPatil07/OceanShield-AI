const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  http.get('http://127.0.0.1:9224/json', (res) => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
      const page = JSON.parse(d).find(t => t.type === 'page');
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      let id = 1;

      function send(method, params = {}) {
        const msgId = id++;
        ws.send(JSON.stringify({ id: msgId, method, params }));
        return msgId;
      }

      ws.onopen = () => {
        send('Runtime.enable');
        send('Console.enable');

        setTimeout(() => {
          send('Runtime.evaluate', {
            expression: `JSON.stringify({
              isDemo: typeof isDemoModeActive !== 'undefined' ? isDemoModeActive : null,
              step: typeof currentDemoStep !== 'undefined' ? currentDemoStep : null,
              counter: document.getElementById('demo-step-counter')?.innerText,
              statusText: document.getElementById('workflow-status-text')?.innerText,
              nextBtnText: document.getElementById('btn-demo-next')?.innerText,
              prevDisabled: document.getElementById('btn-demo-prev')?.disabled
            })`,
            returnByValue: true
          });
        }, 1000);
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
        }
        if (msg.result?.result?.value) {
          console.log('EVAL VALUE:', msg.result.result.value);

          // Now let's simulate clicking the next button!
          console.log('\n--- Clicking #btn-demo-next ---');
          send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              console.log('Clicking button:', btn);
              btn.click();
              return 'clicked';
            })()`,
            returnByValue: true
          });

          setTimeout(() => {
            send('Runtime.evaluate', {
              expression: `JSON.stringify({
                isDemo: isDemoModeActive,
                step: currentDemoStep,
                counter: document.getElementById('demo-step-counter')?.innerText,
                statusText: document.getElementById('workflow-status-text')?.innerText,
                nextBtnText: document.getElementById('btn-demo-next')?.innerText,
                prevDisabled: document.getElementById('btn-demo-prev')?.disabled,
                activeCard: document.querySelector('.workflow-step.active')?.id
              })`,
              returnByValue: true
            });
            setTimeout(() => {
              chromeProc.kill();
              process.exit(0);
            }, 500);
          }, 500);
        }
      };
    });
  });
}
test();
