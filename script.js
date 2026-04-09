const form = document.getElementById("ledger_form");
const table=document.querySelector(".table__main");
const filterOptions = document.querySelectorAll(".filter__option");
let filterOptionValue = null




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
function getLastFiveLatestData () {
    const dataSorted = data.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    return dataSorted.slice(0,5);
}


function renderTable() {
  let tableData = getLastFiveLatestData();
  console.log(filterOptionValue)
  if(filterOptionValue==="rent") { 
    tableData = tableData.filter((item)=>item.category === "Rent and Utilities")
  }
  if(filterOptionValue === "food") {
       tableData = tableData.filter((item)=>item.category === "food");
  }

   if(filterOptionValue === "salary") {
    tableData = tableData.filter((item)=>item.category === "salary");
  }
  if(filterOptionValue === "investment") { 
        tableData = tableData.filter((item)=>item.category === "investment");

  }
   if(filterOptionValue === "technology") { 
        tableData = tableData.filter((item)=>item.category === "technology");
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

  document.querySelector('.table__main').innerHTML = content;
}


form.addEventListener("submit",(e)=> {
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
        "amount":amount,
        "type":type,
        "category":category,
        "createdAt":Date.now()
    });
    saveToStorage();
    renderTable(); //update the table whenever data gets updated
});

renderTable();// render table for the first time