const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const ids = [
  'layer-slick', 'layer-vessels', 'layer-tracks', 'layer-drift', 'layer-uploaded',
  'inspect', 'run', 'incident',
  'btn-upload-ais', 'ais-file-input', 'btn-sample-csv', 'tab-simulated', 'tab-uploaded',
  'sat-zoom-in', 'sat-zoom-out', 'sat-zoom-reset', 'sat-toggle-mask', 'btn-upload-satellite', 'satellite-file-input'
];
ids.forEach(id => {
  console.log(id + ': ' + (html.includes(`id="${id}"`) ? 'EXISTS' : 'MISSING!'));
});
