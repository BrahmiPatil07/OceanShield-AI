const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../style.css');
let css = fs.readFileSync(cssPath, 'utf8');

const workflowCss = `
/* ==========================================================================
   SIH 2026 Interactive 6-Step Workflow Navigation Component
   ========================================================================== */
.workflow-stepper-container {
  background: rgba(10, 24, 46, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  margin: 14px 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;
}

.workflow-stepper-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00f2fe, #38bdf8, #00f5a0);
}

.workflow-stepper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
}

.workflow-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.workflow-badge {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: rgba(0, 242, 254, 0.15);
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 242, 254, 0.35);
  letter-spacing: 0.5px;
}

.workflow-title {
  font-family: var(--font-main);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.2px;
}

.workflow-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.workflow-status-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(15, 35, 61, 0.6);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(56, 189, 248, 0.15);
}

.workflow-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-teal);
  box-shadow: 0 0 8px var(--accent-teal);
  animation: pulse-detect 2s infinite;
}

/* 6-Step Horizontal Card Stepper Grid */
.workflow-steps {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  align-items: stretch;
}

.wf-arrow {
  display: none !important;
}

/* Compact Step Card */
.workflow-step {
  background: rgba(15, 35, 61, 0.55);
  border: 1px solid rgba(56, 189, 248, 0.16);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  user-select: none;
}

.workflow-step:hover {
  background: rgba(20, 48, 85, 0.75);
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

/* Active Step Card: Highlighted with ocean-blue accent */
.workflow-step.active {
  background: rgba(14, 38, 70, 0.95);
  border: 1px solid #38bdf8;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.28), inset 0 0 12px rgba(56, 189, 248, 0.1);
  transform: translateY(-2px);
}

.workflow-step.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

/* Completed Step Card: Subtle completed indicator */
.workflow-step.completed {
  background: rgba(10, 30, 50, 0.55);
  border-color: rgba(0, 245, 160, 0.35);
}

.workflow-step.completed::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-teal);
}

/* Step Card Header: Number & Badge */
.wf-step-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wf-step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-muted);
  border: 1px solid rgba(148, 163, 184, 0.25);
  transition: all var(--transition-fast);
}

.workflow-step.active .wf-step-number {
  background: #38bdf8;
  color: #030712;
  border-color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  font-weight: 800;
}

.workflow-step.completed .wf-step-number {
  background: rgba(0, 245, 160, 0.2);
  color: var(--accent-teal);
  border-color: rgba(0, 245, 160, 0.4);
}

.wf-step-status-tag {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
}

.workflow-step.active .wf-step-status-tag {
  color: #38bdf8;
}

.workflow-step.completed .wf-step-status-tag {
  color: var(--accent-teal);
}

/* Step Card Content */
.wf-step-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wf-step-name {
  font-family: var(--font-main);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.workflow-step.active .wf-step-name {
  color: #ffffff;
}

.workflow-step.completed .wf-step-name {
  color: #e2e8f0;
}

.wf-step-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.35;
}

.workflow-step.active .wf-step-desc {
  color: #94a3b8;
}

/* Dedicated Workflow Navigation Bar */
.demo-mode-toolbar {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 24, 46, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  gap: 14px;
  flex-wrap: wrap;
}

.demo-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.demo-step-counter {
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
}

.demo-toolbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-demo-nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 35, 61, 0.8);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-demo-nav:hover:not(:disabled) {
  background: rgba(20, 45, 80, 0.9);
  color: var(--text-primary);
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}

.btn-demo-nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-demo-nav-primary {
  background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
  color: #030712;
  border-color: #38bdf8;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.35);
}

.btn-demo-nav-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #38bdf8 100%);
  color: #ffffff;
  border-color: #00f2fe;
}

/* Mobile & Laptop Media Queries */
@media (max-width: 1200px) {
  .workflow-steps {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .workflow-steps {
    grid-template-columns: 1fr;
  }
  .demo-mode-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .demo-toolbar-center {
    justify-content: center;
  }
}
`;

fs.writeFileSync(cssPath, css + '\n' + workflowCss, 'utf8');
console.log('Successfully appended workflow styles to style.css');
