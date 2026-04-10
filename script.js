const form = document.getElementById("ledger_form");
const table=document.querySelector(".table__main");
const filterOptions = document.querySelectorAll(".filter__option");
const navbarElements = document.querySelectorAll("#navbar--link");
const from  =document.querySelector("#date-from");
const to = document.querySelector("#date-to");
const categoryFilter = document.querySelector("#category-filter");



let filterOptionValue = null;

const ITEMS_PER_PAGE  = 10;
let currentPage = 1;


function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems/ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  document.querySelector(".pagination__info").innerHTML = 
  `Showing <strong>${start} - ${end}</strong> of <strong>${totalItems}</strong> transactions`;

  const controls = document.querySelector(".pagination__controls");
   controls.innerHTML = `
    <button class="pagination__btn" id="prev-btn" ${currentPage === 1 ? "disabled" : ""}>&lt;</button>
    ${getPaginationButtons(totalPages)}
    <button class="pagination__btn" id="next-btn" ${currentPage === totalPages ? "disabled" : ""}>></button>
  `;
  controls.querySelectorAll(".pagination__btn[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      renderTable();
    });
  });
    document.getElementById("prev-btn")?.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });
  document.getElementById("next-btn")?.addEventListener("click", () => {
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });
}


function getPaginationButtons(totalPages) {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(`<button class="pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`);
    } else if (pages[pages.length - 1] !== '<span class="pagination__ellipsis">...</span>') {
      pages.push('<span class="pagination__ellipsis">...</span>');
    }
  }

  return pages.join('');
}

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

function exportLedger() { 
  const headers =["Date","Merchant","Category","Type","Amount"];
  const escape  =val => `${val}`;
  const rows = data.map(item => [
    escape(formatDate(item.createdAt)),
    escape(item.merchant),
    escape(item.category),
    escape(item.type),
    item.amount
  ])
  const csv = [headers,...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url =  URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href=url;
  a.download="ledger.csv";
  a.click();
  URL.revokeObjectURL(url);
}
document.getElementById("export-btn")?.addEventListener("click", exportLedger);



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

if (from?.value || to?.value) {
  filteredData = filteredData.filter(item => {
    const itemDate = new Date(item.createdAt).toISOString().split("T")[0];
    const fromVal = from?.value;
    const toVal = to?.value;
    if (fromVal && toVal) return itemDate >= fromVal && itemDate <= toVal;
    if (fromVal) return itemDate >= fromVal;
    if (toVal) return itemDate <= toVal;
  });
}
if(categoryFilter?.value) { 
  filteredData = filteredData.filter(item=>item.category===categoryFilter.value)
}

let tableData = [];
const totalItems = filteredData.length;

if (window.location.pathname.includes("transactions.html")) {
  tableData = filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  renderPagination(totalItems);
} else {
  tableData = filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
}

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


[to,from,categoryFilter].forEach(ele=>  {
  ele?.addEventListener("change",()=>  {
    currentPage = 1;
    renderTable();
  })
})





renderTable();// render table for the first time
updateSummary()