document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 1. الثوابت والمتغيرات الأساسية للمشروع (تم التحديث بناءً على آخر الطلبات)
    // ----------------------------------------------------

    const TOTAL_CAR_COUNT = 26;
    const TOTAL_SHARES = 2000;
    const BASE_CAPITAL = 1750000; // رأس المال الكلي
    const SHARE_PRICE = BASE_CAPITAL / TOTAL_SHARES; // 875 ريال/سهم
    const INITIAL_INVESTMENT_RATIO = 0.50; // نسبة الشريك الافتراضية للتقارير العامة
    const ANNUAL_GROWTH_RATE = 0.15; // 15% معدل النمو السنوي الافتراضي

    // المصروفات الشهرية الثابتة (من جدول المصروفات المحدث: 284,280 ريال سنوياً)
    const MONTHLY_FIXED_COSTS = 23690; // 23,690 ريال/شهرياً (دقيق)
    // التكاليف المتغيرة للسيارة الواحدة (290 ريال/شهرياً: 100 صيانة + 90 زيت + 100 كفرات)
    const MONTHLY_VARIABLE_COSTS_CAR = 290;
    const TOTAL_VARIABLE_COSTS_MONTHLY = TOTAL_CAR_COUNT * MONTHLY_VARIABLE_COSTS_CAR; // 7,540 ريال/شهرياً

    // بيانات الأسطول لمتوسط الإيراد (متوسط الإيجار الشهري للسنة الأولى)
    // تم حساب متوسط الإيجار الشهري للأسطول (511,980 ريال سنوياً / 12 شهر = 42,665 ريال)
    const AVG_MONTHLY_RENTAL_PER_CAR = 2355; // (42665 / 26 سيارة تقريبي)

    // الدخل الإضافي الشهري (600 ريال كيلو + 400 ريال تأمين/طقات)
    const AVG_ADDITIONAL_INCOME_MONTHLY = 26000; // (1000 ريال/سيارة) * 26 سيارة

    // بيانات العوائد السنوية الافتراضية (للحساب السريع)
    const ANNUAL_RETURNS = {
        'بعد 1.5 سنة': 0.10, 'بعد سنتين': 0.125, 'بعد 3 سنوات': 0.15, 'بعد 4 سنوات': 0.165,
        'بعد 5 سنوات': 0.18, 'بعد 6 سنوات': 0.19, 'بعد 7 سنوات': 0.20, 'أفكر بوقت آخر': 0.10
    };
    
    // الأرباح الرأسمالية المتوقعة بعد 7 سنوات
    const CAPITAL_GAIN_7_YEARS = 520000; // 520,000 ريال

    // المخاطر الافتراضية لتهيئة قياس المخاطر
    const RISK_DEFAULTS = {
        occupancy: 70,
        maintenance: 60,
        insurance: 80
    };

    // بيانات المستثمر (يتم تحديثها بعد الإدخال الأولي)
    let investorData = { name: '', phone: '', email: '', linkSource: '', type: '', amount: 0, shares: 0, exitYear: 'بعد 5 سنوات' };


    // ----------------------------------------------------
    // 2. الدوال المساعدة والمالية
    // ----------------------------------------------------

    // تنسيق الأرقام كعملة سعودية (بشعار الريال)
    const formatNum = (x) => {
        return Number(x).toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    // وظيفة لحساب الأرباح الشهرية بناءً على نسبة الإشغال (للحاسبة التفاعلية)
    const calculateMonthlyProfit = (occupancyRate, additionalIncomeInput) => {
        const totalRentalRevenue = AVG_MONTHLY_RENTAL_PER_CAR * TOTAL_CAR_COUNT * occupancyRate;
        const totalMonthlyRevenue = totalRentalRevenue + additionalIncomeInput;
        const totalMonthlyExpenses = MONTHLY_FIXED_COSTS + TOTAL_VARIABLE_COSTS_MONTHLY;
        const netProfit = totalMonthlyRevenue - totalMonthlyExpenses;
        const partnerShare = netProfit * 0.50;
        
        return { totalMonthlyRevenue, totalMonthlyExpenses, netProfit, partnerShare };
    };

    // وظيفة لحساب العائد التراكمي (للحساب السريع)
    const calculateProjectedReturn = (investmentAmount, years) => {
        const investorOwnership = investmentAmount / BASE_CAPITAL;
        let projectedTotalProfit = 0;
        
        // استخدام صافي الربح السنوي عند 70% إشغال كنقطة أساس (38,717 * 12 = 464,604 ريال)
        const BASE_NET_PROFIT = 464604; 

        for (let i = 1; i <= years; i++) {
            // تطبيق النمو السنوي (15%) على صافي ربح المشروع
            let annualBaseProfit = BASE_NET_PROFIT * Math.pow(1 + ANNUAL_GROWTH_RATE, i - 1);
            // توزيع حصة المستثمر (50%) بعد تطبيق نسبة ملكيته
            projectedTotalProfit += annualBaseProfit * 0.50 * investorOwnership;
        }

        // إضافة العائد الرأسمالي عند التصفية (بعد 7 سنوات)
        const capitalGain = years >= 7 ? CAPITAL_GAIN_7_YEARS * investorOwnership : 0;
        
        const totalReturn = investmentAmount + projectedTotalProfit + capitalGain;
        const avgAnnualRate = (projectedTotalProfit / investmentAmount) / years;

        return { projectedTotalProfit, totalReturn, avgAnnualRate };
    };

    // ----------------------------------------------------
    // 3. منطق التفاعل (الحاسبة السريعة والتبديل)
    // ----------------------------------------------------

    const exitResult = document.getElementById('exitResult');
    const investmentTypeSelect = document.getElementById('investmentType');
    const amountGroup = document.getElementById('amountGroup');
    const sharesGroup = document.getElementById('sharesGroup');
    const investmentAmountInput = document.getElementById('investmentAmount');
    const shareCountInput = document.getElementById('shareCount');
    const exitPeriodSelect = document.getElementById('exitPeriod');
    const investorNameInput = document.getElementById('investorName');
    const investorPhoneInput = document.getElementById('investorPhone');

    // تحديث حقول الإدخال عند تغيير نوع الاستثمار
    window.updateInvestmentFields = () => {
        const type = investmentTypeSelect.value;
        amountGroup.style.display = type === 'amount' ? 'flex' : 'none';
        sharesGroup.style.display = type === 'shares' ? 'flex' : 'none';
        
        // مسح القيمة الأخرى عند التبديل
        if (type === 'shares') {
            investmentAmountInput.value = '';
        } else if (type === 'amount') {
            shareCountInput.value = '';
        }
        calculateExit();
    };

    // تحديث الحسبة السريعة في الخطوة الأولى
    window.calculateExit = (isFinal = false) => {
        const targetElement = isFinal ? document.querySelector('.final-submission') : exitResult;
        const exitYearElement = isFinal ? document.getElementById('finalExitPeriod') : exitPeriodSelect;

        let investmentAmount = 0;
        let shares = 0;

        if (isFinal) {
            const finalAmount = parseFloat(document.getElementById('finalInvestmentAmount').value) || 0;
            const finalShares = parseFloat(document.getElementById('finalShareCount').value) || 0;
            
            if (finalAmount > 0) {
                investmentAmount = finalAmount;
                shares = Math.floor(investmentAmount / SHARE_PRICE);
                document.getElementById('finalShareCount').value = shares;
            } else if (finalShares > 0) {
                shares = finalShares;
                investmentAmount = finalShares * SHARE_PRICE;
                document.getElementById('finalInvestmentAmount').value = investmentAmount;
            } else {
                investmentAmount = investorData.amount; // استخدام القيمة الأولية إذا لم يتم تعديلها
                shares = investorData.shares;
            }
        } else {
            const type = investmentTypeSelect.value;
            const amountInput = parseFloat(investmentAmountInput.value) || 0;
            const sharesInput = parseFloat(shareCountInput.value) || 0;

            if (type === 'amount' && amountInput > 0) {
                investmentAmount = amountInput;
                shares = Math.floor(amountInput / SHARE_PRICE);
            } else if (type === 'shares' && sharesInput > 0) {
                shares = sharesInput;
                investmentAmount = sharesInput * SHARE_PRICE;
            }
        }
        
        const exitYear = exitYearElement.value;
        const yearsMatch = exitYear.match(/\d+\.?\d*/);
        const years = yearsMatch ? parseFloat(yearsMatch[0]) : 5;

        if (investmentAmount <= 0) {
            if (!isFinal) exitResult.style.display = 'none';
            return;
        }
        
        const { projectedTotalProfit, totalReturn, avgAnnualRate } = calculateProjectedReturn(investmentAmount, years);
        
        if (!isFinal) {
            exitResult.style.display = 'block';
            exitResult.innerHTML = `
                <div style="font-size: 1.2em; text-align: right;">
                    <p>المبلغ المُستثمر: <span class="highlight riyals-icon">${formatNum(investmentAmount)}</span></p>
                    <p>فترة الخروج: <span class="highlight">${exitYear}</span></p>
                    <p>الأرباح المتوقعة: <span class="highlight riyals-icon">${formatNum(projectedTotalProfit)}</span></p>
                    <p style="font-weight: 700; color: var(--tertiary-color);">إجمالي المبلغ المُستحق (تخميني): <span class="highlight riyals-icon">${formatNum(totalReturn)}</span></p>
                </div>
            `;
        } else {
            document.getElementById('finalSummaryAmount').textContent = `${formatNum(investmentAmount)} ﷼`;
            document.getElementById('finalSummaryExit').textContent = exitYear;
            document.getElementById('finalSummaryReturn').textContent = `${formatNum(totalReturn)} ﷼`;
            document.getElementById('finalSummaryAnnualRate').textContent = `${(avgAnnualRate * 100).toFixed(1)}%`;
        }
    };
    
    // وظيفة عرض الأقسام بعد إدخال البيانات الأولية
    window.showDetails = () => {
        const name = investorNameInput.value;
        const phone = investorPhoneInput.value;
        const investmentType = investmentTypeSelect.value;
        const amount = parseFloat(investmentAmountInput.value) || 0;
        const shares = parseFloat(shareCountInput.value) || 0;

        if (!name || !phone || investmentType === 'none' || (investmentType === 'amount' && amount <= 0) || (investmentType === 'shares' && shares <= 0)) {
             alert("الرجاء إدخال الاسم ورقم الجوال وتحديد مبلغ/عدد الأسهم بشكل صحيح للمتابعة.");
             return;
        }

        // تخزين البيانات الأولية
        investorData.name = name;
        investorData.phone = phone;
        investorData.email = document.getElementById('investorEmail').value;
        investorData.linkSource = document.getElementById('linkSource').value;
        investorData.type = investmentType;
        investorData.amount = (investmentType === 'amount' ? amount : shares * SHARE_PRICE);
        investorData.shares = (investmentType === 'shares' ? shares : Math.floor(amount / SHARE_PRICE));
        investorData.exitYear = exitPeriodSelect.value;

        const investmentDetail = investorData.type === 'amount' ? 
            `لقد اخترت الاستثمار بمبلغ: <span class="highlight riyals-icon">${formatNum(investorData.amount)}</span>.` :
            `لقد اخترت <span class="highlight">${investorData.shares.toFixed(0)} سهمًا</span> (بقيمة <span class="highlight riyals-icon">${formatNum(investorData.amount)}</span>).`;

        const welcomeMessage = `
            <div class="investor-message">
                مرحباً بك، شريكنا العزيز/ <span class="highlight">${investorData.name}</span>.<br>
                ${investmentDetail}<br>
                نحن نؤمن بالشفافية المطلقة. يرجى تصفح أدناه دراسة الجدوى الشاملة التي تجيب على كل استفساراتك حول الفرص والمخاطر.
            </div>
        `;
        
        document.getElementById('welcomeSection').innerHTML = welcomeMessage;
        document.getElementById('welcomeSection').style.display = 'block';
        document.getElementById('InteractiveEntry').style.display = 'none';

        // تهيئة حقول الالتزام النهائي (القسم الأخير)
        document.getElementById('finalName').value = investorData.name;
        document.getElementById('finalPhone').value = investorData.phone;
        document.getElementById('finalSourceOfLink').value = investorData.linkSource;
        document.getElementById('finalInvestmentAmount').value = investorData.type === 'amount' ? investorData.amount : '';
        document.getElementById('finalShareCount').value = investorData.type === 'shares' ? investorData.shares : '';
        
        // نسخ خيارات فترة الخروج
        const finalExitSelect = document.getElementById('finalExitPeriod');
        finalExitSelect.innerHTML = exitPeriodSelect.innerHTML;
        finalExitSelect.value = investorData.exitYear;
        
        // عرض المحتوى الكامل والحساب النهائي
        document.getElementById('contentContainer').style.display = 'block';
        calculateExit(true); // تحديث الحاسبة النهائية بالبيانات المخزنة

        // تهيئة الرسوم البيانية والكاروسيل
        setTimeout(() => {
             initializeCharts();
             moveCarousel(0); 
             calculateProfit(); // تشغيل الحاسبة التفاعلية بالقيم الافتراضية
             calculateRisk(); // تشغيل تحليل المخاطر بالقيم الافتراضية
        }, 300);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ----------------------------------------------------
    // 4. منطق الحاسبة التفاعلية المفصلة (القسم 4)
    // ----------------------------------------------------

    const occupancyRateInput = document.getElementById('occupancy-rate');
    const additionalIncomeInput = document.getElementById('additional-income');
    const fixedCostsInput = document.getElementById('fixed-costs');
    const variableCostPerCarInput = document.getElementById('variable-cost-per-car');

    window.updateOccupancyLabel = (value) => {
        document.getElementById('occupancy-label').textContent = value + '%';
    };

    window.calculateProfit = () => {
        const occupancyRate = parseFloat(occupancyRateInput.value) / 100;
        const additionalIncome = parseFloat(additionalIncomeInput.value) || 0;
        const fixedCosts = parseFloat(fixedCostsInput.value) || MONTHLY_FIXED_COSTS;
        const variableCostsCar = parseFloat(variableCostPerCarInput.value) || MONTHLY_VARIABLE_COSTS_CAR;
        
        // 1. حساب الإيراد الشهري (الإيجار فقط)
        const totalRentalRevenue = AVG_MONTHLY_RENTAL_PER_CAR * TOTAL_CAR_COUNT * occupancyRate;
        const totalMonthlyRevenue = totalRentalRevenue + additionalIncome;

        // 2. حساب المصروفات الشهرية
        const totalVariableCosts = TOTAL_CAR_COUNT * variableCostsCar;
        const totalMonthlyExpenses = fixedCosts + totalVariableCosts;

        // 3. صافي الربح
        const netProfit = totalMonthlyRevenue - totalMonthlyExpenses;
        const partnerShare = netProfit * 0.50;
        
        // تحديث العرض
        document.getElementById('total-revenue').textContent = formatNum(totalMonthlyRevenue) + ' ﷼';
        document.getElementById('total-expenses').textContent = formatNum(totalMonthlyExpenses) + ' ﷼';
        document.getElementById('net-profit').textContent = formatNum(netProfit) + ' ﷼';
        document.getElementById('partner-share-monthly').textContent = formatNum(partnerShare) + ' ﷼';
    };

    window.calculateAnnualProfit = () => {
        const years = parseInt(document.getElementById('years-forecast').value);
        const growthRate = parseFloat(document.getElementById('growth-rate').value) / 100;
        
        // استخدام 70% إشغال والدخل الإضافي الافتراضي للتنبؤ السنوي
        const baseData = calculateMonthlyProfit(0.70, AVG_ADDITIONAL_INCOME_MONTHLY);
        const totalRevenueMonthly = baseData.totalMonthlyRevenue;
        const totalExpensesMonthly = baseData.totalMonthlyExpenses;
        const monthlyNetProfit = baseData.netProfit;

        let totalAnnualRevenue = 0;
        let totalAnnualExpenses = 0;
        let totalAnnualNetProfit = 0;
        
        for (let i = 1; i <= years; i++) {
            const factor = Math.pow(1 + growthRate, i - 1);
            totalAnnualRevenue += totalRevenueMonthly * 12 * factor;
            totalAnnualExpenses += totalExpensesMonthly * 12; // افتراض ثبات المصروفات الثابتة نسبياً
            totalAnnualNetProfit += monthlyNetProfit * 12 * factor;
        }
        
        const totalCarCostActual = 1416083; // القيمة الفعلية لتكلفة الأسطول
        const roi = (totalAnnualNetProfit / totalCarCostActual) * 100;

        document.getElementById('annual-revenue').textContent = formatNum(totalAnnualRevenue) + ' ﷼';
        document.getElementById('annual-expenses').textContent = formatNum(totalAnnualExpenses) + ' ﷼';
        document.getElementById('annual-net-profit').textContent = formatNum(totalAnnualNetProfit) + ' ﷼';
        document.getElementById('roi').textContent = roi.toFixed(1) + '%';
    };

    window.updateOccupancySimulation = (value) => {
        document.getElementById('occupancy-display').textContent = value + '%';
        const occupancyRate = parseFloat(value) / 100;
        
        const rentedCars = Math.round(TOTAL_CAR_COUNT * occupancyRate);
        const dailyRevenue = AVG_MONTHLY_RENTAL_PER_CAR * rentedCars; // (متوسط الإيجار اليومي * عدد السيارات المؤجرة)
        const monthlyRevenue = dailyRevenue * 30;

        document.getElementById('rented-cars').textContent = rentedCars + ' سيارة';
        document.getElementById('daily-revenue').textContent = formatNum(dailyRevenue) + ' ﷼';
        document.getElementById('monthly-revenue').textContent = formatNum(monthlyRevenue) + ' ﷼';
    };

    window.calculateBreakEven = () => {
        const fixedCosts = parseFloat(fixedCostsInput.value) || MONTHLY_FIXED_COSTS;
        const variableCostPerCar = parseFloat(variableCostPerCarInput.value) || MONTHLY_VARIABLE_COSTS_CAR;
        
        // متوسط الإيراد الشهري للسيارة (2355 ريال/شهرياً)
        const avgRevenuePerCarMonthly = AVG_MONTHLY_RENTAL_PER_CAR * 30; // إيراد السيارة في شهر تشغيل كامل
        
        // صافي ربح الوحدة (Contribution Margin)
        const contributionMarginPerCar = avgRevenuePerCarMonthly - variableCostPerCar;
        
        // عدد السيارات المطلوبة للتعادل (لتغطية المصروفات الثابتة)
        const breakEvenCarsPerMonth = fixedCosts / contributionMarginPerCar;
        const breakEvenOccupancyRate = (breakEvenCarsPerMonth / TOTAL_CAR_COUNT) * 100;
        const breakEvenRevenue = breakEvenCarsPerMonth * avgRevenuePerCarMonthly;

        document.getElementById('break-even-occupancy').textContent = breakEvenOccupancyRate.toFixed(1) + '%';
        document.getElementById('break-even-cars').textContent = Math.ceil(breakEvenCarsPerMonth) + ' سيارة';
        document.getElementById('break-even-revenue').textContent = formatNum(breakEvenRevenue) + ' ﷼';
    };


    // ----------------------------------------------------
    // 5. منطق تحليل المخاطر (القسم 7)
    // ----------------------------------------------------

    window.calculateRisk = () => {
        const riskOccupancy = parseFloat(document.getElementById('riskOccupancy').value) || RISK_DEFAULTS.occupancy;
        const riskMaintenance = parseFloat(document.getElementById('riskMaintenance').value) || RISK_DEFAULTS.maintenance;
        const riskInsurance = parseFloat(document.getElementById('riskInsurance').value) || RISK_DEFAULTS.insurance;

        document.getElementById('occupancyRiskDisplay').textContent = riskOccupancy + '%';
        document.getElementById('maintenanceRiskDisplay').textContent = riskMaintenance + '%';
        document.getElementById('insuranceRiskDisplay').textContent = riskInsurance + '%';
        
        // معادلة المخاطر (مخاطرة أقل = درجة أقل)
        let riskScore = 0;
        riskScore += (100 - riskOccupancy) * 0.4;
        riskScore += (100 - riskMaintenance) * 0.3;
        riskScore += (100 - riskInsurance) * 0.3;
        
        const riskMeterFill = document.getElementById('riskMeterFill');
        const riskMeterLabel = document.getElementById('riskMeterLabel');
        const riskRecommendations = document.getElementById('riskRecommendations');
        
        riskMeterFill.style.width = riskScore.toFixed(0) + '%';
        riskMeterLabel.textContent = 'مستوى المخاطر: ' + riskScore.toFixed(0) + '%';
        
        riskMeterFill.className = 'risk-meter-fill';
        if (riskScore < 30) {
            riskMeterFill.classList.add('risk-low');
        } else if (riskScore < 60) {
            riskMeterFill.classList.add('risk-medium');
        } else {
            riskMeterFill.classList.add('risk-high');
        }

        let recommendations = '<ul>';
        if (riskOccupancy < 70) {
            recommendations += '<li>• **خطر الإشغال:** نسبة الإشغال (${riskOccupancy}%) منخفضة. يجب زيادة التسويق وتخفيض الأسعار مؤقتاً.</li>';
        }
        if (riskMaintenance < 60) {
            recommendations += '<li>• **خطر الصيانة:** احتياطي الصيانة (${riskMaintenance}%) غير كافٍ. يجب زيادة المخصص الشهري لتغطية الأعطال المفاجئة.</li>';
        }
        if (riskInsurance < 80) {
            recommendations += '<li>• **خطر التأمين:** تغطية التأمين (${riskInsurance}%) غير شاملة. يجب التأكد من التغطية الشاملة بأعلى قيمة ممكنة.</li>';
        }
        
        if (recommendations === '<ul>') {
            riskRecommendations.innerHTML = '<p style="font-weight: bold; color: var(--success-color); text-align: center;">مستوى المخاطر منخفض، استمر في الحفاظ على الإجراءات الحالية!</p>';
        } else {
            riskRecommendations.innerHTML = recommendations + '</ul>';
        }
    };
    
    // ----------------------------------------------------
    // 6. منطق الأزرار والتنقل (Tabs & Final Commitment)
    // ----------------------------------------------------

    // وظيفة التنقل بين الـ Tabs
    window.openTab = (evt, tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-nav button').forEach(el => el.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        evt.currentTarget.classList.add('active');

        // إعادة تشغيل الحاسبة عند التبديل
        if (tabName === 'monthly-profit') calculateProfit();
        if (tabName === 'annual-profit') calculateAnnualProfit();
        if (tabName === 'occupancy-rate') updateOccupancySimulation(document.getElementById('occupancy-slider').value);
        if (tabName === 'break-even') calculateBreakEven();
    };

    // إرسال الالتزام النهائي عبر واتساب
    window.submitFinalCommitment = () => {
        const finalName = document.getElementById('finalName').value;
        const finalPhone = document.getElementById('finalPhone').value;
        const finalExitYear = document.getElementById('finalExitPeriod').value;
        const notes = document.getElementById('finalCommitmentNotes').value || 'لا توجد ملاحظات إضافية.';
        const finalAmount = parseFloat(document.getElementById('finalInvestmentAmount').value) || 0;
        const finalShares = parseFloat(document.getElementById('finalShareCount').value) || 0;
        const annualRate = document.getElementById('finalSummaryAnnualRate').textContent;
        const totalReturn = document.getElementById('finalSummaryReturn').textContent;

        if (!finalName || !finalPhone || finalAmount <= 0) {
            alert("الرجاء إكمال جميع الحقول المطلوبة بشكل صحيح (الاسم، الجوال، والمبلغ/الأسهم).");
            return;
        }
        
        const investmentType = finalAmount === finalShares * SHARE_PRICE ? 'أسهم' : 'مبلغ مخصص';
        
        const whatsappMessage = `
*نموذج الالتزام بالاستثمار (موسوعة الأسطول الذهبي)*
        
*البيانات الأساسية:*
1. الاسم الكامل: ${finalName}
2. رقم الجوال: ${finalPhone}
        
*ملخص الاستثمار:*
3. المبلغ/القيمة المتفق عليها: ${formatNum(finalAmount)} ريال سعودي (${investmentType})
4. عدد الأسهم: ${finalShares.toFixed(0)} سهم
5. نية الخروج: ${finalExitYear}
6. معدل العائد السنوي المتوقع: ${annualRate}
7. إجمالي العائد المتوقع (تخميني): ${totalReturn}
        
*ملاحظات إضافية:*
8. ملاحظات الشريك: ${notes}
        
*أوافق على بدء المناقشات لتوثيق الشراكة.*
        `;

        const encodedMessage = encodeURIComponent(whatsappMessage.trim());
        const whatsappNumber = '966500772878';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
        
        // عرض رسالة التأكيد
        const confirmationMessage = `
            <div class="section" style="text-align: center; background-color: #e8f5e9; border: 2px solid var(--success-color);">
                <h2 style="color: var(--success-color); margin-top: 0;"><i class="fas fa-check-circle"></i> تم تأكيد التزامك بالاستثمار بنجاح!</h2>
                <p style="font-size: 1.2em; margin-bottom: 30px;">شكراً لك يا <span class="highlight">${finalName}</span> على ثقتك بمشروع الأسطول الذهبي.</p>
                <p style="margin-top: 30px; color: var(--danger-color); font-weight: 700;">يرجى إكمال الإرسال في صفحة الواتساب التي تم فتحها لتأكيد التزامك</p>
                <p>سيتم التواصل معك عبر **0500772878** لاستكمال إجراءات العقد.</p>
            </div>
        `;
        document.querySelector('#final-submission').innerHTML = confirmationMessage;
        document.querySelector('#final-submission').scrollIntoView({ behavior: 'smooth' });
    };

    // ----------------------------------------------------
    // 7. بيانات المنافسين و Carousel (القسم 5)
    // ----------------------------------------------------

    const competitors = [
        { name: "رحول لتأجير السيارات (Rahoul)", rating: 4.7, info: "أسطول: فخمة (لامبورجيني) + عائلية (لاندكروزر) | الموقع: تل أسمر", 
            positives: ["سيارات جديدة ونظيفة وموديل السنة.", "تعامل راقٍ وسرعة في الإنجاز.", "المواتر جدد والبانزين فول (العناية بالتفاصيل)."], 
            negatives: ["(لا توجد تعليقات سلبية واضحة ومحددة في المصدر)."], 
            strategy: "الشراكة والتعلم: التواصل معهم لتأجير الجموس والسيارات الفخمة التي لا تتوفر لدينا. نسخ نموذجهم في تدريب الموظفين على الأخلاق العالية والاحترافية." },
        { name: "سلس لتأجير السيارات (Sals)", rating: 4.8, info: "أسطول: جديدة ونظيفة جداً | الموقع: حي النقرة", 
            positives: ["قمة بالتعامل والاحترافية مع العميل.", "مرونة في تسليم وحسن المنطق من المطار.", "خدماتهم والخيارات تفوقت على كثير مكاتب تأجير."], 
            negatives: ["أسعار مبالغ فيها، ومشاكل في تتبع العقد والتأمين.", "موظف 'أخلاقه زي وجهه' ويدخن وهو يتكلم.", "يعطيك سعر وذا جازت لك السيارة رفع السعر."], 
            strategy: "عقود شفافة: الاستفادة من جودة أسطولهم ومرونتهم، مع ضمان الشفافية المطلقة في العقود لتجنب أي اتهامات بالتلاعب بالتأمين أو الأسعار." },
        { name: "شركة نمر لتأجير السيارات (NMR)", rating: 4.6, info: "أسطول: سيارات متنوعة (متوسطة وصغيرة) | الموقع: حائل (حي 9166)", 
            positives: ["أسعار مناسبة وسيارات نظيفة وجديدة.", "لديهم ردود احترافية ومهذبة من المالك على التعليقات.", "تعاملهم جدا راقي."], 
            negatives: ["التواصل الضعيف: تعامل فاشل وسيء بسبب عدم الرد على الاتصالات.", "عدم وضوح الأسعار المعلنة (لو تنزلون صورة قائمة الأسعار)."], 
            strategy: "تحسين التواصل: يجب الاستثمار في نظام اتصال متقدم (VoIP) وموظف مخصص للرد على الاتصالات، لتجنب خسارة العملاء بسبب 'التعامل الفاشل'." },
        { name: "بدجت لتأجير السيارات (Budget)", rating: 4.2, info: "أسطول: سيارات عالية القيمة | الموقع: حي النقرة", 
            positives: ["الموظفين قمة في الاحترام وانصح فيه.", "علامة تجارية عالمية (سمعة).", "سيارة نظيفة وسليمة."], 
            negatives: ["موظف يتكلم من 'راس خشمه' وسوء أسلوب.", "عدم احترام أوقات العمل وإغلاق الفرع يوم الجمعة.", "غرموني قيمة صدام بما يفوق الوصف (غرامات مبالغ فيها)."], 
            strategy: "الأخلاق والالتزام: الالتزام الصارم بساعات العمل، ووضع نظام لتقييم سلوك الموظفين لتجنب سوء السمعة، وتوثيق دقيق للغرامات." },
        { name: "ذيب لتأجير السيارات (Theeb)", rating: 4.2, info: "أسطول: سيارات متنوعة | الموقع: مطار حائل الإقليمي", 
            positives: ["موظف يعكس قوة الشركة وتميزها (عبد العزيز العنزي).", "سرعة في الإنجاز وحسن استقبال.", "عميل قديم يشيد بالخدمات الراقية وعروضها المتميزة."], 
            negatives: ["أسوأ خدمة عميل في العالم، ولا يقدرون الوقت (يمكنك الانتظار لأيام).", "موظف يستصغر العملاء (رد بـ 'غالية عليك').", "غرامة كيلومترات زايدة رغم المشوار القصير."], 
            strategy: "أتمتة الإجراءات: توفير نظام آلي لإنهاء إجراءات التسليم والاستلام بسرعة فائقة (أقل من 5 دقائق)، والاستفادة من الموظفين المميزين كـ 'نموذج' تدريبي." },
        { name: "يلو لتأجير السيارات (Yelo)", rating: 4.1, info: "أسطول: موديلات حديثة ومريحة | الموقع: الوسيطاء", 
            positives: ["تعامل راقٍ وسرعة انجاز (مشعل العنزي وعبد العزيز الحوطي).", "يسلمون السيارة ممتلئة بالوقود (ميزة).", "المركبة مريحة وموديل السنة."], 
            negatives: ["استغلال واضح وصريح (خصم على الكيلومترات المفتوحة).", "موظف يحسسك أنك 'جاي بيت أبوه' وسلوبه سيئ.", "تأخر في اجراءات التسليم مما تسبب في إلغاء رحلة."], 
            strategy: "القضاء على الرسوم الخفية: وضع آلية واضحة لإدارة الكيلومترات والرسوم الإضافية وتدريب الموظفين على الاحترام، وتجنب أي سلوك يوحي بالتعالي على العملاء." },
        { name: "أملاك التميز لتأجير السيارات", rating: 3.8, info: "أسطول: اقتصادية (شانجان) | الموقع: مطار حائل الإقليمي", 
            positives: ["خدمة توصيل واستلام السيارة من وإلى المنزل (ميزة حلوة).", "مرونة في التعامل (الكيلو شبه مفتوح 350 كم/يوم).", "خدومين وسليسين بالتعامل ويسألون عن انطباع العميل."], 
            negatives: ["أسوأ محل، نصب عيني عينك (يفتعلون عيوباً).", "تأخير شديد (ساعة تستلم وساعتين تسلم).", "أسعار مرتفعة جداً (اكسنت بـ 350)."], 
            strategy: "السرعة والتوثيق: توفير خدمة التوصيل والاستلام وتجنب الاحتيال عبر التوثيق بالفيديو والصور لحالة السيارة قبل التسليم لتوفير الأمان للمستأجر." },
        { name: "هتاف الشمال لتأجير السيارات", rating: 3.6, info: "أسطول: سيارات جديدة | الموقع: الوسيطاء", 
            positives: ["سيارات جديدة ونظيفة وتعامل ممتاز (خاصة الموظف خالد فواز).", "استلام وتسليم السيارة تم بسرعة والأسعار مناسبة.", "التعامل راقي مره."], 
            negatives: ["أسوأ مكتب 'نصابين مرة' (اتهام خطير).", "تجربة سيئة ولن تتكرر."], 
            strategy: "بناء الثقة: البناء على التعليقات الإيجابية الحديثة ووضع ضمانات واضحة للعملاء الجدد لتجاوز السمعة السلبية السابقة." },
        { name: "شركة حسين لتأجير السيارات - فرع الملك فهد", rating: 3.8, info: "أسطول: متنوع | الموقع: الملك فهد", 
            positives: ["موظفون بذوق راقٍ وأسلوب احترافي (خاصة وليد).", "خدمة توصيل السيارة من وإلى المطار.", "من أرقى الأماكن التي استأجرت منها أكثر من ست شهور (ولاء العميل)."], 
            negatives: ["السيارة غير مفحوصة (البلوتوث خربان، سيارة بصمة تعمل بالمفتاح).", "تعامل الموظف سيئ جداً وبطيئ وغير مهني.", "أسعارهم جدا سئيه مقارنه بغيرهم."], 
            strategy: "فحص شامل: تطبيق نظام فحص 50 نقطة لكل سيارة قبل التسليم لضمان جودة المكونات الإلكترونية والميكانيكية وتجنب مشكلات 'الخرابات'." },
        { name: "شركة حسين لتأجير السيارات - الأمير مقرن", rating: 4.5, info: "أسطول: سيارات جديدة | الموقع: الأمير مقرن", 
            positives: ["الموظف خلوق ويتعامل بابتسامة طيبة، والاستلام والتسليم ممتاز.", "ممتازين ولديهم تأمين شامل."], 
            negatives: ["رقم التواصل الموجود غير مستعمل."], 
            strategy: "تحديث الاتصال: يجب التأكد من أن جميع أرقام التواصل (الثابتة، الجوال، والواتساب) تعمل وتستقبل المكالمات والرسائل على مدار الساعة." },
        { name: "روتانا لتأجير السيارات", rating: 3.9, info: "أسطول: متنوع | الموقع: الأمير مقرن", 
            positives: ["أسعار مناسبة وتعامل راقٍ.", "تعامل راقٍ من الموظف جابر العزي."], 
            negatives: ["خصم فلوس لأسباب غير واضحة وتأخير في تسليم السيارة ('النصب').", "الموظف يحسسك أنه مدير الشركة."], 
            strategy: "توثيق دقيق: يجب توثيق كل زاوية من السيارة قبل التسليم لتجنب أي خصم غير مبرر يولد شكاوى 'النصب'." },
        { name: "شركة المسار لتأجير السيارات", rating: 5.0, info: "أسطول: نظيفة ومجهزة | الموقع: الأمير مقرن", 
            positives: ["تعامل راقٍ ومصداقية عالية (خاصة عبد الحكيم).", "خدمة ممتازة (حتى في استقبال ضيوف المطار)."], 
            negatives: ["غير متوفرة (جميع التعليقات إيجابية)."], 
            strategy: "النموذج الأمثل: يجب نسخ نموذجهم في الاحترافية (عبد الحكيم، أبو محمد) والتعامل المميز لتصبح شركتك هي النموذج الجديد للتميز في حائل." },
        { name: "الخضر لتأجير السيارات - شراف", rating: 5.0, info: "أسطول: جديدة (موديل 2026) | الموقع: شراف", 
            positives: ["سيارات جديدة موديل 2026.", "تعامل طيب وسهولة معاملة."], 
            negatives: ["غير متوفرة (جميع التعليقات إيجابية)."], 
            strategy: "أحدث الأسطول: يجب أن يكون هدفك هو توفير أحدث الموديلات دائماً (كما يفعلون) لضمان أعلى إيجار يومي." },
        { name: "مجموعة الصافي لتأجير السيارات", rating: 3.8, info: "أسطول: متنوع | الموقع: الأمير مقرن", 
            positives: ["سيارات جديدة ومتنوعة وأسعار مناسبة.", "تعامل راقٍ وخدمة ممتازة (خاصة عبد الله العنزي)."], 
            negatives: ["تأخير في تسليم السيارة وغرامة يوم إيجار إضافي.", "يطلعون بالسيارة عيوب ('النصب')."], 
            strategy: "حماية العميل: وضع نظام لحماية العميل من أي اتهامات بوجود عيوب (عبر التوثيق المسبق)." },
        { name: "كلاس لتأجير السيارات", rating: 4.7, info: "أسطول: فخمة وعادية | الموقع: الأمير مقرن", 
            positives: ["لديهم جميع السيارات الفخمة وغيرها.", "تعامل راقٍ (خاصة الموظف خالد البرادي)."], 
            negatives: ["عدم الالتزام بالمواعيد والحجوزات."], 
            strategy: "الموثوقية: يجب أن يكون نظام الحجز لدينا مضموناً 100% لنتفوق عليهم في الثقة بالمواعيد." },
        { name: "أشجان نجد لتأجير السيارات", rating: 4.7, info: "أسطول: متنوع | الموقع: الأمير مقرن", 
            positives: ["خدمة عملاء ممتازة، احترام، وضيافة.", "تعامل راقٍ وسيارات نظيفة."], 
            negatives: ["مبالغة في قيمة الضرر (أخذوا 3200 ريال لخدش بسيط).", "لا توجد أرقام للتواصل."], 
            strategy: "وضوح التعويض: يجب أن تكون آلية تقدير الضرر واضحة وموثوقة من جهة معتمدة." },
        { name: "كود كار لتأجير السيارات", rating: 3.3, info: "أسطول: فخمة وحلوة | الموقع: الزبارة", 
            positives: ["سيارات فخمة وحلوة ونظيفة.", "أسعار مناسبة للغاية."], 
            negatives: ["استغلال كبير وتلاعب، وتهديد وابتزاز (خطأ جسيم)."], 
            strategy: "الشفافية القانونية: يجب توثيق كل عملية بدقة، وتجنب أي سلوك يوحي بالتهديد أو الابتزاز المالي." }
    ];

    // وظيفة لإنشاء تقييم النجوم (Stars Rating)
    const getStarRating = (rating) => {
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
    };

    // وظيفة تعبئة بطاقات المنافسين في الكاروسيل
    const populateCompetitors = () => {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        track.innerHTML = '';
        competitors.forEach((comp, index) => {
            const ratingHtml = getStarRating(comp.rating);
            let commentsHtml = '';
            
            // إضافة 5 إيجابيات و 5 سلبيات
            comp.positives.slice(0, 5).forEach(text => commentsHtml += `<li class="opinion-item opinion-positive">${text}</li>`);
            comp.negatives.slice(0, 5).forEach(text => commentsHtml += `<li class="opinion-item opinion-negative">${text}</li>`);

            track.innerHTML += `
                <div class="competitor-card-style">
                    <h4><i class="fas fa-building"></i> ${comp.name}
                        <div class="rating">
                            ${ratingHtml}
                            <span>(${comp.rating}/5)</span>
                        </div>
                    </h4>
                    
                    <div class="details">
                        <div class="detail-item">${comp.info}</div>
                    </div>
                    
                    <div class="suggestion" style="margin-top: 10px;">
                        <strong>استراتيجيتنا للتفوق:</strong> ${comp.strategy}
                    </div>

                    <div class="subsection-title" style="margin-top: 20px; font-size:1.2em;"><i class="fas fa-users"></i> آراء العملاء (الإيجابيات والسلبيات)</div>
                    <ul class="list-detail" style="font-size: 0.9em; margin-top: 10px; padding-right:0;">
                        ${commentsHtml}
                    </ul>
                </div>
            `;
        });
    };

    // منطق تحريك الكاروسيل
    let currentSlide = 0;
    window.moveCarousel = (direction) => {
        const track = document.querySelector('.carousel-track');
        const slides = document.querySelectorAll('.competitor-card-style');
        if (!slides.length) return;

        const containerWidth = track.parentElement.clientWidth;
        const cardWidth = slides[0].offsetWidth; // استخدام عرض البطاقة الفعلية + الهامش
        const margin = 20;
        const slideWidth = cardWidth + margin; 

        currentSlide += direction;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        } else if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    };


    // ----------------------------------------------------
    // 8. التهيئة عند تحميل الصفحة
    // ----------------------------------------------------

    const initialize = () => {
        // 1. إعداد الحاسبة التفاعلية بالقيم الافتراضية
        fixedCostsInput.value = MONTHLY_FIXED_COSTS;
        variableCostPerCarInput.value = MONTHLY_VARIABLE_COSTS_CAR;
        
        // 2. تعبئة الكاروسيل بالبيانات
        populateCompetitors();
        
        // 3. ربط الأحداث الافتراضية للحاسبة والمخاطر
        occupancyRateInput.addEventListener('input', window.calculateProfit);
        additionalIncomeInput.addEventListener('input', window.calculateProfit);
        fixedCostsInput.addEventListener('input', window.calculateProfit);
        variableCostPerCarInput.addEventListener('input', window.calculateProfit);
        
        // 4. تشغيل الدوال الابتدائية
        calculateExit(false); 
        calculateRisk();
        calculateAnnualProfit();
        calculateBreakEven();

        // 5. إعداد الرسوم البيانية (يتم تشغيلها عند عرض القسم)
        window.initializeCharts = () => {
             // دالة تهيئة الرسوم البيانية (Charts.js)
        };
    };

    initialize();
});
