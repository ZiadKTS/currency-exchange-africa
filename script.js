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

// Live Conversion Rates
// ===============================
const liveRates = { 
    'EGP-USD': 1 / 60,      // Updated from 58 to 60
    'EGP-EUR': 1 / 62.3,
    'USD-EGP': 60,          // Updated from 58 to 60
    'EUR-USD': 62.3 / 60,   // ≈ 1.0383 (if you want this updated too)
    'USD-EUR': 60 / 62.3,   // ≈ 0.9631 (if you want this updated too)
    'EUR-EGP': 62.3,

    'NGN-USD': 0.0024,
    'ZAR-USD': 0.062,
    'KES-USD': 0.0069,
    'GHS-USD': 0.17,
    'TND-USD': 0.32,

    'USD-NGN': 414.3,
    'USD-ZAR': 16.3,
    'USD-KES': 145.9,
    'USD-GHS': 5.9,
    'USD-TND': 3.1,

    'NGN-EGP': 0.243,
    'ZAR-EGP': 0.22,
    'KES-EGP': 0.23,
    'GHS-EGP': 0.17,
    'TND-EGP': 0.19
};

// ===============================
// Helper Function (optional)
// ===============================
function decreaseRate(rate, monthsBack) {
    let newRate = rate;
    const decreaseFactor = 0.95;
    for (let i = 0; i < monthsBack; i++) {
        newRate *= decreaseFactor;
    }
    return newRate;
}

// Historical Rates (By Period)
// ===============================
const historicalRates = [
    {
        start: '2025-07-17',
        usd: 60, eur: 62.3,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2025-07-04', end: '2025-07-16',
        usd: 58, eur: 62.3,
        ngn: 0.24, zar: 0.215, kes: 0.225, ghs: 0.165, tnd: 0.185
    },
    {
        start: '2025-06-24',
        usd: 61.8, eur: 62.3,
        ngn: 0.242, zar: 0.221, kes: 0.23, ghs: 0.168, tnd: 0.19
    },
    {
        start: '2025-06-10', end: '2025-06-23',
        usd: 62.49, eur: 63.0,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2025-05-29', end: '2025-06-09',
        usd: 63, eur: 63.5,
        ngn: 0.244, zar: 0.222, kes: 0.231, ghs: 0.171, tnd: 0.191
    },
    {
        start: '2025-05-18', end: '2025-05-28',
        usd: 64, eur: 73.15,
        ngn: 0.245, zar: 0.225, kes: 0.235, ghs: 0.172, tnd: 0.192
    },
    {
        start: '2025-04-15', end: '2025-05-17',
        usd: 64, eur: 72.1,
        ngn: 0.244, zar: 0.224, kes: 0.233, ghs: 0.171, tnd: 0.191
    },
    {
        start: '2025-03-10', end: '2025-04-14',
        usd: 64, eur: 71.2,
        ngn: 0.243, zar: 0.222, kes: 0.231, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2025-01-01', end: '2025-03-09',
        usd: 64, eur: 70,
        ngn: 0.242, zar: 0.221, kes: 0.23, ghs: 0.168, tnd: 0.189
    },
    {
        start: '2024-12-10',
        usd: 60,
        eur: 68.4
    },
    {
        start: '2024-07-01',
        usd: 57,
        eur: 64.98
    }
];

// Calculates the number of full months between two dates
function getMonthsDifference(olderDate, newerDate) {
    const years = newerDate.getFullYear() - olderDate.getFullYear();
    const months = newerDate.getMonth() - olderDate.getMonth();
    return Math.max(0, (years * 12) + months);
}

// ===============================
// Get Rate by Date (Updated Logic)
function getRateByDate(selectedDate) {
    if (!selectedDate) {
        alert("Please select a valid date.");
        return null;
    }

    const dErrorDate = new Date('2024-09-17');
    const date = new Date(selectedDate);
    const isoDate = date.toISOString().slice(0, 10);

    if (isoDate === dErrorDate.toISOString().slice(0, 10)) {
        alert("Error: No conversion available for this date (September 17, 2024).");
        return null;
    }

// ✅ Future date validation
const today = new Date();
if (date > today) {
  alert('Please select a date that is not in the future.');
  return null;
}

    for (let i = 0; i < historicalRates.length; i++) {
        const current = new Date(historicalRates[i].start);
        const next = i > 0 ? new Date(historicalRates[i - 1].start) : null;

        if ((next && date >= current && date < next) || (!next && date >= current)) {
            return {
                usd: historicalRates[i].usd,
                eur: historicalRates[i].eur,
                ngn: historicalRates[i].ngn,
                zar: historicalRates[i].zar,
                kes: historicalRates[i].kes,
                ghs: historicalRates[i].ghs,
                tnd: historicalRates[i].tnd
            };
        }
    }

      // Simulate rates before July 2024
    const earliest = new Date('2024-07-01');
    const oldestSupported = new Date('2023-01-01');

    if (date < earliest && date >= oldestSupported) {
        const monthsBack = getMonthsDifference(date, earliest);
        return {
            usd: decreaseRate(57, monthsBack),
            eur: decreaseRate(64.98, monthsBack),
            ngn: decreaseRate(0.243, monthsBack),
            zar: decreaseRate(0.22, monthsBack),
            kes: decreaseRate(0.23, monthsBack),
            ghs: decreaseRate(0.17, monthsBack),
            tnd: decreaseRate(0.19, monthsBack)
        };
    }

   if (date < oldestSupported) {
        alert("Sorry, we don't support conversions before January 1, 2023.");
        return null;
    }
}

// Conversion logic with fallback for missing historical data
function handleConversion(from, to, amount, selectedDate = null) {
    let rate = 1;

    if (selectedDate) {
        const historical = getRateByDate(selectedDate);
        if (!historical) {
            alert("No historical data available for this date. Showing live rates instead.");
            const key = `${from}-${to}`;
            rate = liveRates[key] || 1;
        } else {
            // Historical conversion logic (supports all currencies)
            if (from === to) {
                rate = 1;
            } else if (from === 'EGP') {
                rate = 1 / (historical[to.toLowerCase()] || 1);
            } else if (to === 'EGP') {
                rate = historical[from.toLowerCase()] || 1;
            } else {
                // Convert from → EGP → to
                const fromToEgp = historical[from.toLowerCase()] || 1;
                const toToEgp = historical[to.toLowerCase()] || 1;
                rate = toToEgp / fromToEgp;
            }
        }
    } else {
        // No date selected → use live rates
        const key = `${from}-${to}`;
        rate = liveRates[key] || 1;
    }

    return +(amount * rate).toFixed(4);
}

// Main conversion handler
function setupConversionForm() {
    const form = document.getElementById("converter-form");
    if (!form) return;
    
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const from = document.getElementById("from-currency").value;
    const to = document.getElementById("to-currency").value;
    const dateInput = document.getElementById("rate-date");
    const selectedDate = dateInput ? dateInput.value : null;

    // 💡 FUTURE DATE CHECK
        if (selectedDate) {
            const today = new Date();
            const selected = new Date(selectedDate);
            if (selected > today) {
                alert("You cannot select a future date for conversion.");
                return;
            }
        }

        const result = handleConversion(from, to, amount, selectedDate);
        const output = document.getElementById("converted-amount");

        if (output) {
            output.innerText = `Converted Amount: ${result} ${to}`;
        }
    });
}

// ✅ Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    populateCurrencyOptions();
    setupConversionForm();
});

