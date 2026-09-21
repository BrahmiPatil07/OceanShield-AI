const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function capture() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9250',
    '--window-size=1366,900',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);

  await new Promise(r => setTimeout(r, 1600));

  http.get('http://127.0.0.1:9250/json', (res) => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
      const page = JSON.parse(d).find(t => t.type === 'page');
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
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg.result);
          }
        };

        await send('Page.enable');
        await new Promise(r => setTimeout(r, 1200));

        const res = await send('Page.captureScreenshot', { format: 'png' });
        if (res?.data) {
          const buf = Buffer.from(res.data, 'base64');
          fs.writeFileSync('C:\\Users\\brahm\\.gemini\\antigravity-ide\\brain\\cae42595-a3b4-44a3-b075-408fc646cd7c\\ocean_shield_cleanup.png', buf);
          console.log('Screenshot saved successfully!');
        }
        chromeProc.kill();
        process.exit(0);
      };
    });
  });
}

capture();
