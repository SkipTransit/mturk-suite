let user = {WorkerID: 'worker_id'};

chrome.storage.local.get('user', (data) => {
  user = data.user;
  
  chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.msg == 'WorkerID') {
      user.WorkerID = request.data;
      chrome.storage.local.set({'user': user});
    }
  });
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  if (request.msg == 'turkopticon') {
    TODB_turkopticon(sender.tab.id, request.data);
  }
  if (request.msg == 'hitexport') {
    TODB_hitexport(sender.tab.id, request.data);
  }
});

// Adds context menu to paste worker id in input fields
chrome.contextMenus.create({
  title: "Paste Mturk Worker ID",
  "type" : "normal",
  contexts: ["editable"],
  onclick: () => {
    chrome.tabs.query({"active": true, "currentWindow": true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: 'WorkerID', "data": user.WorkerID});
    });
  }
});

// Turkopticon IndexedDB
let TODB;
const request = indexedDB.open('TODB', 1);
request.onsuccess = (event) => {
  TODB = event.target.result;
};
request.onupgradeneeded = (event) => {
  const TODB = event.target.result;
  const objectStore = TODB.createObjectStore('requester', {keyPath: 'id'});
};

const TODB_turkopticon = (tab, ids) => {
  $.get(`https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${ids}`, (data) => {
    const transaction = TODB.transaction(['requester'], 'readwrite');
    const objectStore = transaction.objectStore('requester');

    const json = JSON.parse(data);
    for (let obj in json) {
     if (json[obj].length) {
       json[obj].id = obj;
       json[obj].edited = 1;
       objectStore.put(json[obj]);
     }
    }
    chrome.tabs.sendMessage(tab, {msg: 'turkopticon.js', data: json}); 
  });
};

const TODB_hitexport = (tab, id) => {
  const transaction = TODB.transaction(['requester']);
  const objectStore = transaction.objectStore('requester');
  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    if (request.result) {
      chrome.tabs.sendMessage(tab, {msg: 'hitexport.js', data: request.result});
    }
    else {
      chrome.tabs.sendMessage(tab, {msg: 'hitexport.js', data: {attrs: {comm: 'N/A', fair: 'N/A', fast: 'N/A', pay: 'N/A'}}});
    }
  };
};
