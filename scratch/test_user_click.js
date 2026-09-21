const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=1366,900',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  http.get('http://127.0.0.1:9226/json', (res) => {
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
          // First, scroll the workflow stepper / button into view
          send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              btn.scrollIntoView({ block: 'center' });
              return 'scrolled';
            })()`,
            returnByValue: true
          });

          await new Promise(r => setTimeout(r, 600));

          // Now check getBoundingClientRect and elementFromPoint
          send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              const rect = btn.getBoundingClientRect();
              const midX = rect.left + rect.width / 2;
              const midY = rect.top + rect.height / 2;
              const elAtPoint = document.elementFromPoint(midX, midY);
              
              console.log('Button rect after scroll:', JSON.stringify(rect));
              console.log('Element at point:', elAtPoint?.tagName, elAtPoint?.id, elAtPoint?.className);

              return JSON.stringify({
                rect, midX, midY,
                elAtPoint: { tagName: elAtPoint?.tagName, id: elAtPoint?.id, className: elAtPoint?.className },
                isClickable: elAtPoint === btn || btn.contains(elAtPoint)
              });
            })()`,
            returnByValue: true
          });
        }, 1500);
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER LOG]', msg.params.args.map(a => a.value || a.description).join(' '));
        }
        if (msg.result?.result?.value && msg.result.result.value.startsWith('{')) {
          const info = JSON.parse(msg.result.result.value);
          console.log('CLICKABLE INFO:', info);

          if (info.midX && info.midY) {
            console.log('Sending mouse click to:', info.midX, info.midY);
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
              send('Runtime.evaluate', {
                expression: `JSON.stringify({
                  step: currentDemoStep,
                  isDemo: isDemoModeActive,
                  counter: document.getElementById('demo-step-counter')?.innerText
                })`,
                returnByValue: true
              });
              setTimeout(() => {
                chromeProc.kill();
                process.exit(0);
              }, 500);
            }, 500);
          }
        }
      };
    });
  });
}
test();
