// Global variables and constants (Updated for 26 Cars and 2000 Shares)
const TOTAL_SHARES = 2000;
const BASE_CAPITAL = 1750000; [span_0](start_span)// 1,750,000 ريال[span_0](end_span)
const SHARE_PRICE = BASE_CAPITAL / TOTAL_SHARES; // 1,750,000 / 2000 = 875 ريال
const TOTAL_CAR_COUNT = 26; [span_1](start_span)//[span_1](end_span)
let investorData = { 
    name: '', 
    phone: '', 
    email: '', 
    linkSource: '', 
    type: '', 
    amount: 0, 
    shares: 0, 
    exitYear: 'بعد 5 سنوات' 
};

// Annual returns for calculation (Updated based on user preference)
const ANNUAL_RETURNS = {
    'بعد 1.5 سنة': 0.10, 
    'بعد سنتين': 0.125, // أقل فترة خروج مسموحة
    'بعد 3 سنوات': 0.15, 
    'بعد 4 سنوات': 0.165,
    'بعد 5 سنوات': 0.18, 
    'بعد 6 سنوات': 0.19, 
    'بعد 7 سنوات': 0.20,
    'أفكر بوقت آخر': 0.10 // عائد افتراضي
};

// Fleet Details and Costs (26 Cars) - Used for calculations
const CAR_COSTS = {
    [span_2](start_span)'هيونداي Grand i10': { count: 10, cost: 51175, minDaily: 115, maxDaily: 140, avgMonthly: 2300 }, //[span_2](end_span)
    [span_3](start_span)'كيا بيجاس GL': { count: 10, cost: 50600, minDaily: 115, maxDaily: 140, avgMonthly: 2300 }, //[span_3](end_span)
    [span_4](start_span)'جيلي امجراند جي اس': { count: 2, cost: 60304, minDaily: 125, maxDaily: 150, avgMonthly: 2425 }, //[span_4](end_span)
    [span_5](start_span)'تويوتا يارس Y': { count: 3, cost: 64400, minDaily: 125, maxDaily: 150, avgMonthly: 2425 }, //[span_5](end_span)
    [span_6](start_span)'كيا K4 LX': { count: 1, cost: 84525, minDaily: 155, maxDaily: 175, avgMonthly: 2825 } //[span_6](end_span)
};

// Calculate actual total car cost for ROI calculation
let TOTAL_CAR_COST_ACTUAL = 0;
for (const car in CAR_COSTS) {
    TOTAL_CAR_COST_ACTUAL += CAR_COSTS[car].count * CAR_COSTS[car].cost;
}

[span_7](start_span)// FIXED EXPENSES (Annual) - Based on corrected values[span_7](end_span)
const SALARY_EMPLOYEE_SHIFT = 96000; // 8000 ريال * 12 شهر
const RENT = 40000; // 40,000 ريال سنويا
const INSURANCE_PER_CAR_ANNUAL = 4000; // متوسط تأمين شامل
const OPERATIONAL_FEES_PER_CAR_ANNUAL = 1500; // 1000 ريال لكرت التشغيل + 500 ريال للطارئة
const WASH_SUPPLIES = 3600; // 300 ريال/شهر * 12
const WATER_TANK = 1680; // 140 ريال/شهر * 12

const TOTAL_FIXED_COSTS_ANNUAL = 
    SALARY_EMPLOYEE_SHIFT + RENT + WASH_SUPPLIES + WATER_TANK + 
    ((INSURANCE_PER_CAR_ANNUAL + OPERATIONAL_FEES_PER_CAR_ANNUAL) * TOTAL_CAR_COUNT);
const MONTHLY_FIXED_COSTS = TOTAL_FIXED_COSTS_ANNUAL / 12; // 284,280 / 12 = 23,690 ريال شهرياً

[span_8](start_span)// VARIABLE EXPENSES (Monthly/Car) - Based on corrected values[span_8](end_span)
const OIL_CHANGE_MONTHLY = 90; 
const TIRES_MONTHLY = 100;
const MAINTENANCE_RESERVE_MONTHLY_YEAR1 = 100; 
const MONTHLY_VARIABLE_COSTS_CAR = OIL_CHANGE_MONTHLY + TIRES_MONTHLY + MAINTENANCE_RESERVE_MONTHLY_YEAR1; // 290 ريال/شهر/سيارة

[span_9](start_span)// Additional Income (Monthly Averages) - Based on corrected values[span_9](end_span)
const AVG_KILOMETER_INCOME_MONTHLY_UNIT = 600;
const AVG_INSURANCE_PROFIT_MONTHLY_UNIT = 400;
const AVG_ADDITIONAL_INCOME_MONTHLY = (AVG_KILOMETER_INCOME_MONTHLY_UNIT + AVG_INSURANCE_PROFIT_MONTHLY_UNIT) * TOTAL_CAR_COUNT; // 26,000 ريال شهرياً

const BASE_ANNUAL_GROWTH = 0.15; // 15% معدل النمو السنوي الافتراضي

// -------------------- Utility Functions --------------------

// Format numbers to Arabic locale
function formatNum(x){ 
    return Number(x).toLocaleString('ar-EG', {minimumFractionDigits: 0, maximumFractionDigits: 0});
}

// Toggle Sidebar for mobile view
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.style.width === '250px') {
        sidebar.style.width = '0';
    } else {
        sidebar.style.width = '250px';
    }
}

// Sidebar/Tab navigation helper
function changeTab(evt, tabName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active-tab');
        if (section.id === tabName) {
            section.classList.add('active-tab');
        } else if (section.id === 'contentContainer' && tabName !== 'InteractiveEntry' && tabName !== 'project-intro') {
            document.getElementById('contentContainer').classList.add('active-tab');
            openTab(evt, tabName); // Use the inner tab system for main content
        }
    });

    // Close sidebar after selection on mobile
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// -------------------- Section 1: Interactive Entry Logic --------------------

function updateInvestmentFields() {
    const type = document.getElementById('investmentType').value;
    document.getElementById('amountGroup').style.display = type === 'amount' ? 'flex' : 'none';
    document.getElementById('sharesGroup').style.display = type === 'shares' ? 'flex' : 'none';
    
    // Clear the opposite field when switching
    if (type === 'shares') {
         document.getElementById('investmentAmount').value = '';
    } else if (type === 'amount') {
         document.getElementById('shareCount').value = '';
    }
    calculateExit();
}

function calculateExit(isFinal = false) {
    const exitYearElement = isFinal ?
    document.getElementById('finalExitPeriod') : document.getElementById('exitPeriod');
    const exitYear = exitYearElement ? exitYearElement.value : investorData.exitYear;
    
    const yearsMatch = exitYear.match(/\d+\.?\d*/);
    const years = yearsMatch ? parseFloat(yearsMatch[0]) : 5;
    
    let investmentAmount = 0;
    let shares = 0;

    // Determine input source
    if (isFinal) {
        const finalAmountInput = document.getElementById('finalInvestmentAmount').value;
        const finalSharesInput = document.getElementById('finalShareCount').value;

        if (finalAmountInput) {
            investmentAmount = parseFloat(finalAmountInput) || 0;
            shares = investmentAmount / SHARE_PRICE;
            document.getElementById('finalShareCount').value = shares.toFixed(0);
        } else if (finalSharesInput) {
            shares = parseFloat(finalSharesInput) || 0;
            investmentAmount = shares * SHARE_PRICE;
            document.getElementById('finalInvestmentAmount').value = investmentAmount.toFixed(0);
        }
    } else {
        const type = document.getElementById('investmentType').value;
        const amountInput = parseFloat(document.getElementById('investmentAmount').value) || 0;
        const sharesInput = parseFloat(document.getElementById('shareCount').value) || 0;
        
        if (type === 'amount' && amountInput > 0) {
            investmentAmount = amountInput;
            shares = amountInput / SHARE_PRICE;
        } else if (type === 'shares' && sharesInput > 0) {
            shares = sharesInput;
            investmentAmount = sharesInput * SHARE_PRICE;
        }
    }
    
    if (investmentAmount <= 0) {
        if (!isFinal) {
            document.getElementById('exitResult').style.display = 'block';
            document.getElementById('exitResult').innerHTML = '<p class="opinion-negative">يرجى إدخال مبلغ الاستثمار أو عدد الأسهم أولاً.</p>';
        } else {
            document.getElementById('finalSummaryAmount').textContent = '0 ريال';
            document.getElementById('finalSummaryReturn').textContent = '0 ريال';
            document.getElementById('finalSummaryAnnualRate').textContent = '0%';
        }
        return;
    }

    // Base Profit Calculation: Use average monthly net profit for calculation
    const baseProfitData = getBaseMonthlyProfit(0.70); // Use 70% occupancy baseline
    const BASE_NET_PROFIT = baseProfitData.netProfit * 12; // Annual Net Profit

    const PARTNER_SHARE_PERCENTAGE = 0.50; // 50% للمستثمر
    const investmentRatio = investmentAmount / BASE_CAPITAL;
    let projectedTotalProfit = 0;

    // Calculate projected profit over the period with annual growth
    for (let i = 1; i <= years; i++) {
        let annualBaseProfit = BASE_NET_PROFIT * Math.pow(1 + BASE_ANNUAL_GROWTH, i - 1);
        projectedTotalProfit += annualBaseProfit * PARTNER_SHARE_PERCENTAGE * investmentRatio;
    }

    const totalReturn = investmentAmount + projectedTotalProfit;
    const avgAnnualRate = (projectedTotalProfit / investmentAmount) / years;

    // Display Logic
    if (!isFinal) {
        document.getElementById('exitResult').style.display = 'block';
        document.getElementById('exitResult').innerHTML = `
            <div style="font-size: 1.2em; text-align: right;">
                <p>المبلغ المُستثمر: <span class="highlight">${formatNum(investmentAmount.toFixed(0))} ريال</span></p>
                <p>عدد الأسهم التقديري: <span class="highlight">${shares.toFixed(0)} سهم</span></p>
                <p>فترة الخروج: <span class="highlight">${exitYear}</span></p>
                <p style="font-weight: 700; color: var(--secondary-color);">إجمالي المبلغ المُستحق بعد الخروج (تخميني): <span class="highlight">${formatNum(totalReturn.toFixed(0))} ريال</span> (رأس مال + أرباح)</p>
            </div>
        `;
    }
    
    // Update final submission display
    if (isFinal) {
        document.getElementById('finalSummaryAmount').textContent = `${formatNum(investmentAmount.toFixed(0))} ريال`;
        document.getElementById('finalSummaryExit').textContent = exitYear;
        document.getElementById('finalSummaryReturn').textContent = `${formatNum(totalReturn.toFixed(0))} ريال`;
        document.getElementById('finalSummaryAnnualRate').textContent = (avgAnnualRate * 100).toFixed(1) + '%';
        
        // Update input field for shares/amount if one was input manually
        if (document.getElementById('finalInvestmentAmount').value && !document.getElementById('finalSharesInput').value) {
            document.getElementById('finalShareCount').value = shares.toFixed(0);
        } else if (document.getElementById('finalShareCount').value && !document.getElementById('finalInvestmentAmount').value) {
            document.getElementById('finalInvestmentAmount').value = investmentAmount.toFixed(0);
        }
    }
}

function showDetails() {
    const name = document.getElementById('investorName').value;
    const phone = document.getElementById('investorPhone').value;
    const email = document.getElementById('investorEmail').value;
    const linkSource = document.getElementById('linkSource').value;
    const investmentType = document.getElementById('investmentType').value;
    const amountInput = parseFloat(document.getElementById('investmentAmount').value) || 0;
    const sharesInput = parseFloat(document.getElementById('shareCount').value) || 0;

    let investmentAmount = 0;
    let shares = 0;

    if (investmentType === 'amount' && amountInput > 0) {
         investmentAmount = amountInput;
         shares = amountInput / SHARE_PRICE;
    } else if (investmentType === 'shares' && sharesInput > 0) {
         shares = sharesInput;
         investmentAmount = sharesInput * SHARE_PRICE;
    }

    if (!name || !phone || investmentType === 'none' || investmentAmount <= 0) {
         alert("الرجاء إدخال الاسم ورقم الجوال وتحديد مبلغ/عدد الأسهم بشكل صحيح للمتابعة.");
         return;
    }

    // Store validated data globally
    investorData.name = name;
    investorData.phone = phone;
    investorData.email = email;
    investorData.linkSource = document.getElementById('linkSource').options[document.getElementById('linkSource').selectedIndex].text;
    investorData.type = investmentType;
    investorData.amount = investmentAmount;
    investorData.shares = shares;
    investorData.exitYear = document.getElementById('exitPeriod').value;

    // Update final submission form fields with initial data
    document.getElementById('finalName').value = investorData.name;
    document.getElementById('finalPhone').value = investorData.phone;
    document.getElementById('finalSourceOfLink').value = investorData.linkSource;
    document.getElementById('finalInvestmentAmount').value = investmentType === 'amount' ? amountInput.toFixed(0) : '';
    document.getElementById('finalShareCount').value = investmentType === 'shares' ? sharesInput.toFixed(0) : '';
    document.getElementById('finalExitPeriod').value = investorData.exitYear;
    calculateExit(true);

    let nameDisplay = `<span class="highlight">${investorData.name}</span>`;
    let investmentDetail = '';

    if (investmentType === 'amount') {
        investmentDetail = `لقد اخترت الاستثمار بمبلغ: <span class="highlight">${formatNum(investorData.amount.toFixed(0))} ريال</span>.`;
    } else if (investmentType === 'shares') {
        investmentDetail = `لقد اخترت <span class="highlight">${shares.toFixed(0)} سهمًا</span> (بقيمة ${formatNum(investorData.amount.toFixed(0))} ريال).`;
    }

    const welcomeMessage = `
        <div class="investor-message">
            مرحباً بك، شريكنا العزيز/ ${nameDisplay}.<br>
            ${investmentDetail}<br>
            نحن نؤمن بالشفافية المطلقة. يرجى تصفح أدناه دراسة الجدوى الشاملة التي تجيب على كل استفساراتك حول الفرص والمخاطر.
        </div>
    `;
    
    // Hide intro sections and show main content
    document.getElementById('contentContainer').style.display = 'block';
    document.getElementById('welcomeSection').innerHTML = welcomeMessage;
    document.getElementById('InteractiveEntry').style.display = 'none';
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('welcomeSection').classList.add('active-tab'); // Show welcome message section
    
    // Initialize calculator and charts
    calculateProfit();
    initializeCharts();
    moveCarousel(0); // Initialize carousel display
}

// -------------------- Section 4: Calculator Logic --------------------

// Tab switching for inner calculator sections
function openCalculatorTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.calculator-tab');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    const tabButtons = document.querySelectorAll('.tab-nav button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Calculate the base monthly profit (used for monthly tab and annual forecast)
function getBaseMonthlyProfit(occupancyRate) {
     let revenueBase = 0;
     let totalCarCount = TOTAL_CAR_COUNT;
     // Calculate Total Monthly Revenue Base (using average monthly rate)
     for (const car in CAR_COSTS) {
        revenueBase += CAR_COSTS[car].count * CAR_COSTS[car].avgMonthly;
     }
    // Average Monthly Revenue (26 cars @ avg 2355.38 SAR/mo) = 61240 SAR
    
    let totalRevenue = revenueBase * occupancyRate;
    totalRevenue += AVG_ADDITIONAL_INCOME_MONTHLY; // 26,000 ريال
    
    // Calculate expenses (using Year 1 variable cost)
    const totalVariableCosts = totalCarCount * MONTHLY_VARIABLE_COSTS_CAR; // 26 * 290 = 7,540 ريال
    const totalExpenses = MONTHLY_FIXED_COSTS + totalVariableCosts; // 23,690 + 7,540 = 31,230 ريال

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit: totalRevenue - totalExpenses
    };
}


function updateOccupancyLabel(value) {
    document.getElementById('occupancy-label-slider').textContent = value + '%';
    document.getElementById('occupancy-label').textContent = value + '%';
}

function calculateProfit() {
    const occupancyRate = parseFloat(document.getElementById('occupancy-rate-slider').value) / 100;
    const additionalIncomeInput = parseFloat(document.getElementById('additional-income').value) || 0;
    
    const profitData = getBaseMonthlyProfit(occupancyRate);
    
    // Adjust total revenue calculation to use the user-inputted additional income
    const totalRevenue = (profitData.revenue - AVG_ADDITIONAL_INCOME_MONTHLY) + additionalIncomeInput;
    const totalExpenses = profitData.expenses; 
    
    const netProfit = totalRevenue - totalExpenses;
    const partnerShare = netProfit * 0.50; // 50% for investor
    
    // Update display
    document.getElementById('total-revenue').textContent = formatNum(totalRevenue) + ' ريال';
    document.getElementById('total-expenses').textContent = formatNum(totalExpenses) + ' ريال';
    document.getElementById('net-profit').textContent = formatNum(netProfit) + ' ريال';
    document.getElementById('partner-share-monthly').textContent = formatNum(partnerShare) + ' ريال';
}

function calculateAnnualProfit() {
    const years = parseInt(document.getElementById('years-forecast').value);
    const growthRate = parseFloat(document.getElementById('growth-rate').value) / 100;
    
    // Use 70% occupancy for the base forecast as per model assumptions
    const baseProfitData = getBaseMonthlyProfit(0.70);
    const totalRevenueMonthly = baseProfitData.revenue;
    const totalExpensesMonthly = baseProfitData.expenses;
    const monthlyNetProfit = baseProfitData.netProfit;

    let totalAnnualRevenue = 0;
    let totalAnnualExpenses = 0;
    let totalAnnualNetProfit = 0;
    
    for (let i = 1; i <= years; i++) {
        // Apply growth factor to revenue, expenses assumed stable initially for simpler forecast
        const revenueGrowthFactor = Math.pow(1 + growthRate, i - 1);
        const expenseGrowthFactor = 1; 
        
        const annualRevenueThisYear = totalRevenueMonthly * 12 * revenueGrowthFactor;
        const annualExpensesThisYear = totalExpensesMonthly * 12 * expenseGrowthFactor;
        
        totalAnnualRevenue += annualRevenueThisYear;
        totalAnnualExpenses += annualExpensesThisYear;
        totalAnnualNetProfit += annualRevenueThisYear - annualExpensesThisYear;
    }
    
    // Calculate ROI against the actual purchase price of the fleet
    const roi = (totalAnnualNetProfit / TOTAL_CAR_COST_ACTUAL) * 100;
    
    // Update display
    document.getElementById('annual-revenue').textContent = formatNum(totalAnnualRevenue) + ' ريال';
    document.getElementById('annual-expenses').textContent = formatNum(totalAnnualExpenses) + ' ريال';
    document.getElementById('annual-net-profit').textContent = formatNum(totalAnnualNetProfit) + ' ريال';
    document.getElementById('roi').textContent = roi.toFixed(1) + '%';
}

function updateOccupancySimulation(value) {
    document.getElementById('occupancy-display').textContent = value + '%';
    const occupancyRate = value / 100;
    const rentedCars = Math.round(TOTAL_CAR_COUNT * occupancyRate);
    
    // Calculate Average Daily Rate from the mix (using max rates for this simulation)
    let totalMaxDailyRate = 0;
    let totalCarCount = 0;
    for (const car in CAR_COSTS) {
        totalMaxDailyRate += CAR_COSTS[car].count * CAR_COSTS[car].maxDaily;
        totalCarCount += CAR_COSTS[car].count;
    }
    const avgDailyRate = totalMaxDailyRate / totalCarCount; 
    // approx 135.5 SAR

    const dailyRevenue = rentedCars * avgDailyRate;
    const monthlyRevenue = dailyRevenue * 30;
    
    document.getElementById('rented-cars').textContent = rentedCars + ' سيارة';
    document.getElementById('daily-revenue').textContent = formatNum(dailyRevenue) + ' ريال';
    document.getElementById('monthly-revenue').textContent = formatNum(monthlyRevenue) + ' ريال';
}

function calculateBreakEven() {
    const fixedCosts = parseFloat(document.getElementById('fixed-costs').value);
    const variableCostPerCar = parseFloat(document.getElementById('variable-cost-per-car').value);
    
    // Calculate average revenue per car (using avg monthly rate from CAR_COSTS)
    let totalRevenueBase = 0;
    let totalCars = 0;
    for (const car in CAR_COSTS) {
        const avgMonthlyRate = CAR_COSTS[car].avgMonthly;
        totalRevenueBase += CAR_COSTS[car].count * avgMonthlyRate;
        totalCars += CAR_COSTS[car].count;
    }
    const avgRevenuePerCar = totalRevenueBase / totalCars; 

    // Calculate break-even point
    const contributionMarginPerCar = avgRevenuePerCar - variableCostPerCar;
    const breakEvenCarsPerMonth = fixedCosts / contributionMarginPerCar;
    const breakEvenOccupancyRate = (breakEvenCarsPerMonth / totalCars) * 100;
    const breakEvenRevenue = breakEvenCarsPerMonth * avgRevenuePerCar;

    // Update display
    document.getElementById('break-even-occupancy').textContent = breakEvenOccupancyRate.toFixed(1) + '%';
    document.getElementById('break-even-cars').textContent = Math.ceil(breakEvenCarsPerMonth) + ' سيارة';
    document.getElementById('break-even-revenue').textContent = formatNum(breakEvenRevenue) + ' ريال';
}

// -------------------- Section 7: Competitors Carousel Logic --------------------

let currentSlide = 0;
function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.competitor-card-style');
    if (!slides.length) return;

    // Calculate card width and margin
    const cardElement = slides[0];
    const computedStyle = window.getComputedStyle(cardElement);
    const marginRight = parseFloat(computedStyle.marginRight);
    const containerWidth = track.parentElement.clientWidth;
    const cardWidth = cardElement.offsetWidth + marginRight;
    
    // Adjustments for responsive view
    const slideWidth = window.innerWidth <= 768 ? cardElement.parentElement.clientWidth * 0.95 + 20 : cardWidth;
    
    currentSlide += direction;

    // Boundary checks (Looping carousel)
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }

    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}


// -------------------- Final Commitment & WhatsApp Logic --------------------

function submitFinalCommitment() {
    const finalName = document.getElementById('finalName').value;
    const finalPhone = document.getElementById('finalPhone').value;
    const finalExitYear = document.getElementById('finalExitPeriod').value;
    const notes = document.getElementById('finalCommitmentNotes').value || 'لا توجد ملاحظات إضافية.';
    
    // Ensure calculation is up-to-date
    calculateExit(true); 
    
    const finalAmount = investorData.amount;
    const finalShares = investorData.shares;

    if (!finalName || !finalPhone || finalAmount <= 0) {
        alert("الرجاء إكمال جميع الحقول المطلوبة (الاسم، الجوال، ومبلغ الاستثمار) بشكل صحيح.");
        return;
    }
    
    // Prepare WhatsApp Message
    const whatsappNumber = '0500772878';
    const whatsappMessage = `
مرحباً، أود تأكيد التزامي بالاستثمار في مشروع الأسطول الذهبي (نُقَاء).

**ملخص الالتزام:**
- الاسم الكامل: ${finalName}
- رقم الجوال: ${finalPhone}
- البريد الإلكتروني: ${document.getElementById('investorEmail').value || 'لم يتم إدخاله'}
- المبلغ المستثمر: ${formatNum(finalAmount.toFixed(0))} ريال سعودي
- عدد الأسهم: ${finalShares.toFixed(0)} سهم (من أصل 2000 سهم)
- فترة الخروج المتوقعة: ${finalExitYear}
- العائد السنوي المتوقع: ${document.getElementById('finalSummaryAnnualRate').textContent}
- إجمالي المبلغ المتوقع بعد الخروج: ${document.getElementById('finalSummaryReturn').textContent}

- ملاحظات إضافية: ${notes}

يرجى التواصل معي على وجه السرعة لاستكمال إجراءات العقد النهائي.
`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');

    // Show confirmation message inside the final submission section
    const confirmationMessage = `
        <div class="section" style="text-align: center; background-color: #e8f5e9; border: 2px solid var(--secondary-color);">
            <h2 style="color: var(--secondary-color); margin-top: 0;">
                <i class="fas fa-check-circle"></i> تم تسجيل التزامك الأولي بنجاح!
            </h2>
            <p style="font-size: 1.2em; margin-bottom: 30px;">
                شكراً لك يا <span class="highlight">${finalName}</span> على ثقتك بمشروع الأسطول الذهبي.
            </p>
            <div class="total-box" style="background-color: white; border: 2px solid var(--primary-color);">
                <p>ملخص استثمارك النهائي (رسالة الواتساب):</p>
                <p>المبلغ المستثمر: <span class="highlight">${formatNum(finalAmount.toFixed(0))} ريال</span></p>
                <p>عدد الأسهم: <span class="highlight">${finalShares.toFixed(0)} سهم</span></p>
                <p>فترة الخروج: <span class="highlight">${finalExitYear}</span></p>
            </div>
            <p style="margin-top: 30px; color: var(--danger-color); font-weight: 700;">
                **يرجى الضغط على زر الإرسال في صفحة الواتساب التي تم فتحها لتأكيد التزامك**
            </p>
            <p>سيتم التواصل معك عبر **0500772878** لاستكمال إجراءات العقد.</p>
            <p>البريد الإلكتروني للإدارة: <span class="highlight">aazz0507zz@gmail.com</span></p>
        </div>
    `;
    document.querySelector('#commitment').innerHTML = confirmationMessage;
    document.querySelector('#commitment').scrollIntoView({ behavior: 'smooth' });
}


// -------------------- Chart Initialization (Section 5: Financial) --------------------

function initializeCharts() {
    const monthlyProfitData = getBaseMonthlyProfit(0.70); // Data @ 70% occupancy
    const totalVariableCostAnnual = MONTHLY_VARIABLE_COSTS_CAR * TOTAL_CAR_COUNT * 12; // 90,480 ريال
    const otherFixedCostsAnnual = RENT + WASH_SUPPLIES + WATER_TANK + (OPERATIONAL_FEES_PER_CAR_ANNUAL * TOTAL_CAR_COUNT); // 84,280 ريال
    const annualInsuranceCost = INSURANCE_PER_CAR_ANNUAL * TOTAL_CAR_COUNT; // 104,000 ريال

    // 1. Expense Distribution Chart (Doughnut)
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: ['الرواتب', 'التأمين (سنوي)', 'الصيانة المتغيرة (احتياطي)', 'الإيجار والرسوم الأخرى'],
                datasets: [{
                    data: [SALARY_EMPLOYEE_SHIFT, annualInsuranceCost, totalVariableCostAnnual, otherFixedCostsAnnual],
                    backgroundColor: [
                        '#203647', // Primary: الرواتب
                        '#ffc107', // Tertiary: التأمين
                        '#3C9D4B', // Secondary: الصيانة
                        '#d32f2f' // Danger: الإيجار والرسوم الأخرى
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    title: { display: true, text: 'توزيع المصروفات السنوية (284,280 ريال)' }
                }
            }
        });
    }
    
    // 2. Car Type Revenue Chart (Pie)
    const carTypeCtx = document.getElementById('carTypeChart');
    if (carTypeCtx) {
        new Chart(carTypeCtx, {
            type: 'pie',
            data: {
                labels: ['هيونداي Grand i10', 'كيا بيجاس GL', 'جيلي امجراند', 'تويوتا يارس', 'كيا K4'],
                datasets: [{
                    // Projected Annual Revenue @ 70% Occupancy
                    data: [
                        CAR_COSTS['هيونداي Grand i10'].avgMonthly * 10 * 12 * 0.7, 
                        CAR_COSTS['كيا بيجاس GL'].avgMonthly * 10 * 12 * 0.7, 
                        CAR_COSTS['جيلي امجراند جي اس'].avgMonthly * 2 * 12 * 0.7, 
                        CAR_COSTS['تويوتا يارس Y'].avgMonthly * 3 * 12 * 0.7, 
                        CAR_COSTS['كيا K4 LX'].avgMonthly * 1 * 12 * 0.7
                    ],
                    backgroundColor: [
                        '#203647', '#ffc107', '#3C9D4B', '#1976d2', '#d32f2f'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    title: { display: true, text: 'الإيرادات السنوية حسب نوع السيارة (تقديري)' }
                }
            }
        });
    }

    // 3. Seasonality Chart (Bar) - Placeholder data
    const seasonalityCtx = document.getElementById('seasonalityChart');
    if (seasonalityCtx) {
        new Chart(seasonalityCtx, {
            type: 'bar',
            data: {
                labels: ['الربيع (75%)', 'الصيف (85%)', 'الخريف (70%)', 'الشتاء (65%)'],
                datasets: [{
                    label: 'متوسط نسبة التشغيل',
                    data: [75, 85, 70, 65],
                    backgroundColor: '#203647'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نسبة التشغيل حسب الفصول الأربعة' }
                }
            }
        });
    }
}


// -------------------- Scroll to Top --------------------

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
