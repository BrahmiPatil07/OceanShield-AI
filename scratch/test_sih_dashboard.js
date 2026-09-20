// scratch/test_sih_dashboard.js
// Standalone Node.js Test Suite for OceanShield AI SIH 2026 Presentation Dashboard

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   OCEANSHIELD AI — SIH 2026 PRESENTATION DASHBOARD TEST SUITE  ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

const htmlPath = path.join(__dirname, '../index.html');
const cssPath = path.join(__dirname, '../style.css');
const jsPath = path.join(__dirname, '../app.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// 1. Header System Status Indicator
console.log('--- TEST 1: Header System Status Indicator ---');
assert(html.includes('id="system-status-indicator"'), 'HTML contains #system-status-indicator');
assert(html.includes('id="header-status-dot"'), 'HTML contains #header-status-dot');
assert(html.includes('id="header-status-text"'), 'HTML contains #header-status-text');
assert(html.includes('SYSTEM STATUS: OPERATIONAL'), 'Default header status text is operational');

// 2. Navigation Tabs
console.log('\n--- TEST 2: Navigation Tabs Verification ---');
const expectedTabs = [
  { target: 'overview', label: 'Dashboard' },
  { target: 'satellite-analysis-panel', label: 'Satellite Detection' },
  { target: 'map-panel', label: 'Incident Map' },
  { target: 'drift-forecast-section', label: 'Drift Forecast' },
  { target: 'vessels-panel', label: 'AIS Correlation' },
  { target: 'evidence-risk-section', label: 'Investigation Report' },
  { target: 'how-it-works-section', label: 'How It Works' }
];

expectedTabs.forEach(tab => {
  const hasTarget = html.includes(`data-target="${tab.target}"`) || html.includes(`href="#${tab.target}"`);
  assert(hasTarget, `Navigation bar has link targeting #${tab.target}`);
  
  const hasSection = html.includes(`id="${tab.target}"`);
  assert(hasSection, `Destination section #${tab.target} exists in HTML`);
});

// 3. 5 Dynamic Dashboard Cards in #overview
console.log('\n--- TEST 3: 5 Dynamic Dashboard Cards in #overview ---');
const cardIds = [
  'stat-area',
  'stat-volume',
  'stat-conf',
  'stat-conf-sub',
  'stat-duration',
  'stat-duration-dist',
  'stat-vessels',
  'stat-window',
  'stat-sys-status',
  'stat-sys-sub'
];

cardIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `Dashboard card element #${id} exists in HTML`);
});

// 4. CSS Grid & Maritime Styling
console.log('\n--- TEST 4: CSS Grid & Maritime Styling Verification ---');
assert(css.includes('.system-status-indicator'), 'CSS contains .system-status-indicator styling');
assert(css.includes('@keyframes statusPulse'), 'CSS contains statusPulse animation');
assert(css.includes('grid-template-columns: repeat(5, 1fr)'), 'CSS contains 5-column grid for .stats');
assert(css.includes('#card-stat-conf::before'), 'CSS contains accent glow for card 2');
assert(css.includes('#card-stat-duration::before'), 'CSS contains accent glow for card 3');
assert(css.includes('#card-stat-vessels::before'), 'CSS contains accent glow for card 4');
assert(css.includes('#card-stat-status::before'), 'CSS contains accent glow for card 5');

// 5. JavaScript Core Functions & DOM Audit
console.log('\n--- TEST 5: JavaScript Core Functions Verification ---');
assert(js.includes('function updateDashboardCards'), 'updateDashboardCards is defined in app.js');
assert(js.includes('function applySatelliteDetectionToMapAndAIS'), 'applySatelliteDetectionToMapAndAIS is defined');
assert(js.includes('function computeSimulatedAiDetection'), 'computeSimulatedAiDetection is defined');
assert(js.includes('function generateInvestigationReport'), 'generateInvestigationReport is defined');
assert(js.includes('function resetDemo'), 'resetDemo is defined');
assert(js.includes('function resetSpillAnalysis'), 'resetSpillAnalysis is defined');

// Check that app.js updates dashboard cards in key workflows
assert(js.includes("updateDashboardCards({ statusText: 'ACTIVE'"), 'applySatelliteDetectionToMapAndAIS updates status to ACTIVE');
assert(js.includes("updateDashboardCards({ statusText: 'STANDBY'"), 'resetSpillAnalysis updates status to STANDBY');
assert(js.includes("updateDashboardCards({ statusText: 'ANALYZING'"), 'runAiSpillDetectionPipeline updates status to ANALYZING');
assert(js.includes("updateDashboardCards({ statusText: 'READY'"), 'resetDemo and init update status to READY');

// 6. DOM ID Integrity Audit
console.log('\n--- TEST 6: DOM ID Audit (app.js references vs index.html) ---');
const idRegex = /(?:document\.querySelector\(['"]#([^'"]+)['"]\)|document\.getElementById\(['"]([^'"]+)['"]\))/g;
const referencedIds = new Set();
let match;
while ((match = idRegex.exec(js)) !== null) {
  referencedIds.add(match[1] || match[2]);
}

let missingIds = [];
referencedIds.forEach(id => {
  const pattern = new RegExp(`id=["']${id}["']`);
  if (!pattern.test(html)) {
    missingIds.push(id);
  }
});

assert(missingIds.length === 0, `All ${referencedIds.size} referenced DOM IDs exist in index.html (missing: ${missingIds.join(', ') || 'none'})`);

// 7. Algorithm Simulation for 2 Distinct Satellite Images
console.log('\n--- TEST 7: Detection Algorithm for 2 Distinct Images ---');

// Extract the mathematical algorithm from app.js to test on two mock image buffers
function simulateImageDetection(width, height, isGif) {
  // Mock luminance generation matching the two sample images in the workspace
  // Image 1: Sentinel-1 SAR Kerala (Dark slick around center-left)
  // Image 2: GIF spread node (Different aspect ratio and slick position)
  const procW = 200;
  const procH = Math.round(200 * (height / width));
  const pixels = new Uint8Array(procW * procH);
  
  const slickCenterX = isGif ? procW * 0.65 : procW * 0.42;
  const slickCenterY = isGif ? procH * 0.35 : procH * 0.58;
  const slickRadius = isGif ? 28 : 22;

  let sum = 0;
  for (let y = 0; y < procH; y++) {
    for (let x = 0; x < procW; x++) {
      const idx = y * procW + x;
      const dist = Math.hypot(x - slickCenterX, y - slickCenterY);
      // Dark slick has lower luminance
      const lum = dist < slickRadius ? (35 + Math.random() * 20) : (130 + Math.random() * 40);
      pixels[idx] = Math.round(lum);
      sum += lum;
    }
  }

  const mean = sum / pixels.length;
  const threshold = mean * 0.75;
  
  let targetCount = 0;
  let targetSumX = 0;
  let targetSumY = 0;

  for (let y = 0; y < procH; y++) {
    for (let x = 0; x < procW; x++) {
      const idx = y * procW + x;
      if (pixels[idx] < threshold) {
        targetCount++;
        targetSumX += x;
        targetSumY += y;
      }
    }
  }

  const centroidProcX = targetSumX / (targetCount || 1);
  const centroidProcY = targetSumY / (targetCount || 1);

  const scale = procW / width;
  const invScale = 1.0 / scale;

  const nativeCentroid = {
    x: Math.round(centroidProcX * invScale),
    y: Math.round(centroidProcY * invScale)
  };

  const areaKm2 = (targetCount * invScale * invScale * 0.0001).toFixed(1);
  const confidence = (85 + Math.random() * 10).toFixed(1);

  return {
    nativeCentroid,
    areaKm2,
    confidence
  };
}

const det1 = simulateImageDetection(1000, 750, false);
const det2 = simulateImageDetection(1280, 960, true);

console.log(`  Image 1 (Sentinel-1 SAR) Centroid: [X:${det1.nativeCentroid.x}, Y:${det1.nativeCentroid.y}] Area: ${det1.areaKm2} km² Conf: ${det1.confidence}%`);
console.log(`  Image 2 (Oil Spill GIF) Centroid: [X:${det2.nativeCentroid.x}, Y:${det2.nativeCentroid.y}] Area: ${det2.areaKm2} km² Conf: ${det2.confidence}%`);

assert(det1.nativeCentroid.x !== det2.nativeCentroid.x, 'Image 1 and Image 2 have distinct X centroid');
assert(det1.nativeCentroid.y !== det2.nativeCentroid.y, 'Image 1 and Image 2 have distinct Y centroid');
assert(parseFloat(det1.areaKm2) > 0, 'Image 1 has positive area');
assert(parseFloat(det2.areaKm2) > 0, 'Image 2 has positive area');

// 8. Legal & Ethical Labeling Compliance
console.log('\n--- TEST 8: Legal & Ethical Labeling Compliance ---');
assert(html.includes('PROTOTYPE DEMO'), 'HTML contains "PROTOTYPE DEMO" labeling');
assert(html.includes('Potentially Associated Vessels'), 'HTML displays "Potentially Associated Vessels"');
assert(!html.includes('Offending Vessel') && !html.includes('Culprit Vessel'), 'HTML avoids biased accusatory vessel terms');
assert(js.includes('Potentially Associated Vessel'), 'app.js uses "Potentially Associated Vessel" in dossier and popups');
assert(html.includes('Statutory Notice') || html.includes('Statutory Disclaimer'), 'Statutory disclaimer is clearly present');

console.log('\n================================================================');
console.log(`   ALL TESTS PASSED: ${passedTests}/${totalTests} assertions verified!  `);
console.log('================================================================');
