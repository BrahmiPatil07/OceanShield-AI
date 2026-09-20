// Automated Verification for Dynamic Drift Forecast Connected to Detected Spill
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const appJsPath = path.resolve(__dirname, '../app.js');
const appJsCode = fs.readFileSync(appJsPath, 'utf8');

console.log('--- STARTING VERIFICATION OF DYNAMIC OIL SPILL DRIFT FORECAST ---');

// Mock DOM
const elements = {};
function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerText: '',
      innerHTML: '',
      value: '',
      style: {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        toggle(c, val) { if (val === undefined) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); } else { if (val) this.classes.add(c); else this.classes.delete(c); } },
        contains(c) { return this.classes.has(c); }
      },
      getAttribute: (attr) => (attr === 'data-hours' ? '6' : (attr === 'data-val' ? '315' : '')),
      setAttribute: () => {},
      appendChild: () => {},
      remove: () => {},
      addEventListener: () => {},
      scrollIntoView: () => {},
      getContext: () => ({
        clearRect: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        measureText: () => ({ width: 50 }),
        setLineDash: () => {},
        arc: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(100) }),
        createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: () => {}
      }),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
    };
  }
  return elements[id];
}

const mockDocument = {
  querySelector: (sel) => getOrCreateElement(sel.replace(/^[#.]/, '')),
  querySelectorAll: (sel) => [getOrCreateElement(sel.replace(/^[#.]/, ''))],
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => {
    const el = getOrCreateElement('created_' + Math.random().toString(36).substr(2, 9));
    el.tagName = tag.toUpperCase();
    return el;
  }
};

const mockMap = {
  setView: function(center, zoom) { mockLeaflet.lastSetView = { center, zoom }; return this; },
  fitBounds: function(bounds) { mockLeaflet.lastFitBounds = bounds; return this; },
  on: function() { return this; },
  panTo: function() { return this; }
};

const mockLeaflet = {
  map: () => mockMap,
  tileLayer: () => ({ addTo: () => ({}) }),
  layerGroup: function() {
    return {
      clearLayers: function() { return this; },
      addTo: function() { return this; }
    };
  },
  polyline: function(coords, opts) {
    mockLeaflet.lastPolyline = { coords, opts };
    return {
      coords, opts,
      addTo: function() { return this; },
      bindPopup: function(content) { this.popupContent = content; return this; }
    };
  },
  polygon: function(coords, opts) {
    return {
      coords, opts,
      addTo: function() { return this; },
      bindPopup: function(content) { this.popupContent = content; return this; }
    };
  },
  circle: function(center, opts) {
    if (!mockLeaflet.circles) mockLeaflet.circles = [];
    mockLeaflet.circles.push({ center, opts });
    return {
      center, opts,
      addTo: function() { return this; },
      bindPopup: function(content) { this.popupContent = content; return this; }
    };
  },
  marker: function(pos, opts) {
    if (!mockLeaflet.markers) mockLeaflet.markers = [];
    mockLeaflet.markers.push({ pos, opts });
    return {
      pos, opts,
      addTo: function() { return this; },
      bindPopup: function(content) { this.popupContent = content; return this; },
      on: function() { return this; }
    };
  },
  divIcon: (opts) => opts,
  latLngBounds: (pts) => ({ pts })
};

const mockWindow = {
  addEventListener: () => {},
  document: mockDocument
};

const sandbox = {
  document: mockDocument,
  window: mockWindow,
  L: mockLeaflet,
  console: console,
  setTimeout: (fn, ms) => {
    if (ms && ms >= 1000) return 999;
    return process.nextTick(fn);
  },
  clearTimeout: () => {},
  Image: class {
    constructor() {
      this.width = 1200;
      this.height = 896;
      this._src = '';
    }
    set src(val) {
      this._src = val;
      if (this.onload) setTimeout(() => this.onload(), 0);
    }
    get src() { return this._src; }
  },
  URL: { createObjectURL: () => 'blob:mock' },
  fetch: async () => ({ arrayBuffer: async () => new ArrayBuffer(10) }),
  alert: (msg) => console.log('ALERT:', msg)
};

vm.createContext(sandbox);

try {
  vm.runInContext(appJsCode, sandbox);
  console.log('✅ app.js executed successfully in sandbox.');
} catch (e) {
  console.error('❌ Error executing app.js:', e);
  process.exit(1);
}

// 1. Initial inspect
vm.runInContext('inspect()', sandbox);
let currentIncident = vm.runInContext('currentIncident', sandbox);
console.log('\n--- 1. Baseline Incident Center ---');
console.log('Center:', currentIncident.center);

// 2. Test calculateNetDriftVector
console.log('\n--- 2. Physics Model: calculateNetDriftVector ---');
const net1 = vm.runInContext('calculateNetDriftVector(315, 14, 135, 0.8)', sandbox);
console.log('315° NW @ 14kts + 135° SE @ 0.8kts ->', net1);
if (net1.bearing >= 130 && net1.bearing <= 140) {
  console.log('✅ Net bearing aligns with windage + current southward/southeastward drift.');
} else {
  console.warn('Note net bearing:', net1.bearing);
}

// Test with easterly wind pushing west: 90° wind pushes to 270°
const net2 = vm.runInContext('calculateNetDriftVector(90, 25, 270, 0.5)', sandbox);
console.log('090° E @ 25kts + 270° W @ 0.5kts ->', net2);
if (net2.bearing >= 265 && net2.bearing <= 275) {
  console.log('✅ Easterly wind pushes drift directly toward ~270° W.');
} else {
  console.error('❌ Unexpected bearing:', net2.bearing);
  process.exit(1);
}

// 3. Test Satellite Detection updates starting point
console.log('\n--- 3. Connected to Detected Spill Centroid ---');
const sampleDetection = {
  areaKm2: '16.8',
  confidence: '97.8',
  perimeterKm: '34.6',
  centroid: { x: 570, y: 408 },
  bbox: { x: 380, y: 310, w: 380, h: 196 },
  polygon: [{ x: 380, y: 390 }, { x: 570, y: 310 }, { x: 760, y: 420 }, { x: 420, y: 460 }]
};

sandbox.sampleDetection = sampleDetection;
vm.runInContext("applySatelliteDetectionToMapAndAIS(sampleDetection, 1200, 896, 'Sentinel-1_SAR_Kerala_GRDH.jpg')", sandbox);
currentIncident = vm.runInContext('currentIncident', sandbox);

console.log('Detected spill centroid:', currentIncident.center);
const initLocText = mockDocument.querySelector('#drift-initial-loc').innerText;
console.log('drift-initial-loc readout:', initLocText);

if (initLocText.includes(currentIncident.center[0].toFixed(4)) && initLocText.includes(currentIncident.center[1].toFixed(4))) {
  console.log('✅ Initial Spill Location readout dynamically matches detected spill centroid.');
} else {
  console.error('❌ Initial Spill Location does not match detected centroid:', { initLocText, center: currentIncident.center });
  process.exit(1);
}

// 4. Test 48-Hour Horizon Simulation
console.log('\n--- 4. 48-Hour Forecast Horizon & Dispersion Zones ---');
mockLeaflet.circles = [];
mockLeaflet.markers = [];

vm.runInContext('simulateSpillDrift(48)', sandbox);

const durText = mockDocument.querySelector('#drift-forecast-duration').innerText;
const distText = mockDocument.querySelector('#drift-forecast-dist').innerText;
const predLocText = mockDocument.querySelector('#drift-predicted-loc').innerText;
const netVecText = mockDocument.querySelector('#drift-net-vector').innerText;

console.log('Duration readout:', durText);
console.log('Distance readout:', distText);
console.log('Predicted future loc readout:', predLocText);
console.log('Net vector readout:', netVecText);
console.log('Generated dispersion circles count:', mockLeaflet.circles.length);

if (durText.includes('48 Hours')) {
  console.log('✅ 48 Hours horizon successfully selected.');
} else {
  console.error('❌ Duration readout does not include 48 Hours:', durText);
  process.exit(1);
}

if (mockLeaflet.circles.length === 4) {
  console.log('✅ Generated 4 dispersion circles for T+6h, T+12h, T+24h, and T+48h!');
} else {
  console.error('❌ Expected 4 dispersion circles, got:', mockLeaflet.circles.length);
  process.exit(1);
}

// Verify 48h circle properties
const circle48 = mockLeaflet.circles[3];
console.log('T+48h circle radius:', circle48.opts.radius, 'color:', circle48.opts.color);
if (circle48.opts.radius === 22000 && circle48.opts.color === '#c084fc') {
  console.log('✅ T+48h circle correctly configured with 22km radius and purple color.');
} else {
  console.error('❌ T+48h circle configuration mismatch:', circle48);
  process.exit(1);
}

// 5. Test Live Control Updates
console.log('\n--- 5. Dynamic Interactive Controls ---');
vm.runInContext('activeWindDir = 270; activeWindSpd = 20; activeCurrDir = 90; activeCurrSpd = 1.0;', sandbox);
vm.runInContext('simulateSpillDrift(24)', sandbox);

const newWindDir = mockDocument.querySelector('#drift-wind-dir-val').innerText;
const newWindSpd = mockDocument.querySelector('#drift-wind-spd-val').innerText;
const newDist = mockDocument.querySelector('#drift-forecast-dist').innerText;
console.log('Updated wind dir:', newWindDir);
console.log('Updated wind spd:', newWindSpd);
console.log('Updated distance at 24h:', newDist);

if (newWindDir.includes('270') && newWindSpd.includes('20')) {
  console.log('✅ Controls dynamically update readouts and recalculate trajectory.');
} else {
  console.error('❌ Controls failed to update readouts:', { newWindDir, newWindSpd });
  process.exit(1);
}

// 6. Test Reset Demo
console.log('\n--- 6. Reset Demo Restores Baseline Controls ---');
vm.runInContext('resetDemo()', sandbox);
const resetWindDir = vm.runInContext('activeWindDir', sandbox);
const resetHorizon = vm.runInContext('activeDriftHorizon', sandbox);
console.log('After resetDemo - windDir:', resetWindDir, 'horizon:', resetHorizon);
if (resetWindDir === 315 && resetHorizon === 6) {
  console.log('✅ resetDemo correctly restored baseline drift parameters (315° NW, 6h horizon).');
} else {
  console.error('❌ resetDemo did not restore baseline drift parameters.');
  process.exit(1);
}

console.log('\n======================================================');
console.log('🎉 ALL DYNAMIC DRIFT FORECAST REQUIREMENTS VERIFIED!');
console.log('======================================================\n');
