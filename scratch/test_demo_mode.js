// scratch/test_demo_mode.js
// Standalone Test Suite for OceanShield AI SIH 2026 Presentation Demo Mode

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   OCEANSHIELD AI — SIH 2026 PRESENTATION DEMO MODE TEST SUITE  ');
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

// 1. HTML Element Audit
console.log('--- TEST 1: Demo Mode HTML Elements ---');
assert(html.includes('id="btn-start-demo"'), 'HTML contains #btn-start-demo button');
assert(html.includes('id="demo-mode-toolbar"'), 'HTML contains #demo-mode-toolbar');
assert(html.includes('id="btn-demo-prev"'), 'HTML contains #btn-demo-prev button');
assert(html.includes('id="btn-demo-next"'), 'HTML contains #btn-demo-next button');
assert(html.includes('id="btn-exit-demo"'), 'HTML contains #btn-exit-demo button');
assert(html.includes('id="demo-step-counter"'), 'HTML contains #demo-step-counter');
assert(html.includes('id="demo-step-dots"'), 'HTML contains #demo-step-dots');
assert(html.includes('id="demo-explanation-card"'), 'HTML contains #demo-explanation-card');
assert(html.includes('id="demo-exp-badge"'), 'HTML contains #demo-exp-badge');
assert(html.includes('id="demo-exp-title"'), 'HTML contains #demo-exp-title');
assert(html.includes('id="demo-exp-desc"'), 'HTML contains #demo-exp-desc');
assert(html.includes('id="demo-exp-hv-badge"'), 'HTML contains #demo-exp-hv-badge');
assert(html.includes('id="demo-exp-action-container"'), 'HTML contains #demo-exp-action-container');
assert(html.includes('id="demo-floating-hud"'), 'HTML contains #demo-floating-hud');
assert(html.includes('id="btn-hud-prev"'), 'HTML contains #btn-hud-prev button');
assert(html.includes('id="btn-hud-next"'), 'HTML contains #btn-hud-next button');
assert(html.includes('id="btn-hud-exit"'), 'HTML contains #btn-hud-exit button');
assert(html.includes('id="hud-counter"'), 'HTML contains #hud-counter');
assert(html.includes('id="hud-step-title"'), 'HTML contains #hud-step-title');

// 2. CSS Styling Audit
console.log('\n--- TEST 2: Demo Mode CSS Styling ---');
assert(css.includes('.btn-demo-start'), 'CSS contains .btn-demo-start styling');
assert(css.includes('.demo-mode-toolbar'), 'CSS contains .demo-mode-toolbar styling');
assert(css.includes('.btn-demo-nav'), 'CSS contains .btn-demo-nav styling');
assert(css.includes('.demo-step-dots'), 'CSS contains .demo-step-dots styling');
assert(css.includes('.demo-dot.active'), 'CSS contains .demo-dot.active styling');
assert(css.includes('.demo-explanation-card'), 'CSS contains .demo-explanation-card styling');
assert(css.includes('.badge-hv-inline'), 'CSS contains .badge-hv-inline styling');
assert(css.includes('.btn-demo-action'), 'CSS contains .btn-demo-action styling');
assert(css.includes('.demo-floating-hud'), 'CSS contains .demo-floating-hud styling');
assert(css.includes('.demo-section-spotlight'), 'CSS contains .demo-section-spotlight styling');

// 3. JavaScript Logic & Step Definitions
console.log('\n--- TEST 3: JavaScript Demo Mode Logic ---');
assert(js.includes('function startDemoMode'), 'startDemoMode is defined in app.js');
assert(js.includes('function exitDemoMode'), 'exitDemoMode is defined in app.js');
assert(js.includes('function nextDemoStep'), 'nextDemoStep is defined in app.js');
assert(js.includes('function prevDemoStep'), 'prevDemoStep is defined in app.js');
assert(js.includes('function renderDemoStep'), 'renderDemoStep is defined in app.js');
assert(js.includes('const DEMO_STEPS ='), 'DEMO_STEPS array is defined');

// 4. Step Content & Workflow Coverage Audit
console.log('\n--- TEST 4: 6-Step Workflow Coverage ---');
assert(js.includes('Satellite Image Ingestion'), 'Step 1 covers Satellite Image Ingestion');
assert(js.includes('Oil-Slick-Like Region Detection'), 'Step 2 covers Oil-Slick-Like Region Detection');
assert(js.includes('Spill Location & Geospatial Map'), 'Step 3 covers Spill Location & Geospatial Map');
assert(js.includes('Hydrodynamic Drift Forecast'), 'Step 4 covers Hydrodynamic Drift Forecast');
assert(js.includes('AIS Vessel Correlation'), 'Step 5 covers AIS Vessel Correlation');
assert(js.includes('Investigation Report (SITREP)'), 'Step 6 covers Official Investigation SITREP Report');

// 5. Compliance & Ethics Audit
console.log('\n--- TEST 5: Legal & Ethical Labeling Compliance ---');
assert(html.includes('PROTOTYPE DEMO'), 'HTML includes PROTOTYPE DEMO label');
assert(html.includes('REQUIRES HUMAN VERIFICATION'), 'HTML includes REQUIRES HUMAN VERIFICATION label');
assert(!html.includes('Offending Vessel') && !html.includes('Culprit Vessel'), 'Zero accusatory vessel claims in HTML');
assert(js.includes('Potentially Associated Vessels'), 'app.js enforces Potentially Associated Vessels terminology');
assert(js.includes('requiresHv: true'), 'Step 5 specifically requires human verification');

// 6. Interactive Sandbox Simulation
console.log('\n--- TEST 6: Interactive Demo Flow Execution Simulation ---');

// Mock a lightweight DOM environment to execute the demo functions
const domStore = {};
function mockElement(id) {
  if (!domStore[id]) {
    domStore[id] = {
      id,
      innerText: '',
      innerHTML: '',
      style: {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); },
        toggle(c, force) {
          if (force !== undefined) {
            if (force) this.classes.add(c);
            else this.classes.delete(c);
          } else {
            if (this.classes.has(c)) this.classes.delete(c);
            else this.classes.add(c);
          }
        }
      },
      disabled: false,
      scrollIntoView: () => {},
      appendChild(child) { this.innerHTML += child.outerHTML || ''; },
      getAttribute(attr) { return this[attr] || null; }
    };
  }
  return domStore[id];
}

const mockDoc = {
  getElementById: (id) => mockElement(id),
  querySelector: (sel) => mockElement(sel.replace(/^[#.]/, '')),
  querySelectorAll: (sel) => [mockElement('item-1'), mockElement('item-2')],
  createElement: (tag) => ({
    tagName: tag,
    className: '',
    innerHTML: '',
    onclick: null,
    style: {}
  })
};

global.document = mockDoc;
global.window = {
  addEventListener: () => {},
  showToast: () => {}
};
global.updateWorkflowStepper = () => {};
global.showToast = () => {};
global.loadSatelliteImage = () => {};
global.runAiSpillDetectionPipeline = () => {};
global.generateInvestigationReport = () => {};
global.simulateSpillDrift = () => {};
global.satImage = null;
global.currentIncident = { center: [9.72, 76.08] };
global.map = null;

// Evaluate the demo module logic extracted from app.js
const demoModuleCode = `
${js.slice(js.indexOf('let isDemoModeActive = false;'), js.indexOf('function updateDashboardCards'))}
global.DEMO_STEPS = DEMO_STEPS;
global.startDemoMode = startDemoMode;
global.exitDemoMode = exitDemoMode;
global.nextDemoStep = nextDemoStep;
global.prevDemoStep = prevDemoStep;
global.renderDemoStep = renderDemoStep;
global.getDemoState = () => ({ isDemoModeActive, currentDemoStep });
`;

eval(demoModuleCode);

assert(typeof startDemoMode === 'function', 'startDemoMode is executable');
assert(typeof nextDemoStep === 'function', 'nextDemoStep is executable');
assert(typeof prevDemoStep === 'function', 'prevDemoStep is executable');
assert(typeof exitDemoMode === 'function', 'exitDemoMode is executable');
assert(DEMO_STEPS.length === 6, 'DEMO_STEPS contains exactly 6 steps');

// Run startDemoMode()
startDemoMode();
assert(getDemoState().isDemoModeActive === true, 'isDemoModeActive is true after startDemoMode()');
assert(getDemoState().currentDemoStep === 1, 'Initial demo step is 1');
assert(mockElement('btn-demo-prev').disabled === true, 'Previous button disabled on step 1');
assert(mockElement('demo-step-counter').innerText.includes('Step 1 of 6'), 'Counter shows Step 1 of 6');

// Run nextDemoStep() through all steps
nextDemoStep();
assert(getDemoState().currentDemoStep === 2, 'Advanced to step 2');
assert(mockElement('btn-demo-prev').disabled === false, 'Previous button enabled on step 2');

nextDemoStep();
assert(getDemoState().currentDemoStep === 3, 'Advanced to step 3');

nextDemoStep();
assert(getDemoState().currentDemoStep === 4, 'Advanced to step 4');

nextDemoStep();
assert(getDemoState().currentDemoStep === 5, 'Advanced to step 5');
assert(mockElement('demo-exp-hv-badge').style.display === 'inline-flex', 'Step 5 displays REQUIRES HUMAN VERIFICATION badge');

nextDemoStep();
assert(getDemoState().currentDemoStep === 6, 'Advanced to step 6');
assert(mockElement('btn-demo-next').innerHTML.includes('Restart Demo'), 'Next button shows Restart on step 6');

// Step backwards using prevDemoStep()
prevDemoStep();
assert(getDemoState().currentDemoStep === 5, 'Stepped back to step 5');

prevDemoStep();
assert(getDemoState().currentDemoStep === 4, 'Stepped back to step 4');

// Exit demo mode
exitDemoMode();
assert(getDemoState().isDemoModeActive === false, 'isDemoModeActive is false after exitDemoMode()');
assert(mockElement('demo-mode-toolbar').style.display === 'none', 'Toolbar hidden after exitDemoMode()');
assert(mockElement('demo-explanation-card').style.display === 'none', 'Explanation card hidden after exitDemoMode()');
assert(mockElement('demo-floating-hud').style.display === 'none', 'Floating HUD hidden after exitDemoMode()');

console.log('\n================================================================');
console.log(`   ALL TESTS PASSED: ${passedTests}/${totalTests} assertions verified!  `);
console.log('================================================================');
