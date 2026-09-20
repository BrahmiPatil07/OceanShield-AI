// Verification of Dynamic Investigation Evidence Report for OceanShield AI
const fs = require('fs');
const path = require('path');

console.log('--- OceanShield AI Investigation Report Verification ---');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

const tests = [
  // 1. Report Modal & Buttons
  { name: 'Report modal overlay container (#report-modal)', pass: html.includes('id="report-modal"') },
  { name: 'Header Generate Investigation Report button (#btn-generate-report)', pass: html.includes('id="btn-generate-report"') },
  { name: 'Evidence Section Generate Report button (#btn-generate-report-evidence)', pass: html.includes('id="btn-generate-report-evidence"') },
  { name: 'Modal Refresh / Generate Report button (#btn-refresh-report)', pass: html.includes('id="btn-refresh-report"') },
  { name: 'Modal Print Report button (#btn-print-report)', pass: html.includes('id="btn-print-report"') },
  { name: 'Modal Download Report as PDF button (#btn-download-report)', pass: html.includes('id="btn-download-report"') },
  { name: 'Modal Close button (#btn-close-report)', pass: html.includes('id="btn-close-report"') },

  // 2. Sections A through F in generateInvestigationReport
  { name: 'Section A: INCIDENT SUMMARY (Incident ID, date/time, status, area, confidence)', 
    pass: js.includes('SECTION A') && js.includes('Incident Summary') && js.includes('Spill Detection Status') && js.includes('reportId') },

  { name: 'Section B: SATELLITE ANALYSIS (SAR raster, segmentation overlay, centroid, area)', 
    pass: js.includes('SECTION B') && js.includes('Satellite SAR Analysis') && js.includes('sarSnapshotHtml') && js.includes('centroidDetail') },

  { name: 'Section C: DRIFT FORECAST (Starting loc, duration, wind, current, distance, drift diagram)', 
    pass: js.includes('SECTION C') && js.includes('Hydrodynamic Drift Forecast') && js.includes('Starting Location') && js.includes('driftSvgHtml') },

  { name: 'Section D: AIS CORRELATION (Vessel, Distance, Time diff, Route alignment, Score, Status)', 
    pass: js.includes('SECTION D') && js.includes('Distance from Estimated Source') && js.includes('Route Alignment') && js.includes('Potentially Associated Vessel') },

  { name: 'Section E: EVIDENCE TIMELINE (6-stage chronological workflow)', 
    pass: js.includes('SECTION E') && js.includes('Evidence Timeline') && 
          js.includes('Satellite Observation') && js.includes('Spill Detection') && 
          js.includes('Origin Estimation') && js.includes('Drift Forecast') && 
          js.includes('AIS Correlation') && js.includes('Human Review') },

  { name: 'Section F: INVESTIGATION CONCLUSION (Dynamic factual summary & recommendation)', 
    pass: js.includes('SECTION F') && js.includes('Investigation Conclusion') && js.includes('conclusionParagraph') },

  // 3. Wording & Disclaimers
  { name: 'Strictly "Potentially Associated Vessel" labeling', 
    pass: js.includes('Potentially Associated Vessel') && !js.includes('caused the spill') },

  { name: 'Mandatory statutory disclaimer', 
    pass: js.includes('This prototype provides decision-support analysis and does not establish legal responsibility for an oil spill.') },

  { name: 'Clearly labeled PROTOTYPE / SIMULATED DATA', 
    pass: js.includes('PROTOTYPE / SIMULATED DATA') },

  { name: 'Graceful "Not Available" fallback handling', 
    pass: js.includes('Not Available') },

  // 4. Stylesheet & Print Styles
  { name: 'CSS styles for .btn-print-report & .btn-refresh-report', 
    pass: css.includes('.btn-print-report') && css.includes('.btn-refresh-report') },

  { name: 'CSS styles for .report-section-pill & .report-sar-grid', 
    pass: css.includes('.report-section-pill') && css.includes('.report-sar-grid') },

  { name: 'CSS styles for .report-drift-svg-box & .report-timeline-stepper', 
    pass: css.includes('.report-drift-svg-box') && css.includes('.report-timeline-stepper') },

  { name: 'CSS styles for .report-conclusion-box', 
    pass: css.includes('.report-conclusion-box') },

  { name: 'Print stylesheet (@media print) with report formatting', 
    pass: css.includes('@media print') && css.includes('.report-modal-dialog') && css.includes('.report-timeline-step') }
];

let allPassed = true;
tests.forEach((t, i) => {
  if (t.pass) {
    console.log(`[PASS] (${i + 1}/${tests.length}) ${t.name}`);
  } else {
    console.error(`[FAIL] (${i + 1}/${tests.length}) ${t.name}`);
    allPassed = false;
  }
});

console.log('---------------------------------------------------------');
if (allPassed) {
  console.log(`SUCCESS: All ${tests.length} Investigation Evidence Report tests PASSED!`);
  process.exit(0);
} else {
  console.error('FAILURE: Some tests failed.');
  process.exit(1);
}
