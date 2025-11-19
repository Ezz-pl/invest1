/* --------------------------------------
   النظام العام – التنقل بين الأقسام
----------------------------------------*/
const pages = document.querySelectorAll(".fullpage");
let currentPage = 0;

function openPage(index) {
  pages.forEach(p => p.classList.remove("active"));
  pages[index].classList.add("active");
  currentPage = index;
}

/* ثلاث شرطات */
document.getElementById("dash1").addEventListener("click", () => openPage(1));
document.getElementById("dash2").addEventListener("click", () => openPage(2));
document.getElementById("dash3").addEventListener("click", () => openPage(3));

/* الزر في الصفحة الرئيسية */
document.getElementById("explorePlanBtn")?.addEventListener("click", () => {
  openPage(1);
});

/* --------------------------------------
   استقبال بيانات المستثمر من الواجهة الأولى
----------------------------------------*/
let investor = {
  name: "",
  phone: "",
  investmentValue: 0,
  shares: 0,
  exitYears: 0,
  occupancy: 0,
  annualProfit: 0
};

const entryFormBtn = document.getElementById("entryCalc");

entryFormBtn?.addEventListener("click", () => {
  investor.name = document.getElementById("userName").value;
  investor.phone = document.getElementById("userPhone").value;

  const entryType = document.getElementById("entryType").value;
  const sharesInput = document.getElementById("sharesNumber");
  const capitalInput = document.getElementById("capitalAmount");

  if (entryType === "shares") {
    investor.shares = Number(sharesInput.value);
    investor.investmentValue = investor.shares * 875;
  } else {
    investor.investmentValue = Number(capitalInput.value);
    investor.shares = investor.investmentValue / 875;
  }

  investor.exitYears = Number(document.getElementById("exitTime").value);
  investor.occupancy = Number(document.getElementById("occupancySlider").value);

  showQuickResults();
  openPage(1);
});

/* --------------------------------------
   الأرقام الأساسية – الثوابت المالية
----------------------------------------*/
const carsCount = 26;
const dailyPrice = 135;
const fixedCostsMonthly = 23690;
const variableCostCar = 290;
const extraIncomeMonthly = 26000;
const growthRate = 0.15;

/* --------------------------------------
   الحسبة السريعة للصفحة الأولى
----------------------------------------*/
function showQuickResults() {
  const occupancy = investor.occupancy / 100;
  const activeCars = carsCount * occupancy;

  const dailyIncome = activeCars * dailyPrice;
  const monthlyIncome = dailyIncome * 30;
  const totalRevenue = monthlyIncome + extraIncomeMonthly;

  const variableCosts = variableCostCar * carsCount;
  const totalCosts = fixedCostsMonthly + variableCosts;
  const netProfitMonthly = totalRevenue - totalCosts;

  const investorShare = netProfitMonthly * 0.50;
  const estimatedExit = investorShare * investor.exitYears * 12;

  document.getElementById("quickTotal").innerHTML =
    `${investor.name} — ربحك المتوقع حتى الخروج: <br><strong>${formatNumber(estimatedExit)} ﷼</strong>`;
}

/* --------------------------------------
   وظيفة تنسيق الأرقام
----------------------------------------*/
function formatNumber(num) {
  return num.toLocaleString("ar-SA", { maximumFractionDigits: 0 });
}

/* --------------------------------------
   الحاسبة الرئيسية المدمجة
----------------------------------------*/
document.getElementById("calcFinal")?.addEventListener("click", () => {
  const occ = Number(document.getElementById("profitSlider").value) / 100;
  const years = Number(document.getElementById("yearSelect").value);

  const activeCars = carsCount * occ;
  const monthlyIncome = activeCars * dailyPrice * 30;
  const revenue = monthlyIncome + extraIncomeMonthly;
  const variableCosts = carsCount * variableCostCar;
  const monthlyProfit = revenue - (variableCosts + fixedCostsMonthly);
  const investorMonthly = monthlyProfit * 0.50;

  let total = 0;
  let current = investorMonthly * 12;
  for (let i = 0; i < years; i++) {
    total += current;
    current += current * growthRate;
  }

  investor.annualProfit = total;

  document.getElementById("annualResult").innerHTML =
    `الربح المتوقع للمستثمر خلال ${years} سنة: <strong>${formatNumber(total)} ﷼</strong>`;
});

/* --------------------------------------
   الرسوم البيانية Chart.js
----------------------------------------*/
function buildCharts() {
  const seasonData = [75, 85, 70, 65];
  new Chart(document.getElementById("seasonChart"), {
    type: "bar",
    data: {
      labels: ["الربيع", "الصيف", "الخريف", "الشتاء"],
      datasets: [{
        label: "نسبة التشغيل",
        data: seasonData,
        backgroundColor: "#3C9D4B"
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  const shareData = [50, 30, 20];
  new Chart(document.getElementById("shareChart"), {
    type: "pie",
    data: {
      labels: ["المستثمرون", "النمو", "الإدارة"],
      datasets: [{
        data: shareData,
        backgroundColor: ["#3C9D4B", "#203647", "#7EA4B5"]
      }]
    },
    options: { responsive: true }
  });
}
setTimeout(buildCharts, 800);

/* --------------------------------------
   إرسال رسالة واتساب النهائية
----------------------------------------*/
document.getElementById("whatsappConfirm")?.addEventListener("click", () => {
  const msg =
    `السلام عليكم\nأرغب بتأكيد الاستثمار في مكتب نُقَاء لتأجير السيارات\n\n` +
    `اسم المستثمر: ${investor.name}\n` +
    `رقم الجوال: ${investor.phone}\n` +
    `قيمة الاستثمار: ${formatNumber(investor.investmentValue)} ﷼\n` +
    `عدد الأسهم: ${investor.shares.toFixed(2)}\n` +
    `فترة الخروج: ${investor.exitYears} سنوات\n` +
    `العائد المتوقع: ${formatNumber(investor.annualProfit)} ﷼\n\n` +
    `وأوافق على جميع الشروط والأحكام.`;

  window.open(
    "https://wa.me/966500772878?text=" + encodeURIComponent(msg),
    "_blank"
  );
});
