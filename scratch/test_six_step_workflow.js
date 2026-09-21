const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   OCEANSHIELD AI — SIX-STEP WORKFLOW VERIFICATION SUITE       ');
console.log('================================================================');

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
}

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

// TEST 1: HTML Architecture of the 6-Step Workflow
console.log('\n--- TEST 1: HTML Structure of the 6-Step Workflow ---');
assert(html.includes('id="workflow-stepper"'), '#workflow-stepper container exists');
assert(html.includes('class="workflow-steps"'), '.workflow-steps container exists');

for (let i = 1; i <= 6; i++) {
  assert(html.includes(`id="wf-step-${i}"`), `Step card #wf-step-${i} exists`);
  assert(html.includes(`id="wf-status-${i}"`), `Status tag #wf-status-${i} exists`);
}

assert(html.includes('Satellite Image'), 'Step 1 title present');
assert(html.includes('Spill Detection'), 'Step 2 title present');
assert(html.includes('Location &amp; Map') || html.includes('Location & Map'), 'Step 3 title present');
assert(html.includes('Drift Forecast'), 'Step 4 title present');
assert(html.includes('AIS Correlation'), 'Step 5 title present');
assert(html.includes('Investigation Report'), 'Step 6 title present');

assert(html.includes('id="btn-demo-prev"'), '#btn-demo-prev exists');
assert(html.includes('id="btn-demo-next"'), '#btn-demo-next exists');
assert(html.includes('id="demo-step-counter"'), '#demo-step-counter exists');
assert(html.includes('id="demo-step-dots"'), '#demo-step-dots exists');
assert(html.includes('id="demo-explanation-card"'), '#demo-explanation-card exists');

// TEST 2: CSS Architecture & Styling
console.log('\n--- TEST 2: CSS Styling of the 6-Step Workflow ---');
assert(css.includes('.workflow-stepper-container'), 'CSS contains .workflow-stepper-container');
assert(css.includes('.workflow-steps'), 'CSS contains .workflow-steps');
assert(css.includes('grid-template-columns: repeat(6, 1fr)'), 'CSS contains 6-column grid for .workflow-steps');
assert(css.includes('.workflow-step.active'), 'CSS contains .workflow-step.active styling');
assert(css.includes('.workflow-step.completed'), 'CSS contains .workflow-step.completed styling');
assert(css.includes('.wf-step-number'), 'CSS contains .wf-step-number styling');
assert(css.includes('.wf-step-status-tag'), 'CSS contains .wf-step-status-tag styling');
assert(css.includes('.demo-mode-toolbar'), 'CSS contains .demo-mode-toolbar');
assert(css.includes('.btn-demo-nav'), 'CSS contains .btn-demo-nav');

// TEST 3: Top-Level Upload Controls
console.log('\n--- TEST 3: Top-Level Upload Controls ---');
assert(html.includes('id="btn-upload-satellite"'), '#btn-upload-satellite exists in header');
assert(html.includes('id="btn-sample-satellite"'), '#btn-sample-satellite exists in header');
assert(html.includes('id="satellite-file-input"'), '#satellite-file-input exists in header');

// TEST 4: Navigation Simulation (Step 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 5 -> 4)
console.log('\n--- TEST 4: Step-by-Step Navigation Simulation ---');

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
        contains(c) { return this.classes.has(c); }
      },
      disabled: false,
      scrollIntoView: () => {},
      appendChild(child) { this.innerHTML += child.outerHTML || ''; }
    };
  }
  return domStore[id];
}

global.document = {
  getElementById: (id) => mockElement(id),
  querySelector: (sel) => mockElement(sel.replace(/^[#.]/, '')),
  querySelectorAll: (sel) => [mockElement('item-1'), mockElement('item-2')],
  createElement: (tag) => ({ tagName: tag, innerHTML: '', onclick: null, style: {} })
};
global.window = { addEventListener: () => {}, showToast: () => {} };
global.showToast = () => {};
global.loadSatelliteImage = () => {};
global.runAiSpillDetectionPipeline = () => {};
global.generateInvestigationReport = () => {};
global.simulateSpillDrift = () => {};
global.setDriftHorizon = () => {};
global.inspect = () => {};
global.satImage = { width: 1200, height: 896 };
global.currentIncident = { center: [9.72, 76.08] };
global.map = { setView: () => {}, invalidateSize: () => {} };

// Evaluate demo & stepper module from app.js
const moduleCode = `
${js.slice(js.indexOf('function updateWorkflowStepper'), js.indexOf('function updateDashboardCards'))}
global.DEMO_STEPS = DEMO_STEPS;
global.startDemoMode = startDemoMode;
global.exitDemoMode = exitDemoMode;
global.nextDemoStep = nextDemoStep;
global.prevDemoStep = prevDemoStep;
global.renderDemoStep = renderDemoStep;
global.getStep = () => currentDemoStep;
`;

eval(moduleCode);

// 1. Initial Step 1
renderDemoStep(1);
assert(getStep() === 1, 'Initial state: Step 1');
assert(mockElement('btn-demo-prev').disabled === true, 'Previous disabled on Step 1');
assert(mockElement('demo-step-counter').innerText.includes('Step 1 of 6'), 'Counter shows Step 1 of 6');

// 2. Advance 1 -> 2
nextDemoStep();
assert(getStep() === 2, 'Clicking Next advances 1 -> 2');
assert(mockElement('btn-demo-prev').disabled === false, 'Previous enabled on Step 2');
assert(mockElement('demo-step-counter').innerText.includes('Step 2 of 6'), 'Counter shows Step 2 of 6');

// 3. Advance 2 -> 3
nextDemoStep();
assert(getStep() === 3, 'Clicking Next advances 2 -> 3 (Location & Map)');

// 4. Advance 3 -> 4
nextDemoStep();
assert(getStep() === 4, 'Clicking Next advances 3 -> 4 (Drift Forecast)');

// 5. Advance 4 -> 5
nextDemoStep();
assert(getStep() === 5, 'Clicking Next advances 4 -> 5 (AIS Correlation)');
assert(mockElement('demo-exp-hv-badge').style.display === 'inline-flex', 'Step 5 displays REQUIRES HUMAN VERIFICATION');

// 6. Advance 5 -> 6
nextDemoStep();
assert(getStep() === 6, 'Clicking Next advances 5 -> 6 (Investigation Report)');
assert(mockElement('btn-demo-next').innerHTML.includes('Restart Demo'), 'Next shows Restart on Step 6');

// 7. Backward navigation 6 -> 5 -> 4
prevDemoStep();
assert(getStep() === 5, 'Clicking Previous steps back 6 -> 5');
prevDemoStep();
assert(getStep() === 4, 'Clicking Previous steps back 5 -> 4');

// 8. Direct jump to step 2
renderDemoStep(2);
assert(getStep() === 2, 'Direct jump to Step 2 works');

console.log('\n================================================================');
console.log('   ALL SIX-STEP WORKFLOW TESTS PASSED PERFECTLY!               ');
console.log('================================================================');
