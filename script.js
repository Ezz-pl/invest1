// === Sidebar Toggle ===
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    if (sidebar.style.left === '0px') {
        sidebar.style.left = '-250px';
    } else {
        sidebar.style.left = '0px';
    }
});

// === Section Navigation ===
const navItems = document.querySelectorAll('.sidebar ul li');
const sections = document.querySelectorAll('.section');

navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        sections.forEach(section => section.classList.remove('active'));
        sections[index].classList.add('active');
        sidebar.style.left = '-250px'; // اغلاق الشريط بعد الاختيار
    });
});

// === Investor Form & Quick Calculation ===
const investorForm = document.querySelector('#investor-form');
const calcResults = document.querySelector('#calc-results');

function calculateInvestor() {
    const name = document.querySelector('#investor-name').value;
    const phone = document.querySelector('#investor-phone').value;
    const method = document.querySelector('#investor-method').value;
    const period = parseInt(document.querySelector('#investor-period').value);
    const occupancy = parseInt(document.querySelector('#occupancy-range').value);

    const capital = 1750000;
    const totalShares = 2000;
    const shareValue = capital / totalShares;

    let investedAmount = 0;

    if (method === 'shares') {
        const shares = parseInt(document.querySelector('#investor-shares').value);
        investedAmount = shares * shareValue;
    } else {
        investedAmount = parseFloat(document.querySelector('#investor-amount').value);
    }

    // افتراضات الحاسبة
    const monthlyRevenue = 135 * 26 * (occupancy / 100) * 30; // 26 سيارة
    const monthlyCosts = 23690 + (290 * 26); // ثابت + متغير
    const monthlyProfit = monthlyRevenue - monthlyCosts;
    const investorShare = monthlyProfit * 0.5;

    const annualProfit = investorShare * 12;
    const totalROI = annualProfit * period;

    // عرض النتائج
    calcResults.innerHTML = `
        <div class="result-card">المستثمر: ${name}</div>
        <div class="result-card">رقم الجوال: ${phone}</div>
        <div class="result-card">المبلغ المستثمر: ${investedAmount.toLocaleString()} ﷼</div>
        <div class="result-card">نسبة التشغيل: ${occupancy}%</div>
        <div class="result-card">الربح الشهري المتوقع: ${monthlyProfit.toLocaleString()} ﷼</div>
        <div class="result-card">حصة المستثمر (50%): ${investorShare.toLocaleString()} ﷼</div>
        <div class="result-card">العائد السنوي المتوقع: ${annualProfit.toLocaleString()} ﷼</div>
        <div class="result-card">إجمالي العائد لفترة ${period} سنة: ${totalROI.toLocaleString()} ﷼</div>
    `;
}

// إضافة حدث عند الضغط على زر الحساب
document.querySelector('#calculate-btn').addEventListener('click', (e) => {
    e.preventDefault();
    calculateInvestor();
});

// === WhatsApp Button ===
document.querySelector('#whatsapp-btn').addEventListener('click', () => {
    const name = document.querySelector('#investor-name').value;
    const phone = document.querySelector('#investor-phone').value;
    const method = document.querySelector('#investor-method').value;
    const period = document.querySelector('#investor-period').value;
    const occupancy = document.querySelector('#occupancy-range').value;

    let investedAmount = 0;
    if (method === 'shares') {
        const shares = parseInt(document.querySelector('#investor-shares').value);
        investedAmount = shares * 875;
    } else {
        investedAmount = parseFloat(document.querySelector('#investor-amount').value);
    }

    const message = `مرحباً، أنا ${name}، رقم جوالي: ${phone}. 
المبلغ المستثمر: ${investedAmount} ﷼
طريقة الاستثمار: ${method}
فترة الاستثمار: ${period} سنة
نسبة التشغيل المتوقعة: ${occupancy}%
أنا موافق على كل الشروط.`

    const url = `https://wa.me/966500772878?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});

// === Chart.js Example Setup ===
const ctxBar = document.getElementById('financial-bar-chart').getContext('2d');
const financialBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: ['2026', '2027', '2028', '2029', '2030'],
        datasets: [{
            label: 'صافي الأرباح السنوية (﷼)',
            data: [465000, 530000, 610000, 710000, 820000],
            backgroundColor: '#3C9D4B'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true },
            title: {
                display: true,
                text: 'قائمة الأرباح السنوية المتوقعة'
            }
        }
    }
});

const ctxPie = document.getElementById('market-pie-chart').getContext('2d');
const marketPieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
        labels: ['نُقَاء', 'المنافسون', 'السوق الحر'],
        datasets: [{
            label: 'حصة السوق',
            data: [35, 45, 20],
            backgroundColor: ['#3C9D4B', '#203647', '#FFD700']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            title: {
                display: true,
                text: 'تحليل السوق وحصة المنافسين'
            }
        }
    }
});
