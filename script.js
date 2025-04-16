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
    // Add more live pairs if needed
  };

  const historicalRates = [
    // Example entries
    // { date: "2024-07-01", usd: 64, eur: 72.96, ngn_usd: 414.3, ... }
  ];

  function findClosestHistoricalRate(dateStr) {
    const inputDate = new Date(dateStr);
    const thresholdDate = new Date("2024-07-01");

    if (inputDate >= thresholdDate) {
      return historicalRates.reduce((closest, current) => {
        const currentDiff = Math.abs(new Date(current.date) - inputDate);
        const closestDiff = Math.abs(new Date(closest.date) - inputDate);
        return currentDiff < closestDiff ? current : closest;
      }, historicalRates[0]);
    }

    return simulateHistoricalEntry(inputDate);
  }

  function simulateHistoricalEntry(inputDate) {
    const baseDate = new Date("2024-07-01");

    const monthsDiff = (baseDate.getFullYear() - inputDate.getFullYear()) * 12 +
      (baseDate.getMonth() - inputDate.getMonth());

    const stepsBack = Math.floor(monthsDiff / 3);
    const multiplier = 1 + (0.05 * stepsBack);

    return {
      date: inputDate.toISOString().split("T")[0],
      usd: 64 * multiplier,
      eur: 72.96 * multiplier,
      ngn_usd: 414.3 * multiplier,
      zar_usd: 16.3 * multiplier,
      kes_usd: 145.9 * multiplier,
      ghs_usd: 5.9 * multiplier,
      tnd_usd: 3.1 * multiplier,
      ngn_eur: (414.3 / 0.88) * multiplier,
      zar_eur: (16.3 / 0.88) * multiplier,
      kes_eur: (145.9 / 0.88) * multiplier,
      ghs_eur: (5.9 / 0.88) * multiplier,
      tnd_eur: (3.1 / 0.88) * multiplier,
      ngn_egp: (414.3 / 64) * multiplier,
      zar_egp: (16.3 / 64) * multiplier,
      kes_egp: (145.9 / 64) * multiplier,
      ghs_egp: (5.9 / 64) * multiplier,
      tnd_egp: (3.1 / 64) * multiplier,
    };
  }

  function buildRateSetFromHistorical(entry) {
    const rates = {};
    if (!entry) return rates;

    if (entry.usd) {
      rates['EGP-USD'] = 1 / entry.usd;
      rates['USD-EGP'] = entry.usd;
    }

    if (entry.eur) {
      rates['EGP-EUR'] = 1 / entry.eur;
      rates['EUR-EGP'] = entry.eur;
    }

    if (entry.usd && entry.eur) {
      const usdToEur = entry.eur / entry.usd;
      rates['USD-EUR'] = usdToEur;
      rates['EUR-USD'] = 1 / usdToEur;
    }

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

  function convertCurrency(amount, from, to, rateSet) {
    const key = `${from}-${to}`;
    if (rateSet[key]) {
      return amount * rateSet[key];
    }

    if (rateSet[`${from}-USD`] && rateSet[`USD-${to}`]) {
      return amount * rateSet[`${from}-USD`] * rateSet[`USD-${to}`];
    }

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
});
