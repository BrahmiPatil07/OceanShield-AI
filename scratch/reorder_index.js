const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Section markers:
const markerOverview = '<!-- Key Telemetry & Intelligence Cards';
const markerMap = '<!-- Main Section: Map & Investigation Console -->';
const markerEvidence = '<!-- Evidence & Risk Analysis Dashboard Section -->';
const markerDrift = '<!-- Oil Spill Drift Forecast Section -->';
const markerSat = '<!-- Satellite SAR Analysis & AI Segmentation Console -->';
const markerVessels = '<!-- Potentially Associated Vessels Panel -->';
const markerHow = '<!-- How It Works Section -->';
const markerFooter = '<!-- Footer -->';

const idxOverview = html.indexOf(markerOverview);
const idxMap = html.indexOf(markerMap);
const idxEvidence = html.indexOf(markerEvidence);
const idxDrift = html.indexOf(markerDrift);
const idxSat = html.indexOf(markerSat);
const idxVessels = html.indexOf(markerVessels);
const idxHow = html.indexOf(markerHow);
const idxFooter = html.indexOf(markerFooter);

console.log({ idxOverview, idxMap, idxEvidence, idxDrift, idxSat, idxVessels, idxHow, idxFooter });

if (idxOverview === -1 || idxMap === -1 || idxEvidence === -1 || idxDrift === -1 || idxSat === -1 || idxVessels === -1 || idxHow === -1 || idxFooter === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const partPre = html.slice(0, idxMap); // Header, Nav, Disclaimer, Stepper, Overview
const partMap = html.slice(idxMap, idxEvidence); // Map Section
const partEvidence = html.slice(idxEvidence, idxDrift); // Evidence & Risk Section
const partDrift = html.slice(idxDrift, idxSat); // Drift Forecast Section
const partSat = html.slice(idxSat, idxVessels); // Satellite Analysis Section
let partVessels = html.slice(idxVessels, idxHow); // Vessels Panel
const partHow = html.slice(idxHow, idxFooter); // How It Works
const partPost = html.slice(idxFooter); // Footer & Modals

// In partVessels, inject Upload AIS Data and Sample CSV buttons if not already present
if (!partVessels.includes('id="btn-upload-ais"')) {
  const targetHeader = '<div class="panel-header">\n        <h2>';
  const targetHeaderAlt = '<div class="panel-header">\r\n        <h2>';
  const newHeader = `<div class="panel-header">
        <div>
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
              <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"></path>
              <line x1="12" y1="10" x2="12" y2="3"></line>
            </svg>
            Potentially Associated Vessels (AIS Spatio-Temporal Intersect)
          </h2>
          <span class="panel-subtitle">CANDIDATE SCREENING SHORTLIST</span>
        </div>
        <div class="vessels-panel-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="btn-upload-ais" id="btn-upload-ais" title="Upload custom AIS CSV dataset">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload AIS Data
          </button>
          <input type="file" id="ais-file-input" accept=".csv" style="display: none;">
          <button type="button" class="btn-sample-csv" id="btn-sample-csv" title="Download realistic sample AIS CSV file">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Sample CSV
          </button>
        </div>
      </div>`;

  const oldHeaderEnd = partVessels.indexOf('</div>\n\n      <!-- Upload Ingestion Status Banner -->');
  const oldHeaderEndAlt = partVessels.indexOf('</div>\r\n\r\n      <!-- Upload Ingestion Status Banner -->');
  const endPos = oldHeaderEnd !== -1 ? oldHeaderEnd : oldHeaderEndAlt;

  if (endPos !== -1) {
    const headerStart = partVessels.indexOf('<div class="panel-header">');
    partVessels = partVessels.slice(0, headerStart) + newHeader + partVessels.slice(endPos + 6);
  }
}

// Assemble in 1 -> 2 -> 3 -> 4 -> 5 -> 6 order:
// 1 & 2: Satellite Analysis (partSat)
// 3: Incident Map (partMap)
// 4: Drift Forecast (partDrift)
// 5: Vessels (partVessels)
// 6: Evidence & SITREP Report (partEvidence)
const newHtml = partPre + partSat + partMap + partDrift + partVessels + partEvidence + partHow + partPost;

fs.writeFileSync(indexPath, newHtml, 'utf8');
console.log('Successfully reordered index.html to 1 -> 2 -> 3 -> 4 -> 5 -> 6 pipeline order!');
