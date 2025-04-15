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
    'EGP-USD': 1 / 64,
    'EGP-EUR': 1 / 72.96,
    'USD-EGP': 64,
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

// Historical rate data
const historicalRates = [
    { date: '2025-04-04', usd: 64, eur: 72.96, ngn_usd: 414.3, ngn_eur: 476.2, ngn_egp: 4.11, zar_usd: 16.3, zar_eur: 17.2, zar_egp: 4.55, kes_usd: 145.9, kes_eur: 153.8, kes_egp: 4.35, ghs_usd: 5.9, ghs_eur: 6.3, ghs_egp: 5.89, tnd_usd: 3.1, tnd_eur: 3.4, tnd_egp: 5.26 }
];

// Conversion logic
function handleConversion(from, to, amount, selectedDate = null) {
    let rate = 1;

    if (selectedDate) {
        const historical = getRateByDate(selectedDate);
        if (!historical) return 0;

        if (from === 'EGP' && to === 'USD') rate = 1 / historical.usd;
        else if (from === 'EGP' && to === 'EUR') rate = 1 / historical.eur;
        else if (from === 'USD' && to === 'EGP') rate = historical.usd;
        else if (from === 'EUR' && to === 'EGP') rate = historical.eur;
        else if (from === to) rate = 1;
    } else {
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

        const result = handleConversion(from, to, amount, selectedDate);
        const output = document.getElementById("converted-amount");

        if (output) {
            output.innerText = `Converted Amount: ${result} ${to}`;
        }
    });
}

// Initialize both live converter and rate history form
populateCurrencyOptions();
setupConversionForm();
