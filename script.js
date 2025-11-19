// --- فتح وإغلاق القائمة الجانبية ---
const hamburger = document.querySelector('.hamburger');
const sidebar = document.getElementById('sidebar');
const content = document.querySelector('.content');

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    content.classList.toggle('active');
});

// --- استرجاع القيم للملف النهائي ---
const finalName = document.getElementById('finalName');
const finalPhone = document.getElementById('finalPhone');
const finalSourceOfLink = document.getElementById('finalSourceOfLink');

// --- الحقول التفاعلية ---
const finalInvestmentAmount = document.getElementById('finalInvestmentAmount');
const finalShareCount = document.getElementById('finalShareCount');
const finalExitPeriod = document.getElementById('finalExitPeriod');

// --- ملخص الاستثمار ---
const finalSummaryAmount = document.getElementById('finalSummaryAmount');
const finalSummaryExit = document.getElementById('finalSummaryExit');
const finalSummaryAnnualRate = document.getElementById('finalSummaryAnnualRate');
const finalSummaryReturn = document.getElementById('finalSummaryReturn');

// --- دالة حساب العائد ---
function calculateExit(updateUI = false) {
    let amount = parseFloat(finalInvestmentAmount.value) || 0;
    let shares = parseFloat(finalShareCount.value) || 0;
    let periodText = finalExitPeriod.value;

    // تحديد عدد السنوات بناءً على الاختيار
    let years = 5; // افتراضي
    if (periodText.includes("1.5")) years = 1.5;
    else if (periodText.includes("سنتين")) years = 2;
    else if (periodText.includes("3")) years = 3;
    else if (periodText.includes("4")) years = 4;
    else if (periodText.includes("5")) years = 5;
    else if (periodText.includes("6")) years = 6;
    else if (periodText.includes("7")) years = 7;

    // معدل عائد سنوي تقريبي (يمكن تعديل حسب خطة المشروع)
    let annualRate = 0.12; // 12% سنوياً
    let annualRatePercent = (annualRate * 100).toFixed(2);

    // حساب المبلغ الإجمالي بعد فترة الخروج
    let totalReturn = amount * Math.pow((1 + annualRate), years);

    if (updateUI) {
        finalSummaryAmount.textContent = `${amount.toLocaleString()} ريال`;
        finalSummaryExit.textContent = periodText;
        finalSummaryAnnualRate.textContent = `${annualRatePercent}%`;
        finalSummaryReturn.textContent = `${totalReturn.toLocaleString()} ريال`;
    }
}

// --- تحديث الملخص عند تغيير أي قيمة ---
finalInvestmentAmount.addEventListener('input', () => calculateExit(true));
finalShareCount.addEventListener('input', () => calculateExit(true));
finalExitPeriod.addEventListener('change', () => calculateExit(true));

// --- دالة إرسال الالتزام النهائي ---
function submitFinalCommitment() {
    alert(
        `شكرًا ${finalName.value || 'المستثمر'}!\n` +
        `تم تسجيل استثمارك بمبلغ ${finalInvestmentAmount.value || 0} ريال.\n` +
        `فترة الخروج: ${finalExitPeriod.value}.\n` +
        `إجمالي المبلغ التخميني بعد الخروج: ${finalSummaryReturn.textContent}.`
    );
}

// --- مثال تعبئة البيانات تلقائياً (يمكن ربطها بقاعدة بيانات لاحقاً) ---
window.onload = () => {
    finalName.value = "عبدالعزيز العنزي";
    finalPhone.value = "0501234567";
    finalSourceOfLink.value = "من خلال الموقع الإلكتروني";
    calculateExit(true);
};
