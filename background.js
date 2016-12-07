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
  TODB.createObjectStore('requester', {keyPath: 'id'});
};

const TODB_turkopticon = (tab, ids) => {
  $.get(`https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${ids}`, (data) => {
    const transaction = TODB.transaction(['requester'], 'readwrite');
    const objectStore = transaction.objectStore('requester');

    const json = JSON.parse(data);
    for (let obj in json) {
      if (json[obj]) {
        json[obj].id = obj;
        json[obj].edited = 1;
        objectStore.put(json[obj]);
      }
    }
    
    const to = {};
    for (let i = 0; i < ids.length; i ++) {
      const request = objectStore.get(ids[i]);
      request.onsuccess = (event) => {
        if (request.result) {
          to[ids[i]] = request.result;
        }
        else {
          to[ids[i]] = {attrs: {comm: 'N/A', fair: 'N/A', fast: 'N/A', pay: 'N/A', reviews: 'N/A', tos_flags: 'N/A'}};
        }
      };
    }
    
    transaction.oncomplete = (event) => {
      chrome.tabs.sendMessage(tab, {msg: 'turkopticon.js', data: to}); 
    };
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


//******* Experimental *******//
let hits  = {};
let requests = {};

chrome.storage.local.get('hits', (data) => {
  hits = data.hits || {};

  // Listens for POST (before) requests to https://www.mturk.com/mturk/externalSubmit
  chrome.webRequest.onBeforeRequest.addListener( (data) => {
    if (data.method == 'POST') {
      requests[data.requestId] = {
        hitid    :  data.requestBody.formData.hitId ? data.requestBody.formData.hitId[0] : null,
        assignid : data.requestBody.formData.assignmentId ? data.requestBody.formData.assignmentId[0] : null
      };
    }
  }, { urls: ['https://www.mturk.com/mturk/externalSubmi*'] }, ['requestBody']);
  
  // Listens for POST (after) requests to https://www.mturk.com/mturk/externalSubmit
  chrome.webRequest.onCompleted.addListener( (data) => {
    if (data.method == 'POST' && data.statusCode == '200') {
      if (requests[data.requestId].hitid) {
        console.log(requests);
        console.log(requests[data.requestId]);
        const key = requests[data.requestId].hitid;
        hits[key].status = 'Submitted';
        hits[key].submitted = new Date().getTime() / 1000;
      }
      else {
        for (let key in hits) {
          if (hits[key].assignid === requests[data.requestId].assignid) {
            hits[key].status = 'Submitted';
            hits[key].submitted = new Date().getTime() / 1000;
          }
        }
      }
      update_tpe();
    }
  }, { urls: ['https://www.mturk.com/mturk/externalSubmi*'] }, ['responseHeaders']);

  // Listens for messages from content scripts.
  chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.msg == 'sendhit') {
      newhit(request.data);
    }
  });
  
  // Listens for messages from user scripts
  chrome.runtime.onMessageExternal.addListener( (request, sender, sendResponse) => {
    if (request.msg == 'sendhit') {
      newhit(request.data);
    }
  });
});

const newhit = (data) => {
  if (!hits[data.hitid]) {
    hits[data.hitid] = {
      reqname   : data.reqname,
      reqid     : data.reqid,
      title     : data.title,
      reward    : data.reward,
      autoapp   : data.autoapp,
      status    : data.status,
      
      hitid     : data.hitid,
      assignid  : data.assignid,
      
      source    : data.source,
      
      date      : data.date,
      viewed    : data.viewed,
      submitted : data.submitted
    };
    chrome.storage.local.set({'hits': hits});
  }
  else {
    hits[data.hitid].assignid = data.assignid;
  }
};

// Updates the TPE and removes old HITs from previous day
const update_tpe = () => {
  let tpe = 0;
  const date = mturk_date(Date.now());

  for (let key in hits) {
    if (date !== hits[key].date) {
      delete hits[key];
    }
    else if (!hits[key].status.match(/(Rejected|Accepted|Previewed|Returned)/)) {
      tpe += Number(hits[key].reward.replace(/[^0-9.]/g, ''));
    }
  }

  chrome.storage.local.set({'tpe': tpe});
  chrome.storage.local.set({'hits': hits});
};

// Get the date for mturk
const mturk_date = (time) => {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = dst() === true ? '-7' : '-8';
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? '0' + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? '0' + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
  const year = (amz.getFullYear()).toString();
  return month + day + year;
};

// Check if DST
const dst = () => {
  const today = new Date();
  const year = today.getFullYear();
  let start = new Date(`March 14, ${year} 02:00:00`);
  let end = new Date(`November 07, ${year} 02:00:00`);
  let day = start.getDay();
  start.setDate(14 - day);
  day = end.getDay();
  end.setDate(7 - day);
  return (today >= start && today < end) ? true : false;
};
