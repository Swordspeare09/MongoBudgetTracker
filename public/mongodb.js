let db;
const request = indexedDB.open("budget", 1);

//Event listener for when the application comes back on
window.addEventListener("online", pendingStore);

//Creates a pending collection
request.onupgradeneeded = function(event) {

  const db = event.target.result;
  db.createObjectStore("offlineTransactions", { autoIncrement: true });
};

//This function runs a check on the pending transactions
request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    pendingStore();
  }
};

request.onerror = function(error) {
  console.log(error);
};

// Saves the transaction in the collection
function saveRecord(record) {
  var transaction = db.transaction(["offlineTransactions"], "readwrite");
  var store = transaction.objectStore("offlineTransactions");
  store.add(record);
}

//Posts everything in the pending collection to indexedDB
function pendingStore() {
  
  var transaction = db.transaction(["offlineTransactions"], "readwrite");
  var store = transaction.objectStore("offlineTransactions");
  var getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      
      //Makes the call to the API upon connection
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {

          //Empties out the pending transactions
          const transaction = db.transaction(["offlineTransactions"],"readwrite");
          const store = transaction.objectStore("offlineTransactions");
          store.clear();
          location.reload();
        });
    }
  };
}

