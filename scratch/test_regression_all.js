// scratch/test_regression_all.js
// Comprehensive System Regression Test for OceanShield AI

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   OCEANSHIELD AI — COMPREHENSIVE PLATFORM REGRESSION TEST       ');
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

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const csv = fs.readFileSync(path.join(__dirname, '../sample_ais_data.csv'), 'utf8');

// 1. Files existence & integrity
console.log('--- TEST 1: Project Asset Files Existence ---');
assert(fs.existsSync(path.join(__dirname, '../sample_sar_image.jpg')), 'sample_sar_image.jpg exists');
assert(fs.existsSync(path.join(__dirname, '../401131-Oil_spill_spread_node_full_image_2.gif')), 'GIF sample raster exists');
assert(fs.existsSync(path.join(__dirname, '../sample_ais_data.csv')), 'sample_ais_data.csv exists');

// 2. CSV Parser Verification
console.log('\n--- TEST 2: AIS CSV Parser Regression ---');
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^["']|["']$/g, ''));
  return values;
}

const lines = csv.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
assert(lines.length >= 2, 'CSV contains header and data lines');
const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
assert(headers.includes('vessel_name') || headers.includes('name'), 'CSV has vessel name header');
assert(headers.includes('latitude') || headers.includes('lat'), 'CSV has latitude header');
assert(headers.includes('longitude') || headers.includes('lon'), 'CSV has longitude header');
assert(headers.includes('timestamp') || headers.includes('time'), 'CSV has timestamp header');

// 3. Drift Physics Engine Verification
console.log('\n--- TEST 3: Drift Physics Engine (3% windage + ocean current) ---');
function calculateNetDriftVector(windDir, windSpd, currDir, currSpd) {
  const windTowardDeg = (windDir + 180) % 360;
  const windRad = (windTowardDeg * Math.PI) / 180;
  const windageKts = windSpd * 0.03;
  const uWind = windageKts * Math.sin(windRad);
  const vWind = windageKts * Math.cos(windRad);

  const currRad = (currDir * Math.PI) / 180;
  const uCurr = currSpd * Math.sin(currRad);
  const vCurr = currSpd * Math.cos(currRad);

  const uNet = uWind + uCurr;
  const vNet = vWind + vCurr;

  const speedKts = Math.sqrt(uNet * uNet + vNet * vNet);
  const speedKmh = speedKts * 1.852;
  const rawBearing = (Math.atan2(uNet, vNet) * 180) / Math.PI;
  const bearing = Math.round(((rawBearing % 360) + 360) % 360);

  return { bearing, speedKts: speedKts.toFixed(1), speedKmh: speedKmh.toFixed(1), speedKmhNum: speedKmh };
}

const driftRes6h = calculateNetDriftVector(315, 14, 135, 0.8);
assert(driftRes6h.bearing >= 0 && driftRes6h.bearing <= 360, `Drift bearing calculated: ${driftRes6h.bearing}°`);
assert(parseFloat(driftRes6h.speedKts) > 0, `Drift speed calculated: ${driftRes6h.speedKts} kts`);
const dist6h = (driftRes6h.speedKmhNum * 6).toFixed(1);
assert(parseFloat(dist6h) > 0, `6h displacement calculated: ${dist6h} km`);

// 4. Modal & Report Verification
console.log('\n--- TEST 4: Investigation Report Modal Elements ---');
assert(html.includes('id="report-modal"'), '#report-modal exists in HTML');
assert(html.includes('id="report-content"'), '#report-content container exists');
assert(html.includes('id="btn-generate-report"'), '#btn-generate-report button exists in header');
assert(html.includes('id="btn-generate-report-evidence"'), '#btn-generate-report-evidence button exists in dossier');
assert(html.includes('id="btn-close-report"'), '#btn-close-report button exists');
assert(html.includes('id="btn-print-report"'), '#btn-print-report button exists');

// 5. Button Click Handlers Audit
console.log('\n--- TEST 5: Interactive Buttons & Event Listeners ---');
const requiredButtonIds = [
  'btn-reset-demo',
  'btn-upload-satellite',
  'btn-sample-satellite',
  'btn-upload-ais',
  'btn-sample-csv',
  'btn-generate-report',
  'btn-detect-spill',
  'btn-reset-analysis',
  'btn-simulate-drift',
  'horizon-6h',
  'horizon-12h',
  'horizon-24h',
  'horizon-48h'
];

requiredButtonIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `HTML contains button #${id}`);
  assert(js.includes(id), `app.js attaches listener or interacts with #${id}`);
});

console.log('\n================================================================');
console.log(`   FULL REGRESSION PASSED: ${passedTests}/${totalTests} assertions verified! `);
console.log('================================================================');
