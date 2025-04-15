
// Toggle Sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Supported currencies 
const currencyList = ["EGP", "USD", "EUR", "NGN", "ZAR", "KES", "GHS", "TND"];

// Populate currency dropdowns
function populateCurrencyOptions() {
    const fromSelects = document.querySelectorAll("#from-currency");
    const toSelects = document.querySelectorAll("#to-currency");

    // Loop through each select element to populate options
    fromSelects.forEach((fromSelect) => {
        currencyList.forEach(currency => {
            const fromOption = document.createElement("option");
            fromOption.value = currency;
            fromOption.innerText = currency;
            fromSelect.appendChild(fromOption);
        });
    });

    toSelects.forEach((toSelect) => {
        currencyList.forEach(currency => {
            const toOption = document.createElement("option");
            toOption.value = currency;
            toOption.innerText = currency;
            toSelect.appendChild(toOption);
        });
    });
}

// Historical rates data (starting from 2024-07-01)
const historicalRates = [
  {
    date: '2025-04-04',
    usd: 64,
    eur: 72.96,
    ngn_usd: 414.3, ngn_eur: 476.2, ngn_egp: 4.11,
    zar_usd: 16.3,  zar_eur: 17.2,  zar_egp: 4.55,
    kes_usd: 145.9, kes_eur: 153.8, kes_egp: 4.35,
    ghs_usd: 5.9,   ghs_eur: 6.3,   ghs_egp: 5.89,
    tnd_usd: 3.1,   tnd_eur: 3.4,   tnd_egp: 5.26,
  },
  {
    date: '2025-03-15',
    usd: 63.5,
    eur: 72.39,
    ngn_usd: 413, ngn_eur: 474, ngn_egp: 4.09,
    zar_usd: 16.2, zar_eur: 17.1, zar_egp: 4.52,
    kes_usd: 145.5, kes_eur: 153.4, kes_egp: 4.31,
    ghs_usd: 5.8, ghs_eur: 6.2, ghs_egp: 5.85,
    tnd_usd: 3.08, tnd_eur: 3.38, tnd_egp: 5.22,
  },
  {
    date: '2025-12-10',
    usd: 60,
    eur: 68.4,
    ngn_usd: 410, ngn_eur: 470, ngn_egp: 4.05,
    zar_usd: 16, zar_eur: 16.9, zar_egp: 4.5,
    kes_usd: 145, kes_eur: 153, kes_egp: 4.25,
    ghs_usd: 5.7, ghs_eur: 6.1, ghs_egp: 5.8,
    tnd_usd: 3, tnd_eur: 3.3, tnd_egp: 5.2,
  },
  {
    date: '2024-07-01',
    usd: 57,
    eur: 64.98,
    ngn_usd: 410, ngn_eur: 470, ngn_egp: 4.05,
    zar_usd: 16, zar_eur: 16.9, zar_egp: 4.5,
    kes_usd: 145, kes_eur: 153, kes_egp: 4.25,
    ghs_usd: 5.7, ghs_eur: 6.1, ghs_egp: 5.8,
    tnd_usd: 3, tnd_eur: 3.3, tnd_egp: 5.2,
  },
];

// Get rate by date or simulate older ones
function getRateByDate(selectedDate) {
  const inputDate = new Date(selectedDate);
  const baseRate = historicalRates[historicalRates.length - 1];
  const baseDate = new Date('2024-07-01');

  if (inputDate >= baseDate) {
    for (const rate of historicalRates) {
      if (inputDate >= new Date(rate.date)) return rate;
    }
    return baseRate;
  }

  // Simulate older rates with decreasing pattern
  const monthsDiff = (baseDate.getFullYear() - inputDate.getFullYear()) * 12 + (baseDate.getMonth() - inputDate.getMonth());
  const steps = Math.floor(monthsDiff / 3);
  const multiplier = Math.max(0.3, 1 - steps * 0.05);

  const simulated = {};
  for (const key in baseRate) {
    if (key !== 'date') {
      simulated[key] = baseRate[key] * multiplier;
    }
  }
  return simulated;
}

// Main conversion logic
function handleConversion(from, to, amount, selectedDate = null) {
  if (!selectedDate) selectedDate = new Date().toISOString().split("T")[0];
  if (selectedDate === '2024-09-17') return 'error-date';

  const rate = getRateByDate(selectedDate);
  const pair = {
    'USD-EUR': rate.usd / rate.eur,
    'EUR-USD': rate.eur / rate.usd,
    'USD-NGN': rate.ngn_usd, 'NGN-USD': 1 / rate.ngn_usd,
    'USD-ZAR': rate.zar_usd, 'ZAR-USD': 1 / rate.zar_usd,
    'USD-KES': rate.kes_usd, 'KES-USD': 1 / rate.kes_usd,
    'USD-GHS': rate.ghs_usd, 'GHS-USD': 1 / rate.ghs_usd,
    'USD-TND': rate.tnd_usd, 'TND-USD': 1 / rate.tnd_usd,
    'EUR-NGN': rate.ngn_eur, 'NGN-EUR': 1 / rate.ngn_eur,
    'EUR-ZAR': rate.zar_eur, 'ZAR-EUR': 1 / rate.zar_eur,
    'EUR-KES': rate.kes_eur, 'KES-EUR': 1 / rate.kes_eur,
    'EUR-GHS': rate.ghs_eur, 'GHS-EUR': 1 / rate.ghs_eur,
    'EUR-TND': rate.tnd_eur, 'TND-EUR': 1 / rate.tnd_eur,
    'EGP-NGN': rate.ngn_egp, 'NGN-EGP': 1 / rate.ngn_egp,
    'EGP-ZAR': rate.zar_egp, 'ZAR-EGP': 1 / rate.zar_egp,
    'EGP-KES': rate.kes_egp, 'KES-EGP': 1 / rate.kes_egp,
    'EGP-GHS': rate.ghs_egp, 'GHS-EGP': 1 / rate.ghs_egp,
    'EGP-TND': rate.tnd_egp, 'TND-EGP': 1 / rate.tnd_egp,
    'EGP-USD': 1 / rate.usd, 'USD-EGP': rate.usd,
    'EGP-EUR': 1 / rate.eur, 'EUR-EGP': rate.eur
  };

  if (from === to) return amount;
  const key = `${from}-${to}`;
  return pair[key] !== undefined ? +(amount * pair[key]).toFixed(4) : null;
}

// DOM logic
document.addEventListener("DOMContentLoaded", () => {
  populateCurrencyOptions();
  const convertBtn = document.getElementById("convert-btn");
  const dateInput = document.getElementById("rate-date");

  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("max", today);
    dateInput.setAttribute("min", "2021-01-01");
  }

  if (convertBtn) {
    convertBtn.addEventListener("click", () => {
      const from = document.getElementById("from-currency").value;
      const to = document.getElementById("to-currency").value;
      const amount = parseFloat(document.getElementById("amount").value);
      const date = dateInput ? dateInput.value : null;
      const resultBox = document.getElementById("result");

      if (!amount || amount <= 0 || from === to) {
        resultBox.textContent = "Please enter a valid amount and select different currencies.";
        return;
      }

      const result = handleConversion(from, to, amount, date);
      if (result === 'error-date') {
        resultBox.textContent = "❌ Rates unavailable for this date.";
      } else {
        resultBox.textContent = `Converted Amount: ${result} ${to}`;
      }
    });
  }
});

