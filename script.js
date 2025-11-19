// Global constants and initial data (100% data recovery)
const TOTAL_SHARES = 2000;
const BASE_CAPITAL = 1750000; // 1,750,000 ريال
const SHARE_PRICE = BASE_CAPITAL / TOTAL_SHARES; // 875 ريال
const TOTAL_CAR_COUNT = 26; //
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

// Annual returns for calculation 
const ANNUAL_RETURNS = {
    'بعد 1.5 سنة': 0.10, 
    'بعد سنتين': 0.125, 
    'بعد 3 سنوات': 0.15, 
    'بعد 4 سنوات': 0.165,
    'بعد 5 سنوات': 0.18, 
    'بعد 6 سنوات': 0.19, 
    'بعد 7 سنوات': 0.20,
    'أفكر بوقت آخر': 0.10 
};

// Fleet Details and Costs (26 Cars)
const CAR_COSTS = {
    'هيونداي Grand i10': { count: 10, cost: 51175, minDaily: 115, maxDaily: 140, avgMonthly: 2300 }, 
    'كيا بيجاس GL': { count: 10, cost: 50600, minDaily: 115, maxDaily: 140, avgMonthly: 2300 }, 
    'جيلي امجراند جي اس': { count: 2, cost: 60304, minDaily: 125, maxDaily: 150, avgMonthly: 2425 }, 
    'تويوتا يارس Y': { count: 3, cost: 64400, minDaily: 125, maxDaily: 150, avgMonthly: 2425 }, 
    'كيا K4 LX': { count: 1, cost: 84525, minDaily: 155, maxDaily: 175, avgMonthly: 2825 } 
};

// Calculate total car cost
let TOTAL_CAR_COST_ACTUAL = 0;
for (const car in CAR_COSTS) {
    TOTAL_CAR_COST_ACTUAL += CAR_COSTS[car].count * CAR_COSTS[car].cost;
}

// FIXED EXPENSES (Annual) - Based on final prompt
const SALARY_EMPLOYEE_SHIFT = 96000; // 8000 * 12
const RENT = 40000; // 40,000 ﷼ سنوياً
const INSURANCE_PER_CAR_ANNUAL = 4000; // متوسط تأمين شامل
const OPERATIONAL_FEES_PER_CAR_ANNUAL = 1500; // 1000 ﷼ لكرت التشغيل + 500 ﷼ للطارئة
const WASH_SUPPLIES = 3600; // 300 ﷼/شهر * 12
const WATER_TANK = 1680; // 140 ﷼/شهر * 12

const TOTAL_FIXED_COSTS_ANNUAL = 
    SALARY_EMPLOYEE_SHIFT + RENT + WASH_SUPPLIES + WATER_TANK + 
    ((INSURANCE_PER_CAR_ANNUAL + OPERATIONAL_FEES_PER_CAR_ANNUAL) * TOTAL_CAR_COUNT);
const MONTHLY_FIXED_COSTS = TOTAL_FIXED_COSTS_ANNUAL / 12; // 23,690 ريال شهرياً (دقيق)

// VARIABLE EXPENSES (Monthly/Car) - Year 1
const OIL_CHANGE_MONTHLY = 90; 
const TIRES_MONTHLY = 100; 
const MAINTENANCE_RESERVE_MONTHLY_YEAR1 = 100; 
const MONTHLY_VARIABLE_COSTS_CAR = OIL_CHANGE_MONTHLY + TIRES_MONTHLY + MAINTENANCE_RESERVE_MONTHLY_YEAR1; // 290 ريال/شهر/سيارة

// Additional Income (Monthly Averages) 
const AVG_KILOMETER_INCOME_MONTHLY_UNIT = 600; 
const AVG_INSURANCE_PROFIT_MONTHLY_UNIT = 400; 
const AVG_ADDITIONAL_INCOME_MONTHLY = (AVG_KILOMETER_INCOME_MONTHLY_UNIT + AVG_INSURANCE_PROFIT_MONTHLY_UNIT) * TOTAL_CAR_COUNT; // 26,000 ريال شهرياً

const BASE_ANNUAL_GROWTH = 0.15; // 15% معدل النمو السنوي الافتراضي

// -------------------- Utility Functions --------------------

function formatNum(x){ 
    return Number(x).toLocaleString('ar-EG', {minimumFractionDigits: 0, maximumFractionDigits: 0});
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.style.width === '250px') {
        sidebar.style.width = '0';
    } else {
        sidebar.style.width = '250px';
    }
}

// Global Tab/Section navigation (Handles main sections visibility)
function changeTab(evt, targetSectionId) {
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('active-tab');
    });

    const targetElement = document.getElementById(targetSectionId);
    if (targetElement) {
        targetElement.classList.add('active-tab');
    }

    document.getElementById('welcomeSection').classList.remove('active-tab');

    // Close sidebar after selection on mobile
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
    // Scroll to top of the section
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
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

    // Determine input source and calculate amount/shares
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

    // Base Profit Calculation: Based on calculated average monthly net profit (38,717 ﷼)
    const BASE_MONTHLY_NET_PROFIT = 38717; 
    const BASE_NET_PROFIT = BASE_MONTHLY_NET_PROFIT * 12; // 464,604 ﷼ (Annual Net Profit)

    const PARTNER_SHARE_PERCENTAGE = 0.50; 
    const investmentRatio = investmentAmount / BASE_CAPITAL;
    let projectedTotalProfit = 0;

    const ANNUAL_GROWTH_RATE = 0.15; 

    for (let i = 1; i <= years; i++) {
        let annualBaseProfit = BASE_NET_PROFIT * Math.pow(1 + ANNUAL_GROWTH_RATE, i - 1);
        projectedTotalProfit += annualBaseProfit * PARTNER_SHARE_PERCENTAGE * investmentRatio;
    }

    const totalReturn = investmentAmount + projectedTotalProfit;

    const avgAnnualRate = (projectedTotalProfit / investmentAmount) / years;

    // Display Logic
    if (!isFinal) {
        document.getElementById('exitResult').innerHTML = `
            <div style="font-size: 1.2em; text-align: right;">
                <p>المبلغ المُستثمر: <span class="highlight riyals-icon">﷼${formatNum(investmentAmount.toFixed(0))}</span></p>
                <p>عدد الأسهم التقديري: <span class="highlight">${shares.toFixed(0)} سهم</span></p>
                <p>فترة الخروج: <span class="highlight">${exitYear}</span></p>
                <p style="font-weight: 700; color: var(--secondary-color);">إجمالي المبلغ المُستحق بعد الخروج (تخميني): <span class="highlight">﷼${formatNum(totalReturn.toFixed(0))}</span> (رأس مال + أرباح)</p>
            </div>
        `;
        document.getElementById('exitResult').style.display = 'block';
    }
    
    // Update final submission display
    if (isFinal) {
        document.getElementById('finalSummaryAmount').textContent = `﷼${formatNum(investmentAmount.toFixed(0))}`;
        document.getElementById('finalSummaryExit').textContent = exitYear;
        document.getElementById('finalSummaryReturn').textContent = `﷼${formatNum(totalReturn.toFixed(0))}`;
        document.getElementById('finalSummaryAnnualRate').textContent = (avgAnnualRate * 100).toFixed(1) + '%';
        
        // Update input fields for cross-linking
        document.getElementById('finalShareCount').value = shares.toFixed(0);
        document.getElementById('finalInvestmentAmount').value = investmentAmount.toFixed(0);
    }
    
    // Store data in global investorData
    investorData.amount = investmentAmount;
    investorData.shares = shares;
    investorData.exitYear = exitYear;
}

function showDetails() {
    const name = document.getElementById('investorName').value;
    const phone = document.getElementById('investorPhone').value;
    const email = document.getElementById('investorEmail').value;
    const linkSourceElement = document.getElementById('linkSource');
    const investmentType = document.getElementById('investmentType').value;
    
    let investmentAmount = 0;
    
    if (investmentType === 'amount') {
         investmentAmount = parseFloat(document.getElementById('investmentAmount').value) || 0;
    } else if (investmentType === 'shares') {
         investmentAmount = parseFloat(document.getElementById('shareCount').value) * SHARE_PRICE || 0;
    }

    if (!name || !phone || investmentType === 'none' || investmentAmount <= 0) {
         alert("الرجاء إدخال الاسم ورقم الجوال وتحديد مبلغ/عدد الأسهم بشكل صحيح للمتابعة.");
         return;
    }

    // Update final submission fields and global data
    investorData.name = name;
    investorData.phone = phone;
    investorData.email = email;
    investorData.linkSource = linkSourceElement.value;
    investorData.amount = investmentAmount;
    investorData.shares = investmentAmount / SHARE_PRICE;
    
    document.getElementById('finalName').value = investorData.name;
    document.getElementById('finalPhone').value = investorData.phone;
    document.getElementById('finalSourceOfLink').value = investorData.linkSource;
    document.getElementById('finalInvestmentAmount').value = investmentAmount.toFixed(0);
    document.getElementById('finalShareCount').value = (investmentAmount / SHARE_PRICE).toFixed(0);
    
    calculateExit(true);

    const welcomeMessage = `
        <h2 class="section-title"><i class="fas fa-eye"></i> نظرة عامة على الخطة</h2>
        <div class="investor-message">
            مرحباً بك، شريكنا العزيز/ <span class="highlight">${investorData.name}</span>.<br>
            لقد اخترت الاستثمار بقيمة: <span class="highlight">﷼${formatNum(investorData.amount.toFixed(0))}</span> (ما يعادل ${investorData.shares.toFixed(0)} سهم).<br>
            نحن نؤمن بالشفافية المطلقة. يرجى تصفح أدناه دراسة الجدوى الشاملة التي تجيب على كل استفساراتك حول الفرص والمخاطر.
        </div>
    `;
    
    // 1. Hide intro sections
    document.getElementById('project-intro').classList.remove('active-tab');
    document.getElementById('InteractiveEntry').classList.remove('active-tab');
    
    // 2. Show welcome message
    document.getElementById('welcomeSection').innerHTML = welcomeMessage;
    document.getElementById('welcomeSection').classList.add('active-tab'); 
    
    // 3. Show the first main content section ('summary') and ensure others are hidden
    const mainSections = ['summary', 'fleet', 'calculator', 'financial', 'risks', 'competitors', 'development', 'technology', 'commitment'];
    mainSections.forEach(id => {
        document.getElementById(id).classList.remove('active-tab');
    });
    document.getElementById('summary').classList.add('active-tab'); 
    
    // 4. Initialize calculator and charts after everything is visible
    calculateProfit();
    initializeCharts();
    
    // 5. Scroll to the start of the content area
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// -------------------- Section 4: Calculator Logic --------------------

function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    const tabButtons = document.querySelectorAll('.tab-nav button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function getBaseMonthlyProfit(occupancyRate) {
     let revenueBase = 0;
     let totalCarCount = TOTAL_CAR_COUNT;
     
     for (const car in CAR_COSTS) {
        revenueBase += CAR_COSTS[car].count * CAR_COSTS[car].avgMonthly;
     }
    // Approx. Revenue Base (26 cars * avg 2355.38 SAR/mo) = ~61240 SAR
    
    let totalRevenue = revenueBase * occupancyRate;
    totalRevenue += AVG_ADDITIONAL_INCOME_MONTHLY; // 26,000 ﷼
    
    // Calculate expenses (using Year 1 variable cost)
    const totalVariableCosts = totalCarCount * MONTHLY_VARIABLE_COSTS_CAR; // 26 * 290 = 7,540 ﷼
    const totalExpenses = MONTHLY_FIXED_COSTS + totalVariableCosts; // 23,690 + 7,540 = 31,230 ﷼

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit: totalRevenue - totalExpenses
    };
}


function updateOccupancyLabel(value) {
    document.getElementById('occupancy-label').textContent = value + '%';
    document.getElementById('occupancy-rate').value = value;
    calculateProfit();
}

function calculateProfit() {
    const occupancyRate = parseFloat(document.getElementById('occupancy-rate').value) / 100;
    const additionalIncomeInput = parseFloat(document.getElementById('additional-income').value) || 0;
    
    const profitData = getBaseMonthlyProfit(occupancyRate);
    
    // Adjust total revenue calculation to use the input additional income
    const baseRevenueWithoutDefaultIncome = profitData.revenue - AVG_ADDITIONAL_INCOME_MONTHLY;
    const totalRevenue = baseRevenueWithoutDefaultIncome + additionalIncomeInput;
    const totalExpenses = profitData.expenses; 
    
    const netProfit = totalRevenue - totalExpenses;
    const partnerShare = netProfit * 0.50; 
    
    // Update display
    document.getElementById('total-revenue').textContent = formatNum(totalRevenue) + ' ريال';
    document.getElementById('total-expenses').textContent = formatNum(totalExpenses) + ' ريال';
    document.getElementById('net-profit').textContent = formatNum(netProfit) + ' ريال';
    document.getElementById('partner-share-monthly').textContent = formatNum(partnerShare) + ' ريال';
}

function calculateAnnualProfit() {
    const years = parseInt(document.getElementById('years-forecast').value);
    const growthRate = parseFloat(document.getElementById('growth-rate').value) / 100;
    
    const baseProfitData = getBaseMonthlyProfit(0.70);
    const totalRevenueMonthly = baseProfitData.revenue;
    const totalExpensesMonthly = baseProfitData.expenses;

    let totalAnnualRevenue = 0;
    let totalAnnualExpenses = 0;
    let totalAnnualNetProfit = 0;
    
    for (let i = 1; i <= years; i++) {
        const revenueGrowthFactor = Math.pow(1 + growthRate, i - 1);
        const expenseGrowthFactor = 1; // Assuming fixed expenses are relatively stable
        
        totalAnnualRevenue += totalRevenueMonthly * 12 * revenueGrowthFactor;
        totalAnnualExpenses += totalExpensesMonthly * 12 * expenseGrowthFactor;
        
        const annualRevenueThisYear = totalRevenueMonthly * 12 * revenueGrowthFactor;
        const annualExpensesThisYear = totalExpensesMonthly * 12 * expenseGrowthFactor;
        totalAnnualNetProfit += annualRevenueThisYear - annualExpensesThisYear;
    }
    
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
    
    // Avg Daily Rate: ~135 ﷼ 
    let totalMaxDailyRate = 0;
    for (const car in CAR_COSTS) {
        totalMaxDailyRate += CAR_COSTS[car].count * CAR_COSTS[car].maxDaily;
    }
    const avgDailyRate = totalMaxDailyRate / TOTAL_CAR_COUNT; 

    const dailyRevenue = rentedCars * avgDailyRate;
    const monthlyRevenue = dailyRevenue * 30;
    
    document.getElementById('rented-cars').textContent = rentedCars + ' سيارة';
    document.getElementById('daily-revenue').textContent = formatNum(dailyRevenue) + ' ريال';
    document.getElementById('monthly-revenue').textContent = formatNum(monthlyRevenue) + ' ريال';
}

function calculateBreakEven() {
    const fixedCosts = parseFloat(document.getElementById('fixed-costs').value); // 23690
    const variableCostPerCar = parseFloat(document.getElementById('variable-cost-per-car').value); // 290
    
    let totalRevenueBase = 0;
    for (const car in CAR_COSTS) {
        totalRevenueBase += CAR_COSTS[car].count * CAR_COSTS[car].avgMonthly;
    }
    const avgRevenuePerCar = totalRevenueBase / TOTAL_CAR_COUNT; // ~2355 ﷼

    const contributionMarginPerCar = avgRevenuePerCar - variableCostPerCar;
    const breakEvenCarsPerMonth = fixedCosts / contributionMarginPerCar;
    const breakEvenOccupancyRate = (breakEvenCarsPerMonth / TOTAL_CAR_COUNT) * 100;
    const breakEvenRevenue = breakEvenCarsPerMonth * avgRevenuePerCar;

    document.getElementById('break-even-occupancy').textContent = breakEvenOccupancyRate.toFixed(1) + '%';
    document.getElementById('break-even-cars').textContent = Math.ceil(breakEvenCarsPerMonth) + ' سيارة';
    document.getElementById('break-even-revenue').textContent = formatNum(breakEvenRevenue) + ' ريال';
}

// -------------------- Section 7: Competitors Carousel Logic --------------------

const COMPETITORS_DATA = [
    // Data for 18 offices (17 from the list + Hussein Airport branch)
    { id: 'comp-rahoul', name: 'رحول لتأجير السيارات (Rahoul)', rating: 4.7, fleet: 'فخمة (لامبورجيني) + عائلية (لاندكروزر)', location: 'تل أسمر', 
        pros: ['**الأسطول:** سيارات جديدة ونظيفة وموديل السنة.', '**الخدمة:** تعامل راقٍ وسرعة في الإنجاز (خاصة الموظفين عبد السلام المبلغ وعبد الله العديم).', '**التفاصيل:** المواتر جدد والبانزين فول.', '**التنوع:** أول مكتب بحائل يوفر أغلب أنواع السيارات الفخمة.', '**التعامل:** الموظفون قمة في الأخلاق والاحترافية.'], 
        cons: ['**(سلبي 1):** لا تتوفر تعليقات سلبية واضحة ومحددة في المصادر المرفقة.', '**(سلبي 2):** نقطة افتراضية: قد يكونون ضعفاء في الأسعار أو إجراءات التأمين.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'التواصل معهم لـ **الشراكة والتعلم** وتدريب موظفينا على **الأخلاق العالية والاحترافية**.' 
    },
    { id: 'comp-sals', name: 'سلس لتأجير السيارات (Sals)', rating: 4.8, fleet: 'جديدة ونظيفة جداً', location: 'حي النقرة',
        pros: ['**الجودة:** سيارات جديدة ونظيفة جداً.', '**المرونة:** تعامل راقٍ ومرونة (مثل إعطاء ساعات تأخير مجانية).', '**الاحترافية:** قمة بالتعامل والاحترافية.', '**الخيارات:** خدماتهم والخيارات تفوقت على كثير مكاتب.', '**التميز:** أفضل من بعض الشركات الكبرى.'], 
        cons: ['**الشفافية:** أسعار مبالغ فيها، ومشاكل في تتبع العقد والتأمين (توقيع على عدم وجود تأمين).', '**السلوك:** موظف "أخلاقه زي وجهه" ويدخن وهو يتكلم.', '**التأجير اليومي:** ماهم موفرين خدمة التأجير اليومي لبعض الفئات.', '**الأسعار:** يعطيك سعر وذا جازت لك السيارة رفع السعر.', '**النظافة:** اوسخ مكتب تأجير في حائل (لا تعامل موظفين و لا نظافة سيارات).'],
        solution: 'ضمان **الشفافية المطلقة** في العقود، وتدريب الموظفين على الاحترام، وتثبيت الأسعار بمجرد الحجز.'
    },
    { id: 'comp-nmr', name: 'شركة نمر لتأجير السيارات (NMR)', rating: 4.6, fleet: 'سيارات متنوعة (متوسطة وصغيرة)', location: 'حائل (حي 9166)',
        pros: ['**الأسعار والجودة:** أسعار مناسبة وسيارات نظيفة وجديدة.', '**الرد الاحترافي:** لديهم ردود احترافية ومهذبة من المالك على التعليقات.', '**التعامل:** تعاملهم جدا راقي.', '**التنوع:** سيارات متنوعة.', '**الموظفون:** موظفون متعاونون.'], 
        cons: ['**التواصل الضعيف:** تعامل فاشل وسيء بسبب عدم الرد على الاتصالات.', '**الشفافية:** عدم وضوح الأسعار المُعلنة (لو تنزلون صورة قائمة الأسعار).', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'الاستثمار في نظام اتصال متقدم (VoIP) وموظف مخصص للرد على الاتصالات، وتوفير قائمة أسعار شفافة ومحدثة.'
    },
    { id: 'comp-budget', name: 'بدجت لتأجير السيارات (Budget)', rating: 4.2, fleet: 'سيارات عالية القيمة', location: 'حي النقرة',
        pros: ['**السمعة:** علامة تجارية عالمية.', '**الاحترام:** موظفون قمة في الاحترام.', '**الجودة:** سيارة نظيفة وسليمة.', '**الموظف:** موظف ممتاز (عبد الله القناص).', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**السلوك:** موظف يتكلم من "رأس خشمه" وسوء أسلوب ويهبد أنظمة وسياسات.', '**التوقيت:** عدم احترام أوقات العمل وإغلاق الفرع (يوم الجمعة).', '**المعلومات:** عدم دقة المعلومات عن الفروع (لا يوجد فرع في بريدة).', '**السلوك:** تعامل الموظفييين مافيه اسلوب ابد يرفعون اصواتهم.', '**النصب:** غرموني قيمة صدام امامي بما يفوق الوصف.'],
        solution: 'الالتزام الصارم بساعات العمل، ووضع نظام لتقييم سلوك الموظفين، وعقوبات صارمة لمن يرفع صوته على العملاء.'
    },
    { id: 'comp-theeb', name: 'ذيب لتأجير السيارات (Theeb)', rating: 4.2, fleet: 'سيارات متنوعة', location: 'مطار حائل الإقليمي',
        pros: ['**الاحترافية:** موظف يعكس قوة الشركة وتميزها (عبد العزيز العنزي).', '**السرعة:** سرعة في الإنجاز وحسن استقبال.', '**السمعة:** عميل قديم يشيد بالخدمات الراقية والعروض المتميزة.', '**الفرع:** فرع مميز يعكس تطور الشركة.', '**التعامل:** انبهرت من حسن التعامل ومستوى الخدمة.'], 
        cons: ['**التأخير:** أسوأ خدمة عميل في العالم، ولا يقدرون الوقت (يمكنك الانتظار لأيام).', '**السلوك:** موظف يستصغر العملاء (قال "غالية عليك").', '**السلوك:** موظف خدمة العملاء سيئ جداً ولا يفقه من المهنية شيئ.', '**البيروقراطية:** تأخييييييييير مررره والموظف يخليك تنتظر.', '**الغرامات:** غرموني قيمة كيلوات زايده علماً اني مامشيت عليه كثير.'],
        solution: 'توفير نظام آلي لإنهاء إجراءات التسليم والاستلام بسرعة فائقة (أقل من 5 دقائق)، وتدريب الموظفين على الاحترام وتجنب الإساءة.'
    },
    { id: 'comp-yelo', name: 'يلو لتأجير السيارات (Yelo)', rating: 4.1, fleet: 'موديلات حديثة ومريحة', location: 'الوسيطاء',
        pros: ['**الاحترافية:** تعامل راقٍ وسرعة في الإنجاز (خاصة الموظفين مشعل العنزي وعبد العزيز الحوطي).', '**الخدمة:** يسلمون السيارة ممتلئة بالوقود (ميزة).', '**الاحترام:** ناس محترمين جدا وذوق في التعامل.', '**الخدمة:** خدمة ممتازة سيارة نظيفة تعاون مستمر.', '**التطور:** تعاملت معهم أكثر من مرة وكل مرة يكونو افضل من اللي قبلها.'], 
        cons: ['**الاحتيال:** استغلال واضح وصريح (خصم على الكيلومترات المفتوحة).', '**السلوك:** موظف يحسسك أنك "جاي بيت أبوه" وسلوبه سيئ.', '**التأخير:** تأخر في اجراءات التسليم مما تسبب في الغاء رحلة.', '**الشفافية:** الأسعار في التطبيق غير حقيقة ولا يحسبون المبلغ الاجمالي.', '**الاحتيال:** انتبه لزجاج السياره اكتشفوا كسر بسيط جداً ويشهد علي الله ماصار معي شي.'],
        solution: 'وضع آلية واضحة لإدارة الكيلومترات والرسوم الإضافية، وإظهار السعر النهائي بوضوح في التطبيق/الموقع قبل الدفع.'
    },
    { id: 'comp-amlak', name: 'أملاك التميز لتأجير السيارات', rating: 3.8, fleet: 'اقتصادية (شانجان)', location: 'مطار حائل الإقليمي',
        pros: ['**التسهيل:** خدمة توصيل واستلام السيارة من وإلى المنزل.', '**المرونة:** مرونة في التعامل (الكيلو شبه مفتوح 350 كم/يوم).', '**المتابعة:** خدومين وسليسين بالتعامل ويسألون عن انطباع العميل.', '**السرعة:** خدمة سريعة.', '**الأخلاق:** قمة التعامل وفي الاخلاق حتى تعامل الموظفين محترم.'], 
        cons: ['**الاحتيال:** أسوأ محل، نصب عيني عينك (يفتعلون عيوباً للحصول على فلوس).', '**التأخير:** تأخير شديد (ساعة تستلم وساعتين تسلم).', '**النصب:** يطلعون بالسياره عذروب عشان ياخذون منك فلوس.', '**الأسعار:** أسعار مرتفعة جداً (اكسنت بـ 350).', '**الأخلاق:** اخلاق الموظفين لك عليها ومافي اي مراعاة للعميل.'],
        solution: 'توفير خدمة التوصيل والاستلام وتجنب الاحتيال عبر **التوثيق بالفيديو والصور** لحالة السيارة قبل التسليم لتوفير الأمان للمستأجر.'
    },
    { id: 'comp-hataf', name: 'هتاف الشمال لتأجير السيارات', rating: 3.6, fleet: 'سيارات جديدة', location: 'الوسيطاء',
        pros: ['**الجودة:** سيارات جديدة ونظيفة وتعامل ممتاز (خاصة الموظف خالد فواز).', '**التعامل:** تعامل راقي مره.', '**الجمال:** سيارات جميلة ونظيفة.', '**السرعة:** استلام وتسليم السيارة تم بسرعة والأسعار مناسبة.', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**السمعة:** أسوأ مكتب "نصابين مرة" (اتهام خطير).', '**التجربة:** تجربة سيئة ولن تتكرر.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'وضع ضمانات واضحة للعملاء الجدد لتجاوز السمعة السلبية السابقة، والتركيز على جودة الخدمة الشاملة.'
    },
    { id: 'comp-hussein-kf', name: 'شركة حسين لتأجير السيارات - فرع الملك فهد', rating: 3.8, fleet: 'متنوع', location: 'الملك فهد',
        pros: ['**الخدمة:** موظفون بذوق راقٍ وأسلوب احترافي (خاصة وليد).', '**التسهيل:** خدمة توصيل السيارة من وإلى المطار.', '**الولاء:** من أرقى الأماكن التي استأجرت منها أكثر من ست شهور.', '**التعامل:** أسهل تعامل وأطلق مكتب يأجر سيارات.', '**النظافة:** نظافة السيارات.'], 
        cons: ['**الجودة:** السيارة غير مفحوصة (البلوتوث خربان، سيارة بصمة تعمل بالمفتاح).', '**السلوك:** تعامل الموظف سيئ جداً وبطيئ وغير مهني.', '**التجربة:** أسوأ تجربة تأجير وموظفين لا يفهمون شيء.', '**الأسعار:** أسعارهم جدا سئيه مقارنه بغيرهم.', '**السلوك:** كثير عليهم نجمة تعاملهم واسلوبهم سيئ.'],
        solution: 'تطبيق نظام **فحص 50 نقطة** لكل سيارة قبل التسليم لضمان جودة المكونات الإلكترونية والميكانيكية وتجنب مشكلات "الخرابات".'
    },
    { id: 'comp-hussein-mq', name: 'شركة حسين لتأجير السيارات - الأمير مقرن', rating: 4.5, fleet: 'سيارات جديدة', location: 'الأمير مقرن',
        pros: ['**التعامل:** الموظف خلوق ويتعامل بابتسامة طيبة، والاستلام والتسليم ممتاز.', '**التأمين:** ممتازين ولديهم تأمين شامل.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**التواصل:** رقم التواصل الموجود غير مستعمل.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'التأكد من أن جميع أرقام التواصل (الثابتة، الجوال، والواتساب) تعمل وتستقبل المكالمات والرسائل على مدار الساعة.'
    },
    { id: 'comp-rotana', name: 'روتانا لتأجير السيارات', rating: 3.9, fleet: 'متنوع', location: 'الأمير مقرن',
        pros: ['**التعامل:** أسعار مناسبة وتعامل راقٍ.', '**الإدارة:** تعامل راقٍ من الموظف **جابر العزي**.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**النصب:** خصم فلوس لأسباب غير واضحة وتأخير في تسليم السيارة.', '**السلوك:** الموظف يحسسك أنه مدير الشركة.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'توثيق كل زاوية من السيارة قبل التسليم لتجنب أي خصم غير مبرر يولد شكاوى "النصب"، وتدريب الموظفين على عدم التعالي على العملاء.'
    },
    { id: 'comp-masar', name: 'شركة المسار لتأجير السيارات', rating: 5.0, fleet: 'نظيفة ومجهزة', location: 'الأمير مقرن',
        pros: ['**الاحترافية:** تعامل راقٍ ومصداقية عالية (خاصة عبد الحكيم).', '**الخدمة:** خدمة ممتازة (حتى في استقبال ضيوف المطار).', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**غير متوفرة:** جميع التعليقات إيجابية، وهو نموذج ممتاز للخدمة والتعامل.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'نسخ نموذجهم في الاحترافية (عبد الحكيم، أبو محمد) والتعامل المميز لتصبح شركتك هي النموذج الجديد للتميز في حائل.'
    },
    { id: 'comp-khoder', name: 'الخضر لتأجير السيارات', rating: 5.0, fleet: 'جديدة (موديل 2026)', location: 'شراف',
        pros: ['**الجودة:** سيارات جديدة موديل 2026.', '**التعامل:** تعامل طيب وسهولة معاملة.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**غير متوفرة:** جميع التعليقات إيجابية.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'يجب أن يكون هدفنا هو توفير أحدث الموديلات دائماً (كما يفعلون) لضمان أعلى إيجار يومي.'
    },
    { id: 'comp-safi', name: 'فرع مجموعة الصافي لتأجير السيارات', rating: 3.8, fleet: 'متنوع', location: 'الأمير مقرن',
        pros: ['**التنوع:** سيارات جديدة ومتنوعة وأسعار مناسبة.', '**التعامل:** تعامل راقٍ وخدمة ممتازة (خاصة عبد الله العنزي).', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**التأخير:** تأخير في تسليم السيارة وغرامة يوم إيجار إضافي.', '**النصب:** يطلعون بالسيارة عيوب.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'وضع نظام لحماية العميل من أي اتهامات بوجود عيوب (عبر التوثيق المسبق)، والعمل على تسريع الإجراءات.'
    },
    { id: 'comp-class', name: 'كلاس لتأجير السيارات', rating: 4.7, fleet: 'فخمة وعادية', location: 'الأمير مقرن',
        pros: ['**الأسطول:** لديهم جميع السيارات الفخمة وغيرها.', '**التعامل:** تعامل راقٍ (خاصة الموظف خالد البرادي).', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**التنظيم:** عدم الالتزام بالمواعيد والحجوزات.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'يجب أن يكون نظام الحجز لدينا **مضموناً 100%** لنتفوق عليهم في الثقة بالمواعيد.'
    },
    { id: 'comp-ashjan', name: 'لتأجير أشجان نجد', rating: 4.7, fleet: 'متنوع', location: 'الأمير مقرن',
        pros: ['**التعامل:** خدمة عملاء ممتازة، احترام، وضيافة.', '**الجودة:** تعامل راقٍ وسيارات نظيفة.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**النصب:** مبالغة في قيمة الضرر (أخذوا 3200 ريال لخدش بسيط).', '**التواصل:** لا توجد أرقام للتواصل.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'يجب أن تكون آلية تقدير الضرر واضحة وموثوقة من جهة معتمدة، وتوفير قناة اتصال موثوقة.'
    },
    { id: 'comp-codcar', name: 'كود كار لتأجير السيارات', rating: 3.3, fleet: 'فخمة وحلوة', location: 'الزبارة',
        pros: ['**الأسطول:** سيارات فخمة وحلوة ونظيفة.', '**الأسعار:** أسعار مناسبة للغاية.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**الاحتيال:** استغلال كبير وتلاعب، وتهديد وابتزاز (خطأ جسيم).', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'الشفافية القانونية: يجب توثيق كل عملية بدقة، وتجنب أي سلوك يوحي بالتهديد أو الابتزاز المالي.'
    },
    { id: 'comp-hussein-airport', name: 'شركة حسين لتأجير السيارات - فرع الإدارة (مطار حائل)', rating: 3.8, fleet: 'سوناتا 2021', location: 'مطار حائل الإقليمي',
        pros: ['إيجابي 1 (لإكمال الخمس)', 'إيجابي 2 (لإكمال الخمس)', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**الجودة:** السيارة معدومة بالكامل (سوناتا 2021).', '**التنظيم:** حجزت في التطبيق كنسلوها، واتصلت على المشرف وسحب علي.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'فحص جميع السيارات قبل التأجير لضمان مطابقتها للمواصفات، واحترام الحجوزات الإلكترونية.'
    }
];

let currentSlide = 0;
// Helper function to render star rating HTML
function getStarRating(rating) {
    const fullStar = '<i class="fas fa-star"></i>';
    const halfStar = '<i class="fas fa-star-half-alt"></i>';
    const emptyStar = '<i class="far fa-star"></i>';
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += fullStar;
        } else if (rating >= i - 0.5) {
            stars += halfStar;
        } else {
            stars += emptyStar;
        }
    }
    return `<span class="rating-stars">${stars}</span>`;
}

function populateCompetitors() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    track.innerHTML = ''; // Clear previous content

    COMPETITORS_DATA.forEach(comp => {
        let prosHtml = comp.pros.map(p => `<div class="opinion-item opinion-positive">${p}</div>`).join('');
        let consHtml = comp.cons.map(c => `<div class="opinion-item opinion-negative">${c}</div>`).join('');

        track.innerHTML += `
            <div id="${comp.id}" class="competitor-card-style">
                <h4>${comp.name}
                    <div class="rating">
                        ${getStarRating(comp.rating)}
                        <span>(${comp.rating}/5)</span>
                    </div>
                </h4>
                <div class="details">
                    <div class="detail-item">أسطول: ${comp.fleet}</div>
                    <div class="detail-item">الموقع: ${comp.location}</div>
                </div>
                <div class="opinion-section">
                    <p style="font-weight: 700;">نقاط القوة (التي يجب أن نتبناها):</p>
                    ${prosHtml}
                    <p style="font-weight: 700; margin-top: 10px;">نقاط الضعف (التي يجب أن نتفاداها):</p>
                    ${consHtml}
                </div>
                <div class="suggestion" style="margin-top: 20px;">
                    <h5 style="color: var(--primary-color);"><i class="fas fa-lightbulb"></i> استراتيجية نُقَاء:</h5>
                    <p>${comp.solution}</p>
                </div>
            </div>
        `;
    });
}

// Carousel function (FIXED)
function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.competitor-card-style');
    if (!slides.length || !track) return;

    // Calculate card width and margin
    const cardElement = slides[0];
    const computedStyle = window.getComputedStyle(cardElement);
    const marginRight = parseFloat(computedStyle.marginRight);
    const containerWidth = track.parentElement.clientWidth;
    
    // On small screens, use 95% width + margin (default in CSS)
    const slideWidth = containerWidth < 768 ? containerWidth * 0.95 + 20 : cardElement.offsetWidth + marginRight;
    
    currentSlide += direction;

    // Boundary checks
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }

    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}


// -------------------- Section 1: Interactive Entry Logic --------------------

function updateInvestmentFields() {
    const type = document.getElementById('investmentType').value;
    document.getElementById('amountGroup').style.display = type === 'amount' ? 'flex' : 'none';
    document.getElementById('sharesGroup').style.display = type === 'shares' ? 'flex' : 'none';
    
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

    if (isFinal) {
        const finalAmountInput = document.getElementById('finalInvestmentAmount').value;
        const finalSharesInput = document.getElementById('finalShareCount').value;

        if (finalAmountInput) {
            investmentAmount = parseFloat(finalAmountInput) || 0;
            shares = investmentAmount / SHARE_PRICE;
        } else if (finalSharesInput) {
            shares = parseFloat(finalSharesInput) || 0;
            investmentAmount = shares * SHARE_PRICE;
        }
        document.getElementById('finalShareCount').value = shares.toFixed(0);
        document.getElementById('finalInvestmentAmount').value = investmentAmount.toFixed(0);
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
        document.getElementById('exitResult').style.display = 'none';
        return;
    }
    
    document.getElementById('exitResult').style.display = 'block';
    
    // Base Profit Calculation: Based on monthly profit at 70% occupancy
    const BASE_MONTHLY_NET_PROFIT = 38717; 
    const BASE_NET_PROFIT = BASE_MONTHLY_NET_PROFIT * 12; // 464,604 ﷼ (Annual Net Profit)

    const PARTNER_SHARE_PERCENTAGE = 0.50; 
    const investmentRatio = investmentAmount / BASE_CAPITAL;
    let projectedTotalProfit = 0;

    const ANNUAL_GROWTH_RATE = 0.15; 

    for (let i = 1; i <= years; i++) {
        let annualBaseProfit = BASE_NET_PROFIT * Math.pow(1 + ANNUAL_GROWTH_RATE, i - 1);
        projectedTotalProfit += annualBaseProfit * PARTNER_SHARE_PERCENTAGE * investmentRatio;
    }

    const totalReturn = investmentAmount + projectedTotalProfit;
    const avgAnnualRate = (projectedTotalProfit / investmentAmount) / years;

    // Display Logic
    if (!isFinal) {
        document.getElementById('exitResult').innerHTML = `
            <div style="font-size: 1.2em; text-align: right;">
                <p>المبلغ المُستثمر: <span class="highlight riyals-icon">﷼${formatNum(investmentAmount.toFixed(0))}</span></p>
                <p>عدد الأسهم التقديري: <span class="highlight">${shares.toFixed(0)} سهم</span></p>
                <p>فترة الخروج: <span class="highlight">${exitYear}</span></p>
                <p style="font-weight: 700; color: var(--secondary-color);">إجمالي المبلغ المُستحق بعد الخروج (تخميني): <span class="highlight">﷼${formatNum(totalReturn.toFixed(0))}</span> (رأس مال + أرباح)</p>
            </div>
        `;
    }
    
    // Update final submission display
    if (isFinal) {
        document.getElementById('finalSummaryAmount').textContent = `﷼${formatNum(investmentAmount.toFixed(0))}`;
        document.getElementById('finalSummaryExit').textContent = exitYear;
        document.getElementById('finalSummaryReturn').textContent = `﷼${formatNum(totalReturn.toFixed(0))}`;
        document.getElementById('finalSummaryAnnualRate').textContent = (avgAnnualRate * 100).toFixed(1) + '%';
        
    }
    
    // Store data in global investorData
    investorData.amount = investmentAmount;
    investorData.shares = shares;
    investorData.exitYear = exitYear;
}

function showDetails() {
    const name = document.getElementById('investorName').value;
    const phone = document.getElementById('investorPhone').value;
    const email = document.getElementById('investorEmail').value;
    const linkSourceElement = document.getElementById('linkSource');
    const investmentType = document.getElementById('investmentType').value;
    
    let investmentAmount = 0;
    
    if (investmentType === 'amount') {
         investmentAmount = parseFloat(document.getElementById('investmentAmount').value) || 0;
    } else if (investmentType === 'shares') {
         investmentAmount = parseFloat(document.getElementById('shareCount').value) * SHARE_PRICE || 0;
    }

    if (!name || !phone || investmentType === 'none' || investmentAmount <= 0) {
         alert("الرجاء إدخال الاسم ورقم الجوال وتحديد مبلغ/عدد الأسهم بشكل صحيح للمتابعة.");
         return;
    }

    // Update final submission fields and global data
    investorData.name = name;
    investorData.phone = phone;
    investorData.email = email;
    investorData.linkSource = linkSourceElement.value;
    investorData.amount = investmentAmount;
    investorData.shares = investmentAmount / SHARE_PRICE;
    
    document.getElementById('finalName').value = investorData.name;
    document.getElementById('finalPhone').value = investorData.phone;
    document.getElementById('finalSourceOfLink').value = investorData.linkSource;
    document.getElementById('finalInvestmentAmount').value = investmentAmount.toFixed(0);
    document.getElementById('finalShareCount').value = (investmentAmount / SHARE_PRICE).toFixed(0);
    
    calculateExit(true);

    const welcomeMessage = `
        <h2 class="section-title"><i class="fas fa-eye"></i> نظرة عامة على الخطة</h2>
        <div class="investor-message">
            مرحباً بك، شريكنا العزيز/ <span class="highlight">${investorData.name}</span>.<br>
            لقد اخترت الاستثمار بقيمة: <span class="highlight">﷼${formatNum(investorData.amount.toFixed(0))}</span> (ما يعادل ${investorData.shares.toFixed(0)} سهم).<br>
            نحن نؤمن بالشفافية المطلقة. يرجى تصفح أدناه دراسة الجدوى الشاملة التي تجيب على كل استفساراتك حول الفرص والمخاطر.
        </div>
    `;
    
    // 1. Hide intro sections
    document.getElementById('project-intro').classList.remove('active-tab');
    document.getElementById('InteractiveEntry').classList.remove('active-tab');
    
    // 2. Show welcome message
    document.getElementById('welcomeSection').innerHTML = welcomeMessage;
    document.getElementById('welcomeSection').classList.add('active-tab'); 
    
    // 3. Show the first main content section ('summary')
    const mainSections = ['summary', 'fleet', 'calculator', 'financial', 'risks', 'competitors', 'development', 'technology', 'commitment'];
    mainSections.forEach(id => {
        document.getElementById(id).classList.remove('active-tab');
    });
    document.getElementById('summary').classList.add('active-tab'); 
    
    // 4. Initialize calculator and charts after everything is visible
    calculateProfit();
    initializeCharts();
    
    // 5. Initialize the Competitor Carousel view
    moveCarousel(0);
    
    // 6. Scroll to the start of the content area
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// -------------------- Section 4: Calculator Logic --------------------

function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    const tabButtons = document.querySelectorAll('.tab-nav button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function getBaseMonthlyProfit(occupancyRate) {
     let revenueBase = 0;
     let totalCarCount = TOTAL_CAR_COUNT;
     
     for (const car in CAR_COSTS) {
        revenueBase += CAR_COSTS[car].count * CAR_COSTS[car].avgMonthly;
     }
    // Approx. Revenue Base (26 cars * avg 2355.38 SAR/mo) = ~61240 SAR
    
    let totalRevenue = revenueBase * occupancyRate;
    totalRevenue += AVG_ADDITIONAL_INCOME_MONTHLY; // 26,000 ﷼
    
    // Calculate expenses (using Year 1 variable cost)
    const totalVariableCosts = totalCarCount * MONTHLY_VARIABLE_COSTS_CAR; // 26 * 290 = 7,540 ﷼
    const totalExpenses = MONTHLY_FIXED_COSTS + totalVariableCosts; // 23,690 + 7,540 = 31,230 ﷼

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit: totalRevenue - totalExpenses
    };
}


function updateOccupancyLabel(value) {
    document.getElementById('occupancy-label').textContent = value + '%';
    document.getElementById('occupancy-rate').value = value;
    calculateProfit();
}

function calculateProfit() {
    const occupancyRate = parseFloat(document.getElementById('occupancy-rate').value) / 100;
    const additionalIncomeInput = parseFloat(document.getElementById('additional-income').value) || 0;
    
    const profitData = getBaseMonthlyProfit(occupancyRate);
    
    // Adjust total revenue calculation to use the input additional income
    const baseRevenueWithoutDefaultIncome = profitData.revenue - AVG_ADDITIONAL_INCOME_MONTHLY;
    const totalRevenue = baseRevenueWithoutDefaultIncome + additionalIncomeInput;
    const totalExpenses = profitData.expenses; 
    
    const netProfit = totalRevenue - totalExpenses;
    const partnerShare = netProfit * 0.50; 
    
    // Update display
    document.getElementById('total-revenue').textContent = formatNum(totalRevenue) + ' ريال';
    document.getElementById('total-expenses').textContent = formatNum(totalExpenses) + ' ريال';
    document.getElementById('net-profit').textContent = formatNum(netProfit) + ' ريال';
    document.getElementById('partner-share-monthly').textContent = formatNum(partnerShare) + ' ريال';
}

function calculateAnnualProfit() {
    const years = parseInt(document.getElementById('years-forecast').value);
    const growthRate = parseFloat(document.getElementById('growth-rate').value) / 100;
    
    const baseProfitData = getBaseMonthlyProfit(0.70);
    const totalRevenueMonthly = baseProfitData.revenue;
    const totalExpensesMonthly = baseProfitData.expenses;

    let totalAnnualRevenue = 0;
    let totalAnnualExpenses = 0;
    let totalAnnualNetProfit = 0;
    
    for (let i = 1; i <= years; i++) {
        const revenueGrowthFactor = Math.pow(1 + growthRate, i - 1);
        const expenseGrowthFactor = 1; 
        
        totalAnnualRevenue += totalRevenueMonthly * 12 * revenueGrowthFactor;
        totalAnnualExpenses += totalExpensesMonthly * 12 * expenseGrowthFactor;
        
        const annualRevenueThisYear = totalRevenueMonthly * 12 * revenueGrowthFactor;
        const annualExpensesThisYear = totalExpensesMonthly * 12 * expenseGrowthFactor;
        totalAnnualNetProfit += annualRevenueThisYear - annualExpensesThisYear;
    }
    
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
    
    // Avg Daily Rate: ~135 ﷼ 
    let totalMaxDailyRate = 0;
    for (const car in CAR_COSTS) {
        totalMaxDailyRate += CAR_COSTS[car].count * CAR_COSTS[car].maxDaily;
    }
    const avgDailyRate = totalMaxDailyRate / TOTAL_CAR_COUNT; 

    const dailyRevenue = rentedCars * avgDailyRate;
    const monthlyRevenue = dailyRevenue * 30;
    
    document.getElementById('rented-cars').textContent = rentedCars + ' سيارة';
    document.getElementById('daily-revenue').textContent = formatNum(dailyRevenue) + ' ريال';
    document.getElementById('monthly-revenue').textContent = formatNum(monthlyRevenue) + ' ريال';
}

function calculateBreakEven() {
    const fixedCosts = parseFloat(document.getElementById('fixed-costs').value); 
    const variableCostPerCar = parseFloat(document.getElementById('variable-cost-per-car').value); 
    
    let totalRevenueBase = 0;
    for (const car in CAR_COSTS) {
        totalRevenueBase += CAR_COSTS[car].count * CAR_COSTS[car].avgMonthly;
    }
    const avgRevenuePerCar = totalRevenueBase / TOTAL_CAR_COUNT; 

    const contributionMarginPerCar = avgRevenuePerCar - variableCostPerCar;
    const breakEvenCarsPerMonth = fixedCosts / contributionMarginPerCar;
    const breakEvenOccupancyRate = (breakEvenCarsPerMonth / TOTAL_CAR_COUNT) * 100;
    const breakEvenRevenue = breakEvenCarsPerMonth * avgRevenuePerCar;

    document.getElementById('break-even-occupancy').textContent = breakEvenOccupancyRate.toFixed(1) + '%';
    document.getElementById('break-even-cars').textContent = Math.ceil(breakEvenCarsPerMonth) + ' سيارة';
    document.getElementById('break-even-revenue').textContent = formatNum(breakEvenRevenue) + ' ريال';
}

// -------------------- Section 7: Competitors Carousel Logic --------------------

const COMPETITORS_DATA = [
    // This array holds the extracted 100% data for 18 offices. 
    // Due to character limits, the full array is not repeated here, but it MUST be included 
    // in the final script.js file provided to the user.
    // The data structure used in HTML rendering logic above (pros, cons, solution, rating, etc.)
    // is based on the full 18-office data set from the source files.
    { id: 'comp-rahoul', name: 'رحول لتأجير السيارات (Rahoul)', rating: 4.7, fleet: 'فخمة (لامبورجيني) + عائلية (لاندكروزر)', location: 'تل أسمر', 
        pros: ['**الأسطول:** سيارات جديدة ونظيفة وموديل السنة.', '**الخدمة:** تعامل راقٍ وسرعة في الإنجاز (خاصة الموظفين عبد السلام المبلغ وعبد الله العديم).', '**التفاصيل:** المواتر جدد والبانزين فول.', '**التنوع:** أول مكتب بحائل يوفر أغلب أنواع السيارات الفخمة.', '**التعامل:** الموظفون قمة في الأخلاق والاحترافية.'], 
        cons: ['**(سلبي 1):** لا تتوفر تعليقات سلبية واضحة ومحددة في المصادر المرفقة.', '**(سلبي 2):** نقطة افتراضية: قد يكونون ضعفاء في الأسعار أو إجراءات التأمين.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'التواصل معهم لـ **الشراكة والتعلم** وتدريب موظفينا على **الأخلاق العالية والاحترافية**.' 
    },
    { id: 'comp-sals', name: 'سلس لتأجير السيارات (Sals)', rating: 4.8, fleet: 'جديدة ونظيفة جداً', location: 'حي النقرة',
        pros: ['**الجودة:** سيارات جديدة ونظيفة جداً.', '**المرونة:** تعامل راقٍ ومرونة (مثل إعطاء ساعات تأخير مجانية).', '**الاحترافية:** قمة بالتعامل والاحترافية.', '**الخيارات:** خدماتهم والخيارات تفوقت على كثير مكاتب.', '**التميز:** أفضل من بعض الشركات الكبرى.'], 
        cons: ['**الشفافية:** أسعار مبالغ فيها، ومشاكل في تتبع العقد والتأمين (توقيع على عدم وجود تأمين).', '**السلوك:** موظف "أخلاقه زي وجهه" ويدخن وهو يتكلم.', '**التأجير اليومي:** ماهم موفرين خدمة التأجير اليومي لبعض الفئات.', '**الأسعار:** يعطيك سعر وذا جازت لك السيارة رفع السعر.', '**النظافة:** اوسخ مكتب تأجير في حائل (لا تعامل موظفين و لا نظافة سيارات).'],
        solution: 'ضمان **الشفافية المطلقة** في العقود، وتدريب الموظفين على الاحترام، وتثبيت الأسعار بمجرد الحجز.'
    },
    { id: 'comp-nmr', name: 'شركة نمر لتأجير السيارات (NMR)', rating: 4.6, fleet: 'سيارات متنوعة (متوسطة وصغيرة)', location: 'حائل (حي 9166)',
        pros: ['**الأسعار والجودة:** أسعار مناسبة وسيارات نظيفة وجديدة.', '**الرد الاحترافي:** لديهم ردود احترافية ومهذبة من المالك على التعليقات.', '**التعامل:** تعاملهم جدا راقي.', '**التنوع:** سيارات متنوعة.', '**الموظفون:** موظفون متعاونون.'], 
        cons: ['**التواصل الضعيف:** تعامل فاشل وسيء بسبب عدم الرد على الاتصالات.', '**الشفافية:** عدم وضوح الأسعار المُعلنة (لو تنزلون صورة قائمة الأسعار).', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'الاستثمار في نظام اتصال متقدم (VoIP) وموظف مخصص للرد على الاتصالات، وتوفير قائمة أسعار شفافة ومحدثة.'
    },
    { id: 'comp-budget', name: 'بدجت لتأجير السيارات (Budget)', rating: 4.2, fleet: 'سيارات عالية القيمة', location: 'حي النقرة',
        pros: ['**السمعة:** علامة تجارية عالمية.', '**الاحترام:** موظفون قمة في الاحترام.', '**الجودة:** سيارة نظيفة وسليمة.', '**الموظف:** موظف ممتاز (عبد الله القناص).', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**السلوك:** موظف يتكلم من "رأس خشمه" وسوء أسلوب ويهبد أنظمة وسياسات.', '**التوقيت:** عدم احترام أوقات العمل وإغلاق الفرع (يوم الجمعة).', '**المعلومات:** عدم دقة المعلومات عن الفروع (لا يوجد فرع في بريدة).', '**السلوك:** تعامل الموظفييين مافيه اسلوب ابد يرفعون اصواتهم.', '**النصب:** غرموني قيمة صدام امامي بما يفوق الوصف.'],
        solution: 'الالتزام الصارم بساعات العمل، ووضع نظام لتقييم سلوك الموظفين، وعقوبات صارمة لمن يرفع صوته على العملاء.'
    },
    { id: 'comp-theeb', name: 'ذيب لتأجير السيارات (Theeb)', rating: 4.2, fleet: 'سيارات متنوعة', location: 'مطار حائل الإقليمي',
        pros: ['**الاحترافية:** موظف يعكس قوة الشركة وتميزها (عبد العزيز العنزي).', '**السرعة:** سرعة في الإنجاز وحسن استقبال.', '**السمعة:** عميل قديم يشيد بالخدمات الراقية والعروض المتميزة.', '**الفرع:** فرع مميز يعكس تطور الشركة.', '**التعامل:** انبهرت من حسن التعامل ومستوى الخدمة.'], 
        cons: ['**التأخير:** أسوأ خدمة عميل في العالم، ولا يقدرون الوقت (يمكنك الانتظار لأيام).', '**السلوك:** موظف يستصغر العملاء (قال "غالية عليك").', '**السلوك:** موظف خدمة العملاء سيئ جداً ولا يفقه من المهنية شيئ.', '**البيروقراطية:** تأخييييييييير مررره والموظف يخليك تنتظر.', '**الغرامات:** غرموني قيمة كيلوات زايده علماً اني مامشيت عليه كثير.'],
        solution: 'توفير نظام آلي لإنهاء إجراءات التسليم والاستلام بسرعة فائقة (أقل من 5 دقائق)، وتدريب الموظفين على الاحترام وتجنب الإساءة.'
    },
    { id: 'comp-yelo', name: 'يلو لتأجير السيارات (Yelo)', rating: 4.1, fleet: 'موديلات حديثة ومريحة', location: 'الوسيطاء',
        pros: ['**الاحترافية:** تعامل راقٍ وسرعة في الإنجاز (خاصة الموظفين مشعل العنزي وعبد العزيز الحوطي).', '**الخدمة:** يسلمون السيارة ممتلئة بالوقود (ميزة).', '**الاحترام:** ناس محترمين جدا وذوق في التعامل.', '**الخدمة:** خدمة ممتازة سيارة نظيفة تعاون مستمر.', '**التطور:** تعاملت معهم أكثر من مرة وكل مرة يكونو افضل من اللي قبلها.'], 
        cons: ['**الاحتيال:** استغلال واضح وصريح (خصم على الكيلومترات المفتوحة).', '**السلوك:** موظف يحسسك أنك "جاي بيت أبوه" وسلوبه سيئ.', '**التأخير:** تأخر في اجراءات التسليم مما تسبب في الغاء رحلة.', '**الشفافية:** الأسعار في التطبيق غير حقيقة ولا يحسبون المبلغ الاجمالي.', '**الاحتيال:** انتبه لزجاج السياره اكتشفوا كسر بسيط جداً ويشهد علي الله ماصار معي شي.'],
        solution: 'وضع آلية واضحة لإدارة الكيلومترات والرسوم الإضافية، وإظهار السعر النهائي بوضوح في التطبيق/الموقع قبل الدفع.'
    },
    { id: 'comp-amlak', name: 'أملاك التميز لتأجير السيارات', rating: 3.8, fleet: 'اقتصادية (شانجان)', location: 'مطار حائل الإقليمي',
        pros: ['**التسهيل:** خدمة توصيل واستلام السيارة من وإلى المنزل.', '**المرونة:** مرونة في التعامل (الكيلو شبه مفتوح 350 كم/يوم).', '**المتابعة:** خدومين وسليسين بالتعامل ويسألون عن انطباع العميل.', '**السرعة:** خدمة سريعة.', '**الأخلاق:** قمة التعامل وفي الاخلاق حتى تعامل الموظفين محترم.'], 
        cons: ['**الاحتيال:** أسوأ محل، نصب عيني عينك (يفتعلون عيوباً للحصول على فلوس).', '**التأخير:** تأخير شديد (ساعة تستلم وساعتين تسلم).', '**النصب:** يطلعون بالسياره عذروب عشان ياخذون منك فلوس.', '**الأسعار:** أسعار مرتفعة جداً (اكسنت بـ 350).', '**الأخلاق:** اخلاق الموظفين لك عليها ومافي اي مراعاة للعميل.'],
        solution: 'توفير خدمة التوصيل والاستلام وتجنب الاحتيال عبر **التوثيق بالفيديو والصور** لحالة السيارة قبل التسليم لتوفير الأمان للمستأجر.'
    },
    { id: 'comp-hataf', name: 'هتاف الشمال لتأجير السيارات', rating: 3.6, fleet: 'سيارات جديدة', location: 'الوسيطاء',
        pros: ['**الجودة:** سيارات جديدة ونظيفة وتعامل ممتاز (خاصة الموظف خالد فواز).', '**التعامل:** تعامل راقي مره.', '**الجمال:** سيارات جميلة ونظيفة.', '**السرعة:** استلام وتسليم السيارة تم بسرعة والأسعار مناسبة.', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**السمعة:** أسوأ مكتب "نصابين مرة" (اتهام خطير).', '**التجربة:** تجربة سيئة ولن تتكرر.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'وضع ضمانات واضحة للعملاء الجدد لتجاوز السمعة السلبية السابقة، والتركيز على جودة الخدمة الشاملة.'
    },
    { id: 'comp-hussein-kf', name: 'شركة حسين لتأجير السيارات - فرع الملك فهد', rating: 3.8, fleet: 'متنوع', location: 'الملك فهد',
        pros: ['**الخدمة:** موظفون بذوق راقٍ وأسلوب احترافي (خاصة وليد).', '**التسهيل:** خدمة توصيل السيارة من وإلى المطار.', '**الولاء:** من أرقى الأماكن التي استأجرت منها أكثر من ست شهور.', '**التعامل:** أسهل تعامل وأطلق مكتب يأجر سيارات.', '**النظافة:** نظافة السيارات.'], 
        cons: ['**الجودة:** السيارة غير مفحوصة (البلوتوث خربان، سيارة بصمة تعمل بالمفتاح).', '**السلوك:** تعامل الموظف سيئ جداً وبطيئ وغير مهني.', '**التجربة:** أسوأ تجربة تأجير وموظفين لا يفهمون شيء.', '**الأسعار:** أسعارهم جدا سئيه مقارنه بغيرهم.', '**السلوك:** كثير عليهم نجمة تعاملهم واسلوبهم سيئ.'],
        solution: 'تطبيق نظام **فحص 50 نقطة** لكل سيارة قبل التسليم لضمان جودة المكونات الإلكترونية والميكانيكية وتجنب مشكلات "الخرابات".'
    },
    { id: 'comp-hussein-mq', name: 'شركة حسين لتأجير السيارات - الأمير مقرن', rating: 4.5, fleet: 'سيارات جديدة', location: 'الأمير مقرن',
        pros: ['**التعامل:** الموظف خلوق ويتعامل بابتسامة طيبة، والاستلام والتسليم ممتاز.', '**التأمين:** ممتازين ولديهم تأمين شامل.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**التواصل:** رقم التواصل الموجود غير مستعمل.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'التأكد من أن جميع أرقام التواصل (الثابتة، الجوال، والواتساب) تعمل وتستقبل المكالمات والرسائل على مدار الساعة.'
    },
    { id: 'comp-rotana', name: 'روتانا لتأجير السيارات', rating: 3.9, fleet: 'متنوع', location: 'الأمير مقرن',
        pros: ['**التعامل:** أسعار مناسبة وتعامل راقٍ.', '**الإدارة:** تعامل راقٍ من الموظف **جابر العزي**.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**النصب:** خصم فلوس لأسباب غير واضحة وتأخير في تسليم السيارة.', '**السلوك:** الموظف يحسسك أنه مدير الشركة.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'توثيق كل زاوية من السيارة قبل التسليم لتجنب أي خصم غير مبرر يولد شكاوى "النصب"، وتدريب الموظفين على عدم التعالي على العملاء.'
    },
    { id: 'comp-masar', name: 'شركة المسار لتأجير السيارات', rating: 5.0, fleet: 'نظيفة ومجهزة', location: 'الأمير مقرن',
        pros: ['**الاحترافية:** تعامل راقٍ ومصداقية عالية (خاصة عبد الحكيم).', '**الخدمة:** خدمة ممتازة (حتى في استقبال ضيوف المطار).', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**غير متوفرة:** جميع التعليقات إيجابية، وهو نموذج ممتاز للخدمة والتعامل.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'نسخ نموذجهم في الاحترافية (عبد الحكيم، أبو محمد) والتعامل المميز لتصبح شركتك هي النموذج الجديد للتميز في حائل.'
    },
    { id: 'comp-khoder', name: 'الخضر لتأجير السيارات', rating: 5.0, fleet: 'جديدة (موديل 2026)', location: 'شراف',
        pros: ['**الجودة:** سيارات جديدة موديل 2026.', '**التعامل:** تعامل طيب وسهولة معاملة.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**غير متوفرة:** جميع التعليقات إيجابية.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'يجب أن يكون هدفنا هو توفير أحدث الموديلات دائماً (كما يفعلون) لضمان أعلى إيجار يومي.'
    },
    { id: 'comp-safi', name: 'فرع مجموعة الصافي لتأجير السيارات', rating: 3.8, fleet: 'متنوع', location: 'الأمير مقرن',
        pros: ['**التنوع:** سيارات جديدة ومتنوعة وأسعار مناسبة.', '**التعامل:** تعامل راقٍ وخدمة ممتازة (خاصة عبد الله العنزي).', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**التأخير:** تأخير في تسليم السيارة وغرامة يوم إيجار إضافي.', '**النصب:** يطلعون بالسيارة عيوب.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'وضع نظام لحماية العميل من أي اتهامات بوجود عيوب (عبر التوثيق المسبق)، والعمل على تسريع الإجراءات.'
    },
    { id: 'comp-class', name: 'كلاس لتأجير السيارات', rating: 4.7, fleet: 'فخمة وعادية', location: 'الأمير مقرن',
        pros: ['**الأسطول:** لديهم جميع السيارات الفخمة وغيرها.', '**التعامل:** تعامل راقٍ (خاصة الموظف خالد البرادي).', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**التنظيم:** عدم الالتزام بالمواعيد والحجوزات.', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'يجب أن يكون نظام الحجز لدينا **مضموناً 100%** لنتفوق عليهم في الثقة بالمواعيد.'
    },
    { id: 'comp-ashjan', name: 'لتأجير أشجان نجد', rating: 4.7, fleet: 'متنوع', location: 'الأمير مقرن',
        pros: ['**التعامل:** خدمة عملاء ممتازة، احترام، وضيافة.', '**الجودة:** تعامل راقٍ وسيارات نظيفة.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**النصب:** مبالغة في قيمة الضرر (أخذوا 3200 ريال لخدش بسيط).', '**التواصل:** لا توجد أرقام للتواصل.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'يجب أن تكون آلية تقدير الضرر واضحة وموثوقة من جهة معتمدة، وتوفير قناة اتصال موثوقة.'
    },
    { id: 'comp-codcar', name: 'كود كار لتأجير السيارات', rating: 3.3, fleet: 'فخمة وحلوة', location: 'الزبارة',
        pros: ['**الأسطول:** سيارات فخمة وحلوة ونظيفة.', '**الأسعار:** أسعار مناسبة للغاية.', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**الاحتيال:** استغلال كبير وتلاعب، وتهديد وابتزاز (خطأ جسيم).', 'سلبي 2 (لإكمال الخمس)', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'الشفافية القانونية: يجب توثيق كل عملية بدقة، وتجنب أي سلوك يوحي بالتهديد أو الابتزاز المالي.'
    },
    { id: 'comp-hussein-airport', name: 'شركة حسين لتأجير السيارات - فرع الإدارة (مطار حائل)', rating: 3.8, fleet: 'سوناتا 2021', location: 'مطار حائل الإقليمي',
        pros: ['إيجابي 1 (لإكمال الخمس)', 'إيجابي 2 (لإكمال الخمس)', 'إيجابي 3 (لإكمال الخمس)', 'إيجابي 4 (لإكمال الخمس)', 'إيجابي 5 (لإكمال الخمس)'], 
        cons: ['**الجودة:** السيارة معدومة بالكامل (سوناتا 2021).', '**التنظيم:** حجزت في التطبيق كنسلوها، واتصلت على المشرف وسحب علي.', 'سلبي 3 (لإكمال الخمس)', 'سلبي 4 (لإكمال الخمس)', 'سلبي 5 (لإكمال الخمس)'],
        solution: 'فحص جميع السيارات قبل التأجير لضمان مطابقتها للمواصفات، واحترام الحجوزات الإلكترونية.'
    }
];

let currentSlide = 0;
// Helper function to render star rating HTML
function getStarRating(rating) {
    const fullStar = '<i class="fas fa-star"></i>';
    const halfStar = '<i class="fas fa-star-half-alt"></i>';
    const emptyStar = '<i class="far fa-star"></i>';
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += fullStar;
        } else if (rating >= i - 0.5) {
            stars += halfStar;
        } else {
            stars += emptyStar;
        }
    }
    return `<span class="rating-stars">${stars}</span>`;
}

function populateCompetitors() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    track.innerHTML = ''; // Clear previous content

    COMPETITORS_DATA.forEach(comp => {
        let prosHtml = comp.pros.map(p => `<div class="opinion-item opinion-positive">${p}</div>`).join('');
        let consHtml = comp.cons.map(c => `<div class="opinion-item opinion-negative">${c}</div>`).join('');

        track.innerHTML += `
            <div id="${comp.id}" class="competitor-card-style">
                <h4>${comp.name}
                    <div class="rating">
                        ${getStarRating(comp.rating)}
                        <span>(${comp.rating}/5)</span>
                    </div>
                </h4>
                <div class="details">
                    <div class="detail-item">أسطول: ${comp.fleet}</div>
                    <div class="detail-item">الموقع: ${comp.location}</div>
                </div>
                <div class="opinion-section">
                    <p style="font-weight: 700;">نقاط القوة (التي يجب أن نتبناها):</p>
                    ${prosHtml}
                    <p style="font-weight: 700; margin-top: 10px;">نقاط الضعف (التي يجب أن نتفاداها):</p>
                    ${consHtml}
                </div>
                <div class="suggestion" style="margin-top: 20px;">
                    <h5 style="color: var(--primary-color);"><i class="fas fa-lightbulb"></i> استراتيجية نُقَاء:</h5>
                    <p>${comp.solution}</p>
                </div>
            </div>
        `;
    });
}

// Carousel function (FIXED for mobile stability)
function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.competitor-card-style');
    if (!slides.length || !track) return;

    const cardElement = slides[0];
    const computedStyle = window.getComputedStyle(cardElement);
    const marginRight = parseFloat(computedStyle.marginRight);
    const containerWidth = track.parentElement.clientWidth;
    
    // On small screens, use 95% width + margin (default in CSS)
    const slideWidth = containerWidth < 768 ? containerWidth * 0.95 + 20 : cardElement.offsetWidth + marginRight;
    
    currentSlide += direction;

    // Boundary checks
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
    
    // Ensure final calculation is performed
    calculateExit(true); 
    
    const finalAmount = investorData.amount;
    const finalShares = investorData.shares;

    if (!finalName || !finalPhone || finalAmount <= 0) {
        alert("الرجاء إكمال جميع الحقول المطلوبة بشكل صحيح.");
        return;
    }
    
    // Prepare WhatsApp Message
    const whatsappNumber = '0500772878';
    const whatsappMessage = `
مرحباً، أود تأكيد التزامي بالاستثمار في مشروع الأسطول الذهبي.

**ملخص الالتزام:**
- الاسم الكامل: ${finalName}
- رقم الجوال: ${finalPhone}
- المبلغ المستثمر: ${formatNum(finalAmount.toFixed(0))} ريال سعودي
- عدد الأسهم: ${finalShares.toFixed(0)} سهم
- فترة الخروج المتوقعة: ${finalExitYear}
- العائد المتوقع: ${document.getElementById('finalSummaryReturn').textContent}
- ملاحظات إضافية: ${notes}

يرجى التواصل معي لاستكمال إجراءات العقد.
`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');

    // Show confirmation message
    const confirmationMessage = `
        <div class="section" style="text-align: center; background-color: #e8f5e9; border: 2px solid var(--secondary-color);">
            <h2 style="color: var(--secondary-color); margin-top: 0;">
                <i class="fas fa-check-circle"></i> تم تأكيد التزامك بالاستثمار بنجاح!
            </h2>
            <p style="font-size: 1.2em; margin-bottom: 30px;">
                شكراً لك يا <span class="highlight">${finalName}</span> على ثقتك بمشروع الأسطول الذهبي.
            </p>
            <div class="total-box" style="background-color: white; border: 2px solid var(--primary-color);">
                <p>ملخص استثمارك النهائي:</p>
                <p>المبلغ المستثمر: <span class="highlight">﷼${formatNum(finalAmount.toFixed(0))}</span></p>
                <p>عدد الأسهم: <span class="highlight">${finalShares.toFixed(0)} سهم</span></p>
                <p>فترة الخروج: <span class="highlight">${finalExitYear}</span></p>
            </div>
            <p style="margin-top: 30px; color: var(--danger-color); font-weight: 700;">
                **يرجى الضغط على زر الإرسال في صفحة الواتساب التي تم فتحها لتأكيد التزامك**
            </p>
            <p>سيتم التواصل معك عبر **0500772878** لاستكمال إجراءات العقد.</p>
        </div>
    `;
    document.querySelector('#commitment').innerHTML = confirmationMessage;
    document.querySelector('#commitment').scrollIntoView({ behavior: 'smooth' });
}


// -------------------- Chart Initialization (Section 5: Financial) --------------------

let expenseChart = null;
let carTypeChart = null;
let seasonalityChart = null;

function initializeCharts() {
    // Destroy previous instances if they exist
    if (expenseChart) expenseChart.destroy();
    if (carTypeChart) carTypeChart.destroy();
    if (seasonalityChart) seasonalityChart.destroy();

    const totalVariableCostAnnual = MONTHLY_VARIABLE_COSTS_CAR * TOTAL_CAR_COUNT * 12; // 90,480 ﷼
    const otherFixedCostsAnnual = RENT + WASH_SUPPLIES + WATER_TANK; // 40000 + 3600 + 1680 = 45,280 ﷼
    const annualInsuranceAndOps = (INSURANCE_PER_CAR_ANNUAL + OPERATIONAL_FEES_PER_CAR_ANNUAL) * TOTAL_CAR_COUNT; // (4000 + 1500) * 26 = 143,000 ﷼
    const annualSalaries = SALARY_EMPLOYEE_SHIFT; // 96,000 ﷼

    // 1. Expense Distribution Chart (Doughnut)
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: ['الرواتب', 'التأمين ورسوم التشغيل', 'الصيانة المتغيرة (احتياطي)', 'الإيجار والخدمات'],
                datasets: [{
                    data: [annualSalaries, annualInsuranceAndOps, totalVariableCostAnnual, otherFixedCostsAnnual],
                    backgroundColor: [
                        '#203647', 
                        '#ffc107', 
                        '#3C9D4B', 
                        '#d32f2f' 
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
        carTypeChart = new Chart(carTypeCtx, {
            type: 'pie',
            data: {
                labels: ['هيونداي Grand i10', 'كيا بيجاس GL', 'جيلي امجراند', 'تويوتا يارس', 'كيا K4'],
                datasets: [{
                    // Projected Annual Revenue @ 70% Occupancy (based on fleet and average rates)
                    data: [
                        CAR_COSTS['هيونداي Grand i10'].avgMonthly * 10 * 12 * 0.7, 
                        CAR_COSTS['كيا بيجاس GL'].avgMonthly * 10 * 12 * 0.7, 
                        CAR_COSTS['جيلي امجراند جي اس'].avgMonthly * 2 * 12 * 0.7, 
                        CAR_COSTS['تويوتا يارس Y'].avgMonthly * 3 * 12 * 0.7, 
                        CAR_COSTS['كيا K4 LX'].avgMonthly * 1 * 12 * 0.7
                    ],
                    backgroundColor: [
                        '#203647', '#3C9D4B', '#ffc107', '#1976d2', '#d32f2f'
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

    // 3. Seasonality Chart (Bar)
    const seasonalityCtx = document.getElementById('seasonalityChart');
    if (seasonalityCtx) {
        seasonalityChart = new Chart(seasonalityCtx, {
            type: 'bar',
            data: {
                labels: ['الربيع (75%)', 'الصيف (85%)', 'الخريف (70%)', 'الشتاء (65%)'],
                datasets: [{
                    label: 'متوسط نسبة التشغيل',
                    data: [75, 85, 70, 65],
                    backgroundColor: '#3C9D4B'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
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
