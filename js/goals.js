/* ==========================================================================
   TrueNorth Goals & Portfolio Mapping Module
   ========================================================================== */

import { t, escapeHTML } from './jargon.js';

// Pre-populated active goals
let goals = [
  {
    id: 1,
    title: "Emergency Shield",
    category: "shield",
    icon: "🛡️",
    targetAmount: 200000,
    currentAmount: 80000,
    years: 2,
    sipAmount: 7800,
    fundType: "DEBT_FUND",
    allocationLabel: "Low-Risk Debt Funds",
    progress: 40
  },
  {
    id: 2,
    title: "Dream Home in Pune",
    category: "home",
    icon: "🏠",
    targetAmount: 2500000,
    currentAmount: 375000,
    years: 8,
    sipAmount: 15500,
    fundType: "EQUITY_FUND",
    allocationLabel: "Growth Equity Funds",
    progress: 15
  }
];

// Wizard State
let wizardStep = 1;
let selectedCategory = "";
let goalName = "";
let targetAmount = 500000;
let timeHorizon = 5;

// Constants for asset classes based on time horizon
const PORTFOLIO_CONFIGS = {
  SHORT: {
    rate: 0.065, // 6.5% average return for Debt
    fundType: "DEBT_FUND",
    label: "Low-Risk Loan Funds (Debt)",
    desc: "Best for short-term goals. Focuses on capital safety and steady returns."
  },
  MEDIUM: {
    rate: 0.10, // 10% average return for Hybrid
    fundType: "MUTUAL_FUND", // Representing Hybrid/Balanced
    label: "Balanced Mixed Funds (Hybrid)",
    desc: "Best for medium-term goals. A mix of stocks and loans to balance growth and safety."
  },
  LONG: {
    rate: 0.135, // 13.5% average return for Equity
    fundType: "EQUITY_FUND",
    label: "Growth Stock Baskets (Equity)",
    desc: "Best for long-term goals. High growth potential through India's top companies."
  }
};

/**
 * Gets the portfolio configuration based on the timeline (years)
 * @param {number} years 
 */
function getPortfolioConfig(years) {
  if (years < 3) return PORTFOLIO_CONFIGS.SHORT;
  if (years <= 5) return PORTFOLIO_CONFIGS.MEDIUM;
  return PORTFOLIO_CONFIGS.LONG;
}

/**
 * Calculates the monthly SIP required using compound interest
 * SIP = Target * r / ((1 + r)^n - 1)
 */
export function calculateRequiredSIP(target, years, rate) {
  if (!target || target <= 0 || !years || years <= 0 || !rate || rate <= 0) {
    return 0;
  }
  const r = rate / 12;
  const n = years * 12;
  const denom = Math.pow(1 + r, n) - 1;
  if (denom <= 0) return Math.round(target / n);
  const sip = (target * r) / denom;
  return Number.isFinite(sip) ? Math.round(sip) : 0;
}

/**
 * Formats currency in Indian Style (Lakhs, Crores)
 * e.g., 100000 -> ₹1,00,000
 */
export function formatINR(number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(number);
}

/**
 * Renders all active goals in the dashboard
 */
export function renderGoals() {
  const container = document.getElementById('goals-container');
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="empty-state glass-panel">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <h3 class="empty-title">No Goals Created Yet</h3>
        <p class="empty-text">TrueNorth is built around your life goals. Create your first goal bucket to see how simple investing can be.</p>
        <button class="btn btn-primary" id="btn-create-goal-empty">Create Your First Goal</button>
      </div>
    `;
    
    // Add event listener to empty state button
    const emptyBtn = document.getElementById('btn-create-goal-empty');
    if (emptyBtn) {
      emptyBtn.addEventListener('click', openGoalModal);
    }
    return;
  }

  container.innerHTML = goals.map(goal => {
    const cardClass = goal.years < 3 ? 'goal-short' : (goal.years <= 5 ? 'goal-medium' : 'goal-long');
    
    return `
      <div class="goal-card glass-panel ${cardClass}" data-id="${goal.id}">
        <div class="goal-card-header">
          <div class="goal-icon">${goal.icon}</div>
          <div class="goal-meta">
            <span class="badge badge-plain">${goal.years} Years</span>
          </div>
        </div>
        <div>
          <h3 class="goal-title">${escapeHTML(goal.title)}</h3>
          <div class="goal-target">Target: ${formatINR(goal.targetAmount)}</div>
        </div>
        
        <div class="goal-progress-container">
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${goal.progress}%"></div>
          </div>
          <div class="goal-progress-labels">
            <span>Saved: ${formatINR(goal.currentAmount)}</span>
            <span>${goal.progress}%</span>
          </div>
        </div>
        
        <div class="goal-card-footer">
          <div class="goal-allocation">
            <div class="goal-allocation-dot"></div>
            <span>${t(goal.fundType, goal.allocationLabel)}</span>
          </div>
          <div>
            <div class="goal-sip-value">${formatINR(goal.sipAmount)}/mo</div>
            <div class="goal-sip-label">Required ${t('SIP')}</div>
          </div>
        </div>
        
        <button class="btn-delete-goal" data-id="${goal.id}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
  }).join('');

  // Attach delete listeners
  container.querySelectorAll('.btn-delete-goal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      deleteGoal(id);
    });
  });
}

/**
 * Deletes a goal
 */
function deleteGoal(id) {
  goals = goals.filter(g => g.id !== id);
  renderGoals();
}

/**
 * Opens the goal creation modal and resets the wizard
 */
export function openGoalModal() {
  const modal = document.getElementById('goal-modal');
  if (modal) {
    wizardStep = 1;
    selectedCategory = "";
    goalName = "";
    targetAmount = 500000;
    timeHorizon = 5;
    
    renderWizard();
    modal.classList.add('active');
  }
}

/**
 * Closes the goal creation modal
 */
export function closeGoalModal() {
  const modal = document.getElementById('goal-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Renders the wizard steps and forms inside the modal
 */
function renderWizard() {
  const container = document.getElementById('goal-wizard-container');
  if (!container) return;

  const portfolio = getPortfolioConfig(timeHorizon);
  const requiredSip = calculateRequiredSIP(targetAmount, timeHorizon, portfolio.rate);

  container.innerHTML = `
    <!-- Step Progress Indicator -->
    <div class="wizard-steps">
      <div class="wizard-step ${wizardStep >= 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}">1</div>
      <div class="wizard-step ${wizardStep >= 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}">2</div>
      <div class="wizard-step ${wizardStep >= 3 ? 'active' : ''}">3</div>
    </div>

    <!-- Step 1: Select Category -->
    <div class="wizard-panel ${wizardStep === 1 ? 'active' : ''}">
      <h2 class="wizard-title">What is your investment goal?</h2>
      <p class="wizard-subtitle">We'll map your goal to the right financial strategy.</p>
      
      <div class="card-selector">
        <div class="select-card ${selectedCategory === 'home' ? 'active' : ''}" data-cat="home" data-default-name="Dream Home">
          <div class="select-card-icon">🏠</div>
          <div class="select-card-title">Buy a Home</div>
          <div class="select-card-desc">Save for down payment or buying property. Typically 5+ years.</div>
        </div>
        <div class="select-card ${selectedCategory === 'shield' ? 'active' : ''}" data-cat="shield" data-default-name="Emergency Shield">
          <div class="select-card-icon">🛡️</div>
          <div class="select-card-title">Emergency Shield</div>
          <div class="select-card-desc">A safety net for unforeseen circumstances. Typically 1-2 years.</div>
        </div>
        <div class="select-card ${selectedCategory === 'edu' ? 'active' : ''}" data-cat="edu" data-default-name="Higher Education">
          <div class="select-card-icon">🎓</div>
          <div class="select-card-title">Child's Education</div>
          <div class="select-card-desc">Secure funds for university or school fees. Typically 7+ years.</div>
        </div>
        <div class="select-card ${selectedCategory === 'retire' ? 'active' : ''}" data-cat="retire" data-default-name="Retirement Fund">
          <div class="select-card-icon">🚀</div>
          <div class="select-card-title">Retire Rich</div>
          <div class="select-card-desc">Build long-term wealth for financial freedom. Typically 10+ years.</div>
        </div>
      </div>
    </div>

    <!-- Step 2: Set Amount and Timeline -->
    <div class="wizard-panel ${wizardStep === 2 ? 'active' : ''}">
      <h2 class="wizard-title">Set your target</h2>
      <p class="wizard-subtitle">How much do you need, and by when?</p>
      
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="form-group">
          <label class="form-label" for="goal-name-input">Goal Name</label>
          <input type="text" id="goal-name-input" class="input-text" value="${escapeHTML(goalName)}" placeholder="e.g. My Mumbai Flat">
        </div>

        <div class="form-group">
          <div class="form-label-row">
            <span class="form-label">Target Amount</span>
            <span class="form-value" id="wizard-amount-val">${formatINR(targetAmount)}</span>
          </div>
          <input type="range" id="wizard-amount-slider" class="slider-input" min="50000" max="10000000" step="50000" value="${targetAmount}">
          <div class="goal-progress-labels" style="margin-top: 4px;">
            <span>₹50,000</span>
            <span>₹1 Crore</span>
          </div>
        </div>

        <div class="form-group">
          <div class="form-label-row">
            <span class="form-label">Time Horizon</span>
            <span class="form-value" id="wizard-years-val">${timeHorizon} Years</span>
          </div>
          <input type="range" id="wizard-years-slider" class="slider-input" min="1" max="15" step="1" value="${timeHorizon}">
          <div class="goal-progress-labels" style="margin-top: 4px;">
            <span>1 Year</span>
            <span>15 Years</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Portfolio Preview & Mapping -->
    <div class="wizard-panel ${wizardStep === 3 ? 'active' : ''}">
      <h2 class="wizard-title">Your TrueNorth Strategy</h2>
      <p class="wizard-subtitle">We've translated your goal timeline into a custom allocation.</p>
      
      <div class="allocation-preview-box">
        <div class="preview-row">
          <span class="preview-label">Timeline Category</span>
          <span class="preview-value" style="color: #a5b4fc; font-weight: 700;">
            ${timeHorizon < 3 ? 'Short-Term' : (timeHorizon <= 5 ? 'Medium-Term' : 'Long-Term')}
          </span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Recommended Allocation</span>
          <span class="preview-value">${t(portfolio.fundType, portfolio.label)}</span>
        </div>
        <div class="preview-row" style="align-items: flex-start;">
          <span class="preview-label" style="margin-top: 2px;">Strategy Info</span>
          <span class="preview-value" style="font-weight: 400; font-size: 13px; color: var(--color-ink-mute); text-align: right; max-width: 250px;">
            ${portfolio.desc}
          </span>
        </div>
        
        <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0;"></div>
        
        <div class="preview-row">
          <span class="preview-label">Target Goal</span>
          <span class="preview-value">${escapeHTML(goalName || 'My Goal')} (${formatINR(targetAmount)})</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Required Monthly Savings (${t('SIP')})</span>
          <span class="preview-value highlight">${formatINR(requiredSip)}/mo</span>
        </div>
      </div>
      
      <p style="font-size: 12px; color: var(--color-ink-mute); margin-top: 16px; text-align: center; line-height: 1.5;">
        By continuing, you are setting up a sandbox bucket. No real money will be transacted. 
        You can simulate and track this portfolio with zero risk.
      </p>
    </div>

    <!-- Wizard Navigation Footer -->
    <div class="wizard-footer">
      <button class="btn btn-secondary" id="wizard-prev-btn" style="visibility: ${wizardStep === 1 ? 'hidden' : 'visible'};">Back</button>
      <button class="btn btn-primary" id="wizard-next-btn">
        <span>${wizardStep === 3 ? 'Create Bucket' : 'Continue'}</span>
      </button>
    </div>
  `;

  setupWizardEventListeners();
}

/**
 * Binds event listeners to dynamically rendered wizard elements
 */
function setupWizardEventListeners() {
  // Step 1 Category Selection
  const cards = document.querySelectorAll('.select-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      selectedCategory = card.getAttribute('data-cat');
      goalName = card.getAttribute('data-default-name');
      
      // Auto-advance to step 2 for smooth UX
      wizardStep = 2;
      renderWizard();
    });
  });

  // Step 2 Inputs
  const nameInput = document.getElementById('goal-name-input');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      goalName = e.target.value;
    });
  }

  const amountSlider = document.getElementById('wizard-amount-slider');
  const amountVal = document.getElementById('wizard-amount-val');
  if (amountSlider && amountVal) {
    amountSlider.addEventListener('input', (e) => {
      targetAmount = parseInt(e.target.value);
      amountVal.textContent = formatINR(targetAmount);
    });
  }

  const yearsSlider = document.getElementById('wizard-years-slider');
  const yearsVal = document.getElementById('wizard-years-val');
  if (yearsSlider && yearsVal) {
    yearsSlider.addEventListener('input', (e) => {
      timeHorizon = parseInt(e.target.value);
      yearsVal.textContent = `${timeHorizon} Years`;
    });
  }

  // Navigation buttons
  const prevBtn = document.getElementById('wizard-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (wizardStep > 1) {
        wizardStep--;
        renderWizard();
      }
    });
  }

  const nextBtn = document.getElementById('wizard-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (wizardStep < 3) {
        // Validation for step 1
        if (wizardStep === 1 && !selectedCategory) {
          alert("Please select a goal type to continue.");
          return;
        }
        wizardStep++;
        renderWizard();
      } else {
        // Finish wizard and create goal
        createNewGoal();
      }
    });
  }
}

/**
 * Creates a new goal and adds it to the state
 */
function createNewGoal() {
  const portfolio = getPortfolioConfig(timeHorizon);
  const requiredSip = calculateRequiredSIP(targetAmount, timeHorizon, portfolio.rate);
  
  const categoryIcons = {
    home: "🏠",
    shield: "🛡️",
    edu: "🎓",
    retire: "🚀"
  };

  const newGoal = {
    id: Date.now(),
    title: (goalName && goalName.trim()) ? goalName.trim() : "My Savings Goal",
    category: selectedCategory || "custom",
    icon: categoryIcons[selectedCategory] || "🎯",
    targetAmount: targetAmount,
    currentAmount: 0, // Starts at zero
    years: timeHorizon,
    sipAmount: requiredSip,
    fundType: portfolio.fundType,
    allocationLabel: portfolio.label,
    progress: 0
  };

  goals.push(newGoal);
  renderGoals();
  closeGoalModal();

  // Highlight the newly created goal card
  setTimeout(() => {
    const newCard = document.querySelector(`.goal-card[data-id="${newGoal.id}"]`);
    if (newCard) {
      newCard.style.outline = "2px solid var(--color-primary)";
      newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        newCard.style.transition = "outline 1s";
        newCard.style.outline = "2px solid transparent";
      }, 2000);
    }
  }, 100);
}

/**
 * Initializes the goals module
 */
export function initGoals() {
  const createBtn = document.getElementById('btn-create-goal');
  if (createBtn) {
    createBtn.addEventListener('click', openGoalModal);
  }

  const closeBtn = document.getElementById('btn-close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeGoalModal);
  }

  // Close modal when clicking overlay
  const modal = document.getElementById('goal-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeGoalModal();
      }
    });
  }

  // Initial render of dashboard goals
  renderGoals();
}
