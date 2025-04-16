// Currency options supported
const currencyOptions = ['USD', 'EUR', 'EGP', 'ZAR', 'KES', 'NGN', 'GHS', 'TND'];

// Simulated live exchange rates
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

// Fallback today's date
const today = new Date();

// Populate dropdowns if empty
function populateDropdowns() {
  const fromDropdown = document.getElementById('from-currency');
  const toDropdown = document.getElementById('to-currency');

  if (fromDropdown && fromDropdown.options.length === 0) {
    currencyOptions.forEach(currency => {
      const optionFrom = document.createElement('option');
      optionFrom.value = currency;
      optionFrom.text = currency;
      fromDropdown.appendChild(optionFrom);
    });
  }

  if (toDropdown && toDropdown.options.length === 0) {
    currencyOptions.forEach(currency => {
      const optionTo = document.createElement('option');
      optionTo.value = currency;
      optionTo.text = currency;
      toDropdown.appendChild(optionTo);
    });
  }
}

// Handle conversion for both pages
function handleConversion(event) {
  event.preventDefault();

  const amountInput = document.getElementById('amount');
  const fromCurrency = document.getElementById('from-currency').value;
  const toCurrency = document.getElementById('to-currency').value;
  const convertedAmountElement = document.getElementById('converted-amount');

  const rateDateInput = document.getElementById('rate-date');
  const selectedDate = rateDateInput && rateDateInput.value
    ? new Date(rateDateInput.value)
    : today;

  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    convertedAmountElement.textContent = 'Please enter a valid amount.';
    return;
  }

  if (fromCurrency === toCurrency) {
    convertedAmountElement.textContent = amount.toFixed(2);
    return;
  }

  const isHistorical = selectedDate < new Date('2025-01-01'); // Custom logic threshold

  let rate = liveRates[fromCurrency]?.[toCurrency];

  if (!rate) {
    convertedAmountElement.textContent = 'Conversion rate not available.';
    return;
  }

  if (isHistorical) {
    const dayOffset = (today - selectedDate) / (1000 * 60 * 60 * 24);
    const percentOffset = Math.min(dayOffset * 0.0025, 0.2); // Max ±20%
    const historicalFactor = 1 - percentOffset;
    rate *= historicalFactor;
  }

  const result = amount * rate;
  convertedAmountElement.textContent = result.toFixed(2);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();

  const form = document.getElementById('converter-form');
  if (form) {
    form.addEventListener('submit', handleConversion);
  }
});
