/**
 * FxChange Real-time Multi-Currency Conversion Logic Engine
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- CORE SYSTEM DATA STABILIZATION FALLBACK (OFFLINE MATRIX SNAPSHOT) ---
  const snapshotFallbackRates = {
    "USD": 1.0, "EUR": 0.92, "GBP": 0.78, "INR": 83.45, "JPY": 156.20,
    "AUD": 1.51, "CAD": 1.37, "CHF": 0.90, "CNY": 7.24, "SGD": 1.35
  };

  const isoSymbolMapping = {
    "USD": "$", "EUR": "€", "GBP": "£", "INR": "₹", "JPY": "¥",
    "AUD": "A$", "CAD": "C$", "CHF": "CHF", "CNY": "¥", "SGD": "S$"
  };

  // Runtime Global Memory Cache States Object
  let activeExchangeTable = { ...snapshotFallbackRates };
  let activeBaseCurrency = "USD";

  // --- REQUISITION CACHED INTERFACE DOM NODES ---
  const amountInput = document.getElementById('amount-input');
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  const sourceSymbolAddon = document.getElementById('source-symbol');
  
  const rateBaselineEquation = document.getElementById('rate-baseline-equation');
  const outputAmountDisplay = document.getElementById('output-amount-display');
  const outputTickerDisplay = document.getElementById('output-ticker-display');
  
  const apiErrorBanner = document.getElementById('api-error-banner');
  const statusPulseDot = document.getElementById('status-dot');
  const ledgerTimestampStatus = document.getElementById('ledger-timestamp-status');
  const btnSwap = document.getElementById('btn-swap');

  /**
   * Application Pipeline Operational Inception Module
   */
  async function init() {
    buildDropdownDomOptions();
    setupConverterEventWiring();
    await dispatchExchangeRatesFetchAPI();
    executeCoreConversionCalculation();
  }

  /**
   * Map Available Memory Dictionary Assets into Selection Node Templates
   */
  function buildDropdownDomOptions() {
    const alphabeticalKeys = Object.keys(snapshotFallbackRates).sort();
    
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';

    alphabeticalKeys.forEach(currencyTicker => {
      const optionFrom = document.createElement('option');
      optionFrom.value = currencyTicker;
      optionFrom.textContent = currencyTicker;
      if (currencyTicker === "USD") optionFrom.selected = true;

      const optionTo = document.createElement('option');
      optionTo.value = currencyTicker;
      optionTo.textContent = currencyTicker;
      if (currencyTicker === "INR") optionTo.selected = true;

      fromCurrencySelect.appendChild(optionFrom);
      toCurrencySelect.appendChild(optionTo);
    });
  }

  /**
   * Structural Frame Listeners Binding Assignment Track
   */
  function setupConverterEventWiring() {
    amountInput.addEventListener('input', executeCoreConversionCalculation);
    fromCurrencySelect.addEventListener('change', () => {
      synchronizeSourceCurrencyAddonSymbol();
      executeCoreConversionCalculation();
    });
    toCurrencySelect.addEventListener('change', executeCoreConversionCalculation);
    btnSwap.addEventListener('click', executionAxisSwapPipelineToggle);
  }

  /**
   * Real-Time Core Exchange Matrix Data Stream Ingestion Processing Pipeline
   */
  async function dispatchExchangeRatesFetchAPI() {
    try {
      // open.er-api.com is fully open-source, client-side unblocked, and requires zero tracking keys
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('API server boundary verification failure.');

      const payload = await response.json();
      
      // Ingest the raw data layer mapping vectors
      activeExchangeTable = payload.rates;
      activeBaseCurrency = payload.base_code;

      // Transition structural tracking status elements to fully online
      statusPulseDot.className = 'status-pulse-dot online';
      
      const updateDate = new Date(payload.time_last_update_utc);
      ledgerTimestampStatus.textContent = `Index Live // Updated: ${updateDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      apiErrorBanner.classList.add('hidden');

    } catch (error) {
      console.warn('Network layer unreachable. Dropping down context state to internal snapshot frames: ', error);
      
      // Activate fallbacks, clear status indices alerts
      statusPulseDot.className = 'status-pulse-dot fallback';
      ledgerTimestampStatus.textContent = 'Offline Engine Mode // Utilizing Local Snapshot';
      apiErrorBanner.classList.remove('hidden');
    }
  }

  /**
   * Algorithmic Cross-Conversion Formula Mathematical Engine Block
   */
  function executeCoreConversionCalculation() {
    const rawSourceAmount = parseFloat(amountInput.value);
    
    // Boundary check input parameters
    if (isNaN(rawSourceAmount) || rawSourceAmount < 0) {
      outputAmountDisplay.textContent = "0.00";
      return;
    }

    const sourceTicker = fromCurrencySelect.value;
    const targetTicker = toCurrencySelect.value;

    // Cross-Currency Matrix Logic (Converting using a unified base anchor coefficient)
    const amountInBaseUSD = rawSourceAmount / activeExchangeTable[sourceTicker];
    const finalCalculatedOutput = amountInBaseUSD * activeExchangeTable[targetTicker];

    // Compute localized unit baseline equivalence formula string representation
    const operationalUnitBaseUSD = 1 / activeExchangeTable[sourceTicker];
    const operationalUnitTargetResult = operationalUnitBaseUSD * activeExchangeTable[targetTicker];

    // Render output layers into localized typography masks
    rateBaselineEquation.textContent = `1 ${sourceTicker} = ${operationalUnitTargetResult.toFixed(4)} ${targetTicker}`;
    outputAmountDisplay.textContent = finalCalculatedOutput.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    outputTickerDisplay.textContent = targetTicker;
  }

  /**
   * Toggle and Reverse Selected Layout Matrix Navigation Nodes
   */
  function executionAxisSwapPipelineToggle() {
    const auxiliaryIntermediateHolder = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = auxiliaryIntermediateHolder;

    synchronizeSourceCurrencyAddonSymbol();
    executeCoreConversionCalculation();
  }

  /**
   * Sync prepend character markers to align with standard international symbol keys
   */
  function synchronizeSourceCurrencyAddonSymbol() {
    const currentFromValue = fromCurrencySelect.value;
    sourceSymbolAddon.textContent = isoSymbolMapping[currentFromValue] || "$";
  }

  // Fire up initialization core sequence configurations
  init();
});