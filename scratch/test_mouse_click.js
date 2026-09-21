const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  http.get('http://127.0.0.1:9229/json', (res) => {
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
        send('Input.enable');
        send('Console.enable');

        setTimeout(async () => {
          // Check elementFromPoint at the exact center of btn-demo-next
          const mId = send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              const rect = btn.getBoundingClientRect();
              const midX = Math.round(rect.left + rect.width / 2);
              const midY = Math.round(rect.top + rect.height / 2);
              const el = document.elementFromPoint(midX, midY);
              
              // Also add a click listener to log clicks on window
              window.addEventListener('click', (e) => {
                console.log('Window clicked at:', e.clientX, e.clientY, 'Target:', e.target.tagName, e.target.id, e.target.className);
              }, true);

              return JSON.stringify({
                midX, midY,
                btnId: btn.id,
                btnTag: btn.tagName,
                elId: el?.id,
                elTag: el?.tagName,
                elClass: el?.className,
                isSame: el === btn || btn.contains(el)
              });
            })()`,
            returnByValue: true
          });

          ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.method === 'Runtime.consoleAPICalled') {
              console.log('[CONSOLE]', msg.params.args.map(a => a.value || a.description).join(' '));
            }
            if (msg.id === mId) {
              console.log('HIT TEST RESULT:', msg.result.result.value);
              const info = JSON.parse(msg.result.result.value);

              console.log('Dispatching mouse click to', info.midX, info.midY);
              send('Input.dispatchMouseEvent', {
                type: 'mousePressed',
                x: info.midX,
                y: info.midY,
                button: 'left',
                clickCount: 1
              });
              send('Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                x: info.midX,
                y: info.midY,
                button: 'left',
                clickCount: 1
              });

              setTimeout(() => {
                const checkId = send('Runtime.evaluate', {
                  expression: `JSON.stringify({
                    currentDemoStep: typeof currentDemoStep !== 'undefined' ? currentDemoStep : null,
                    counter: document.getElementById('demo-step-counter')?.innerText,
                    statusText: document.getElementById('workflow-status-text')?.innerText,
                    activeStepCard: document.querySelector('.workflow-step.active')?.id
                  })`,
                  returnByValue: true
                });

                const checkListener = (e2) => {
                  const msg2 = JSON.parse(e2.data);
                  if (msg2.id === checkId) {
                    console.log('POST-CLICK STATE:', msg2.result.result.value);
                    chromeProc.kill();
                    process.exit(0);
                  }
                };
                ws.addEventListener('message', checkListener);
              }, 600);
            }
          };
        }, 2000);
      };
    });
  });
}
test();
