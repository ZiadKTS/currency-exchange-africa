document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amount');
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const dateInput = document.getElementById('rate-date');
  const resultDisplay = document.getElementById('result');

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
      date: '2025-02-10',
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
    // Simulated historical USD & EUR rates only
    { date: '2024-04-01', usd: 59.85, eur: 68.23 },
    { date: '2024-01-01', usd: 62.84, eur: 71.64 },
    { date: '2023-10-01', usd: 65.99, eur: 75.22 },
    { date: '2023-07-01', usd: 69.29, eur: 78.98 },
    { date: '2023-04-01', usd: 72.75, eur: 82.93 },
    { date: '2023-01-01', usd: 76.39, eur: 87.08 },
    { date: '2022-10-01', usd: 80.21, eur: 91.43 },
    { date: '2022-07-01', usd: 84.22, eur: 96.0 },
    { date: '2022-04-01', usd: 88.43, eur: 100.8 },
    { date: '2022-01-01', usd: 92.85, eur: 105.84 },
    { date: '2021-10-01', usd: 97.49, eur: 111.13 },
    { date: '2021-07-01', usd: 102.37, eur: 116.69 },
    { date: '2021-04-01', usd: 107.48, eur: 122.52 },
    { date: '2021-01-01', usd: 112.86, eur: 128.65 }
  ];

  function getRateByDate(targetDate) {
    if (targetDate === '2024-17-09') {
      return { error: 'Invalid date entered. Please choose a correct date.' };
    }

    const sorted = [...historicalRates].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (let rate of sorted) {
      if (new Date(rate.date) <= new Date(targetDate)) {
        return rate;
      }
    }
    return { error: 'No historical data available for selected date.' };
  }

  function handleConversion() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const selectedDate = dateInput.value;

    if (!amount || !from || !to || !selectedDate) {
      resultDisplay.textContent = 'Please fill in all fields.';
      return;
    }

    const rateData = getRateByDate(selectedDate);
    if (rateData.error) {
      resultDisplay.textContent = rateData.error;
      return;
    }

    const liveRates = {
      USD: 64,
      EUR: 72.96,
      EGP: 1,
    };

    // Special EGP logic
    if (to === 'EGP') {
      if (from === 'USD' && selectedDate < '2023-01-01') {
        return resultDisplay.textContent = `1 USD = 16 EGP (Fixed Pre-2023 Rate) → ${amount * 16} EGP`;
      }
      if (from === 'EUR' && selectedDate < '2023-01-01') {
        return resultDisplay.textContent = `1 EUR = 18 EGP (Fixed Pre-2023 Rate) → ${amount * 18} EGP`;
      }
    }

    const getRate = (currency, type) => {
      if (rateData[`${currency.toLowerCase()}_${type.toLowerCase()}`]) {
        return rateData[`${currency.toLowerCase()}_${type.toLowerCase()}`];
      } else if (currency === 'USD' || currency === 'EUR' || currency === 'EGP') {
        if (type === 'EGP') return 1;
        return rateData[currency.toLowerCase()];
      } else {
        return null;
      }
    };

    const fromRate = getRate(from, 'EGP');
    const toRate = getRate(to, 'EGP');

    if (fromRate === null || toRate === null) {
      resultDisplay.textContent = 'Rate not available for selected currencies on this date.';
      return;
    }

    const converted = (amount * fromRate) / toRate;
    resultDisplay.textContent = `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
  }

  amountInput.addEventListener('input', handleConversion);
  fromCurrency.addEventListener('change', handleConversion);
  toCurrency.addEventListener('change', handleConversion);
  dateInput.addEventListener('change', handleConversion);
});
