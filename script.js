document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("converter-form");
  const amountInput = document.getElementById("amount");
  const fromCurrencySelect = document.getElementById("from-currency");
  const toCurrencySelect = document.getElementById("to-currency");
  const resultDisplay = document.getElementById("result");
  const dateInput = document.getElementById("rate-date"); // Only exists in Rate History

  if (!form || !amountInput || !fromCurrencySelect || !toCurrencySelect || !resultDisplay) {
    console.error("Some required elements are missing in the HTML.");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop form from refreshing the page

    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const selectedDate = dateInput ? dateInput.value : null; // Only if date input exists

    if (isNaN(amount) || amount <= 0) {
      resultDisplay.textContent = "Please enter a valid amount.";
      return;
    }

    // Simulated historical rate logic
    const today = new Date().toISOString().split("T")[0];

    let rate;
    if (!selectedDate || selectedDate === today) {
      // Live rate logic
      rate = getLiveRate(fromCurrency, toCurrency);
    } else {
      try {
        rate = getHistoricalRate(fromCurrency, toCurrency, selectedDate);
      } catch (error) {
        resultDisplay.textContent = error.message;
        return;
      }
    }

    const converted = (amount * rate).toFixed(2);
    resultDisplay.textContent = `${converted} ${toCurrency}`;
  });
});

// Dummy live exchange rates (for demo purposes)
function getLiveRate(from, to) {
  const baseRates = {
    USD: 1,
    EUR: 0.88,
    EGP: 47.25,
    ZAR: 18.2,
    KES: 131.6,
    NGN: 1402,
    GHS: 13.7,
    TND: 3.1,
  };

  if (!baseRates[from] || !baseRates[to]) {
    return 1;
  }

  return baseRates[to] / baseRates[from];
}

// Simulated historical rate logic
function getHistoricalRate(from, to, date) {
  if (date === "2024-09-07") {
    throw new Error("Invalid Date: No rates available on 2024-09-07.");
  }

  const fixedRates = {
    "2025-04-16": {
      USD: 1, EUR: 0.88, EGP: 47.25, ZAR: 18.2, KES: 131.6, NGN: 1402, GHS: 13.7, TND: 3.1
    },
    "2025-04-10": {
      USD: 1, EUR: 0.87, EGP: 47.1, ZAR: 18.1, KES: 132.5, NGN: 1398, GHS: 13.5, TND: 3.05
    },
    "2025-04-04": {
      USD: 1, EUR: 0.86, EGP: 46.9, ZAR: 18.0, KES: 133.4, NGN: 1395, GHS: 13.3, TND: 3.02
    },
    "2024-07-01": {
      USD: 1, EUR: 0.84, EGP: 44.0, ZAR: 17.0, KES: 138.0, NGN: 1350, GHS: 12.0, TND: 2.95
    },
  };

  if (fixedRates[date]) {
    return fixedRates[date][to] / fixedRates[date][from];
  }

  const baseDate = new Date("2024-07-01");
  const targetDate = new Date(date);
  if (targetDate < baseDate) {
    const msPerMonth = 30 * 24 * 60 * 60 * 1000;
    const monthsBack = Math.floor((baseDate - targetDate) / msPerMonth);
    const multiplier = Math.max(0.3, 1 - monthsBack * 0.05);

    const reference = fixedRates["2024-07-01"];
    const fromRate = reference[from] * multiplier;
    const toRate = reference[to] * multiplier;
    return toRate / fromRate;
  }

  // If date is in the future or unknown
  throw new Error("No rate data available for the selected date.");
}
