/* ==========================================================================
   TrueNorth Jargon Translator Module
   ========================================================================== */

// Jargon Dictionary
export const jargonDictionary = {
  SIP: {
    jargon: "SIP",
    simplified: "Automated Monthly Savings",
    explanation: "Systematic Investment Plan: Automatically investing a fixed amount of money every month to build a long-term habit and average out market ups and downs."
  },
  ELSS: {
    jargon: "ELSS",
    simplified: "Tax-Saving Stock Basket",
    explanation: "Equity Linked Savings Scheme: A special stock-based fund that saves you tax under Section 80C, with a mandatory 3-year lock-in period."
  },
  MUTUAL_FUND: {
    jargon: "Mutual Fund",
    simplified: "Managed Money Basket",
    explanation: "A pool of money collected from many investors that is managed by professionals who invest it in diversified stocks, bonds, or gold."
  },
  EXPENSE_RATIO: {
    jargon: "Expense Ratio",
    simplified: "Annual Management Fee",
    explanation: "The percentage of your total investment that the fund manager charges annually to cover operational costs (typically between 0.1% and 2.2%)."
  },
  DEBT_FUND: {
    jargon: "Debt Fund",
    simplified: "Low-Risk Loan Fund",
    explanation: "A fund that lends money to the government and stable companies. It behaves similarly to a bank Fixed Deposit, but is more tax-friendly if held long-term."
  },
  EQUITY_FUND: {
    jargon: "Equity Fund",
    simplified: "Growth-Oriented Stock Fund",
    explanation: "A fund that buys shares of companies. It is higher risk but aims to grow your money significantly over 5+ years."
  },
  CAGR: {
    jargon: "CAGR",
    simplified: "Average Yearly Growth",
    explanation: "Compound Annual Growth Rate: The smoothed annual rate at which your money grows, showing the power of compounding over time."
  },
  NIFTY_50: {
    jargon: "Nifty 50",
    simplified: "India's Top 50 Companies",
    explanation: "An index representing 50 of the largest, most stable companies in India (like Reliance, HDFC, Infosys). If India's economy grows, this index generally grows."
  },
  NAV: {
    jargon: "NAV",
    simplified: "Price Per Share",
    explanation: "Net Asset Value: The price of a single unit of a fund. Just like a stock price, it goes up when the underlying investments gain value."
  },
  ASSET_ALLOCATION: {
    jargon: "Asset Allocation",
    simplified: "Money Spreading Strategy",
    explanation: "Dividing your investments among different categories (like stocks, loans, and gold) to balance risk and returns based on your timeline."
  },
  DIVERSIFICATION: {
    jargon: "Diversification",
    simplified: "Spreading Your Risk",
    explanation: "The golden rule of investing: 'Don't put all your eggs in one basket.' Investing in different companies and sectors so a single failure doesn't ruin you."
  },
  KYC: {
    jargon: "KYC",
    simplified: "Identity Verification",
    explanation: "Know Your Customer: A government-mandated one-time check to verify your identity using Aadhaar/PAN before you can start investing."
  }
};

// Global state for translation
let isSimplified = false;

/**
 * Safely escapes HTML special characters to prevent DOM-based XSS
 * @param {*} str - Raw string or value to escape
 * @returns {string} Escaped HTML-safe string
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Helper to generate HTML for a jargon term
 * @param {string} key - Dictionary key
 * @param {string} [overrideText] - Optional custom text to display in Jargon mode
 * @returns {string} HTML string
 */
export function t(key, overrideText) {
  const item = jargonDictionary[key];
  if (!item) return escapeHTML(overrideText || key);
  
  const rawText = isSimplified ? item.simplified : (overrideText || item.jargon);
  const rawTooltip = isSimplified 
    ? `Original term: "${item.jargon}". ${item.explanation}` 
    : item.explanation;
  
  const className = isSimplified ? "jargon-term jargon-translated" : "jargon-term";

  return `<span class="${className}" data-jargon-key="${escapeHTML(key)}" data-override="${escapeHTML(overrideText || '')}">
    <span class="jargon-text-node">${escapeHTML(rawText)}</span>
    <span class="jargon-tooltip">${escapeHTML(rawTooltip)}</span>
  </span>`;
}

/**
 * Scans the DOM and updates all jargon elements
 * @param {boolean} simplified - Whether to show simplified terms
 */
export function translateDOM(simplified) {
  isSimplified = simplified;
  const elements = document.querySelectorAll('.jargon-term');
  
  elements.forEach(el => {
    const key = el.getAttribute('data-jargon-key');
    const override = el.getAttribute('data-override');
    const item = jargonDictionary[key];
    
    if (item) {
      const textNode = el.querySelector('.jargon-text-node');
      const tooltipNode = el.querySelector('.jargon-tooltip');
      
      if (simplified) {
        el.classList.add('jargon-translated');
        if (textNode) textNode.textContent = item.simplified;
        if (tooltipNode) tooltipNode.textContent = `Original term: "${item.jargon}". ${item.explanation}`;
      } else {
        el.classList.remove('jargon-translated');
        if (textNode) textNode.textContent = override || item.jargon;
        if (tooltipNode) tooltipNode.textContent = item.explanation;
      }
    }
  });

  // Update sidebar explanation
  const sidebarExplanation = document.getElementById('translator-explanation');
  if (sidebarExplanation) {
    if (simplified) {
      sidebarExplanation.innerHTML = `
        <strong>Simplified Mode is ACTIVE!</strong> We have translated all confusing financial terms across the application. 
        You can hover over any highlighted green term to see its original name and explanation.
      `;
    } else {
      sidebarExplanation.innerHTML = `
        Financial terms can be scary. Toggle the switch at the top to instantly translate terms like 
        <strong>SIP</strong>, <strong>ELSS</strong>, and <strong>Expense Ratio</strong> into plain English!
      `;
    }
  }

  // Update navbar status text
  const statusLabel = document.getElementById('translator-status');
  if (statusLabel) {
    statusLabel.textContent = simplified ? "Jargon: OFF" : "Jargon: ON";
    const control = statusLabel.closest('.translator-control');
    if (control) {
      if (simplified) {
        control.classList.add('active');
      } else {
        control.classList.remove('active');
      }
    }
  }
}

/**
 * Initializes the jargon translator
 * @param {Function} onChangeCallback - Optional callback when toggle changes
 */
export function initJargon(onChangeCallback) {
  const toggle = document.getElementById('jargon-toggle');
  if (toggle) {
    // Sync initial state
    isSimplified = !toggle.checked; // checked means Jargon is ON, so simplified is OFF
    translateDOM(isSimplified);

    toggle.addEventListener('change', (e) => {
      isSimplified = !e.target.checked;
      translateDOM(isSimplified);
      if (onChangeCallback) onChangeCallback(isSimplified);
    });
  }
}
