const { get } = require("mongoose");

let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
  };

request.onsuccess = function(event){
     db = event.target.result;

    if (navigator.onLine) {
      uploadBudget();
    }
}
request.onerror = function (event){
    console.log(event.target.errorCode);
}

function saveTransaction(transaction) {
    const saveBudget = db.transaction(['savebudget'], 'readwrite')
    const budgetObjectStore = db.transaction('savebudget')
    budgetObjectStore.add(transaction)
}

function uploadBudget(){
const saveBudget = db.transaction(['savebudget'], 'readwrite')
const budgetObjectStore = db.transaction('savebudget')

const getAll = budgetObjectStore.getAll();

 getAll.onsuccess = function () {
     if (getAll.result.length > 0){
         fetch('/api/transaction', {
             method: "POST",
             body: JSON.stringify(getAll.result),
             headers: {
                 Accept: "application/json, text/plain, */*",
                 "Content-Type": "application/json"
             }
         })
         .then((response) => response.json())
				.then((serverResponse) => {
					if (serverResponse.message) {
						throw new Error(serverResponse);
					}

					const saveBudget = db.transaction(['savebudget'], 'readwrite')
                    const budgetObjectStore = db.transaction('savebudget')
					budgetObjectStore.clear();
				})
				.catch((err) => {
					console.log(err);
				});
     }
 }

}

window.addEventListener("online")