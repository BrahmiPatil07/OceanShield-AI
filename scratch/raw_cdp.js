const { spawn } = require('child_process');
const http = require('http');

async function testCDP() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9261',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  http.get('http://127.0.0.1:9261/json', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const targets = JSON.parse(d);
      const page = targets.find(t => t.type === 'page');
      console.log('Page target:', page.url);
      const ws = new WebSocket(page.webSocketDebuggerUrl);

      let id = 1;
      const pending = new Map();
      function send(method, params = {}) {
        return new Promise((resolve) => {
          const msgId = id++;
          pending.set(msgId, resolve);
          ws.send(JSON.stringify({ id: msgId, method, params }));
        });
      }

      ws.onopen = async () => {
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id && pending.has(msg.id)) {
            const resolve = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
          if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('[Console]:', msg.params.args.map(a => a.value || a.description).join(' '));
          }
        };

        await send('Page.enable');
        await send('Runtime.enable');
        await send('Console.enable');

        // Check readyState every 500ms for 5 seconds
        for (let i = 0; i < 10; i++) {
          const state = await send('Runtime.evaluate', {
            expression: '({ readyState: document.readyState, bodyLen: document.body ? document.body.innerHTML.length : 0, btnStart: !!document.getElementById("btn-start-demo") })',
            returnByValue: true
          });
          console.log(`Check ${i}:`, state.result?.result?.value);
          if (state.result?.result?.value?.btnStart) break;
          await new Promise(r => setTimeout(r, 500));
        }

        chromeProc.kill();
        process.exit(0);
      };
    });
  });
}

testCDP();
