/* ==========================================================================
   Mock MFapi.in Service for Mutual Fund NAV Data
   Simulates the free MFapi.in service for fetching historical NAV data
   ========================================================================== */

/**
 * Service to fetch mutual fund NAV data
 * In a real implementation, this would call the actual MFapi.in API
 */
class MFapiService {
  /**
   * Fetch historical NAV data for a mutual fund scheme
   * @param {string} schemeCode - The mutual fund scheme code
   * @param {string} fromDate - Start date in DD-MM-YYYY format
   * @param {string} toDate - End date in DD-YYYY format
   * @returns {Promise<Array>} Array of NAV data objects
   */
  static async fetchSchemeNAV(schemeCode, fromDate, toDate) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data generation based on scheme type
    // In reality, this would parse the actual API response
    const mockData = this.generateMockNAVData(schemeCode, fromDate, toDate);

    // Simulate occasional API errors for realism
    if (Math.random() < 0.05) { // 5% chance of error
      throw new Error('Unable to fetch data. Please try again later.');
    }

    return mockData;
  }

  /**
   * Generate mock NAV data for demonstration/development
   * @param {string} schemeCode - Mutual fund scheme code
   * @param {string} fromDate - Start date
   * @param {string} toDate - End date
   * @returns {Array} Mock NAV data
   */
  static generateMockNAVData(schemeCode, fromDate, toDate) {
    // Parse dates
    const [fromDay, fromMonth, fromYear] = fromDate.split('-').map(Number);
    const [toDay, toMonth, toYear] = toDate.split('-').map(Number);

    const startDate = new Date(fromYear, fromMonth - 1, fromDay);
    const endDate = new Date(toYear, toMonth - 1, toDay);

    // Calculate number of days
    const timeDiff = endDate.getTime() - startDate.getTime();
    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Generate data points (weekly sampling for performance)
    const data = [];
    let currentDate = new Date(startDate);
    let nav = 100; // Starting NAV

    // Different growth patterns based on scheme type
    let annualGrowth = 0.12; // Default 12%
    if (schemeCode.includes('DEBT') || schemeCode.includes('LIQUID')) {
      annualGrowth = 0.065; // Debt funds ~6.5%
    } else if (schemeCode.includes('ELSS') || schemeCode.includes('EQUITY')) {
      annualGrowth = 0.14; // Equity funds ~14%
    } else if (schemeCode.includes('HYBRID') || schemeCode.includes('BALANCED')) {
      annualGrowth = 0.105; // Hybrid funds ~10.5%
    }

    const dailyGrowth = Math.pow(1 + annualGrowth, 1/365) - 1;

    while (currentDate <= endDate) {
      // Add some random volatility
      const volatility = (Math.random() - 0.5) * 0.02; // +/-1% daily volatility
      const dailyReturn = dailyGrowth + volatility;
      nav = Math.max(nav * (1 + dailyReturn), nav * 0.95); // Prevent negative NAV

      // Format date as DD-MM-YYYY
      const dateStr = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;

      data.push({
        nav: Math.round(nav * 100) / 100, // Round to 2 decimal places
        date: dateStr
      });

      // Move to next week for sampling
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return data;
  }

  /**
   * Search for mutual fund schemes
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching schemes
   */
  static async searchSchemes(query) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock search results
    const allSchemes = [
      { schemeCode: '120503', schemeName: 'SBI Bluechip Fund - Growth', category: 'EQUITY_LARGE_CAP' },
      { schemeCode: '120505', schemeName: 'HDFC Top 100 Fund - Growth', category: 'EQUITY_LARGE_CAP' },
      { schemeCode: '120507', schemeName: 'ICICI Prudential Bluechip Fund - Growth', category: 'EQUITY_LARGE_CAP' },
      { schemeCode: '120509', schemeName: 'Mirae Asset Large Cap Fund - Growth', category: 'EQUITY_LARGE_CAP' },
      { schemeCode: '120511', schemeName: 'Axis Bluechip Fund - Growth', category: 'EQUITY_LARGE_CAP' },
      { schemeCode: '120513', schemeName: 'SBI Small Cap Fund - Growth', category: 'EQUITY_SMALL_CAP' },
      { schemeCode: '120515', schemeName: 'HDFC Hybrid Equity Fund - Growth', category: 'HYBRID' },
      { schemeCode: '120517', schemeName: 'ICICI Prudential Equity & Debt Fund - Growth', category: 'HYBRID' },
      { schemeCode: '120519', schemeName: 'SBI Magnum Gilt Fund - Growth', category: 'DEBT_GILT' },
      { schemeCode: '120521', schemeName: 'HDFC Liquid Fund - Growth', category: 'DEBT_LIQUID' }
    ];

    if (!query) return allSchemes.slice(0, 5);

    const filtered = allSchemes.filter(scheme =>
      scheme.schemeName.toLowerCase().includes(query.toLowerCase()) ||
      scheme.schemeCode.includes(query)
    );

    return filtered.slice(0, 10);
  }
}

// ES module export
export { MFapiService };