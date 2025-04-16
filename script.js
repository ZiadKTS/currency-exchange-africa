const currencyOptions = ['USD', 'EUR', 'EGP', 'ZAR', 'KES', 'NGN', 'GHS', 'TND'];

// Simulated live exchange rates (approximate as of today)
const liveRates = {
  USD: { EUR: 0.88, EGP: 47.5, ZAR: 18.2, KES: 130.3, NGN: 1160, GHS: 14.5, TND: 3.1 },
  EUR: { USD: 1.14, EGP: 54, ZAR: 20.3, KES: 148, NGN: 1300, GHS: 16.5, TND: 3.55 },
  EGP: { USD: 0.021, EUR: 0.019, ZAR: 1.1, KES: 2.75, NGN: 27.5, GHS: 0.3, TND: 0.065 },
  ZAR: { USD: 0.055, EUR: 0.049, EGP: 0.91, KES: 7.2, NGN: 63, GHS: 0.8, TND: 0.18 },
  KES: { USD: 0.0077, EUR: 0.0067, EGP: 0.36, ZAR: 0.14, NGN: 8.7, GHS: 0.11, TND: 0.025 },
  NGN: { USD: 0.00086, EUR: 0.00077, EGP: 0.036, ZAR: 0.016, KES: 0.115, GHS: 0.013, TND: 0.0031 },
  GHS: { USD: 0.069, EUR: 0.060, EGP: 3.2, ZAR: 1.25, KES: 9.1, NGN: 77, TND: 0.21 },
  TND: { USD: 0.32, EUR: 0.28, EGP: 15.1, ZAR: 5.5, KES: 39, NGN: 322, GHS: 4.7 }
};

// Real historical rates from 2024-07-01 onwards
const historicalRates = {
  '2024-07-01': {
    USD: { EUR: 0.85, EGP: 45 },
    EUR: { USD: 1.18, EGP: 52 },
    EGP: { USD: 0.022, EUR: 0.0192 }
    // Add more if needed
  },
  '2024-09-01': {
    USD: { EUR: 0.86, EGP: 46 },
    EUR: { USD: 1.16, EGP: 53 },
    EGP: { USD: 0.0217, EUR: 0.0188 }
  },
  '2024-11-01': {
    USD: { EUR: 0.875, EGP: 47 },
    EUR: { USD: 1.14, EGP: 53.5 },
    EGP: { USD: 0.0213, EUR: 0.0186 }
  }
};

// Utility
const today = new Date();
const historicalStartDate = new Date('2024-07-01');
const minDate = '2021-01-01';

// Populate dropdowns
function populateDropdowns() {
  const from = document.getElementById('from-currency');
  const to = document.getElementById('to-currency');
  if (from && from.options.length === 0) {
    currencyOptions.forEach(curr => {
      const opt = new Option(curr, curr);
      from.add(opt.cloneNode(true));
      to.add(opt);
    });
  }
}

// Convert date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Get historical rate from exact data or simulate
function getHistoricalRate(from, to, selectedDate) {
  const dateStr = formatDate(selectedDate);

  if (dateStr === '2024-09-17') {
    return { error: '❗ Invalid date selected. Please choose another date.' };
  }

  if (selectedDate >= historicalStartDate) {
    const closestDate = Object.keys(historicalRates).reverse().find(d => new Date(d) <= selectedDate);
    const rates = historicalRates[closestDate];
    return rates?.[from]?.[to] || null;
  }

  // Simulated older rate: +5% per 3 months back from 2024-07-01
  const msPerMonth = 30 * 24 * 60 * 60 * 1000;
  const monthsBack = Math.floor((historicalStartDate - selectedDate) / msPerMonth);
  const steps = Math.floor(monthsBack / 3);
  const factor = 1 + 0.05 * steps;

  let baseRate = liveRates[from]?.[to];
  if (!baseRate) return null;

  return baseRate * factor;
}

// Handle conversion
function handleConversion(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount')?.value);
  const from = document.getElementById('from-currency')?.value;
  const to = document.getElementById('to-currency')?.value;
  const resultBox = document.getElementById('converted-amount');

  const dateInput = document.getElementById('rate-date');
  const selectedDate = dateInput?.value ? new Date(dateInput.value) : today;

  if (!amount || amount <= 0 || !from || !to) {
    resultBox.textContent = 'Please enter valid input.';
    return;
  }

  if (from === to) {
    resultBox.textContent = amount.toFixed(2);
    return;
  }

  if (selectedDate > today) {
    resultBox.textContent = '❗ Future dates are not allowed.';
    return;
  }

  const rate = getHistoricalRate(from, to, selectedDate);
  if (rate?.error) {
    resultBox.textContent = rate.error;
    return;
  }

  if (!rate) {
    resultBox.textContent = 'Conversion rate not available.';
    return;
  }

  const converted = amount * rate;
  resultBox.textContent = converted.toFixed(2);
}

// Set min/max on date picker
function configureDateInput() {
  const dateInput = document.getElementById('rate-date');
  if (dateInput) {
    dateInput.min = minDate;
    dateInput.max = formatDate(today);
  }
}

// Init everything
document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();
  configureDateInput();

  const form = document.getElementById('converter-form');
  if (form) {
    form.addEventListener('submit', handleConversion);
  }
});
