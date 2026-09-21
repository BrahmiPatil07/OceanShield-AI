const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  http.get('http://127.0.0.1:9228/json', (res) => {
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

      function toObj(rect) {
        if (!rect) return null;
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
      }

      ws.onopen = () => {
        send('Runtime.enable');

        setTimeout(async () => {
          const mId = send('Runtime.evaluate', {
            expression: `(() => {
              function toObj(r) {
                if (!r) return null;
                return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
              }
              const btn = document.getElementById('btn-demo-next');
              const stepper = document.getElementById('workflow-stepper');
              const nav = document.getElementById('main-nav');
              const satPanel = document.getElementById('satellite-analysis-panel');
              const toolbar = document.getElementById('demo-mode-toolbar');

              return JSON.stringify({
                scrollY: window.scrollY,
                stepper: toObj(stepper?.getBoundingClientRect()),
                toolbar: toObj(toolbar?.getBoundingClientRect()),
                btn: toObj(btn?.getBoundingClientRect()),
                nav: toObj(nav?.getBoundingClientRect()),
                satPanel: toObj(satPanel?.getBoundingClientRect())
              }, null, 2);
            })()`,
            returnByValue: true
          });
          
          ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.id === mId) {
              console.log('INITIAL LAYOUT POSITIONS:\n', msg.result.result.value);
              chromeProc.kill();
              process.exit(0);
            }
          };
        }, 2000);
      };
    });
  });
}
test();
