function calculate() {
  //Look up the input and output elements in the document
  let amount = document.getElementById("amount");
  let apr = document.getElementById("apr");
  let period = document.getElementById("period");
  let payment = document.getElementById("payment");
  let total = document.getElementById("total");
  let totalinterest = document.getElementById("totalinterest");

  // Get the user's input from the input elements.
  // Convert interest from a percentage to a decimal, and convert from
  // an annual rate to a monthly rate. Convert payment period in years
  // to the number of monthly payments.
  let principal = parseFloat(amount.value);
  let interest = parseFloat(apr.value) / 100 / 12;
  let payments = parseFloat(period.value) * 12;

  // compute the monthly payment figure
  let x = Math.pow(1 + interest, payments); //Math.pow computes powers
  let monthly = (principal * x * interest) / (x - 1);

  // If the result is a finite number, the user's input was good and
  // we have meaningful results to display
  if (isFinite(monthly)) {
    // Fill in the output fields, rounding to 2 decimal places
    payment.value = monthly.toFixed(2);
    total.value = (monthly * payments).toFixed(2);
    totalinterest.value = (monthly * payments - principal).toFixed(2);

    // Save the user's input so we can restore it the next time they visit
    save(amount.value, apr.value, period.value);

    // Finally, chart loan balance, and interest and equity payments
    // chart(principal, interest, monthly, payments);
    updateChart1(principal, interest, monthly, payments);

    calculateMonthlyCompoundInterest(monthly * payments - principal);
  } else {
    // Result was Not-a-Number or infinite, which means the input was
    // incomplete or invalid. Clear any previously displayed output.
    payment.value = ""; // Erase the content of these elements
    total.value = "";
    totalinterest.value = "";
    updateChart1(); // With no arguments, clears the chart
  }
}
// Save the user's input as properties of the localStorage object. Those
// properties will still be there when the user visits in the future
// This storage feature will not work in some browsers (Firefox, e.g.) if you
// run the example from a local file:// URL. It does work over HTTP, however.
function save(amount, apr, period) {
  if (window.localStorage) {
    // Only do this if the browser supports it
    localStorage.loan_amount = amount;
    localStorage.loan_apr = apr;
    localStorage.loan_period = period;
  }
}

// Automatically attempt to restore input fields when the document first loads.
window.onload = function () {
  // If the browser supports localStorage and we have some stored data
  if (window.localStorage && localStorage.loan_amount) {
    document.getElementById("amount").value = localStorage.loan_amount;
    document.getElementById("apr").value = localStorage.loan_apr;
    document.getElementById("years").value = localStorage.loan_years;
    document.getElementById("principal").value = localStorage.loan_principal;
    document.getElementById("interest").value = localStorage.loan_interest;
    document.getElementById("period").value = localStorage.loan_period;
    document.getElementById("monthly").value = localStorage.loan_monthly;
  }
};

var ctx = document.getElementById("graph").getContext("2d");
var chart1 = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Loan Balance",
        data: [],
        borderColor: "black",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      },
      {
        label: "Total Interest Payments",
        data: [],
        borderColor: "orange",
        fill: true,
        backgroundColor: "rgba(124, 25, 0, 0.2)",
        lineTension: 0,
        pointRadius: 0,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      xAxes: [
        {
          type: "linear",
          position: "bottom",
          ticks: {
            callback: function (value, index, values) {
              return index % 12 == 0 ? "Year " + value / 12 : "";
            },
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            callback: function (value, index, values) {
              return "$" + value.toFixed(2);
            },
          },
        },
      ],
    },
  },
});

function updateChart1(principal, interest, monthly, payments) {
  chart1.data.labels = Array.from({ length: payments }, (_, i) => i + 1);
  chart1.data.datasets[0].data = [];
  chart1.data.datasets[1].data = [];

  let equity = 0;
  let bal = principal;

  for (let p = 1; p <= payments; p++) {
    let thisMonthsInterest = bal * interest;

    bal -= monthly - thisMonthsInterest;
    chart1.data.datasets[0].data.push(bal);

    equity += monthly;

    chart1.data.datasets[1].data.push(equity);
  }

  chart1.update();
}

function calculateMonthlyCompoundInterest(totalInterest) {
  let principal = Number(document.getElementById("principal").value);
  let monthly = Number(document.getElementById("monthly").value);
  let period = Number(document.getElementById("years").value);
  let interest = Number(document.getElementById("interest").value) / 100;

  const n = 12;

  let totalFund = document.getElementById("totalFund");
  let capitalGain = document.getElementById("capitalGain");
  let totalGain = document.getElementById("totalGain");

  const total = compoundInterest(principal, period, interest, n, monthly);

  const value = total - (principal + monthly * 12 * period) - totalInterest;
  const propertyRevenue = (13000 - 4200) * 12 * 5;

  totalGain.innerText = value.toFixed(0);

  if (total) {
    totalFund.value = total.toFixed(2);
    capitalGain.value = (total - (principal + monthly * 12 * period)).toFixed(
      2
    );
    saveInvestment(principal, interest, period, monthly);
    updateChart2(principal, interest, monthly, period * 12);
  }
}

function compoundInterest(p, t, r, n, m) {
  const total =
    p * Math.pow(1 + r / n, n * t) +
    m * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));
  return total;
}

function saveInvestment(principal, interest, period, monthly) {
  if (window.localStorage) {
    // Only do this if the browser supports it
    localStorage.loan_principal = principal;
    localStorage.loan_interest = interest * 100;
    localStorage.loan_years = period;
    localStorage.loan_monthly = monthly;
  }
}

var ctx = document.getElementById("compoundInterestGraph").getContext("2d");
var chart2 = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Total Equity",
        data: [],
        borderColor: "green",
        fill: true,
        backgroundColor: "rgba(155, 255, 155, 0.2)",
        lineTension: 0,
        pointRadius: 0,
      },
      {
        label: "Total Payments",
        data: [],
        borderColor: "blue",
        fill: true,
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        lineTension: 0,
        pointRadius: 0,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      xAxes: [
        {
          type: "linear",
          position: "bottom",
          ticks: {
            callback: function (value, index, values) {
              return index % 12 == 0 ? "Year " + value / 12 : "";
            },
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            callback: function (value, index, values) {
              return "$" + value.toFixed(2);
            },
          },
        },
      ],
    },
  },
});

function updateChart2(principal, interest, monthly, payments) {
  chart2.data.labels = Array.from({ length: payments }, (_, i) => i + 1);
  chart2.data.datasets[0].data = [];
  chart2.data.datasets[1].data = [];

  let equity = 0;
  let contribution = principal;

  for (let p = 1; p <= payments; p++) {
    // For each payment, figure out how much is interest

    equity = compoundInterest(principal, p / 12, interest, 12, monthly);
    contribution += monthly;

    chart2.data.datasets[0].data.push(equity);
    chart2.data.datasets[1].data.push(contribution);
  }

  chart2.update();
}
