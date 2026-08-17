const STORAGE_KEY = "masrofiData";

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function createMonthData() {
  return {
    income: 0,
    incomeCurrency: "USD",
    budget: 0,
    expenses: []
  };
}

let allData =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    months: {}
  };

// Compatibility with the old version
if (!allData.months) {
  const oldData = allData;

  allData = {
    months: {
      [getMonthKey()]: {
        income: oldData.income || 0,
        incomeCurrency: oldData.incomeCurrency || "USD",
        budget: oldData.budget || 0,
        expenses: oldData.expenses || []
      }
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

const currentMonthKey = getMonthKey();

if (!allData.months[currentMonthKey]) {
  allData.months[currentMonthKey] = createMonthData();
}

let data = allData.months[currentMonthKey];

const incomeInput = document.getElementById("incomeInput");
const incomeCurrency = document.getElementById("incomeCurrency");
const saveIncomeBtn = document.getElementById("saveIncomeBtn");

const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseNote = document.getElementById("expenseNote");
const addExpenseBtn = document.getElementById("addExpenseBtn");

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");

const remainingBalance = document.getElementById("remainingBalance");
const incomeTotal = document.getElementById("incomeTotal");
const fixedTotal = document.getElementById("fixedTotal");
const dailyTotal = document.getElementById("dailyTotal");

const transactionsList = document.getElementById("transactionsList");
const budgetProgress = document.getElementById("budgetProgress");
const budgetMessage = document.getElementById("budgetMessage");

function saveData() {
  allData.months[currentMonthKey] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

function formatMoney(amount) {
  return "$" + Number(amount || 0).toFixed(2);
}

function calculateExpenses() {
  return data.expenses.reduce((total, expense) => {
    return total + Number(expense.amount || 0);
  }, 0);
}

function updateDashboard() {
  const totalExpenses = calculateExpenses();
  const remaining = Number(data.income || 0) - totalExpenses;

  incomeTotal.textContent = formatMoney(data.income);
  dailyTotal.textContent = formatMoney(totalExpenses);

  fixedTotal.textContent = "$0.00";

  remainingBalance.textContent = formatMoney(remaining);

  if (remaining < 0) {
    remainingBalance.style.color = "#e3262e";
  } else {
    remainingBalance.style.color = "#f3cf68";
  }

  updateBudget();
  renderTransactions();
}

function updateBudget() {
  const totalExpenses = calculateExpenses();
  const budget = Number(data.budget || 0);

  if (budget <= 0) {
    budgetProgress.style.width = "0%";
    budgetMessage.textContent = "No budget set";
    return;
  }

  let percentage = (totalExpenses / budget) * 100;

  if (percentage > 100) {
    percentage = 100;
  }

  budgetProgress.style.width = percentage + "%";

  if (totalExpenses > budget) {
    budgetMessage.textContent =
      "⚠️ You are over your monthly budget.";
  } else if (totalExpenses >= budget * 0.8) {
    budgetMessage.textContent =
      "⚠️ You are close to your monthly budget.";
  } else {
    budgetMessage.textContent =
      "✓ Your spending is within budget.";
  }
}

function renderTransactions() {
  if (data.expenses.length === 0) {
    transactionsList.innerHTML = `
      <p class="empty">No transactions yet.</p>
    `;
    return;
  }

  transactionsList.innerHTML = "";

  [...data.expenses].reverse().forEach((expense) => {
    const item = document.createElement("div");

    item.className = "transaction";

    item.innerHTML = `
      <div class="transaction-info">

        <div class="transaction-category">
          ${escapeHTML(expense.category)}
        </div>

        <div class="transaction-note">
          ${escapeHTML(expense.note || "No note")}
        </div>

        <div class="transaction-date">
          ${escapeHTML(expense.date)}
        </div>

      </div>

      <div class="transaction-amount">
        -${formatMoney(expense.amount)}
      </div>
    `;

    transactionsList.appendChild(item);
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

saveIncomeBtn.addEventListener("click", () => {
  const amount = Number(incomeInput.value);

  if (!amount || amount < 0) {
    alert("Please enter a valid income.");
    return;
  }

  data.income = amount;
  data.incomeCurrency = incomeCurrency.value;

  saveData();
  updateDashboard();

  incomeInput.value = "";

  alert("Income saved successfully.");
});

addExpenseBtn.addEventListener("click", () => {
  const amount = Number(expenseAmount.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid expense amount.");
    return;
  }

  const expense = {
    id: Date.now(),
    amount: amount,
    category: expenseCategory.value,
    note: expenseNote.value.trim(),
    date: new Date().toLocaleString()
  };

  data.expenses.push(expense);

  saveData();
  updateDashboard();

  expenseAmount.value = "";
  expenseNote.value = "";

  alert("Expense added successfully.");
});

saveBudgetBtn.addEventListener("click", () => {
  const budget = Number(budgetInput.value);

  if (!budget || budget < 0) {
    alert("Please enter a valid budget.");
    return;
  }

  data.budget = budget;

  saveData();
  updateDashboard();

  budgetInput.value = "";

  alert("Budget saved successfully.");
});

function loadSavedValues() {
  if (data.income) {
    incomeInput.value = data.income;
  }

  if (data.incomeCurrency) {
    incomeCurrency.value = data.incomeCurrency;
  }

  if (data.budget) {
    budgetInput.value = data.budget;
  }
}

loadSavedValues();
updateDashboard();
