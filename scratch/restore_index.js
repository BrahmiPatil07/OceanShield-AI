const fs = require('fs');
const path = require('path');

const gitHtml = fs.readFileSync(path.join(__dirname, 'git_original_index.html'), 'utf8');

// The Demo Stepper + Toolbar + Explanation Card snippet
const demoStepperHtml = `
    <!-- End-to-End Pipeline Workflow Visualizer (SIH 2026 Presentation) -->
    <div class="workflow-stepper-container" id="workflow-stepper">
      <div class="workflow-stepper-header">
        <div class="workflow-title-group">
          <span class="workflow-badge">SIH 2026 PIPELINE</span>
          <span class="workflow-title">Autonomous Multi-Sensor Intelligence Workflow</span>
          <span class="badge prototype-badge">&#x26F6; PROTOTYPE DEMO</span>
        </div>
        <div class="workflow-header-actions">
          <button class="btn-demo-start" id="btn-start-demo" title="Launch Interactive SIH 2026 Guided Presentation Demo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Start Demo</span>
          </button>
          <div class="workflow-status-tag" id="workflow-status-tag">
            <span class="workflow-pulse"></span>
            <span id="workflow-status-text">Pipeline Ready &bull; Ingest Satellite SAR or Run Detection</span>
          </div>
        </div>
      </div>

      <!-- Interactive Demo Mode Control Toolbar -->
      <div class="demo-mode-toolbar" id="demo-mode-toolbar" style="display: none;">
        <div class="demo-toolbar-left">
          <span class="demo-live-badge"><span class="pulsing-dot-teal"></span> LIVE DEMO MODE</span>
          <span class="demo-step-counter" id="demo-step-counter">Step 1 of 6: Satellite Image Ingestion</span>
        </div>
        <div class="demo-toolbar-center">
          <button class="btn-demo-nav" id="btn-demo-prev" title="Previous Step (&larr;)" disabled>
            &larr; Previous Step
          </button>
          <div class="demo-step-dots" id="demo-step-dots">
            <span class="demo-dot active" data-step="1" title="Step 1: Satellite Image"></span>
            <span class="demo-dot" data-step="2" title="Step 2: Spill Detection"></span>
            <span class="demo-dot" data-step="3" title="Step 3: Spill Location"></span>
            <span class="demo-dot" data-step="4" title="Step 4: Drift Forecast"></span>
            <span class="demo-dot" data-step="5" title="Step 5: AIS Correlation"></span>
            <span class="demo-dot" data-step="6" title="Step 6: Investigation Report"></span>
          </div>
          <button class="btn-demo-nav btn-demo-nav-primary" id="btn-demo-next" title="Next Step (&rarr;)">
            Next Step &rarr;
          </button>
        </div>
        <div class="demo-toolbar-right">
          <button class="btn-demo-exit" id="btn-exit-demo" title="Exit Guided Demo Mode">
            Exit Demo &times;
          </button>
        </div>
      </div>

      <div class="workflow-steps">
        <div class="workflow-step active" id="wf-step-1" data-target="satellite-analysis-panel" title="Step 1: Satellite Image Ingestion">
          <div class="wf-step-number">01</div>
          <div class="wf-step-content">
            <div class="wf-step-name">Satellite Image</div>
            <div class="wf-step-desc">Sentinel-1 C-SAR / User Raster</div>
          </div>
        </div>
        <div class="wf-arrow">&rarr;</div>
        <div class="workflow-step" id="wf-step-2" data-target="satellite-analysis-panel" title="Step 2: AI Spill Detection">
          <div class="wf-step-number">02</div>
          <div class="wf-step-content">
            <div class="wf-step-name">Spill Detection</div>
            <div class="wf-step-desc">Adaptive CFAR &amp; Segmentation</div>
          </div>
        </div>
        <div class="wf-arrow">&rarr;</div>
        <div class="workflow-step" id="wf-step-3" data-target="map-panel" title="Step 3: Geospatial Localization">
          <div class="wf-step-number">03</div>
          <div class="wf-step-content">
            <div class="wf-step-name">Location &amp; Map</div>
            <div class="wf-step-desc">Centroid &amp; 12km Review Zone</div>
          </div>
        </div>
        <div class="wf-arrow">&rarr;</div>
        <div class="workflow-step" id="wf-step-4" data-target="drift-forecast-section" title="Step 4: Hydrodynamic Drift Forecast">
          <div class="wf-step-number">04</div>
          <div class="wf-step-content">
            <div class="wf-step-name">Drift Forecast</div>
            <div class="wf-step-desc">Metocean Trajectory (6h-48h)</div>
          </div>
        </div>
        <div class="wf-arrow">&rarr;</div>
        <div class="workflow-step" id="wf-step-5" data-target="vessels-panel" title="Step 5: AIS Spatio-Temporal Correlation">
          <div class="wf-step-number">05</div>
          <div class="wf-step-content">
            <div class="wf-step-name">AIS Correlation</div>
            <div class="wf-step-desc">Candidate Screening &amp; CPA</div>
          </div>
        </div>
        <div class="wf-arrow">&rarr;</div>
        <div class="workflow-step" id="wf-step-6" data-target="report-modal" title="Step 6: Official Investigation SITREP Report">
          <div class="wf-step-number">06</div>
          <div class="wf-step-content">
            <div class="wf-step-name">Investigation Report</div>
            <div class="wf-step-desc">Official Evidence SITREP</div>
          </div>
        </div>
      </div>

      <!-- Demo Step Explanation Card -->
      <div class="demo-explanation-card" id="demo-explanation-card" style="display: none;">
        <div class="demo-exp-header">
          <div class="demo-exp-title-group">
            <span class="demo-exp-badge" id="demo-exp-badge">STEP 01</span>
            <h3 class="demo-exp-title" id="demo-exp-title">Satellite SAR Image Ingestion</h3>
            <span class="badge prototype-badge">&#x26F6; PROTOTYPE DEMO</span>
            <span class="badge-hv-inline" id="demo-exp-hv-badge" style="display: none;">⚠️ REQUIRES HUMAN VERIFICATION</span>
          </div>
          <div class="demo-exp-action-container" id="demo-exp-action-container">
            <!-- Dynamic Action Button for current step -->
          </div>
        </div>
        <p class="demo-exp-desc" id="demo-exp-desc">
          Synthetic Aperture Radar (SAR) penetrates cloud cover and darkness to detect ocean surface roughness anomalies. OceanShield AI ingests high-resolution SAR rasters (GeoTIFF, JPG, PNG, GIF) to identify potential oil-slick dampening of capillary waves.
        </p>
        <div class="demo-exp-footer">
          <span class="demo-exp-hint" id="demo-exp-hint">💡 Presenter Hint: Use Next Step or Right Arrow key to advance.</span>
          <span class="demo-exp-statutory">Statutory Notice: Synthetic data for demonstration purposes only. Non-accusatory candidate screening.</span>
        </div>
      </div>
    </div>
`;

// Floating HUD snippet
const floatingHudHtml = `
    <!-- Floating Presenter HUD for Guided Demo Mode -->
    <div class="demo-floating-hud" id="demo-floating-hud" style="display: none;">
      <div class="hud-left">
        <span class="hud-badge">SIH DEMO</span>
        <div class="hud-info">
          <div class="hud-step-title" id="hud-step-title">Step 1: Satellite Image</div>
          <div class="hud-step-desc" id="hud-step-desc">Ingest SAR Raster</div>
        </div>
      </div>
      <div class="hud-center">
        <button class="btn-hud-nav" id="btn-hud-prev" title="Previous Step">&larr;</button>
        <span class="hud-counter" id="hud-counter">1/6</span>
        <button class="btn-hud-nav btn-hud-nav-primary" id="btn-hud-next" title="Next Step">&rarr;</button>
      </div>
      <div class="hud-right">
        <div id="hud-action-slot"></div>
        <button class="btn-hud-exit" id="btn-hud-exit" title="Exit Demo">&times;</button>
      </div>
    </div>
`;

let restored = gitHtml;

// 1. Add Start Demo button to header controls if not present
if (!restored.includes('id="btn-start-demo"')) {
  restored = restored.replace(
    '<button type="button" class="btn-reset-demo" id="btn-reset-demo"',
    `<button type="button" class="btn-demo-start" id="btn-start-demo-header" onclick="document.getElementById('btn-start-demo').click()" title="Launch Guided SIH 2026 Demo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Start Demo</span>
        </button>
        <button type="button" class="btn-reset-demo" id="btn-reset-demo"`
  );
}

// 2. Insert Demo Stepper right after disclaimer banner
if (!restored.includes('id="workflow-stepper"')) {
  const disclaimerEnd = '</div>\n    </div>\n\n    <!-- Key Telemetry';
  const disclaimerEndAlt = '</div>\n    </div>\n    <!-- Key Telemetry';
  if (restored.includes(disclaimerEnd)) {
    restored = restored.replace(disclaimerEnd, '</div>\n    </div>\n' + demoStepperHtml + '\n    <!-- Key Telemetry');
  } else if (restored.includes(disclaimerEndAlt)) {
    restored = restored.replace(disclaimerEndAlt, '</div>\n    </div>\n' + demoStepperHtml + '\n    <!-- Key Telemetry');
  } else {
    // fallback: find class="disclaimer-banner" closing
    const idx = restored.indexOf('class="disclaimer-banner"');
    const closeIdx = restored.indexOf('</div>\n    </div>', idx);
    if (closeIdx !== -1) {
      restored = restored.slice(0, closeIdx + 13) + '\n' + demoStepperHtml + restored.slice(closeIdx + 13);
    }
  }
}

// 3. Insert Floating HUD before </body>
if (!restored.includes('id="demo-floating-hud"')) {
  restored = restored.replace('</body>', floatingHudHtml + '\n</body>');
}

// Write to index.html
fs.writeFileSync(path.join(__dirname, '../index.html'), restored, 'utf8');
console.log('Successfully restored index.html with SIH 2026 presentation features');
