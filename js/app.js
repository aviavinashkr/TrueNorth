/* ==========================================================================
   TrueNorth Main Application Orchestrator
   ========================================================================== */

import { initJargon, translateDOM } from './jargon.js';
import { initGoals, renderGoals } from './goals.js';
import { initSimulator, updateSimulator } from './simulator.js';
import { initPassport, renderPassportTab } from './passport.js';
import { initLearning, renderLearningTab } from './learning.js';

// App State
let currentTab = "dashboard";
let jargonSimplified = false;

// Tab Routing Registry
const tabHandlers = {
  "dashboard": renderGoals,
  "simulator": updateSimulator,
  "passport": renderPassportTab,
  "learning": renderLearningTab
};

/**
 * Handles tab switching logic
 * @param {string} tabId 
 */
function switchTab(tabId) {
  if (currentTab === tabId) return;
  currentTab = tabId;

  // Update navbar active state
  document.querySelectorAll('.nav-tab').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update tab content visibility
  document.querySelectorAll('.tab-content').forEach(section => {
    if (section.id === `${tabId}-section`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Module specific updates when switching
  if (tabHandlers[tabId]) {
    tabHandlers[tabId]();
  }

  // Re-apply jargon translation state to newly rendered elements
  translateDOM(jargonSimplified);
}

/**
 * Binds global navigation events
 */
function bindNavigationEvents() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Jargon Translator first (defines global state)
  initJargon((simplified) => {
    jargonSimplified = simplified;
    
    // Refresh the active tab elements to translate them
    if (tabHandlers[currentTab]) {
      tabHandlers[currentTab]();
    }
  });

  // 2. Initialize sub-modules
  initGoals();
  initSimulator();
  initPassport();
  initLearning();

  // 3. Bind navigation
  bindNavigationEvents();

  console.log("TrueNorth (India Edition) Phase 1 Prototype Initialized Successfully!");
});
