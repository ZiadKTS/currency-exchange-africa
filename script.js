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

// ===============================
// Historical Rates (By Period)
// ===============================
const historicalRates = [
    { start: '2025-07-04', end: '2025-07-16', usd: 58, eur: 62.3 }, // Closed today
    { start: '2025-06-24', usd: 61.8, eur: 62.3 },
    { start: '2025-05-29', usd: 62.49, eur: 63.0 },
    { start: '2025-05-18', usd: 64, eur: 73.15 },
    { start: '2025-05-14', usd: 62, eur: 54.39 },
    { start: '2025-05-11', usd: 63, eur: 71.82 },
    { start: '2025-04-17', usd: 61, eur: 70.23 },
    { start: '2025-04-04', usd: 64, eur: 72.96 },
    { start: '2025-03-18', usd: 63.5, eur: 72.39 },
    { start: '2025-02-03', usd: 65, eur: 68.25 },
    { start: '2024-12-10', usd: 60, eur: 68.4 },
    { start: '2024-07-01', usd: 57, eur: 64.98 }
];

// ===============================
// Get Rate by Date (Updated Logic)
// ===============================
function getRateByDate(selectedDate) {
    const dErrorDate = new Date('2024-09-17');
    const date = new Date(selectedDate);
    const isoDate = date.toISOString().slice(0, 10);

    if (isoDate === dErrorDate.toISOString().slice(0, 10)) {
        alert("Error: No conversion available for this date (September 17, 2024).");
        return null;
    }

    for (let i = 0; i < historicalRates.length; i++) {
        const current = new Date(historicalRates[i].start);
        const next = i > 0 ? new Date(historicalRates[i - 1].start) : null;

        if ((next && date >= current && date < next) || (!next && date >= current)) {
            return {
                usd: historicalRates[i].usd,
                eur: historicalRates[i].eur
            };
        }
    }

    return null;
}


// Conversion logic with fallback for missing historical data
function handleConversion(from, to, amount, selectedDate = null) {
    let rate = 1;

    if (selectedDate) {
        const historical = getRateByDate(selectedDate);
        if (!historical) {
            alert("No historical data available for this date. Showing live rates instead.");
            // If no historical data, use live rates
            const key = `${from}-${to}`;
            rate = liveRates[key] || 1;
        } else {
            // Conversion logic for historical rates
            if (from === 'EGP' && to === 'USD') rate = 1 / historical.usd;
            else if (from === 'EGP' && to === 'EUR') rate = 1 / historical.eur;
            else if (from === 'USD' && to === 'EGP') rate = historical.usd;
            else if (from === 'EUR' && to === 'EGP') rate = historical.eur;
            else if (from === 'USD' && to === 'EUR') rate = historical.eur / historical.usd;
            else if (from === 'EUR' && to === 'USD') rate = historical.usd / historical.eur;
            else if (from === to) rate = 1;
        }
    } else {
        // If no date is selected, use live rates
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
