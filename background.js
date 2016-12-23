let user = {}, dashboard = {}, tpe = {};
let syncing_tpe = {tab: null, running: false};

chrome.storage.local.get(`user`, (data) => {
  user = data.user || {goal: 20, dark: true};
  tpe.goal = user.goal;
});

chrome.storage.local.get(`dashboard`, (data) => {
  dashboard = data.dashboard || {id: `visit_your_dashboard`, date: null, earn_hits: 0, earn_bonus: 0, earn_total: 0, earn_trans: 0, total_sub: 0, total_app: 0, total_rej: 0, total_pen: 0, today_sub: 0, today_app: 0, today_rej: 0, today_pen: 0};
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  if (request.msg == `user`) {
    user = request.data;
    chrome.storage.local.set({'user': user});
    tpe.goal = user.goal;
    chrome.storage.local.set({'tpe': tpe});
  }
  if (request.msg == `dashboard`) {
    dashboard = request.data;
    chrome.storage.local.set({'dashboard': dashboard});
  }
  if (request.msg == `turkopticon`) {
    TODB_turkopticon(sender.tab.id, request.data);
  }
  if (request.msg == `hitexport`) {
    TODB_hitexport(sender.tab.id, request.data);
  }
  if (request.msg == `sync_tpe`) {
    sync_tpe(sender.tab.id, request.data);
  }
  if (request.msg == `send_mtc`) {
    SEND_MTC(sender.tab.id, request.data);
  }
  if (request.msg == `send_th`) {
    SEND_TH(sender.tab.id, request.data);
  }
  if (request.msg == `close_tpe_menu`) {
    chrome.tabs.sendMessage(sender.tab.id, {msg: `close_tpe_menu`});
  }
});

// Adds context menu to paste worker id in input fields
chrome.contextMenus.create({
  title: "Paste Mturk Worker ID",
  contexts: ["editable"],
  onclick: (info, tab) => {
    chrome.tabs.executeScript(tab.id, {
        frameId: info.frameId,
        code: `// This code runs in one frame, specified via frameId \n` +
              `document.activeElement.value += '${dashboard.id}';`
    });
  }
});

// Adds context menu to search mturk for highlighted text
chrome.contextMenus.create({
  title: "Search Mturk",
  "type" : "normal",
  contexts: ["selection"],
  onclick: (info, tab) => {
    chrome.tabs.create({url: `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${info.selectionText}`});
  }
});

// Turkopticon IndexedDB
let TODB;
const request = indexedDB.open(`TODB`, 1);
request.onsuccess = (event) => {
  TODB = event.target.result;
};
request.onupgradeneeded = (event) => {
  const TODB = event.target.result;
  TODB.createObjectStore(`requester`, {keyPath: `id`});
};

const TODB_turkopticon = (tab, ids) => {
  let grab = false;
  const time = new Date().getTime();
  const transaction = TODB.transaction([`requester`], `readwrite`);
  const objectStore = transaction.objectStore(`requester`);
  
  for (let i = 0; i < ids.length; i ++) {
    const request = objectStore.get(ids[i]);
    request.onsuccess = (event) => {
      if (request.result) {
        if (request.result.edited < time - 21600000) {
          grab = true;
        }
      }
      else {
        grab = true;
      }
    };
  }
  
  transaction.oncomplete = (event) => {
    if (grab) { console.log('Grab');
      $.get(`https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${ids}`, (data) => {
        const transaction = TODB.transaction([`requester`], `readwrite`);
        const objectStore = transaction.objectStore(`requester`);

        const json = JSON.parse(data);
        for (let obj in json) {
          if (json[obj]) {
            json[obj].id = obj;
            json[obj].edited = time;
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
              to[ids[i]] = {attrs: {comm: 0, fair: 0, fast: 0, pay: 0}, reviews: 0, tos_flags: 0};
            }
          };
        }
    
        transaction.oncomplete = (event) => {
          chrome.tabs.sendMessage(tab, {msg: `turkopticon.js`, data: to}); 
        };
      });
    }
    else { console.log('No Grab');
      const transaction = TODB.transaction([`requester`], `readwrite`);
      const objectStore = transaction.objectStore(`requester`);

      const to = {};
      for (let i = 0; i < ids.length; i ++) {
        const request = objectStore.get(ids[i]);
        request.onsuccess = (event) => {
          if (request.result) {
            to[ids[i]] = request.result;
          }
          else {
            to[ids[i]] = {attrs: {comm: 0, fair: 0, fast: 0, pay: 0}, reviews: 0, tos_flags: 0};
          }
        };
      }
    
      transaction.oncomplete = (event) => {
        chrome.tabs.sendMessage(tab, {msg: `turkopticon.js`, data: to}); 
      };
    }
  };
};

const TODB_hitexport = (tab, id) => {
  const transaction = TODB.transaction([`requester`]);
  const objectStore = transaction.objectStore(`requester`);
  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    if (request.result) {
      chrome.tabs.sendMessage(tab, {msg: `hitexport.js`, data: request.result});
    }
    else {
      chrome.tabs.sendMessage(tab, {msg: `hitexport.js`, data: {attrs: {comm: 0, fair: 0, fast: 0, pay: 0}, reviews: 0, tos_flags: 0}});
    }
  };
};

const SEND_MTC = (tab, message) => {
  $.get(`http://www.mturkcrowd.com/forums/4/?order=post_date&direction=desc`, (data) => {
    const $data = $(data);
    const thread = $data.find(`li[id^="thread-"]`).eq(1).prop(`id`).replace(`thread-`, ``);
    const xfToken = $data.find(`input[name="_xfToken"]`).eq(0).val();

    $.post(`http://www.mturkcrowd.com/threads/${thread}/add-reply`, {
      message_html: message,
      _xfToken: xfToken
    });
  });
};

const SEND_TH = (tab, message) => {
  $.get(`https://turkerhub.com/forums/2/?order=post_date&direction=desc`, (data) => {
    const $data = $(data);
    const thread = $data.find(`li[id^="thread-"]`).eq(1).prop(`id`).replace(`thread-`, ``);
    const xfToken = $data.find(`input[name="_xfToken"]`).eq(0).val();

    $.post(`https://turkerhub.com/threads/${thread}/add-reply`, {
      message_html: message,
      _xfToken: xfToken
    });
  });
};

//******* Experimental *******//
let hits  = {};
let requests = {};

chrome.storage.local.get(`hits`, (data) => {
  hits = data.hits || {};
  
  chrome.webRequest.onBeforeRequest.addListener( (data) => {
    if (data.requestBody) {
      requests[data.requestId] = {
        hitid : data.requestBody.formData.hitId ? data.requestBody.formData.hitId[0] : null,
        assignid : data.requestBody.formData.assignmentId ? data.requestBody.formData.assignmentId[0] : null
      };
    }
    else {
      requests[data.requestId] = {
        hitid : data.url.indexOf(`hitId=`) !== -1 ? data.url.split(`hitId=`)[1].split(`&`)[0] : null,
        assignid : data.url.indexOf(`assignmentId=`) !== -1  ? data.url.split(`assignmentId=`)[1].split(`&`)[0] : null
      };
    }
  }, { urls: [`https://www.mturk.com/mturk/externalSubmit*`] }, [`requestBody`]);
  
  chrome.webRequest.onCompleted.addListener( (data) => {
    if (data.statusCode == `200`) {
      if (requests[data.requestId].hitid) {
        const key = requests[data.requestId].hitid;
        hits[key].status = `Submitted`;
        hits[key].submitted = new Date().getTime() / 1000;
      }
      else {
        for (let key in hits) {
          if (hits[key].assignid === requests[data.requestId].assignid) {
            hits[key].status = `Submitted`;
            hits[key].submitted = new Date().getTime() / 1000;
          }
        }
      }
      update_tpe();
    }
  }, { urls: [`https://www.mturk.com/mturk/externalSubmit*`] }, [`responseHeaders`]);

  chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.msg == `sendhit`) {
      ADD_HIT(request.data);
    }
  });
  
  chrome.runtime.onMessageExternal.addListener( (request, sender, sendResponse) => {
    if (request.msg == `sendhit`) {
      ADD_HIT(request.data);
    }
  });
});

const ADD_HIT = (data) => {
  if (!hits[data.hitid]) {
    hits[data.hitid] = {
      reqname   : data.reqname,
      reqid     : data.reqid,
      title     : data.title,
      reward    : data.reward,
      autoapp   : data.autoapp,
      hitid     : data.hitid,
      assignid  : data.assignid,
      status    : data.status,
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

const sync_tpe = (tab) => {
  const date = mturk_date(Date.now());
  
  const scrape = (page) => {
    $.get(`https://www.mturk.com/mturk/statusdetail?encodedDate=${date}&pageNumber=${page}`, (data) => {
      const $data = $(data);
      const url = $data.find(`a:contains(Next)`).eq(0).prop(`href`);
      const err = $data.find(`.error_title:contains(You have exceeded the maximum allowed page request rate for this website.)`).length;
      const act = $data.find(`td:contains(You have no HIT activity on this day matching the selected status.)`).length;
      const last = $data.find(`a:contains(Last)`).length ? $data.find(`a:contains(Last)`).eq(0).prop(`href`).split(`Number=`)[1].split(`&`)[0] : null;
      const $hits = $data.find(`#dailyActivityTable`).find(`tr[valign="top"]`);

      if ($hits.length) {
        for (let i = 0; i < $hits.length; i++) {
          const reqname = $hits.eq(i).find(`td[class="statusdetailRequesterColumnValue"]`).text().trim();
          const reqid   = $hits.eq(i).find(`a`).prop(`href`).split(`requesterId=`)[1].split(`&`)[0];
          const title   = $hits.eq(i).find(`td[class="statusdetailTitleColumnValue"]`).text().trim();
          const reward  = $hits.eq(i).find(`td[class="statusdetailAmountColumnValue"]`).text().trim();
          const status  = $hits.eq(i).find(`td[class="statusdetailStatusColumnValue"]`).text().trim();
          const hitid   = $hits.eq(i).find(`a`).prop(`href`).split(`hitId=`)[1].split(`&`)[0];

          if (!hits[hitid]) {
            hits[hitid] = {
              reqname   : reqname,
              reqid     : reqid,
              title     : title,
              reward    : reward,
              autoapp   : null,
              hitid     : hitid,
              assignid  : null,
              status    : status,
              source    : null,
              date      : date,
              viewed    : new Date().getTime(),          
              submitted : null
            };
          }
          else {
            hits[hitid].reqname = reqname;
            hits[hitid].reqid   = reqid;
            hits[hitid].title   = title;
            hits[hitid].reward  = reward;
            hits[hitid].status  = status;
            hits[hitid].date    = date;
          }
        }
        if (url) {
          page ++;
          scrape(page);
          chrome.tabs.sendMessage(syncing_tpe.tab, {msg: `sync_tpe_running`, data: {current: page, total: last}});
        }
        else {
          update_tpe();
          syncing_tpe.running = false;
          chrome.tabs.sendMessage(syncing_tpe.tab, {msg: `sync_tpe_done`, data: {current: page, total: last}});
        }
      }
      else if (err) {
        setTimeout( () => { scrape(page); }, 2000);
      }
      else if (act) {
        hits = {};
        update_tpe();
        syncing_tpe.running = false;
        chrome.tabs.sendMessage(syncing_tpe.tab, {msg: `sync_tpe_done`, data: {current: page, total: last}});
      }
    });
  };
  
  if (!syncing_tpe.running) {
    syncing_tpe.tab = tab;
    syncing_tpe.running = true;
    scrape(1);
  }
  else {
    syncing_tpe.tab = tab;
  }
  
};

// Updates the TPE and removes old HITs from previous day
const update_tpe = () => {
  tpe.tpe = 0;
  const date = mturk_date(Date.now());

  for (let key in hits) {
    if (date !== hits[key].date) {
      delete hits[key];
    }
    else if (!hits[key].status.match(/(Rejected|Accepted|Previewed|Returned)/)) {
      tpe.tpe += Number(hits[key].reward.replace(/[^0-9.]/g, ``));
    }
  }

  chrome.storage.local.set({'tpe': tpe});
  chrome.storage.local.set({'hits': hits});
};

// Get the date for mturk
const mturk_date = (time) => {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = dst() === true ? `-7` : `-8`;
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
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
