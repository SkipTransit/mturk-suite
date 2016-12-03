let user = {};

chrome.storage.local.get('user', (data) => {
  user = data.user || {WorkerID: 'null'};
  
  chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.msg == 'WorkerID') {
      user.WorkerID = request.data;
    }
    chrome.storage.local.set({'user': user});
  });
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
