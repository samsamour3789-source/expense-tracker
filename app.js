const $ = id => document.getElementById(id);

let transactions = JSON.parse(
  localStorage.getItem("expenseTransactions") || "[]"
);

let budget = Number(
  localStorage.getItem("expenseBudget") || 0
);


// ==============================
// DATE
// ==============================

$("date").value =
  new Date().toISOString().slice(0, 10);


// ==============================
// MONEY
// ==============================

function money(number) {

  return "$" + Number(number).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

}


// ==============================
// SAVE DATA
// ==============================

function save() {

  localStorage.setItem(
    "expenseTransactions",
    JSON.stringify(transactions)
  );

  localStorage.setItem(
    "expenseBudget",
    budget
  );

}


// ==============================
// DISPLAY
// ==============================

function render() {

  const income =
    transactions
      .filter(t => t.type === "income")
      .reduce(
        (sum, t) => sum + t.amount,
        0
      );


  const expense =
    transactions
      .filter(t => t.type === "expense")
      .reduce(
        (sum, t) => sum + t.amount,
        0
      );


  const balance =
    income - expense;


  // Statistics

  $("income").textContent =
    money(income);

  $("expense").textContent =
    money(expense);

  $("balance").textContent =
    money(balance);


  // ==============================
  // BUDGET
  // ==============================

  const used =
    budget
      ? (expense / budget) * 100
      : 0;


  $("progressBar").style.width =
    Math.min(
      100,
      Math.max(0, used)
    ) + "%";


  if (budget) {

    $("budgetText").textContent =
      `${money(expense)} من ${money(budget)} (${Math.round(used)}%)`;

  } else {

    $("budgetText").textContent =
      "لم يتم تحديد ميزانية بعد.";

  }


  // ==============================
  // ALERT
  // ==============================

  if (budget && expense > budget) {

    $("alertBox")
      .classList
      .remove("hidden");

    $("alertBox").textContent =
      "⚠️ تنبيه: لقد تجاوزت الميزانية المحددة.";

  } else {

    $("alertBox")
      .classList
      .add("hidden");

  }


  // ==============================
  // TRANSACTIONS
  // ==============================

  const list =
    $("transactions");

  list.innerHTML = "";


  if (!transactions.length) {

    $("empty")
      .classList
      .remove("hidden");

    return;

  }


  $("empty")
    .classList
    .add("hidden");


  [
    ...transactions
  ]
    .reverse()
    .forEach(
      (transaction, reverseIndex) => {

        const realIndex =
          transactions.length -
          1 -
          reverseIndex;


        const row =
          document.createElement("div");


        row.className =
          "transaction";


        row.innerHTML = `

          <div class="info">

            <div class="icon">

              ${
                transaction.type === "income"
                  ? "💰"
                  : "💸"
              }

            </div>

            <div>

              <b>
                ${escapeHtml(
                  transaction.description
                )}
              </b>

              <small>
                ${transaction.date}
              </small>

            </div>

          </div>


          <div>

            <b class="${
              transaction.type === "income"
                ? "amount-income"
                : "amount-expense"
            }">

              ${
                transaction.type === "income"
                  ? "+"
                  : "-"
              }

              ${money(transaction.amount)}

            </b>


            <button
              class="delete"
              title="حذف"
            >
              ✕
            </button>

          </div>

        `;


        // DELETE

        row
          .querySelector(".delete")
          .onclick = () => {

            transactions.splice(
              realIndex,
              1
            );

            save();

            render();

          };


        list.appendChild(row);

      }
    );

}


// ==============================
// SECURITY
// ==============================

function escapeHtml(text) {

  return String(text)
    .replace(
      /[&<>"']/g,
      character => {

        const characters = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };

        return characters[character];

      }
    );

}


// ==============================
// ADD TRANSACTION
// ==============================

$("transactionForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const description =
        $("description")
          .value
          .trim();


      const amount =
        Number(
          $("amount").value
        );


      const type =
        $("type").value;


      const date =
        $("date").value;


      if (
        !description ||
        amount <= 0 ||
        !date
      ) {

        return;

      }


      transactions.push({

        type: type,

        description: description,

        amount: amount,

        date: date

      });


      save();

      render();


      // Reset

      event.target.reset();


      $("date").value =
        new Date()
          .toISOString()
          .slice(0, 10);

    }
  );


// ==============================
// SAVE BUDGET
// ==============================

$("saveBudget").onclick = () => {

  budget =
    Math.max(
      0,
      Number(
        $("budget").value
      ) || 0
    );


  save();

  render();

};


// ==============================
// DELETE ALL
// ==============================

$("clearAll").onclick = () => {

  if (!transactions.length) {

    return;

  }


  if (
    confirm(
      "هل تريد حذف كل العمليات؟"
    )
  ) {

    transactions = [];

    save();

    render();

  }

};


// ==============================
// PWA INSTALL
// ==============================

let deferredPrompt;


window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    $("installBtn")
      .classList
      .remove("hidden");

  }
);


$("installBtn").onclick =
  async () => {

    if (!deferredPrompt) {

      return;

    }


    deferredPrompt.prompt();


    await deferredPrompt.userChoice;


    deferredPrompt = null;


    $("installBtn")
      .classList
      .add("hidden");

  };


// ==============================
// SERVICE WORKER
// ==============================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("sw.js")
        .catch(
          error =>
            console.log(
              "Service Worker:",
              error
            )
        );

    }
  );

}


// ==============================
// START APP
// ==============================

render();