// Final Comprehensive System Integration Test — OceanShield AI
// Tests the full 7-step workflow with 2 distinct satellite images:
// 1. Upload SAR image
// 2. Detect oil-slick-like region
// 3. Display dynamic segmentation overlay
// 4. Update spill location and map
// 5. Generate drift forecast
// 6. Perform AIS correlation
// 7. Generate investigation report
// And verifies state clearing, non-hardcoded results, and data safety compliance.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('   OCEANSHIELD AI — TWO-IMAGE FULL INTEGRATION TEST SUITE      ');
console.log('================================================================\n');

// 1. Setup DOM and Leaflet Mock Environment
const elements = {};
function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerText: '',
      innerHTML: '',
      value: '',
      checked: false,
      style: {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        toggle(c, val) { 
          if (val === undefined) { 
            if (this.classes.has(c)) this.classes.delete(c); 
            else this.classes.add(c); 
          } else { 
            if (val) this.classes.add(c); 
            else this.classes.delete(c); 
          } 
        },
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
        measureText: (text) => ({ width: text.length * 6 }),
        setLineDash: () => {},
        arc: () => {},
        getImageData: (x, y, w, h) => {
          // Generate realistic mock SAR pixel luminance data
          const data = new Uint8ClampedArray(w * h * 4);
          const isSecondImage = elements['sat-img-filename']?.innerText?.includes('401131');
          
          // Image 1 has dark slick near center-left, Image 2 near top-right
          const slickCenterX = isSecondImage ? Math.round(w * 0.68) : Math.round(w * 0.35);
          const slickCenterY = isSecondImage ? Math.round(h * 0.32) : Math.round(h * 0.55);
          const slickRadius = isSecondImage ? Math.round(w * 0.22) : Math.round(w * 0.14);

          for (let py = 0; py < h; py++) {
            for (let px = 0; px < w; px++) {
              const idx = (py * w + px) * 4;
              const dist = Math.hypot(px - slickCenterX, py - slickCenterY);
              // Dark slick has low luminance (e.g. 35), background sea has high (e.g. 140)
              const lum = dist < slickRadius ? 35 : (130 + Math.sin(px * 0.1) * 15);
              data[idx] = lum;
              data[idx + 1] = lum;
              data[idx + 2] = lum;
              data[idx + 3] = 255;
            }
          }
          return { data };
        },
        createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: () => {}
      }),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };
  }
  return elements[id];
}

const mockDocument = {
  querySelector: (sel) => {
    const id = sel.replace(/^[#.]/, '');
    return getOrCreateElement(id);
  },
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
  panTo: function(pos) { mockLeaflet.lastPanTo = pos; return this; },
  addLayer: function() { return this; },
  removeLayer: function() { return this; }
};

const mockLeaflet = {
  layersCleared: [],
  map: () => mockMap,
  tileLayer: () => ({ addTo: () => ({}) }),
  layerGroup: function(name) {
    return {
      name,
      clearLayers: function() { 
        mockLeaflet.layersCleared.push(this);
        return this; 
      },
      addTo: function() { return this; }
    };
  },
  polyline: function(coords, opts) {
    mockLeaflet.lastPolyline = { coords, opts };
    return {
      coords, opts,
      addTo: function() { return this; },
      bindPopup: function(content) { this.popupContent = content; return this; },
      setStyle: function() { return this; }
    };
  },
  polygon: function(coords, opts) {
    mockLeaflet.lastPolygon = { coords, opts };
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
    const m = {
      pos, opts,
      addTo: function() { return this; },
      bindPopup: function(content) { this.popupContent = content; return this; },
      on: function(ev, cb) { this[ev] = cb; return this; },
      getLatLng: () => ({ lat: pos[0], lng: pos[1] }),
      openPopup: () => {}
    };
    mockLeaflet.markers.push(m);
    return m;
  },
  divIcon: (opts) => opts,
  latLngBounds: (pts) => ({ pts })
};

const mockWindow = {
  addEventListener: () => {},
  document: mockDocument,
  print: () => {}
};

class MockImage {
  constructor() {
    this.width = 1200;
    this.height = 896;
    this._src = '';
  }
  set src(val) {
    this._src = val;
    if (val.includes('401131')) {
      this.width = 800;
      this.height = 600;
    } else {
      this.width = 1200;
      this.height = 896;
    }
    if (this.onload) setTimeout(() => this.onload(), 5);
  }
  get src() { return this._src; }
}

const sandbox = {
  document: mockDocument,
  window: mockWindow,
  L: mockLeaflet,
  console: console,
  Image: MockImage,
  setTimeout: (fn, ms) => {
    if (ms && ms >= 2000) return 999;
    return process.nextTick(fn);
  },
  clearTimeout: () => {},
  performance: { now: () => Date.now() },
  URL: { createObjectURL: () => 'blob:mock' }
};

const appJsCode = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');
vm.createContext(sandbox);
vm.runInContext(appJsCode, sandbox);

let passCount = 0;
let failCount = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// WORKFLOW TEST 1: INGEST IMAGE 1 & RUN DETECTION
// -------------------------------------------------------------
console.log('--- TEST 1: Ingest Image 1 (sample_sar_image.jpg) & Run Full Pipeline ---');

// Step 1: Upload / Load SAR image
const loadPromise1 = vm.runInContext("loadSatelliteImage('sample_sar_image.jpg', 'sample_sar_image.jpg')", sandbox);

loadPromise1.then(() => {
  // Check that image loaded cleanly and old results are cleared
  const satImage1 = vm.runInContext("satImage", sandbox);
  assert(satImage1 !== null, 'Step 1: Image 1 raster ingested into satImage');
  assert(vm.runInContext("simulatedAiResults", sandbox) === null, 'Step 1: Old detection masks & results cleared upon ingestion');
  assert(elements['sat-status-badge'].innerText === 'READY', 'Step 1: Status badge set to READY (awaiting detection)');

  // Step 2 & 3: Run AI detection -> display dynamic segmentation overlay
  const t1Promise = vm.runInContext("runAiSpillDetectionPipeline()", sandbox);

  return t1Promise.then(() => {
    const res1 = vm.runInContext("simulatedAiResults", sandbox);
    assert(res1 !== null, 'Step 2: AI slick detection computed results');
    assert(res1.centroid && res1.centroid.x > 0 && res1.centroid.y > 0, `Step 2: Centroid localized [X:${res1.centroid.x}, Y:${res1.centroid.y}]`);
    assert(parseFloat(res1.areaKm2) > 0, `Step 2: Estimated slick area computed: ${res1.areaKm2} km²`);
    assert(res1.polygon && res1.polygon.length >= 10, `Step 3: Dynamic segmentation overlay boundary polygon generated (${res1.polygon.length} vertices)`);
    assert(vm.runInContext("showAiMask", sandbox) === true, 'Step 3: AI segmentation mask visibility active');

    // Step 4: Update spill location and map
    const inc1 = vm.runInContext("currentIncident", sandbox);
    assert(inc1 !== null, 'Step 4: currentIncident updated with satellite detection');
    assert(mockLeaflet.lastSetView && mockLeaflet.lastSetView.center, `Step 4: Map centered on detected centroid [${mockLeaflet.lastSetView.center.join(', ')}]`);
    assert(mockLeaflet.lastPolygon !== null, 'Step 4: Orange multi-vertex radar slick polygon rendered on map');

    // Step 5: Generate drift forecast
    assert(elements['drift-initial-loc'].innerText.includes('°N'), `Step 5: Drift forecast initialized at detected centroid (${elements['drift-initial-loc'].innerText})`);
    assert(elements['drift-net-vector'].innerText.length > 0, `Step 5: Net drift vector calculated (${elements['drift-net-vector'].innerText})`);

    // Step 6: Perform AIS correlation
    assert(inc1.vessels && inc1.vessels.length > 0, `Step 6: AIS vessels correlated (${inc1.vessels.length} vessels)`);
    assert(inc1.vessels[0].distance.includes('km'), `Step 6: Closest Point of Approach (CPA) calculated: ${inc1.vessels[0].distance}`);
    assert(elements['rows'].innerHTML.includes('Potentially Associated Vessel'), 'Step 6: Table displays Potentially Associated Vessel labels');

    // Step 7: Generate investigation report
    vm.runInContext("generateInvestigationReport()", sandbox);
    const reportContent1 = elements['report-content'].innerHTML;
    assert(reportContent1.includes('SECTION A') && reportContent1.includes('SECTION B') && reportContent1.includes('SECTION F'), 'Step 7: 6-Section SITREP report generated');
    assert(reportContent1.includes(res1.areaKm2), `Step 7: Report contains latest detected area (${res1.areaKm2} km²)`);
    assert(reportContent1.includes('PROTOTYPE / SIMULATED DATA'), 'Step 7: Report clearly labels PROTOTYPE / SIMULATED DATA');
    assert(reportContent1.includes('Potentially Associated Vessel'), 'Step 7: Report uses Potentially Associated Vessel');

    // -------------------------------------------------------------
    // WORKFLOW TEST 2: INGEST IMAGE 2 & VERIFY DYNAMIC UPDATES
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Ingest Image 2 (401131-Oil_spill_spread_node_full_image_2.gif) & Verify State Reset ---');

    // Step 1: Upload second image
    const loadPromise2 = vm.runInContext("loadSatelliteImage('401131-Oil_spill_spread_node_full_image_2.gif', '401131-Oil_spill_spread_node_full_image_2.gif')", sandbox);

    return loadPromise2.then(() => {
      assert(vm.runInContext("simulatedAiResults", sandbox) === null, 'Step 1 (Img 2): Previous detection masks cleared upon new upload');
      assert(elements['sat-area-val'].innerText === '--', 'Step 1 (Img 2): Telemetry readouts reset to placeholder');

      // Step 2 & 3: Run AI detection on Image 2
      const t2Promise = vm.runInContext("runAiSpillDetectionPipeline()", sandbox);

      return t2Promise.then(() => {
    const res2 = vm.runInContext("simulatedAiResults", sandbox);
    assert(res2 !== null, 'Step 2 (Img 2): AI detection completed for Image 2');
    assert(res2.centroid.x !== res1.centroid.x || res2.centroid.y !== res1.centroid.y, 
      `Step 2 (Img 2): Centroid changed dynamically! Img 1: [${res1.centroid.x}, ${res1.centroid.y}] vs Img 2: [${res2.centroid.x}, ${res2.centroid.y}]`);
    assert(res2.areaKm2 !== res1.areaKm2, `Step 2 (Img 2): Detected area updated! Img 1: ${res1.areaKm2} km² vs Img 2: ${res2.areaKm2} km²`);

    // Step 4: Map updated to Image 2 centroid
    const inc2 = vm.runInContext("currentIncident", sandbox);
    assert(inc2.center[0] !== inc1.center[0] || inc2.center[1] !== inc1.center[1],
      `Step 4 (Img 2): Map center updated to new centroid! [${inc2.center.join(', ')}]`);

    // Step 5: Drift forecast updated
    assert(elements['drift-initial-loc'].innerText.includes(inc2.center[0].toFixed(4)), 
      `Step 5 (Img 2): Drift forecast starting point updated to Image 2 centroid`);

    // Step 6: AIS correlation updated
    assert(inc2.vessels[0].distance !== inc1.vessels[0].distance || inc2.vessels[0].score !== inc1.vessels[0].score,
      `Step 6 (Img 2): AIS correlation re-evaluated relative to Image 2 centroid!`);

    // Step 7: Report updated to Image 2
    vm.runInContext("generateInvestigationReport()", sandbox);
    const reportContent2 = elements['report-content'].innerHTML;
    assert(reportContent2.includes(res2.areaKm2), `Step 7 (Img 2): Report reflects Image 2 area (${res2.areaKm2} km²)`);
    assert(reportContent2.includes(inc2.center[0].toFixed(4)), `Step 7 (Img 2): Report reflects Image 2 geographic coordinates`);

    // -------------------------------------------------------------
    // DATA SAFETY & ETHICS AUDIT
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Data Safety & Ethics Audit ---');
    const fullHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    const fullJs = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');

    assert(!fullJs.includes('caused the spill') && !fullJs.includes('culprit vessel'), 'Compliance: Zero accusatory claims of culpability');
    assert(fullJs.includes('Potentially Associated Vessel'), 'Compliance: Uses "Potentially Associated Vessel" exclusively');
    assert(fullJs.includes('PROTOTYPE / SIMULATED DATA') || fullJs.includes('PROTOTYPE SIMULATION'), 'Compliance: Simulated data labeled as PROTOTYPE');
    assert(fullJs.includes('REQUIRES HUMAN VERIFICATION') || fullJs.includes('Human Review'), 'Compliance: Clear "REQUIRES HUMAN VERIFICATION" notice');
    assert(!fullJs.includes('AIzaSy') && !fullJs.includes('sk_live_'), 'Security: Zero API keys or secrets in codebase');

    console.log('\n================================================================');
    console.log(`TOTAL PASS: ${passCount} | TOTAL FAIL: ${failCount}`);
    if (failCount === 0) {
      console.log('>>> COMPLETE SYSTEM INTEGRATION REVIEW VERIFIED SUCCESSFULLY! <<<');
      console.log('================================================================');
        process.exit(0);
      } else {
        console.error('>>> INTEGRATION REVIEW ENCOUNTERED FAILURES! <<<');
        console.log('================================================================');
        process.exit(1);
      }
    });
  });
});
}).catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
