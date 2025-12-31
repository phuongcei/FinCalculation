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
let chartTrading = null;

// --- THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggleBtn.querySelector('i');

// Check saved theme from LocalStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    enableLightMode();
}

themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
        disableLightMode();
    } else {
        enableLightMode();
    }
});

function enableLightMode() {
    body.classList.add('light-mode');
    themeIcon.className = 'fa-solid fa-moon'; // Force icon
    localStorage.setItem('theme', 'light');

    // Update chart colors if they exist
    if (chartCompound) chartCompound.update();
    if (chartInvestment) chartInvestment.update();
    if (chartTrading) chartTrading.update();
}

function disableLightMode() {
    body.classList.remove('light-mode');
    themeIcon.className = 'fa-solid fa-sun'; // Force icon
    localStorage.setItem('theme', 'dark');

    if (chartCompound) chartCompound.update();
    if (chartInvestment) chartInvestment.update();
    if (chartTrading) chartTrading.update();
}

// --- CHART INSTANCES ---


// ... [Existing displayFormula] ...

// ... [Existing calculateCompound] ...

// ... [Existing calculateInvestment] ...

// ... [Existing calculateLoan] ...

// --- CALCULATOR 4: TRADING SYSTEM ---
function calculateTrading() {
    const initialAccounts = parseInt(document.getElementById('c4-accounts').value);
    const capitalPerAccount = parseCurrency(document.getElementById('c4-capital').value);
    const dailyRate = parseFloat(document.getElementById('c4-rate').value) / 100;
    const daysPerMonth = parseInt(document.getElementById('c4-days').value);
    const months = parseFloat(document.getElementById('c4-months').value);

    if (!initialAccounts || !capitalPerAccount || !dailyRate || !daysPerMonth || !months) return;

    // NEW: Withdrawal Rate (default 0 if empty)
    let withdrawRate = parseFloat(document.getElementById('c4-withdraw-rate').value);
    if (isNaN(withdrawRate)) withdrawRate = 0;
    withdrawRate = withdrawRate / 100;

    let currentAccounts = initialAccounts;
    const totalDays = months * daysPerMonth;
    let cashPool = 0;
    let totalWithdrawn = 0;
    let monthlyWithdrawnAccumulator = 0;

    // Tracking
    const labels = [];
    const dataAccounts = [];
    let logHTML = '';

    let timeToX2 = null;
    let timeToBreakeven = null;
    const initialTotalCapital = initialAccounts * capitalPerAccount;

    for (let day = 1; day <= totalDays; day++) {
        // Daily Profit Calculation
        const grossDailyProfit = currentAccounts * capitalPerAccount * dailyRate;

        // Split Profit
        const withdrawAmount = grossDailyProfit * withdrawRate;
        const reinvestAmount = grossDailyProfit - withdrawAmount;

        cashPool += reinvestAmount;
        monthlyWithdrawnAccumulator += withdrawAmount;
        totalWithdrawn += withdrawAmount;

        // Check Breakeven Milestone (Total Withdrawn >= Initial Capital)
        if (timeToBreakeven === null && totalWithdrawn >= initialTotalCapital) {
            timeToBreakeven = day;
            logHTML += `<div style="color: #3b82f6; margin-bottom: 5px;">Day ${day}: 💎 Hoàn vốn đầu tư! (Tổng rút: ${formatCurrency(totalWithdrawn)})</div>`;
        }

        // Check if we can open new account
        let newAccountsToday = 0;
        while (cashPool >= capitalPerAccount) {
            cashPool -= capitalPerAccount;
            currentAccounts++;
            newAccountsToday++;
        }

        const isMonthEnd = day % daysPerMonth === 0;

        // Record Data points
        if (day % 5 === 0 || newAccountsToday > 0 || isMonthEnd || day === totalDays) {
            labels.push(`Day ${day}`);
            dataAccounts.push(currentAccounts);

            // X2 Goal check: Equity + Total Withdrawn >= 2 * Initial
            const currentEquity = (currentAccounts * capitalPerAccount) + cashPool;
            // Note: Total Value Generated includes ALL withdrawn money (past + current month accumulator)
            const totalValueGenerated = currentEquity + totalWithdrawn;

            // Check X2 Milestone
            if (timeToX2 === null && totalValueGenerated >= initialTotalCapital * 2) {
                timeToX2 = day;
                logHTML += `<div style="color: #10b981; margin-bottom: 5px;">Day ${day}: 🚀 Đạt X2 Vốn! (Tổng giá trị: ${formatCurrency(totalValueGenerated)})</div>`;
            }

            if (newAccountsToday > 0) {
                logHTML += `<div style="margin-bottom: 5px;">Day ${day}: Mở thêm ${newAccountsToday} account. Tổng: ${currentAccounts}.</div>`;
            }

            if (isMonthEnd && monthlyWithdrawnAccumulator > 0) {
                const monthIndex = day / daysPerMonth;
                logHTML += `<div style="color: #f43f5e; margin-bottom: 5px; font-weight:500;">End Month ${monthIndex}: 💸 Rút lãi ${formatCurrency(monthlyWithdrawnAccumulator)}</div>`;
                monthlyWithdrawnAccumulator = 0; // Reset for next month
            }
        }
    }

    // Update UI Results
    document.getElementById('c4-total-accounts').textContent = currentAccounts;

    // Net Worth displayed is Current Asset Value (Accounts + Cash Pool)
    document.getElementById('c4-net-worth').textContent = formatCurrency((currentAccounts * capitalPerAccount) + cashPool);

    // New Output: Total Withdrawn
    document.getElementById('c4-total-withdrawn').textContent = formatCurrency(totalWithdrawn);

    if (timeToX2) {
        document.getElementById('c4-x2-time').textContent = `${timeToX2} ngày`;
        document.getElementById('c4-x2-time').style.color = '#10b981';
    } else {
        document.getElementById('c4-x2-time').textContent = 'Chưa đạt';
        document.getElementById('c4-x2-time').style.color = '#94a3b8';
    }

    // New Output: Breakeven Time
    const breakEvenEl = document.getElementById('c4-breakeven-time');
    if (timeToBreakeven) {
        const bMonths = Math.floor(timeToBreakeven / daysPerMonth);
        const bDays = timeToBreakeven % daysPerMonth;
        let timeStr = `${timeToBreakeven} ngày`;
        // Only show months if meaningful (at least 1 month)
        if (bMonths > 0) {
            timeStr = `${bMonths} tháng ${bDays > 0 ? bDays + ' ngày' : ''}`;
        }
        breakEvenEl.textContent = timeStr;
        breakEvenEl.style.color = '#3b82f6';
    } else {
        breakEvenEl.textContent = 'Chưa đạt';
        breakEvenEl.style.color = '#94a3b8';
    }

    document.getElementById('c4-log').innerHTML = logHTML || '<div style="color: #94a3b8">Chưa có sự kiện nổi bật</div>';

    // Render Step Chart
    renderStepChart('chart-trading', labels, dataAccounts);
}

// Specialized Step Chart for Trading
function renderStepChart(canvasId, labels, data, existingChartInstance) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (chartTrading) {
        chartTrading.destroy();
    }

    chartTrading = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng Accounts',
                data: data,
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.2)',
                stepped: true, // Key feature for step chart
                fill: true,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: { display: true, grid: { display: false } }, // Hide x grid
                y: {
                    beginAtZero: false,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Helper to display formula
function displayFormula(elementId, formulaText, substitutionText) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<span class="formula-label">Công thức:</span>
<span class="formula-math">${formulaText}</span>
<br><br>
<span class="formula-label">Thay số:</span>
<span class="formula-math">${substitutionText}</span>`;
    el.classList.add('visible');
}

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

    // Show FormulaDisplay
    const nText = n === 12 ? '12' : (n === 4 ? '4' : '1');
    const formulaStr = `A = P * (1 + r/n)^(n*t)`;
    const subStr = `${formatCurrency(P)} * (1 + ${parseFloat(document.getElementById('c1-rate').value)}%/${nText})^(${nText}*${t}) = ${formatCurrency(finalAmount)}`;
    displayFormula('c1-formula', formulaStr, subStr);

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

    // Show FormulaDisplay
    const rVal = parseFloat(document.getElementById('c2-rate').value);
    const formulaStr = `FV = P*(1 + r/n)^(nt) + PMT * [(1 + r/n)^(nt) - 1] / (r/n)`;
    const subStr = `Principal: ${formatCurrency(P)} * (1 + ${rVal}%/12)^(12*${t})\n+ Series: ${formatCurrency(PMT)} * [(1 + ${rVal}%/12)^(12*${t}) - 1] / (${rVal}%/12)`;
    displayFormula('c2-formula', formulaStr, subStr);

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

    // Show FormulaDisplay (Initial EMI)
    const r1Val = parseFloat(document.getElementById('c3-rate1').value);
    const formulaStr = `EMI = P * r * (1+r)^n / ((1+r)^n - 1)`;
    const subStr = `EMI (kỳ đầu) = ${formatCurrency(P)} * ${(r1Val / 12).toFixed(2)}% * (1 + ${(r1Val / 12).toFixed(2)}%/${totalMonths}) ... \n= ${formatCurrency(emi1)} / tháng`;
    displayFormula('c3-formula', formulaStr, subStr);

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
