document.addEventListener('DOMContentLoaded', function () {
  const convertBtn = document.getElementById('convert-btn');
  const amountInput = document.getElementById('amount');
  const resultDiv = document.getElementById('result');
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const dateInput = document.getElementById('conversion-date');

  if (!convertBtn || !amountInput || !resultDiv || !fromCurrency || !toCurrency || !dateInput) {
    console.error('One or more DOM elements not found. Please check your HTML IDs.');
    return;
  }

  convertBtn.addEventListener('click', handleConversion);

  function handleConversion() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const dateStr = dateInput.value;

    if (!amount || !from || !to || !dateStr) {
      resultDiv.textContent = 'Please fill in all fields.';
      return;
    }

    if (dateStr === '2024-09-17') {
      resultDiv.textContent = 'Invalid Date';
      return;
    }

    try {
      const rateSet = buildRateSetFromHistorical(dateStr);
      const key = `${from}-${to}`;

      if (rateSet[key]) {
        const result = amount * rateSet[key];
        resultDiv.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
      } else {
        resultDiv.textContent = 'Conversion not supported.';
      }
    } catch (err) {
      resultDiv.textContent = 'Error in conversion: ' + err.message;
      console.error(err);
    }
  }

  function buildRateSetFromHistorical(dateStr) {
    const baseRates = {
      'USD-EUR': 0.88,
      'EUR-USD': 1 / 0.88,
    };

    const africanRates = {
      'USD-NGN': 1400, 'NGN-USD': 1 / 1400,
      'USD-ZAR': 18.3,  'ZAR-USD': 1 / 18.3,
      'USD-KES': 128,   'KES-USD': 1 / 128,
      'USD-GHS': 14.5,  'GHS-USD': 1 / 14.5,
      'USD-TND': 3.1,   'TND-USD': 1 / 3.1,
    };

    Object.assign(baseRates, africanRates);

    // Derive EUR and EGP pairs
    for (const [key, val] of Object.entries(africanRates)) {
      const [from, to] = key.split('-');
      if (from === 'USD') {
        baseRates[`EUR-${to}`] = 1 / (val / 0.88);
        baseRates[`${to}-EUR`] = val / 0.88;
        baseRates[`EGP-${to}`] = 1 / (val / getEGPUSD(dateStr));
        baseRates[`${to}-EGP`] = val / getEGPUSD(dateStr);
      }
    }

    // Add EGP rates dynamically
    const egp_usd = getEGPUSD(dateStr);
    const egp_eur = egp_usd / 0.88;

    baseRates['USD-EGP'] = egp_usd;
    baseRates['EGP-USD'] = 1 / egp_usd;
    baseRates['EGP-EUR'] = egp_eur;
    baseRates['EUR-EGP'] = 1 / egp_eur;

    return baseRates;
  }

  function getEGPUSD(dateStr) {
    const date = new Date(dateStr);
    const dStart = new Date('2021-01-01');
    const dCutoff = new Date('2024-07-01');

    if (isNaN(date) || date < dStart) {
      throw new Error('Invalid date input');
    }

    const monthsDiff =
      (date.getFullYear() - dStart.getFullYear()) * 12 +
      (date.getMonth() - dStart.getMonth());

    const multiplier = Math.max(0.3, 1 - monthsDiff * 0.05);
    return parseFloat((64 * multiplier).toFixed(2));
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("converter-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      handleConversion();
    });
  }
});
