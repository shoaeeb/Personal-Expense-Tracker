const form = document.getElementById("ledger_form");
const table=document.querySelector(".table__main");
const filterOptions = document.querySelectorAll(".filter__option");
const navbarElements = document.querySelectorAll("#navbar--link");

let filterOptionValue = null




function addSidebarClassList() {
  navbarElements.forEach(ele=> { 
    ele.classList.remove("sidebar__nav-item--active");
  });
    const path =window.location.pathname;
    console.log(path);
    if(path==="/" || path.includes("index.html")) {
      navbarElements[0].classList.add("sidebar__nav-item--active")
    }
    if(path.includes("transactions.html")) { 
      navbarElements[1].classList.add("sidebar__nav-item--active")
    }
}

addSidebarClassList()



filterOptions.forEach(filterOption=> {
    filterOption.addEventListener("click",(e)=> {
    filterOptions.forEach(b=>b.classList.remove("selected__tab"));
    e.target.classList.add("selected__tab");
    filterOptionValue = e.target.dataset.filtervalue; 
    renderTable(); // update the table when filter changes 
    })
    
})


let data = JSON.parse(localStorage.getItem("ledger_data")) || [];

function saveToStorage() {
  localStorage.setItem("ledger_data", JSON.stringify(data));
}

function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

// function to calculate and display the totals
function updateSummary() { 
  const summary = data.reduce((acc,item)=> { 
    const amount = parseFloat(item.amount);

    if(item.type==="income"  ) { 
      acc.income+=amount
    }
    else  {
      acc.expense+=Math.abs(amount)
    }
    acc.netWorth = acc.income -  acc.expense
    return acc;
  },{
    netWorth:0,
    income:0,
    expense:0
  })
  if(window.location.pathname!=="/" || window.location.pathname.includes("index.html")) return;
document.getElementById("networth_display").innerText = 
    `$${summary.netWorth.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
  document.getElementById("income_display").innerText = 
    `$${summary.income.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
  document.getElementById("expense_display").innerText = 
    `$${summary.expense.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}


function renderTable() {
  let filteredData = [...data];

  if(filterOptionValue && filterOptionValue!=="all") {
    filteredData = filteredData.filter(item=>item.category.toLowerCase().includes(filterOptionValue.toLowerCase()))
   console.log(filteredData);
  }

  const tableData = filteredData.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  const content = `
    <thead>
      <tr>
        <th>DATE</th>
        <th>TRANSACTION</th>
        <th>CATEGORY</th>
        <th>AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${tableData.map((item) => `
        <tr>
          <td>${formatDate(item.createdAt)}</td>
          <td class="source">${item.merchant}</td>
          <td class="category"><span>${item.category}</span></td>
          <td class="${item.amount < 0 ? 'expense' : 'income'}">
            ${item.amount < 0 ? '-' : '+'}$${item.amount}
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;


  let ele = document.querySelector(".table__main");
  if(ele!==null) ele.innerHTML = content;

}


  form?.addEventListener("submit",(e)=> {
    e.preventDefault()
    const formData  = new FormData(e.target);
    const merchant = formData.get("merchant");
    const amount  = formData.get("amount");
    const type = formData.get("type");
    const category = formData.get("category");

    console.log({
        "Merchant":merchant,
        "Amount":amount,
        "Type":type,
        "Category":category
    })
    data.push({
       "merchant":merchant,
        "amount":parseFloat(amount),
        "type":type,
        "category":category,
        "createdAt":Date.now()
    });
    saveToStorage();
    updateSummary()
    renderTable(); //update the table whenever data gets updated
});

renderTable();// render table for the first time
updateSummary()