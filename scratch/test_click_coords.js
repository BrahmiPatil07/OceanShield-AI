const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--window-size=1366,768',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  http.get('http://127.0.0.1:9225/json', (res) => {
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

        setTimeout(() => {
          send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById('btn-demo-next');
              const rect = btn.getBoundingClientRect();
              const midX = rect.left + rect.width / 2;
              const midY = rect.top + rect.height / 2;
              const elAtPoint = document.elementFromPoint(midX, midY);
              
              return JSON.stringify({
                rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                midX,
                midY,
                elAtPoint: {
                  id: elAtPoint?.id,
                  tagName: elAtPoint?.tagName,
                  className: elAtPoint?.className,
                  outerHTML: elAtPoint?.outerHTML?.slice(0, 150)
                },
                isSame: elAtPoint === btn || btn.contains(elAtPoint)
              });
            })()`,
            returnByValue: true
          });
        }, 1200);
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.result?.result?.value) {
          console.log('HIT TEST RESULT:', msg.result.result.value);
          const data = JSON.parse(msg.result.result.value);
          
          // Now let's try a REAL MouseEvent dispatch (like a user click with mouse coordinates)
          send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x: data.midX,
            y: data.midY,
            button: 'left',
            clickCount: 1
          });
          send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x: data.midX,
            y: data.midY,
            button: 'left',
            clickCount: 1
          });

          setTimeout(() => {
            send('Runtime.evaluate', {
              expression: `JSON.stringify({
                step: currentDemoStep,
                counter: document.getElementById('demo-step-counter')?.innerText,
                statusText: document.getElementById('workflow-status-text')?.innerText
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
