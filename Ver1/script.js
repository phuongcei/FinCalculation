// Utility: Format currency
const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// Utility: Parse currency string to number
const parseCurrency = (str) => {
    if (!str) return 0;
    // Remove non-numeric characters except for possible decimal point if needed (VND usually integer)
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
};

// Auto-format input fields
const currencyInputs = document.querySelectorAll('.format-currency');
currencyInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value;
        if (value) {
            const num = parseCurrency(value);
            e.target.value = num.toLocaleString('en-US'); // Use en-US to get commas (1,000,000), typical in computing
        }
    });
});

// Tab Switching Logic
const tabs = document.querySelectorAll('.nav-links li');
const panes = document.querySelectorAll('.tab-pane');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        // Add active class
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        document.getElementById(targetId).classList.add('active');
    });
});

// --- CHART INSTANCES ---
let chartCompound = null;
let chartInvestment = null;

// --- CALCULATOR 1: COMPOUND INTEREST ---
function calculateCompound() {
    const P = parseCurrency(document.getElementById('c1-principal').value);
    const r = parseFloat(document.getElementById('c1-rate').value) / 100;
    const t = parseFloat(document.getElementById('c1-years').value);
    const n = parseInt(document.getElementById('c1-frequency').value);

    if (!P || !r || !t) return;

    // Formula: A = P(1 + r/n)^(nt)
    const totalPeriods = n * t;
    const finalAmount = P * Math.pow((1 + r / n), totalPeriods);
    const totalInterest = finalAmount - P;

    // Update UI
    document.getElementById('c1-total-principal').textContent = formatCurrency(P);
    document.getElementById('c1-total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('c1-final-balance').textContent = formatCurrency(finalAmount);

    // Draw Chart
    const labels = Array.from({ length: t + 1 }, (_, i) => `Năm ${i}`);
    const dataPrincipal = Array(t + 1).fill(P);
    const dataInterest = [];

    // Calculate year by year for chart
    for (let i = 0; i <= t; i++) {
        const amt = P * Math.pow((1 + r / n), n * i);
        dataInterest.push(amt - P);
    }

    renderChart('chart-compound', labels, dataPrincipal, dataInterest, chartCompound, (newChart) => chartCompound = newChart);
}

// --- CALCULATOR 2: INVESTMENT ---
function calculateInvestment() {
    const P = parseCurrency(document.getElementById('c2-principal').value);
    const PMT = parseCurrency(document.getElementById('c2-contribution').value);
    const r = parseFloat(document.getElementById('c2-rate').value) / 100;
    const t = parseFloat(document.getElementById('c2-years').value);

    // Assumption: Contribution is monthly (n=12)
    const n = 12;

    if (isNaN(P) || isNaN(PMT) || !r || !t) return;

    // Future Value of Initial Principal: P * (1 + r/n)^(nt)
    const fvPrincipal = P * Math.pow((1 + r / n), n * t);

    // Future Value of Series: PMT * [ (1 + r/n)^(nt) - 1 ] / (r/n)
    const fvSeries = PMT * (Math.pow((1 + r / n), n * t) - 1) / (r / n);

    const totalAmount = fvPrincipal + fvSeries;
    const totalContributed = P + (PMT * n * t);
    const totalInterest = totalAmount - totalContributed;

    // Update UI
    document.getElementById('c2-total-principal').textContent = formatCurrency(totalContributed);
    document.getElementById('c2-total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('c2-final-balance').textContent = formatCurrency(totalAmount);

    // Draw Chart
    const labels = Array.from({ length: t + 1 }, (_, i) => `Năm ${i}`);
    const dataPrincipal = []; // Cumulative Principal
    const dataInterest = [];  // Cumulative Interest

    for (let i = 0; i <= t; i++) {
        const periods = i * n;
        const currentPrincipal = P + (PMT * periods);

        const fvP = P * Math.pow((1 + r / n), periods);
        const fvS = periods === 0 ? 0 : PMT * (Math.pow((1 + r / n), periods) - 1) / (r / n);

        const currentTotal = fvP + fvS;

        dataPrincipal.push(currentPrincipal);
        dataInterest.push(currentTotal - currentPrincipal);
    }

    renderChart('chart-investment', labels, dataPrincipal, dataInterest, chartInvestment, (newChart) => chartInvestment = newChart);
}

// --- CALCULATOR 3: LOAN ---
function calculateLoan() {
    const P = parseCurrency(document.getElementById('c3-principal').value);
    const years = parseFloat(document.getElementById('c3-years').value);
    const r1 = parseFloat(document.getElementById('c3-rate1').value) / 100 / 12; // Monthly rate 1
    const p1_months = parseInt(document.getElementById('c3-period1').value) || 0; // Months for rate 1
    const r2 = parseFloat(document.getElementById('c3-rate2').value) / 100 / 12; // Monthly rate 2

    if (!P || !years) return;

    const totalMonths = years * 12;
    let remainingPrincipal = P;
    let totalInterestPaid = 0;

    const tbody = document.getElementById('c3-schedule-body');
    let tableHTML = '';

    // First Period EMI
    let emi1 = 0;
    if (r1 > 0) {
        emi1 = remainingPrincipal * r1 * Math.pow(1 + r1, totalMonths) / (Math.pow(1 + r1, totalMonths) - 1);
    } else {
        emi1 = remainingPrincipal / totalMonths;
    }

    // Optimization: Generate HTML string first
    for (let i = 1; i <= totalMonths; i++) {
        let currentRate = (i <= p1_months) ? r1 : r2;
        let currentEMI = emi1;

        // If we just switched to period 2, recalculate EMI
        if (i === p1_months + 1) {
            const remainingMonths = totalMonths - (i - 1);
            if (currentRate > 0) {
                currentEMI = remainingPrincipal * currentRate * Math.pow(1 + currentRate, remainingMonths) / (Math.pow(1 + currentRate, remainingMonths) - 1);
            } else {
                currentEMI = remainingPrincipal / remainingMonths;
            }
            emi1 = currentEMI;
        } else if (i > p1_months) {
            currentEMI = emi1;
        }

        const interestPayment = remainingPrincipal * currentRate;
        let principalPayment = currentEMI - interestPayment;

        // Handle last month rounding
        if (i === totalMonths || principalPayment > remainingPrincipal) {
            principalPayment = remainingPrincipal;
            currentEMI = principalPayment + interestPayment;
        }

        remainingPrincipal -= principalPayment;
        if (remainingPrincipal < 0) remainingPrincipal = 0;

        totalInterestPaid += interestPayment;

        tableHTML += `<tr>
            <td>${i}</td>
            <td>${formatCurrency(remainingPrincipal + principalPayment)}</td>
            <td>${formatCurrency(principalPayment)}</td>
            <td>${formatCurrency(interestPayment)}</td>
            <td>${formatCurrency(currentEMI)}</td>
        </tr>`;
    }

    tbody.innerHTML = tableHTML;

    const totalPaid = P + totalInterestPaid;

    document.getElementById('c3-total-paid').textContent = formatCurrency(totalPaid);
    document.getElementById('c3-total-interest').textContent = formatCurrency(totalInterestPaid);
}


// Generic Chart Render Function
function renderChart(canvasId, labels, data1, data2, existingChartInstance, setChartInstance) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (existingChartInstance) {
        existingChartInstance.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tiền gốc',
                    data: data1,
                    borderColor: '#4f46e5', // Primary Dark
                    backgroundColor: 'rgba(79, 70, 229, 0.5)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                },
                {
                    label: 'Tiền lãi',
                    data: data2,
                    borderColor: '#10b981', // Secondary
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1' }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                y: {
                    stacked: true, // Key change: Stacked charts
                    ticks: {
                        color: '#94a3b8',
                        callback: function (value) {
                            if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' tỷ';
                            if (value >= 1000000) return (value / 1000000).toFixed(0) + ' tr';
                            return value;
                        }
                    },
                    grid: { color: '#334155' }
                }
            }
        }
    });

    setChartInstance(newChart);
}

// Initial Call to setup default view or wait for input
// calculateCompound(); // Optional: Calculate default values on load
