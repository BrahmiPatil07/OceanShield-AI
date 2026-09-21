const fs = require('fs');
const path = require('path');

const originalCss = fs.readFileSync(path.join(__dirname, 'original_style.css'), 'utf8');

const additionalCss = `
/* ==========================================================================
   SIH 2026 Enhanced Demo Mode & 2-Column Workspace (Dark Oceanic Theme)
   ========================================================================== */

/* Workspace 2-Column Grid Layout */
.sat-workspace-grid {
  display: grid;
  grid-template-columns: minmax(420px, 1.25fr) minmax(360px, 1fr);
  gap: 22px;
  align-items: start;
}

@media (max-width: 1024px) {
  .sat-workspace-grid {
    grid-template-columns: 1fr;
  }
}

.sat-workspace-left,
.sat-workspace-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.workspace-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.workspace-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.workspace-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-cyan);
  color: #030712;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

/* Prominent Upload Satellite Image Button */
.btn-primary-upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
  color: #030712;
  border: 1px solid #38bdf8;
  font-family: var(--font-main);
  font-size: 13.5px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.35);
  transition: all var(--transition-smooth);
}

.btn-primary-upload:hover {
  background: linear-gradient(135deg, #0369a1 0%, #38bdf8 100%);
  color: #ffffff;
  border-color: #00f2fe;
  box-shadow: 0 0 24px rgba(0, 242, 254, 0.55);
  transform: translateY(-1px);
}

.btn-primary-upload svg {
  stroke: currentColor;
}

/* Detect Spill Action Trigger Bar */
.detect-trigger-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.detect-trigger-bar .btn-detect-spill {
  flex: 1;
}

/* Header & Nav Demo Start Button */
.btn-demo-start {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(56, 189, 248, 0.3) 100%);
  color: var(--accent-cyan);
  border: 1px solid var(--border-glow);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.2);
}

.btn-demo-start:hover {
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.35) 0%, rgba(56, 189, 248, 0.45) 100%);
  border-color: var(--accent-cyan);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.45);
  transform: translateY(-1px);
}

/* Demo Mode Toolbar (Dark Oceanic Theme) */
.demo-mode-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 24, 46, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 242, 254, 0.35);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  gap: 14px;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.15);
  margin-bottom: 12px;
}

.demo-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.demo-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--accent-cyan);
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
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
  gap: 10px;
}

.btn-demo-nav {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(15, 35, 61, 0.8);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-demo-nav:hover:not(:disabled) {
  background: rgba(20, 45, 80, 0.9);
  color: var(--text-primary);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25);
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

.demo-step-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.demo-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.4);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.demo-dot.active {
  background: var(--accent-cyan);
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.8);
  transform: scale(1.25);
}

.demo-dot.completed {
  background: var(--accent-teal);
  border-color: var(--accent-teal);
}

.btn-demo-exit {
  background: rgba(244, 63, 94, 0.12);
  color: var(--accent-red);
  border: 1px solid rgba(244, 63, 94, 0.3);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-demo-exit:hover {
  background: rgba(244, 63, 94, 0.25);
  border-color: var(--accent-red);
}

/* Demo Step Explanation Card */
.demo-explanation-card {
  background: rgba(10, 24, 46, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 242, 254, 0.25);
  border-left: 4px solid var(--accent-cyan);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 242, 254, 0.1);
  margin-top: 14px;
}

.demo-exp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.demo-exp-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.demo-exp-badge {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--accent-cyan);
  color: #030712;
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.4);
}

.demo-exp-title {
  font-family: var(--font-main);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.badge-hv-inline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-amber);
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.35);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.3px;
}

.btn-demo-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
  border: 1px solid #38bdf8;
  color: #030712;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.3);
  transition: all var(--transition-fast);
}

.btn-demo-action:hover {
  background: linear-gradient(135deg, #0369a1 0%, #38bdf8 100%);
  color: #ffffff;
  box-shadow: 0 0 18px rgba(0, 242, 254, 0.5);
}

.demo-exp-desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.demo-exp-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
}

.demo-exp-hint {
  color: var(--accent-cyan);
  font-weight: 500;
}

.demo-exp-statutory {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
}

/* Floating Presenter HUD */
.demo-floating-hud {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: rgba(6, 14, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 242, 254, 0.4);
  border-radius: var(--radius-full);
  padding: 10px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.25);
  max-width: 90vw;
}

.hud-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hud-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-cyan);
  background: rgba(0, 242, 254, 0.15);
  border: 1px solid rgba(0, 242, 254, 0.35);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.hud-info {
  display: flex;
  flex-direction: column;
}

.hud-step-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.hud-step-desc {
  font-size: 10.5px;
  color: var(--text-muted);
  white-space: nowrap;
}

.hud-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-hud-nav {
  background: rgba(15, 35, 61, 0.8);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-hud-nav:hover:not(:disabled) {
  background: rgba(20, 45, 80, 0.9);
  color: var(--text-primary);
  border-color: var(--accent-cyan);
}

.btn-hud-nav-primary {
  background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
  color: #030712;
  border-color: #38bdf8;
  font-weight: 700;
}

.hud-counter {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}

.btn-hud-exit {
  background: rgba(244, 63, 94, 0.12);
  color: var(--accent-red);
  border: 1px solid rgba(244, 63, 94, 0.3);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
}

.btn-hud-exit:hover {
  background: rgba(244, 63, 94, 0.25);
  border-color: var(--accent-red);
}

.demo-section-spotlight {
  border-color: var(--accent-cyan) !important;
  box-shadow: 0 0 25px rgba(0, 242, 254, 0.35) !important;
}
`;

fs.writeFileSync(path.join(__dirname, '../style.css'), originalCss + '\n' + additionalCss, 'utf8');
console.log('Successfully written unified style.css');
