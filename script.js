document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amount');
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const dateInput = document.getElementById('rate-date');
  const resultDisplay = document.getElementById('result');

  const today = new Date().toISOString().split("T")[0];
  if (dateInput) {
    dateInput.max = today;
  }

  const currencyList = ["EGP", "USD", "EUR", "NGN", "ZAR", "KES", "GHS", "TND"];

  // Populate dropdowns
  function populateCurrencyOptions() {
    const fromSelects = document.querySelectorAll("#from-currency");
    const toSelects = document.querySelectorAll("#to-currency");

    fromSelects.forEach(select => {
      select.innerHTML = "";
      currencyList.forEach(curr => {
        const opt = document.createElement("option");
        opt.value = curr;
        opt.textContent = curr;
        select.appendChild(opt);
      });
    });

    toSelects.forEach(select => {
      select.innerHTML = "";
      currencyList.forEach(curr => {
        const opt = document.createElement("option");
        opt.value = curr;
        opt.textContent = curr;
        select.appendChild(opt);
      });
    });
  }

  populateCurrencyOptions();

  const liveRates = {
    'EGP-USD': 1 / 64,
    'EGP-EUR': 1 / 72.96,
    'USD-EGP': 64,
    'EUR-EGP': 72.96,
    'USD-EUR': 0.88,
    'EUR-USD': 1 / 0.88,
    'USD-NGN': 414.3,
    'NGN-USD': 1 / 414.3,
    'USD-ZAR': 16.3,
    'ZAR-USD': 1 / 16.3,
    'USD-KES': 145.9,
    'KES-USD': 1 / 145.9,
    'USD-GHS': 5.9,
    'GHS-USD': 1 / 5.9,
    'USD-TND': 3.1,
    'TND-USD': 1 / 3.1,
    // Add similar lines for EUR, EGP conversions...
  };

  const historicalRates = [/* your existing rate array here */];

  function findClosestHistoricalRate(dateStr) {
    const inputDate = new Date(dateStr);
    return historicalRates.reduce((closest, current) => {
      const currentDiff = Math.abs(new Date(current.date) - inputDate);
      const closestDiff = Math.abs(new Date(closest.date) - inputDate);
      return currentDiff < closestDiff ? current : closest;
    });
  }

  function convertCurrency(amount, from, to, rateSet) {
    const key = `${from}-${to}`;
    if (rateSet[key]) {
      return amount * rateSet[key];
    }

    // Try going through USD as an intermediary
    if (rateSet[`${from}-USD`] && rateSet[`USD-${to}`]) {
      const viaUSD = amount * rateSet[`${from}-USD`] * rateSet[`USD-${to}`];
      return viaUSD;
    }

    // Try going through EGP
    if (rateSet[`${from}-EGP`] && rateSet[`EGP-${to}`]) {
      return amount * rateSet[`${from}-EGP`] * rateSet[`EGP-${to}`];
    }

    return null;
  }

  const form = document.getElementById('converter-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const date = dateInput ? dateInput.value : null;

    let result;
    if (!date) {
      // Use live
      result = convertCurrency(amount, from, to, liveRates);
    } else {
      const closestRate = findClosestHistoricalRate(date);
      const rateSet = buildRateSetFromHistorical(closestRate);
      result = convertCurrency(amount, from, to, rateSet);
    }

    if (result !== null && resultDisplay) {
      resultDisplay.textContent = result.toFixed(2);
    } else {
      resultDisplay.textContent = "Conversion not available";
    }
  });

  function buildRateSetFromHistorical(entry) {
    const rates = {};
    if (!entry) return rates;

    // Base: EGP to others
    if (entry.usd) {
      rates['EGP-USD'] = 1 / entry.usd;
      rates['USD-EGP'] = entry.usd;
    }
    if (entry.eur) {
      rates['EGP-EUR'] = 1 / entry.eur;
      rates['EUR-EGP'] = entry.eur;
    }

    // African currencies to major ones
    ['ngn', 'zar', 'kes', 'ghs', 'tnd'].forEach(code => {
      const upper = code.toUpperCase();
      if (entry[`${code}_usd`]) {
        rates[`${upper}-USD`] = 1 / entry[`${code}_usd`];
        rates[`USD-${upper}`] = entry[`${code}_usd`];
      }
      if (entry[`${code}_eur`]) {
        rates[`${upper}-EUR`] = 1 / entry[`${code}_eur`];
        rates[`EUR-${upper}`] = entry[`${code}_eur`];
      }
      if (entry[`${code}_egp`]) {
        rates[`${upper}-EGP`] = 1 / entry[`${code}_egp`];
        rates[`EGP-${upper}`] = entry[`${code}_egp`];
      }
    });

    return rates;
  }
});
