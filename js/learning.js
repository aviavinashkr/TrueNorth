/* ==========================================================================
   TrueNorth Learning Hub Module
   ========================================================================== */

import { t } from './jargon.js';
import { formatINR } from './goals.js';

// State
let activeLessonId = "compounding";

// Interactive Widget States
let compoundingYears = 10;
let inflationYears = 10;
let marketPrice = 100;
let marketHistory = [100];

// Lesson Data
const lessons = {
  compounding: {
    id: "compounding",
    title: "The Magic of Compounding",
    badge: "Wealth Building",
    body: `
      <p>Compounding is the financial equivalent of a snowball rolling down a hill. As it rolls, it picks up more snow, growing faster and faster.</p>
      <p>In investing, <strong>compounding</strong> means you earn returns not just on your original money, but also on the interest/returns you've already earned. Your money makes money, and then that new money makes even more money.</p>
      <p><strong>The Golden Rule:</strong> The longer you let your money roll, the steeper the growth. Starting 5 years earlier can double your final wealth.</p>
    `,
    renderWidget: renderCompoundingWidget,
    bindWidgetEvents: bindCompoundingEvents
  },
  fluctuation: {
    id: "fluctuation",
    title: "Why Do Markets Fluctuate?",
    badge: "Market Psychology",
    body: `
      <p>If you check the stock market daily, it looks like a chaotic heartbeat—up one day, down the next. This short-term movement is called <strong>volatility</strong>.</p>
      <p>In the short run, markets react emotionally to news (interest rates, elections, global events). In the long run, however, the market behaves like a weighing machine, reflecting the actual profits and growth of businesses.</p>
      <p><strong>The Golden Rule:</strong> Ignore the daily noise. Short-term drops are normal, but over 5-10 years, the Indian economy has historically expanded, pulling the stock market upwards with it.</p>
    `,
    renderWidget: renderFluctuationWidget,
    bindWidgetEvents: bindFluctuationEvents
  },
  inflation: {
    id: "inflation",
    title: "Understanding Inflation",
    badge: "The Silent Thief",
    body: `
      <p>Have you noticed that a cup of chai or a movie ticket costs much more today than it did 10 years ago? That is <strong>inflation</strong>.</p>
      <p>Inflation is the rate at which the cost of living increases, which means the purchasing power of your money goes down. If inflation is 6% in India, something that costs ₹100 today will cost ₹106 next year.</p>
      <p><strong>The Golden Rule:</strong> If your money is sitting in a traditional savings account earning 3% interest, you are actually <strong>losing wealth</strong> because inflation (at 6%) is eating it faster than it grows. To beat inflation, you must invest in assets like stocks that grow faster than the cost of living.</p>
    `,
    renderWidget: renderInflationWidget,
    bindWidgetEvents: bindInflationEvents
  }
};

/* ==========================================================================
   Compounding Widget
   ========================================================================== */
function renderCompoundingWidget() {
  const principal = 10000;
  const rate = 0.12; // 12% average return
  const finalValue = Math.round(principal * Math.pow(1 + rate, compoundingYears));
  const wealthGained = finalValue - principal;

  return `
    <div class="interactive-lesson-widget">
      <h4 style="font-size: 14px; font-weight: 400; margin-bottom: 12px; color: var(--color-ink);">Compounding Simulator (One-time ₹10,000)</h4>
      
      <div class="form-group" style="margin-bottom: 16px;">
        <div class="form-label-row">
          <span class="form-label" style="font-size: 12px;">Time Period</span>
          <span class="form-value" id="learn-comp-years-val" style="font-size: 14px;">${compoundingYears} Years</span>
        </div>
        <input type="range" id="learn-comp-years-slider" class="slider-input" min="5" max="30" step="5" value="${compoundingYears}">
        <div class="goal-progress-labels" style="font-size: 10px;">
          <span>5 Years</span>
          <span>30 Years</span>
        </div>
      </div>

      <div class="sim-results-grid" style="grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="result-card" style="padding: 10px;">
          <div class="result-label" style="font-size: 11px;">Invested</div>
          <div class="result-value" style="font-size: 15px;">₹10,000</div>
        </div>
        <div class="result-card highlight" style="padding: 10px; background: rgba(83, 58, 253, 0.06); border-color: rgba(83, 58, 253, 0.2);">
          <div class="result-label" style="font-size: 11px; color: var(--color-primary);">Grows To (at 12%)</div>
          <div class="result-value" id="learn-comp-final-val" style="font-size: 16px; color: var(--color-primary);">${formatINR(finalValue)}</div>
        </div>
      </div>

      <p style="font-size: 12px; color: var(--color-ink-mute); margin-top: 12px; line-height: 1.4; text-align: center;">
        Your money multiplied by <strong>${(finalValue / principal).toFixed(1)}x</strong>. 
        Notice how it grows from ${formatINR(17623)} (in 5 yrs) to ${formatINR(299599)} (in 30 yrs)!
      </p>
    </div>
  `;
}

function bindCompoundingEvents() {
  const slider = document.getElementById('learn-comp-years-slider');
  const valText = document.getElementById('learn-comp-years-val');
  const finalValText = document.getElementById('learn-comp-final-val');

  if (slider && valText && finalValText) {
    slider.addEventListener('input', (e) => {
      compoundingYears = parseInt(e.target.value);
      valText.textContent = `${compoundingYears} Years`;
      
      const principal = 10000;
      const rate = 0.12;
      const finalValue = Math.round(principal * Math.pow(1 + rate, compoundingYears));
      
      finalValText.textContent = formatINR(finalValue);
      
      // Update explanation text
      const descText = slider.nextElementSibling.nextElementSibling;
      if (descText) {
        descText.innerHTML = `
          Your money multiplied by <strong>${(finalValue / principal).toFixed(1)}x</strong>. 
          Notice how it grows from ${formatINR(17623)} (in 5 yrs) to ${formatINR(299599)} (in 30 yrs)!
        `;
      }
    });
  }
}

/* ==========================================================================
   Inflation Widget
   ========================================================================== */
function renderInflationWidget() {
  const principal = 10000;
  const inflationRate = 0.06; // 6% average inflation in India
  const purchasingPower = Math.round(principal / Math.pow(1 + inflationRate, inflationYears));

  return `
    <div class="interactive-lesson-widget">
      <h4 style="font-size: 14px; font-weight: 400; margin-bottom: 12px; color: var(--color-ink);">The Shrinking Value of Cash (₹10,000 in a Safe)</h4>
      
      <div class="form-group" style="margin-bottom: 16px;">
        <div class="form-label-row">
          <span class="form-label" style="font-size: 12px;">Time in the Future</span>
          <span class="form-value" id="learn-inf-years-val" style="font-size: 14px;">${inflationYears} Years</span>
        </div>
        <input type="range" id="learn-inf-years-slider" class="slider-input" min="1" max="20" step="1" value="${inflationYears}">
        <div class="goal-progress-labels" style="font-size: 10px;">
          <span>1 Year</span>
          <span>20 Years</span>
        </div>
      </div>

      <div class="sim-results-grid" style="grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="result-card" style="padding: 10px;">
          <div class="result-label" style="font-size: 11px;">Nominal Value</div>
          <div class="result-value" style="font-size: 15px;">₹10,000</div>
        </div>
        <div class="result-card" style="padding: 10px; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.25);">
          <div class="result-label" style="font-size: 11px; color: #fca5a5;">Real Purchasing Power</div>
          <div class="result-value" id="learn-inf-power-val" style="font-size: 16px; color: #fca5a5;">${formatINR(purchasingPower)}</div>
        </div>
      </div>

      <p style="font-size: 12px; color: var(--color-ink-mute); margin-top: 12px; line-height: 1.4; text-align: center;">
        In ${inflationYears} years, your ₹10,000 cash note will only buy what <strong>${formatINR(purchasingPower)}</strong> buys today. 
        It has lost <strong>${(100 - (purchasingPower/principal)*100).toFixed(0)}%</strong> of its value!
      </p>
    </div>
  `;
}

function bindInflationEvents() {
  const slider = document.getElementById('learn-inf-years-slider');
  const valText = document.getElementById('learn-inf-years-val');
  const powerText = document.getElementById('learn-inf-power-val');

  if (slider && valText && powerText) {
    slider.addEventListener('input', (e) => {
      inflationYears = parseInt(e.target.value);
      valText.textContent = `${inflationYears} Years`;
      
      const principal = 10000;
      const inflationRate = 0.06;
      const purchasingPower = Math.round(principal / Math.pow(1 + inflationRate, inflationYears));
      
      powerText.textContent = formatINR(purchasingPower);

      const descText = slider.nextElementSibling.nextElementSibling;
      if (descText) {
        descText.innerHTML = `
          In ${inflationYears} years, your ₹10,000 cash note will only buy what <strong>${formatINR(purchasingPower)}</strong> buys today. 
          It has lost <strong>${(100 - (purchasingPower/principal)*100).toFixed(0)}%</strong> of its value!
        `;
      }
    });
  }
}

/* ==========================================================================
   Market Fluctuation Widget
   ========================================================================== */
function renderFluctuationWidget() {
  return `
    <div class="interactive-lesson-widget">
      <h4 style="font-size: 14px; font-weight: 400; margin-bottom: 8px; color: var(--color-ink);">Market Noise Simulator</h4>
      <p style="font-size: 11px; color: var(--color-ink-mute); margin-bottom: 12px;">Trigger news events and see how the price responds.</p>
      
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button class="btn btn-secondary" id="btn-market-good" style="flex: 1; padding: 8px 12px; font-size: 12px; background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.2); color: var(--color-success);">
          📢 Positive News
        </button>
        <button class="btn btn-secondary" id="btn-market-bad" style="flex: 1; padding: 8px 12px; font-size: 12px; background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); color: var(--color-error);">
          📢 Negative News
        </button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-canvas-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--color-hairline);">
        <div>
          <span style="font-size: 11px; color: var(--color-ink-mute);">Share Price</span>
          <div id="learn-market-price" style="font-size: 20px; font-weight: 400; color: var(--color-ink);">₹${marketPrice}</div>
        </div>
        <div id="learn-market-news-feed" style="font-size: 12px; font-style: italic; color: var(--color-primary); max-width: 180px; text-align: right; line-height: 1.3;">
          Market is quiet. Stable earnings.
        </div>
      </div>
      
      <div style="margin-top: 12px; text-align: center;">
        <span style="font-size: 11px; color: var(--color-ink-mute);">Price History: </span>
        <span id="learn-market-history-spark" style="font-family: monospace; font-size: 12px; letter-spacing: 2px; color: var(--color-primary);"></span>
      </div>
    </div>
  `;
}

function updateSparkline() {
  const spark = document.getElementById('learn-market-history-spark');
  if (!spark) return;

  const min = Math.min(...marketHistory);
  const max = Math.max(...marketHistory);
  const range = max - min || 1;

  // Draw simple text-based sparkline
  const chars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const sparkText = marketHistory.map(price => {
    const idx = Math.floor(((price - min) / range) * (chars.length - 1));
    return chars[idx];
  }).join('');

  spark.textContent = sparkText;
}

function bindFluctuationEvents() {
  const goodBtn = document.getElementById('btn-market-good');
  const badBtn = document.getElementById('btn-market-bad');
  const priceText = document.getElementById('learn-market-price');
  const newsFeed = document.getElementById('learn-market-news-feed');

  const positiveNews = [
    { text: "Excellent monsoon, rural demand picks up!", change: 5 },
    { text: "RBI keeps interest rates stable.", change: 3 },
    { text: "Top tech company reports 20% profit jump.", change: 6 },
    { text: "Foreign investors pump ₹2000 Cr into India.", change: 4 },
    { text: "Inflation drops below RBI comfort band.", change: 4 }
  ];

  const negativeNews = [
    { text: "Global oil prices spike by 5%.", change: -4 },
    { text: "US Federal Reserve hints at rate hikes.", change: -3 },
    { text: "Rupee hits new low against USD.", change: -2 },
    { text: "Tech stock sell-off in NASDAQ.", change: -5 },
    { text: "Monsoon delayed in western India.", change: -4 }
  ];

  const applyNews = (newsArray) => {
    const news = newsArray[Math.floor(Math.random() * newsArray.length)];
    marketPrice = Math.max(10, marketPrice + news.change);
    marketHistory.push(marketPrice);
    if (marketHistory.length > 15) marketHistory.shift();

    if (priceText) priceText.textContent = `₹${marketPrice}`;
    if (newsFeed) {
      newsFeed.textContent = news.text;
      newsFeed.style.color = news.change > 0 ? "var(--color-success)" : "var(--color-error)";
    }
    updateSparkline();
  };

  if (goodBtn && badBtn) {
    goodBtn.addEventListener('click', () => applyNews(positiveNews));
    badBtn.addEventListener('click', () => applyNews(negativeNews));
  }

  updateSparkline();
}

/* ==========================================================================
   Main Tab Render & Bind
   ========================================================================== */

/**
 * Renders the active lesson in the container
 */
function renderActiveLesson() {
  const lesson = lessons[activeLessonId];
  const container = document.getElementById('learning-lesson-container');
  if (!container || !lesson) return;

  container.innerHTML = `
    <div class="learning-lesson-panel glass-panel">
      <div class="lesson-header">
        <span class="lesson-badge">${lesson.badge}</span>
        <h2 class="lesson-title">${lesson.title}</h2>
      </div>
      
      <div class="lesson-body">
        ${lesson.body}
      </div>

      <!-- Inject Interactive Widget -->
      ${lesson.renderWidget()}
    </div>
  `;

  lesson.bindWidgetEvents();
}

/**
 * Renders the HTML structure of the Learning Hub
 */
export function renderLearningTab() {
  const container = document.getElementById('learning-container');
  if (!container) return;

  container.innerHTML = `
    <div class="learning-layout">
      <!-- Left Menu -->
      <div class="learning-menu">
        <button class="learning-menu-btn ${activeLessonId === 'compounding' ? 'active' : ''}" data-lesson="compounding">
          1. Compounding Magic
        </button>
        <button class="learning-menu-btn ${activeLessonId === 'fluctuation' ? 'active' : ''}" data-lesson="fluctuation">
          2. Market Noise
        </button>
        <button class="learning-menu-btn ${activeLessonId === 'inflation' ? 'active' : ''}" data-lesson="inflation">
          3. Silent Thief (Inflation)
        </button>
      </div>

      <!-- Right Content Panel -->
      <div id="learning-lesson-container">
        <!-- Dynamically populated -->
      </div>
    </div>
  `;

  bindMenuEvents();
  renderActiveLesson();
}

function bindMenuEvents() {
  const buttons = document.querySelectorAll('.learning-menu-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      buttons.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');
      
      activeLessonId = btn.getAttribute('data-lesson');
      renderActiveLesson();
    });
  });
}

/**
 * Triggers switching to a specific lesson (e.g., from sidebar links)
 */
export function selectLesson(lessonId) {
  if (lessons[lessonId]) {
    activeLessonId = lessonId;
    
    // Switch tab if not on learning tab
    const learningTab = document.getElementById('tab-learning');
    if (learningTab) {
      learningTab.click();
    }
    
    renderLearningTab();
  }
}

/**
 * Initializes the learning module
 */
export function initLearning() {
  renderLearningTab();
  
  // Bind sidebar "Read More" button
  const sidebarReadMore = document.getElementById('sidebar-read-more');
  if (sidebarReadMore) {
    sidebarReadMore.addEventListener('click', () => {
      selectLesson('inflation');
    });
  }
}
