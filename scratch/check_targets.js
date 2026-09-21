const { spawn } = require('child_process');
const http = require('http');

async function checkTargets() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9250',
    '--no-first-run',
    '--no-default-browser-check',
    'file:///c:/oil%20spill/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9250/json', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('Targets:', JSON.parse(d));
      chromeProc.kill();
    });
  });
}

checkTargets();
