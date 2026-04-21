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

// ===============================
// EUR BASE RATIO (unchanged anchor)
// ===============================
const eurUsdRate = 58.13 / 56; // ≈ 1.0380357

// ===============================
// LIVE RATES (CURRENT = 61.70)
// ===============================
const liveRates = { 
    'EGP-USD': 1 / 61.70,
    'USD-EGP': 61.70,

    'EUR-USD': eurUsdRate,
    'USD-EUR': 1 / eurUsdRate,
    'EUR-EGP': 61.70 * eurUsdRate,
    'EGP-EUR': 1 / (61.70 * eurUsdRate),

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
// HISTORICAL RATES (FIXED STAGED STRUCTURE)
// ===============================
const historicalRates = [
    {
        start: '2026-04-21', // TODAY
        usd: 61.70,
        eur: 61.70 * eurUsdRate,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2026-04-17',
        end: '2026-04-20',
        usd: 59.70,
        eur: 59.70 * eurUsdRate,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2025-08-11',
        end: '2026-04-16',
        usd: 59,
        eur: 59 * eurUsdRate,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2025-08-05',
        end: '2025-08-10',
        usd: 56,
        eur: 58.13,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
    },
    {
        start: '2025-07-17',
        end: '2025-08-04',
        usd: 60,
        eur: 62.3,
        ngn: 0.243, zar: 0.22, kes: 0.23, ghs: 0.17, tnd: 0.19
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





