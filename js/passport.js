/* ==========================================================================
   TrueNorth Passport (Global Window) Module
   ========================================================================== */

import { t } from './jargon.js';

// State
let showInINR = true;
const USD_TO_INR_RATE = 83.50;

// Top Global Assets
const globalAssets = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    usdPrice: 189.30,
    change: 1.45,
    isPositive: true
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    usdPrice: 421.90,
    change: 0.82,
    isPositive: true
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc. (Google)",
    usdPrice: 173.50,
    change: -0.34,
    isPositive: false
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    usdPrice: 187.20,
    change: 3.12,
    isPositive: true
  },
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    usdPrice: 472.60,
    change: 0.78,
    isPositive: true
  }
];

/**
 * Formats USD currency
 */
function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Formats INR currency
 */
function formatINRLocal(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Renders the stock cards list
 */
function renderStockCards() {
  const container = document.getElementById('passport-stock-list');
  if (!container) return;

  container.innerHTML = globalAssets.map(asset => {
    const price = showInINR ? asset.usdPrice * USD_TO_INR_RATE : asset.usdPrice;
    const formattedPrice = showInINR ? formatINRLocal(price) : formatUSD(price);
    
    const changeClass = asset.isPositive ? 'positive' : 'negative';
    const changeIcon = asset.isPositive ? '▲' : '▼';
    
    return `
      <div class="stock-card glass-panel">
        <div class="stock-header">
          <div>
            <span class="stock-symbol">${asset.symbol}</span>
            <div class="stock-name">${asset.name}</div>
          </div>
          <span class="badge ${asset.symbol === 'VOO' ? 'badge-plain' : 'badge-jargon'}" style="font-size: 9px; padding: 2px 6px;">
            ${asset.symbol === 'VOO' ? 'US ETF' : 'US Stock'}
          </span>
        </div>
        <div>
          <div class="stock-price">${formattedPrice}</div>
          <div class="stock-change ${changeClass}">
            <span>${changeIcon} ${Math.abs(asset.change).toFixed(2)}%</span>
            <span style="font-size: 10px; color: var(--color-ink-mute); font-weight: 400;">Today</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renders the HTML structure for the Passport tab
 */
export function renderPassportTab() {
  const container = document.getElementById('passport-container');
  if (!container) return;

  container.innerHTML = `
    <div class="passport-layout">
      <!-- Left: Stock Tracking & Currency Toggle -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 18px; font-weight: 400; color: var(--color-ink);">International Markets Window</h3>
            <p style="font-size: 13px; color: var(--color-ink-mute); margin-top: 4px;">Convert prices to see how they fit your budget.</p>
          </div>
          
          <div class="translator-control" style="padding: 6px 12px;">
            <span class="translator-label" id="currency-status" style="min-width: 60px; font-size: 12px;">Show in INR</span>
            <label class="switch">
              <input type="checkbox" id="currency-toggle" ${showInINR ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <div class="stock-grid" id="passport-stock-list">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- Right: Educational Passport Insights -->
      <div class="passport-insights">
        
        <!-- Insight 1: Rupee Depreciation -->
        <div class="insight-card glass-panel">
          <h4 class="insight-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>The Rupee Shield (Depreciation)</span>
          </h4>
          <p class="insight-desc">
            Historically, the Indian Rupee (INR) has depreciated against the US Dollar (USD) by about <strong>3% to 4% per year</strong>. 
            <br><br>
            When you invest in US assets, your investment is in Dollars. Even if a stock price stays completely flat, <strong>your wealth in Rupees grows</strong> because the Dollar is strengthening. This acts as a natural hedge for your future international expenses (like travel or study).
          </p>
        </div>

        <!-- Insight 2: Global Diversification -->
        <div class="insight-card glass-panel">
          <h4 class="insight-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>True ${t('DIVERSIFICATION', 'Global Diversification')}</span>
          </h4>
          <p class="insight-desc">
            India represents less than 3% of the global stock market. By investing only locally, you miss out on the growth of global giants that power your daily life (like Microsoft, Google, and Apple).
            <br><br>
            Allocating 10-15% of your ${t('ASSET_ALLOCATION', 'portfolio')} to US markets ensures that if the Indian market goes through a local slump, your global investments keep your overall portfolio stable.
          </p>
        </div>

        <!-- Insight 3: Fractional Shares -->
        <div class="insight-card glass-panel">
          <h4 class="insight-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Fractional Investing (No Barriers)</span>
          </h4>
          <p class="insight-desc">
            Confused why one share of Microsoft costs over ₹35,000? With TrueNorth Passport, you don't need to buy a whole share. 
            <br><br>
            Our broker-partner integration will support <strong>fractional investing</strong>. You can buy 0.01 shares of Microsoft or Apple with just <strong>₹500</strong>. It makes global ownership accessible to every Indian household.
          </p>
        </div>

      </div>
    </div>
  `;

  bindPassportEvents();
  renderStockCards();
}

/**
 * Binds events for the currency toggle
 */
function bindPassportEvents() {
  const toggle = document.getElementById('currency-toggle');
  const status = document.getElementById('currency-status');

  if (toggle) {
    toggle.addEventListener('change', (e) => {
      showInINR = e.target.checked;
      if (status) {
        status.textContent = showInINR ? "Show in INR" : "Show in USD";
      }
      renderStockCards();
    });
  }
}

/**
 * Initializes the passport module
 */
export function initPassport() {
  renderPassportTab();
}
