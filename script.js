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

// Live and Historical Conversion Rates
const liveRates = { 
    'EGP-USD': 1 / 63,
    'EGP-EUR': 1 / 72.96,
    'USD-EGP': 63,
    'EUR-USD': 1.14,
    'USD-EUR': 0.8772,
    'EUR-EGP': 72.96,
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

// Helper function to decrease the rate by 5% every 3.6 months
function decreaseRate(rate, monthsBack) {
    let newRate = rate;
    const decreaseFactor = 0.95;  // 5% decrease
    for (let i = 0; i < monthsBack; i++) {
        newRate *= decreaseFactor;
    }
    return newRate;
}

// Historical rate data with new rules and dynamic decrease logic
const historicalRates = [
    { date: '2024-07-01', usd: 57, eur: 64.98 },  // July 1, 2024 - Dec 9, 2024
    { date: '2024-12-10', usd: 60, eur: 68.4 },   // Dec 10, 2024 - Mar 18, 2025
    { date: '2025-02-03', usd: 65, eur: 68.25 },  // Feb 3, 2025
    { date: '2025-03-18', usd: 63.5, eur: 72.39 },  // March 19, 2025 - April 7, 2025
    { date: '2025-04-04', usd: 64, eur: 72.96 },  // April 8, 2025 - April 16, 2025
    { date: '2025-04-17', usd: 61, eur: 70.23 },  // April 17, 2025 - May 10, 2025
    { date: '2025-05-11', usd: 63, eur: 71.82 }   // May 11, 2025 onward
];

// Function to get historical rate data by date with error handling for September 17, 2024
function getRateByDate(selectedDate) {
    const dStartFixed = new Date('2024-07-01');
    const d1 = new Date('2024-12-10');
    const d2 = new Date('2024-02-03');   // Special date
    const d3 = new Date('2025-03-19');
    const d4 = new Date('2025-04-07');
    const dErrorDate = new Date('2024-09-17');  // Error date

    const date = new Date(selectedDate);

    // Handle error for September 17, 2024
    if (date.toISOString().slice(0, 10) === dErrorDate.toISOString().slice(0, 10)) {
        alert("Error: No conversion available for this date (September 17, 2024).");
        return null;  // Return null to indicate an error
    }

    // ✅ NEW: Handle dates BEFORE July 1, 2024 with decreasing rate
    if (date < dStartFixed) {
        const baseRate = 57; // Starting rate
        const baseEur = 64.98;

        const msPerDay = 1000 * 60 * 60 * 24;
        const diffInDays = Math.floor((dStartFixed - date) / msPerDay);
        const periods = Math.floor(diffInDays / 108); // 108 days ≈ 3.6 months
        const decreasedUsd = decreaseRate(baseRate, periods);
        const decreasedEur = decreaseRate(baseEur, periods);

        return { usd: +decreasedUsd.toFixed(2), eur: +decreasedEur.toFixed(2) };
    }

    // ✅ Special case: February 3, 2025
if (date.toISOString().slice(0, 10) === '2025-02-03') {
    return { usd: 65, eur: 68.25 };
} else if (date >= dStartFixed && date < d1) {
    // July 1, 2024 - Dec 9, 2024
    return { usd: 57, eur: 64.98 };
} else if (date >= d1 && date < d3) {
    // Dec 10, 2024 - Mar 18, 2025
    return { usd: 60, eur: 68.4 };
} else if (date >= d3 && date < d4) {
    // March 19, 2025 - April 7, 2025
    return { usd: 63.5, eur: 72.39 };
} else if (date >= d4) {
    // April 7, 2025 onward
    return { usd: 64, eur: 72.96 };
} else {
    return null;
  // If no historical data, return null
    }
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

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("amount").value);
        const from = document.getElementById("from-currency").value;
        const to = document.getElementById("to-currency").value;
        const dateInput = document.getElementById("rate-date");
        const selectedDate = dateInput ? dateInput.value : null;

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

        const result = handleConversion(from, to, amount, selectedDate);
        const output = document.getElementById("converted-amount");

        if (output) {
            output.innerText = `Converted Amount: ${result} ${to}`;
        }
    });
}

// Initialize both live converter and rate history form
document.addEventListener("DOMContentLoaded", () => {
    populateCurrencyOptions();
    setupConversionForm();
});
