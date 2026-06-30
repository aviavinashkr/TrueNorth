/* ==========================================================================
   TrueNorth Sandbox Simulator Module
   ========================================================================== */

import { t } from './jargon.js';
import { formatINR } from './goals.js';

// State
let sipAmount = 5000;
let years = 10;
let riskProfile = "BALANCED"; // CONSERVATIVE, BALANCED, AGGRESSIVE
let isHistoricalMode = false;
let historicalPeriod = 5; // 3, 5, or 10 years

// Rates
const RATES = {
  FD: 0.065,              // 6.5% constant FD rate
  CONSERVATIVE: 0.075,    // 7.5% Debt-heavy
  BALANCED: 0.105,        // 10.5% Hybrid
  AGGRESSIVE: 0.135       // 13.5% Equity-heavy
};

// Historical Nifty 50 CAGRs (realistic ending 2026)
const HISTORICAL_CAGR = {
  3: 0.152,  // 15.2% 3yr CAGR
  5: 0.148,  // 14.8% 5yr CAGR
  10: 0.139  // 13.9% 10yr CAGR
};

/**
 * Calculates investment values over time
 */
function calculateDataSeries() {
  const months = (isHistoricalMode ? historicalPeriod : years) * 12;
  const rateTN = isHistoricalMode ? HISTORICAL_CAGR[historicalPeriod] : RATES[riskProfile];
  const rateFD = RATES.FD;

  const monthlyRateTN = rateTN / 12;
  const monthlyRateFD = rateFD / 12;

  const series = [];

  for (let m = 0; m <= months; m += Math.max(1, Math.round(months / 12))) {
    const invested = sipAmount * m;
    
    // Future value formulas
    let fdValue = 0;
    let tnValue = 0;

    if (m > 0) {
      fdValue = sipAmount * ((Math.pow(1 + monthlyRateFD, m) - 1) / monthlyRateFD) * (1 + monthlyRateFD);
      tnValue = sipAmount * ((Math.pow(1 + monthlyRateTN, m) - 1) / monthlyRateTN) * (1 + monthlyRateTN);
    }

    series.push({
      month: m,
      year: (m / 12).toFixed(1),
      invested: Math.round(invested),
      fd: Math.round(fdValue),
      truenorth: Math.round(tnValue)
    });
  }

  return series;
}

/**
 * Draws the SVG Chart
 */
function drawChart(series) {
  const svg = document.getElementById('simulator-chart');
  if (!svg) return;

  const width = svg.clientWidth || 500;
  const height = 240;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Clear previous contents
  svg.innerHTML = `
    <defs>
      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0"/>
      </linearGradient>
      <linearGradient id="fd-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  `;

  // Margins
  const margin = { top: 20, right: 20, bottom: 30, left: 65 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Max value for scaling
  const maxVal = Math.max(...series.map(d => d.truenorth)) * 1.05;

  // Scale functions
  const getX = (d) => margin.left + (d.month / series[series.length - 1].month) * chartWidth;
  const getY = (val) => margin.top + chartHeight - (val / maxVal) * chartHeight;

  // Draw Grid Lines (Y-Axis)
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const val = (maxVal / gridCount) * i;
    const y = getY(val);
    
    // Grid line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', margin.left);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width - margin.right);
    line.setAttribute('y2', y);
    line.setAttribute('class', 'chart-grid-line');
    svg.appendChild(line);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', margin.left - 10);
    text.setAttribute('y', y + 4);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', '#9CA3AF');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', '600');
    
    // Format label (e.g. 1.2L, 50K)
    let label = "";
    if (val >= 100000) {
      label = `₹${(val / 100000).toFixed(1)}L`;
    } else if (val >= 1000) {
      label = `₹${(val / 1000).toFixed(0)}K`;
    } else {
      label = `₹${val.toFixed(0)}`;
    }
    text.textContent = label;
    svg.appendChild(text);
  }

  // Draw X-Axis Labels
  const xLabelsCount = 5;
  for (let i = 0; i < xLabelsCount; i++) {
    const idx = Math.round((series.length - 1) * (i / (xLabelsCount - 1)));
    const d = series[idx];
    const x = getX(d);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', height - 8);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#9CA3AF');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', '600');
    text.textContent = `${Math.round(d.month / 12)} Yrs`;
    svg.appendChild(text);
  }

  // Generate path coordinates
  const investedPoints = series.map(d => `${getX(d)},${getY(d.invested)}`).join(' ');
  const fdPoints = series.map(d => `${getX(d)},${getY(d.fd)}`).join(' ');
  const tnPoints = series.map(d => `${getX(d)},${getY(d.truenorth)}`).join(' ');

  // Draw Area under TrueNorth (Gradient)
  const tnAreaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const tnAreaD = `M ${getX(series[0])} ${getY(0)} ` + 
                  series.map(d => `L ${getX(d)} ${getY(d.truenorth)}`).join(' ') + 
                  ` L ${getX(series[series.length - 1])} ${getY(0)} Z`;
  tnAreaPath.setAttribute('d', tnAreaD);
  tnAreaPath.setAttribute('fill', 'url(#chart-gradient)');
  svg.appendChild(tnAreaPath);

  // Draw Invested Path (Dashed White)
  const investedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  investedPath.setAttribute('d', `M ${investedPoints}`);
  investedPath.setAttribute('class', 'chart-path-invested');
  svg.appendChild(investedPath);

  // Draw FD Path (Sky Blue)
  const fdPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  fdPath.setAttribute('d', `M ${fdPoints}`);
  fdPath.setAttribute('class', 'chart-path-fd');
  svg.appendChild(fdPath);

  // Draw TrueNorth Path (Gradient Purple, Glowing)
  const tnPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tnPath.setAttribute('d', `M ${tnPoints}`);
  tnPath.setAttribute('class', 'chart-path-truenorth');
  svg.appendChild(tnPath);

  // Draw Interactive Dots at the end of curves
  const endD = series[series.length - 1];
  
  // FD End Dot
  const fdDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  fdDot.setAttribute('cx', getX(endD));
  fdDot.setAttribute('cy', getY(endD.fd));
  fdDot.setAttribute('r', '5');
  fdDot.setAttribute('fill', '#38bdf8');
  fdDot.setAttribute('stroke', '#0B0F19');
  fdDot.setAttribute('stroke-width', '2');
  svg.appendChild(fdDot);

  // TrueNorth End Dot
  const tnDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  tnDot.setAttribute('cx', getX(endD));
  tnDot.setAttribute('cy', getY(endD.truenorth));
  tnDot.setAttribute('r', '6');
  tnDot.setAttribute('fill', '#8B5CF6');
  tnDot.setAttribute('stroke', '#F9FAFB');
  tnDot.setAttribute('stroke-width', '2');
  svg.appendChild(tnDot);
}

/**
 * Recalculates and updates the UI display cards
 */
export function updateSimulator() {
  const series = calculateDataSeries();
  const finalData = series[series.length - 1];

  // Update card values
  const totalInvestedEl = document.getElementById('sim-total-invested');
  const fdValueEl = document.getElementById('sim-fd-value');
  const tnValueEl = document.getElementById('sim-tn-value');
  const advantageValueEl = document.getElementById('sim-advantage-value');

  if (totalInvestedEl) totalInvestedEl.textContent = formatINR(finalData.invested);
  if (fdValueEl) fdValueEl.textContent = formatINR(finalData.fd);
  if (tnValueEl) tnValueEl.textContent = formatINR(finalData.truenorth);
  
  if (advantageValueEl) {
    const adv = finalData.truenorth - finalData.fd;
    advantageValueEl.textContent = formatINR(adv);
  }

  // Draw chart
  drawChart(series);

  // Update explanation notes
  const noteEl = document.getElementById('sim-note-text');
  if (noteEl) {
    const rate = isHistoricalMode ? HISTORICAL_CAGR[historicalPeriod] : RATES[riskProfile];
    const ratePct = (rate * 100).toFixed(1);
    
    if (isHistoricalMode) {
      noteEl.innerHTML = `
        This simulation reflects actual historical performance of the ${t('NIFTY_50')} 
        (India's top 50 companies) over the last <strong>${historicalPeriod} years</strong>, 
        averaging a compound growth rate of <strong>${ratePct}% per year</strong>. 
        In comparison, a traditional Fixed Deposit grew at <strong>6.5%</strong>.
      `;
    } else {
      const allocationMap = {
        CONSERVATIVE: "low-risk debt funds (loans to government & companies)",
        BALANCED: "a hybrid mix of stable debt and growth stocks",
        AGGRESSIVE: "growth-oriented stock funds (top 50 Indian companies)"
      };
      noteEl.innerHTML = `
        This projection assumes an average annual return of <strong>${ratePct}%</strong>, 
        representing a <strong>${riskProfile.toLowerCase()}</strong> strategy allocated in 
        <strong>${allocationMap[riskProfile]}</strong>. 
        Fixed Deposits are calculated at a steady <strong>6.5%</strong> annual return.
      `;
    }
  }
}

/**
 * Renders the HTML structure of the Sandbox Simulator
 */
export function renderSimulatorTab() {
  const container = document.getElementById('simulator-container');
  if (!container) return;

  container.innerHTML = `
    <div class="simulator-layout">
      <!-- Left: Input Controls -->
      <div class="simulator-controls glass-panel">
        
        <!-- Toggle Mode -->
        <div class="radio-group" style="grid-template-columns: 1fr 1fr; margin-bottom: 8px;">
          <div class="radio-btn">
            <input type="radio" id="mode-projection" name="sim-mode" value="projection" ${!isHistoricalMode ? 'checked' : ''}>
            <label for="mode-projection">Future Projections</label>
          </div>
          <div class="radio-btn">
            <input type="radio" id="mode-historical" name="sim-mode" value="historical" ${isHistoricalMode ? 'checked' : ''}>
            <label for="mode-historical">Historical Reality</label>
          </div>
        </div>

        <!-- Monthly Investment -->
        <div class="form-group">
          <div class="form-label-row">
            <span class="form-label">Monthly Investment (${t('SIP')})</span>
            <span class="form-value" id="sim-sip-val">${formatINR(sipAmount)}</span>
          </div>
          <input type="range" id="sim-sip-slider" class="slider-input" min="500" max="50000" step="500" value="${sipAmount}">
          <div class="goal-progress-labels">
            <span>₹500</span>
            <span>₹50,000</span>
          </div>
        </div>

        <!-- Projection Mode Controls -->
        <div id="projection-controls-group" style="display: ${isHistoricalMode ? 'none' : 'flex'}; flex-direction: column; gap: 24px;">
          <!-- Years -->
          <div class="form-group">
            <div class="form-label-row">
              <span class="form-label">Investment Period</span>
              <span class="form-value" id="sim-years-val">${years} Years</span>
            </div>
            <input type="range" id="sim-years-slider" class="slider-input" min="1" max="20" step="1" value="${years}">
            <div class="goal-progress-labels">
              <span>1 Year</span>
              <span>20 Years</span>
            </div>
          </div>

          <!-- Risk Profile -->
          <div class="form-group">
            <span class="form-label">Investment Strategy</span>
            <div class="radio-group" style="margin-top: 4px;">
              <div class="radio-btn">
                <input type="radio" id="risk-cons" name="risk-profile" value="CONSERVATIVE" ${riskProfile === 'CONSERVATIVE' ? 'checked' : ''}>
                <label for="risk-cons" style="font-size: 11px;">Low Risk</label>
              </div>
              <div class="radio-btn">
                <input type="radio" id="risk-bal" name="risk-profile" value="BALANCED" ${riskProfile === 'BALANCED' ? 'checked' : ''}>
                <label for="risk-bal" style="font-size: 11px;">Balanced</label>
              </div>
              <div class="radio-btn">
                <input type="radio" id="risk-aggr" name="risk-profile" value="AGGRESSIVE" ${riskProfile === 'AGGRESSIVE' ? 'checked' : ''}>
                <label for="risk-aggr" style="font-size: 11px;">High Growth</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Historical Mode Controls -->
        <div id="historical-controls-group" style="display: ${isHistoricalMode ? 'flex' : 'none'}; flex-direction: column; gap: 24px;">
          <!-- Historical Period -->
          <div class="form-group">
            <span class="form-label">Past Time Period</span>
            <div class="radio-group" style="margin-top: 4px;">
              <div class="radio-btn">
                <input type="radio" id="hist-3" name="hist-period" value="3" ${historicalPeriod === 3 ? 'checked' : ''}>
                <label for="hist-3">Last 3 Years</label>
              </div>
              <div class="radio-btn">
                <input type="radio" id="hist-5" name="hist-period" value="5" ${historicalPeriod === 5 ? 'checked' : ''}>
                <label for="hist-5">Last 5 Years</label>
              </div>
              <div class="radio-btn">
                <input type="radio" id="hist-10" name="hist-period" value="10" ${historicalPeriod === 10 ? 'checked' : ''}>
                <label for="hist-10">Last 10 Years</label>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right: Chart and Results -->
      <div class="simulator-display glass-panel">
        
        <!-- Chart Area -->
        <div class="chart-container">
          <svg id="simulator-chart" class="chart-svg"></svg>
        </div>

        <!-- Legend -->
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-dot invested"></div>
            <span>Total Invested</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot fd"></div>
            <span>Fixed Deposit (6.5%)</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot truenorth"></div>
            <span id="legend-tn-label">TrueNorth Growth</span>
          </div>
        </div>

        <!-- Dynamic Explanation Note -->
        <div class="historical-sim-box" style="background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06); padding: 12px 16px;">
          <div class="historical-text" style="width: 100%;">
            <p id="sim-note-text" style="font-size: 13px; color: hsl(var(--text-secondary)); line-height: 1.5;"></p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="sim-results-grid">
          <div class="result-card">
            <div class="result-label">Total Saved</div>
            <div class="result-value" id="sim-total-invested">₹0</div>
          </div>
          <div class="result-card">
            <div class="result-label">FD Value</div>
            <div class="result-value" id="sim-fd-value" style="color: #38bdf8;">₹0</div>
          </div>
          <div class="result-card highlight">
            <div class="result-label">TrueNorth Value</div>
            <div class="result-value" id="sim-tn-value">₹0</div>
          </div>
        </div>

        <!-- Advantage Banner -->
        <div class="historical-sim-box" style="margin-top: -8px;">
          <div class="historical-text">
            <h4 style="color: #a7f3d0; font-size: 15px;">TrueNorth Advantage</h4>
            <p>Your extra gains compared to traditional Fixed Deposits.</p>
          </div>
          <div class="result-value" id="sim-advantage-value" style="color: hsl(var(--color-success)); font-size: 24px; font-weight: 800;">₹0</div>
        </div>

      </div>
    </div>
  `;

  bindEventListeners();
  updateSimulator();
}

/**
 * Binds event listeners to the controls
 */
function bindEventListeners() {
  // Mode Switch
  const modeProj = document.getElementById('mode-projection');
  const modeHist = document.getElementById('mode-historical');
  const projControls = document.getElementById('projection-controls-group');
  const histControls = document.getElementById('historical-controls-group');
  const legendLabel = document.getElementById('legend-tn-label');

  if (modeProj && modeHist && projControls && histControls) {
    const handleModeChange = (isHist) => {
      isHistoricalMode = isHist;
      projControls.style.display = isHist ? 'none' : 'flex';
      histControls.style.display = isHist ? 'flex' : 'none';
      if (legendLabel) {
        legendLabel.textContent = isHist ? "Nifty 50 Historical" : "TrueNorth Growth";
      }
      updateSimulator();
    };

    modeProj.addEventListener('change', () => handleModeChange(false));
    modeHist.addEventListener('change', () => handleModeChange(true));
  }

  // SIP Slider
  const sipSlider = document.getElementById('sim-sip-slider');
  const sipVal = document.getElementById('sim-sip-val');
  if (sipSlider && sipVal) {
    sipSlider.addEventListener('input', (e) => {
      sipAmount = parseInt(e.target.value);
      sipVal.textContent = formatINR(sipAmount);
      updateSimulator();
    });
  }

  // Years Slider
  const yearsSlider = document.getElementById('sim-years-slider');
  const yearsVal = document.getElementById('sim-years-val');
  if (yearsSlider && yearsVal) {
    yearsSlider.addEventListener('input', (e) => {
      years = parseInt(e.target.value);
      yearsVal.textContent = `${years} Years`;
      updateSimulator();
    });
  }

  // Risk Radios
  const riskRadios = document.querySelectorAll('input[name="risk-profile"]');
  riskRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      riskProfile = e.target.value;
      updateSimulator();
    });
  });

  // Historical Period Radios
  const histRadios = document.querySelectorAll('input[name="hist-period"]');
  histRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      historicalPeriod = parseInt(e.target.value);
      updateSimulator();
    });
  });

  // Redraw chart on window resize
  window.addEventListener('resize', () => {
    if (document.getElementById('simulator-section').classList.contains('active')) {
      const series = calculateDataSeries();
      drawChart(series);
    }
  });
}

/**
 * Initializes the simulator module
 */
export function initSimulator() {
  renderSimulatorTab();
}
