
let tpe = { goal: 20.00 }, hits  = {}, requests = {};
let syncing_tpe = { tab: null, running: false };

const USER = {
  worker_id: `Visit Dashboard`
};

let BONUS = { 
  date     : null, 
  starting : null, 
  current  : null
};

function PARSE_SETTINGS (settings) {
  if (settings.hasOwnProperty(`goal`)) tpe.goal = settings.goal;
  
  chrome.storage.local.set({
    tpe: tpe
  });
}

function PARSE_DASHBOARD (dashboard) {
  if (dashboard.hasOwnProperty(`worker_id`)) USER.worker_id = dashboard.worker_id;
}

chrome.storage.onChanged.addListener( function (changes) {
  if (changes.settings) PARSE_SETTINGS(changes.settings.newValue);
  if (changes.dashboard) PARSE_DASHBOARD(changes.dashboard.newValue);
});

chrome.storage.local.get(`settings`, function (result) {
  PARSE_SETTINGS(result.settings);
});

chrome.storage.local.get(`dashboard`, function (result) {
  PARSE_DASHBOARD(result.dashboard);
});

chrome.storage.local.get(`bonus`, function (result) {
  if (result.bonus) BONUS = result.bonus;
  GET_BONUS();
});

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  switch (request.msg) {
    case `sync_tpe`:
      sync_tpe(sender.tab.id, request.data);
      break;
    case `bonus`:
      GET_BONUS(sender.tab.id);
      break;
  }
});

// Listens from messages from MTS sources
chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (onMessageHandler[request.type]) {
    onMessageHandler[request.type](sender.tab.id, request.message);
  }
});

// Listens for messages from Non-MTS sources
chrome.runtime.onMessageExternal.addListener( function (request, sender, sendResponse) {
  if (onMessageHandler[request.type]) {
    onMessageHandler[request.type](sender.tab.id, request.message);
  }
});

const onMessageHandler = {
  turkopticon: function (tabId, message) {
    turkopticon.check(tabId, message);
  },
  ircHitExport: function (tabId, message) {
    hitExport.irc(tabId, message);
  },
  forumHitExport: function (tabId, message) {
    hitExport.forum(tabId, message);
  },
  hitExportThDirect: function (tabId, message) {
    hitExport.thDirect(tabId, message);
  },
  hitExportMtcDirect: function (tabId, message) {
    hitExport.mtcDirect(tabId, message);
  },
  resetSettings: function (tabId, message) {
    settings.reset(tabId, message);
  },
  resetTurkopticon: function (tabId, message) {
    turkopticon.reset(tabId, message);
  }
};

const mturkSuite = {
  initialize () {    
    settings.initialize();
    turkopticon.initialize();
    
    mturkSuite.versionCheck();
  },
  
  versionCheck () {    
    chrome.storage.local.get(`version`, function (result) {
      const version = chrome.runtime.getManifest().version;
  
      if (result.version !== version) {
        chrome.tabs.create({url: `http://mturksuite.com/change-log.html`});
      }
  
      chrome.storage.local.set({
        version: version
      });
    });
  }
};

const settings = {
  default: {
    goal: `20.00`,
    acceptNext: true,
    workspace: true,
    preReloader: true,
    hcBeta: true,
    hitExport: {
      irc: true,
      forum: true,
      thDirect: true,
      mtcDirect: true
    },
    to: {
      to1: {
        use: true,
        high: `4.00`,
        good: `3.00`,
        average: `2.00`,
        low: `0.01`
      },
      to2: {
        use: true,
        high: `12.00`,
        good: `9.00`,
        average: `6.00`,
        low: `0.01`
      }
    },
    theme: false
  },
  
  reset: function () {
    console.log(`settings.reset()`);
    
    chrome.storage.local.set({
      settings: settings.default
    });
  },
  
  initialize: function () {
    console.log(`settings.initialize()`);
    
    chrome.storage.local.get(`settings`, function (result) {
      const load = result.settings;
      const valid = JSON.parse(JSON.stringify(settings.default));
      
      // Today's Projected Earnings Settings
      if (load.hasOwnProperty(`goal`)) valid.goal = load.goal;
      
      // General Settings
      if (load.hasOwnProperty(`acceptNext`)) valid.acceptNext = load.acceptNext;
      if (load.hasOwnProperty(`workspace`)) valid.workspace = load.workspace;
      if (load.hasOwnProperty(`preReloader`)) valid.preReloader = load.preReloader;
      if (load.hasOwnProperty(`hcBeta`)) valid.hcBeta = load.hcBeta;
      
      // TO Settings
      if (load.hasOwnProperty(`to`)) {
        
        // TO 1 Settings
        if (load.to.hasOwnProperty(`to1`)) {
          if (load.to.to1.hasOwnProperty(`use`)) valid.to.to1.use = load.to.to1.use;
          if (load.to.to1.hasOwnProperty(`high`)) valid.to.to1.high = load.to.to1.high;
          if (load.to.to1.hasOwnProperty(`good`)) valid.to.to1.good = load.to.to1.good;
          if (load.to.to1.hasOwnProperty(`average`)) valid.to.to1.average = load.to.to1.average;
          if (load.to.to1.hasOwnProperty(`low`)) valid.to.to1.low = load.to.to1.low;
        }
        
        // TO 2 Settings
        if (load.to.hasOwnProperty(`to2`)) {
          if (load.to.to2.hasOwnProperty(`use`)) valid.to.to2.use = load.to.to2.use;
          if (load.to.to2.hasOwnProperty(`high`)) valid.to.to2.high = load.to.to2.high;
          if (load.to.to2.hasOwnProperty(`good`)) valid.to.to2.good = load.to.to2.good;
          if (load.to.to2.hasOwnProperty(`average`)) valid.to.to2.average = load.to.to2.average;
          if (load.to.to2.hasOwnProperty(`low`)) valid.to.to2.low = load.to.to2.low;
        }
      }
      
      // HIT Export Settings
      if (load.hasOwnProperty(`hitExport`)) {
        if (load.hitExport.hasOwnProperty(`irc`)) valid.hitExport.irc = load.hitExport.irc;
        if (load.hitExport.hasOwnProperty(`forum`)) valid.hitExport.forum = load.hitExport.forum;
        if (load.hitExport.hasOwnProperty(`thDirect`)) valid.hitExport.thDirect = load.hitExport.thDirect;
        if (load.hitExport.hasOwnProperty(`mtcDirect`)) valid.hitExport.mtcDirect = load.hitExport.mtcDirect;
      }
      
      // Theme
      if (load.hasOwnProperty(`theme`)) valid.theme = load.theme;
                  
      chrome.storage.local.set({
        settings: valid
      });
    });
  }
};

const turkopticon = {
  db: null,
  
  reset () {
    if (turkopticon.db) {
      turkopticon.db.close();
    }
    
    const deleteDatabase = window.indexedDB.deleteDatabase(`TODB`);
    
    deleteDatabase.onsuccess = function () {
      chrome.runtime.reload();
    };
  },
  
  initialize () {    
    const open = window.indexedDB.open(`TODB`, 1);
    
    open.onsuccess = function (event) {
      turkopticon.db = event.target.result;
    };
    open.onupgradeneeded = function (event) {
      turkopticon.db = event.target.result;
      turkopticon.db.createObjectStore(`requester`, {keyPath: `id`});
    };
  },
  
  check (tab, ids) {    
    const temp = {};
    const time = new Date().getTime();
    const transaction = turkopticon.db.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);
    
    let get = true;
    
    for (let i = 0; i < ids.length; i ++) {
      const id = ids[i];
      const request = objectStore.get(id);      
      
      request.onsuccess = function (event) {
        if (this.result) {
          temp[id] = this.result;
          
          if (this.result.time < time - 3600000 * 2) {
            get = true;
          }
        }
        else {
          temp[id] = {
            id: id
          };
          get = true;
        }
      };
    }
    
    transaction.oncomplete = function (event) {
      if (get) {
        turkopticon.fetch(tab, ids, temp);
      }
      else {
        turkopticon.send(tab, temp);
      }
    };
  },
  
  fetch (tab, ids, temp) {
    $.when(
      $.ajax({
        url: `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${ids}`,
        type: `GET`,
        timeout: 1500
      }),
      $.ajax({
        url: `https://api.turkopticon.info/requesters?rids=${ids}&fields[requesters]=rid,aggregates`,
        type: `GET`,
        timeout: 1500
      })
    ).done(
      function (to1, to2) {
        temp = turkopticon.to1Parse(to1, ids, temp);
        temp = turkopticon.to2Parse(to2, ids, temp);
        turkopticon.fetchDone(tab, ids, temp);
      }
    ).fail(
      function () {
        turkopticon.send(tab, temp);
      }
    );
  },
  
  to1Parse (result, ids, temp) {
    const json = JSON.parse(result[0]);
    
    for (let i = 0; i < ids.length; i ++) {
      const id = ids[i];
      
      if (json[id]) {
        temp[id].to1 = json[id];
      }
    }
    
    return temp;
  },
  
  to2Parse (result, ids, temp) {
    const array = result[0].data;
    
    for (let i = 0; i < array.length; i ++) {
      const id = array[i].id;
      
      temp[id].to2 = array[i].attributes.aggregates;
    }
    
    return temp;
  },
  
  fetchDone (tab, ids, temp) {
    const time = new Date().getTime();
    const transaction = turkopticon.db.transaction([`requester`], `readwrite`);
    const objectStore = transaction.objectStore(`requester`);
    
    for (let key in temp) {
      if (temp[key].hasOwnProperty(`id`)) {
        temp[key].time = time;
        objectStore.put(temp[key]);
      }
    }
    
    turkopticon.send(tab, temp);
  },
  
  send (tab, temp) {    
    chrome.tabs.sendMessage(tab, {
      type: `turkopticon`,
      message: temp
    });
  }
};

const hitExport = {
  irc: function (tab, msg) {
    const obj = { 
      links: {
        req: `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${msg.reqid}`,
        preview: `https://www.mturk.com/mturk/preview?groupId=${msg.groupid}`,
        panda: `https://www.mturk.com/mturk/previewandaccept?groupId=${msg.groupid}`,
        to1: `https://turkopticon.ucsd.edu/${msg.reqid}`,
        to2: `https://turkopticon.info/requesters/${msg.reqid}`
      }
    };
  
    function ns4tSuccess (result, status, xhr) {
      console.log(`ns4tSuccess`);
      const urls = result.split(`;`);
      obj.links.req = urls[0];
      obj.links.preview = urls[1];
      obj.links.panda = urls[2];
      obj.links.to1 = urls[3];
      obj.links.to2 = urls[4];
    
      getTo();
    }
  
    function ns4tError (result, status, xhr) {
      console.log(`ns4tError`);
      getTo();
    }
  
    function getTo () {
      const request = turkopticon.db.transaction([`requester`]).objectStore(`requester`).get(msg.reqid);
      request.onsuccess = function (event) {
        
        obj.to = request.result ? request.result : {};
        console.log(obj);
        chrome.tabs.sendMessage(tab, {
          type : `ircHitExport`,
          message : obj
        });
      };
    }

    $.get(`https://ns4t.net/yourls-api.php?action=bulkshortener&title=MTurk&signature=39f6cf4959&urls[]=${encodeURIComponent(obj.links.req)}&urls[]=${encodeURIComponent(obj.links.preview)}&urls[]=${encodeURIComponent(obj.links.panda)}&urls[]=${encodeURIComponent(obj.links.to1)}&urls[]=${encodeURIComponent(obj.links.to2)}`).then(ns4tSuccess, ns4tError);
  },
  forum: function (tab, id) {
    const request = turkopticon.db.transaction([`requester`]).objectStore(`requester`).get(id);
    request.onsuccess = function (event) {
      chrome.tabs.sendMessage(tab, {
        type: `forumHitExport`,
        message: request.result ? request.result : {}
      });
    };
  },
  thDirect: function (tab, msg) {
    $.get(`https://turkerhub.com/forums/2/?order=post_date&direction=desc`, function (data) {
      const $data = $(data);
      const thread = $data.find(`li[id^="thread-"]`).eq(1).prop(`id`).replace(`thread-`, ``);
      const xfToken = $data.find(`input[name="_xfToken"]`).eq(0).val();

      $.get(`https://turkerhub.com/hub.php?action=getPosts&thread_id=${thread}&order_by=post_date`, function (data) {
        const groupId = msg.match(/groupId=(\w+)/)[1];
      
        for (let i = 0; i < data.posts.length; i ++) {
          if (data.posts[i].message.indexOf(groupId) !== -1) {
            return;
          }
        } 
           
        $.post(`https://turkerhub.com/threads/${thread}/add-reply`, {
          _xfToken: xfToken,
          message_html: msg
        });
      });
    });
  },
  mtcDirect: function (tab, msg) {
    $.get(`http://www.mturkcrowd.com/forums/4/?order=post_date&direction=desc`, function (data) {
      const $data = $(data);
      const thread = $data.find(`li[id^="thread-"]`).eq(1).prop(`id`).replace(`thread-`, ``);
      const xfToken = $data.find(`input[name="_xfToken"]`).eq(0).val();

      $.get(`http://www.mturkcrowd.com/api.php?action=getPosts&thread_id=${thread}&order_by=post_date`, function (data) {
        const groupId = msg.match(/groupId=(\w+)/)[1];
      
        for (let i = 0; i < data.posts.length; i ++) {
          if (data.posts[i].message.indexOf(groupId) !== -1) {
            return;
          }
        }
          
        $.post(`http://www.mturkcrowd.com/threads/${thread}/add-reply`, {
          _xfToken: xfToken,
          message_html: msg
        });
      });
    });
  },
  drawOnForum: function (data) {
    const forum = data.url.match(/mturkcrowd|turkerhub/);
    const thread = data.url.split(`threads/`)[1].split(`/`)[0];
    const regex = new RegExp(`.+${forum}\.com\/threads\/.+\.${thread}`);
    
    function bbcodeToHtml (bbcode) {
      bbcode = bbcode.replace(/(?:\r\n|\r|\n)/g, ``);
      bbcode = bbcode.replace(/<p>/gi, ``).replace(/<\/p>/gi, `<br>`);
      bbcode = bbcode.replace(/\[table\]/gi, `<table class="ctaBbcodeTable">`).replace(/\[\/table\]/gi, `</table>`);
      bbcode = bbcode.replace(/\[tr\]/gi, `<tr class="ctaBbcodeTableRowTransparent">`).replace(/\[\/tr\]/gi, `</tr>`);
      bbcode = bbcode.replace(/\[td\]/gi, `<td class="ctaBbcodeTableCellLeft">`).replace(/\[\/td\]/gi, `</td>`);
      bbcode = bbcode.replace(/\[b\]/gi, `<b>`).replace(/\[\/b\]/gi, `</b>`);
      bbcode = bbcode.replace(/\[center\]/gi, `<div style="text-align: center">`).replace(/\[\/center\]/gi, `</div>`);
      bbcode = bbcode.replace(/\[size=2\]/gi, `<span style="font-size: 10px">`).replace(/\[\/size\]/gi, `</span>`);
    
      const colorMatches = bbcode.match(/\[color=.+?\]/gi);
      
      for (let i = 0; i < colorMatches.length; i ++) {
        const color = colorMatches[i].match(/color=([#\w]+)/gi)[0].replace(/color=|]/gi, ``);
        const replacer = `<span style="color: ${color}">`;
        bbcode = bbcode.replace(colorMatches[i], replacer).replace(/\[\/color\]/gi, `</span>`);
      }
    
      const urlMatches = bbcode.match(/\[url=.+?\]/gi);
    
      for (let i = 0; i < urlMatches.length; i ++) {
        const url = urlMatches[i].match(/url=([:/.?=\w]+)/gi)[0].replace(/url=|]/gi, ``);
        const replacer = `<a href="${url}" target="_blank" class="externalLink">`;
        bbcode = bbcode.replace(urlMatches[i], replacer).replace(/\[\/url\]/gi, `</a>`);
      }
      
      return bbcode;
    }

    chrome.tabs.query({}, function (tabs) {
      for (let i = 0; i < tabs.length; i ++) {
        if (tabs[i].url.match(regex)) {
          chrome.tabs.executeScript(tabs[i].id, {
            frameId: tabs[i].frameId,
            code: 
              `document.getElementById('messageList').insertAdjacentHTML(
                'beforeend',
                '<li class="sectionMain message">' +
                  '<div class="uix_message">' +
          
                    '<div class="messageUserInfo" itemscope="itemscope" itemtype="http://data-vocabulary.org/Person">' +
                      '<div class="messageUserBlock ">' +
                        '<div class="avatarHolder">' +
                          '<div class="uix_avatarHolderInner">' +
                            '<span class="helper"></span>' +
                            '<a href="http://mturksuite.com/" class="avatar" >'+
                              '<img src="${chrome.runtime.getURL(`media/icon_128.png`)}" width="96" height="96" alt="MTS">' +
                            '</a>' +
                          '</div>' +
                        '</div>' +
                        '<span class="arrow"><span></span></span>' +
                      '</div>' +
                    '</div>' +
          
                    '<div class="messageInfo primaryContent">' +
                      '<div class="messageContentt">' +
                        '<article>' +
                          '<blockquote class="messageText SelectQuoteContainer ugc baseHtml">' +
                            '${bbcodeToHtml(data.requestBody.formData.message_html[0])}' +
                          '</blockquote>' +
                        '</article>' +
                      '</div>' +
                    '</div>' +
          
                  '</div>' +
                '</li>'
              );`
          });
        }
      }
    });
  }
};

const webRequests = {
  wwwMturkReturn: function (data) {
    console.log(`webRequests.wwwMturkReturn()`);
    
    if (data.statusCode !== 200) {
      return;
    }
    
    const id = data.url.match(/hitId=(\w+)/)[1];
    
    if (hits[id]) {
      hits[id].status = `Returned`;
    }
    else {
      for (let key in hits) {
        if (hits[key].assignid === id) {
          hits[key].status = `Returned`;
        }
      }
    }
  }
};

// Adds context menu to paste worker id in input fields
chrome.contextMenus.create({
  title    : "Paste Mturk Worker ID",
  contexts : ["editable"],
  onclick  : function (info, tab) {
    chrome.tabs.executeScript(
      tab.id, {
        frameId: info.frameId,
        code:
          `element = document.activeElement;` +
          `element.value += '${USER.worker_id}';` +
          `element.dispatchEvent(new Event('change', {bubbles: true}));`
      }
    );
  }
});

// Adds context menu to search mturk for highlighted text
chrome.contextMenus.create({
  title    : "Search Mturk",
  type     : "normal",
  contexts : ["selection"],
  onclick  : function (info, tab) {
    chrome.tabs.create({
      url: `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${info.selectionText}`
    });
  }
});


chrome.webRequest.onBeforeRequest.addListener(
  function (data) {
    if (data.tabId === -1) {
      hitExport.drawOnForum(data);
    }
  }, {
    urls: [
      `http://www.mturkcrowd.com/threads/*/add-reply`,
      `https://turkerhub.com/threads/*/add-reply`
    ]
  }, [`requestBody`]
);

//******* Experimental *******//
chrome.webRequest.onCompleted.addListener(
  webRequests.wwwMturkReturn,
  {urls: [`https://www.mturk.com/mturk/return?*`]},
  [`responseHeaders`]
);


chrome.storage.local.get(`hits`, function (data) {
  hits = data.hits || {}; update_tpe();
  
  chrome.webRequest.onBeforeRequest.addListener( function (data) {
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
    
    BONUS_NEW_DAY_CHECK();
  }, { urls: [`https://www.mturk.com/mturk/submit`, `https://www.mturk.com/mturk/externalSubmit*`] }, [`requestBody`]);
  
  chrome.webRequest.onCompleted.addListener( function (data) {
    if (data.statusCode !== 200) return;
    
    if (requests[data.requestId].hitid) {
      const key = requests[data.requestId].hitid;
      if (hits[key]) {
        hits[key].status = `Submitted`;
        hits[key].submitted = new Date().getTime() / 1000;
      }
      else {
        for (let key in hits) {
          if (hits[key].assignid === requests[data.requestId].hitid) {
            hits[key].status = `Submitted`;
            hits[key].submitted = new Date().getTime() / 1000;
          }
        }
      }
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
  }, { urls: [`https://www.mturk.com/mturk/submit`, `https://www.mturk.com/mturk/externalSubmit*`] }, [`responseHeaders`]);

  chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    if (request.msg == `sendhit`) ADD_HIT(request.data);
  });
  
  chrome.runtime.onMessageExternal.addListener( function (request, sender, sendResponse) {
    if (request.msg == `sendhit`) ADD_HIT(request.data);
  });
});

function ADD_HIT (data) {
  if (hits[data.hitid]) {
    hits[data.hitid].assignid = data.assignid;
  }
  else {
    hits[data.hitid] = data;
  }
  
  chrome.storage.local.set({hits: hits});
}

function sync_tpe (tab) {
  const date = mturk_date(Date.now());
  
  for (let key in hits) if (hits[key].status === `Submitted`) hits[key].status = `Accepted`;
  
  function scrape (page) {
    $.get(`https://www.mturk.com/mturk/statusdetail?encodedDate=${date}&pageNumber=${page}`, function (data) {
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
        setTimeout( function () { scrape(page); }, 2000);
      }
      else if (act) {
        hits = {};
        update_tpe();
        syncing_tpe.running = false;
        chrome.tabs.sendMessage(syncing_tpe.tab, {msg: `sync_tpe_done`, data: {current: page, total: last}});
      }
    });
  }
  
  if (!syncing_tpe.running) {
    syncing_tpe.tab = tab;
    syncing_tpe.running = true;
    scrape(1);
  }
  else {
    syncing_tpe.tab = tab;
  }
}

// Updates the TPE and removes old HITs from previous day
function update_tpe () {
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

  chrome.storage.local.set({ tpe: tpe });
  chrome.storage.local.set({ hits: hits });
}

// Get the date for mturk
function mturk_date (time) {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = dst() === true ? `-7` : `-8`;
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
  const year = (amz.getFullYear()).toString();
  return month + day + year;
}

// Check if DST
function dst () {
  const today = new Date();
  const year = today.getFullYear();
  let start = new Date(`March 14, ${year} 02:00:00`);
  let end = new Date(`November 07, ${year} 02:00:00`);
  let day = start.getDay();
  start.setDate(14 - day);
  day = end.getDay();
  end.setDate(7 - day);
  return (today >= start && today < end) ? true : false;
}


/********** Bonus Tracking **********/
function BONUS_NEW_DAY_CHECK () {
  if (BONUS.date !== mturk_date(Date.now())) GET_BONUS();
}

function GET_BONUS (tab) {
  const date = mturk_date(Date.now()); const b_date = BONUS.date;
  
  $.get(`https://www.mturk.com/mturk/dashboard`, function (result, status, xhr) {
    const doc = document.implementation.createHTMLDocument().documentElement; doc.innerHTML = result;
    
    const pre = doc.getElementsByClassName(`error_title`);
    const bonus = doc.querySelector(`#bonus_earnings_amount`);
    const today = doc.querySelector(`a[href^='/mturk/statusdetail?encodedDate']`);
    
    if (pre[0]) return GET_BONUS(); if (!bonus) return;
    
    if (BONUS.date !== date || BONUS.starting === null) {
      BONUS.starting = +bonus.textContent.replace(/[^0-9.]/g, ``);
    }
    
    BONUS.date = mturk_date(Date.now());
    BONUS.current = +bonus.textContent.replace(/[^0-9.]/g, ``);
      
    if (!today.textContent.match(/Today/)) {
      BONUS.starting = +bonus.textContent.replace(/[^0-9.]/g, ``);
    }
    else if (+today.parentElement.parentElement.children[2].textContent === 0) {
      BONUS.starting = +bonus.textContent.replace(/[^0-9.]/g, ``) - +today.parentElement.parentElement.children[5].textContent.replace(/[^0-9.]/g, ``);
    }
    
    chrome.storage.local.set({bonus: BONUS});
    if (tab) chrome.tabs.sendMessage(tab, { msg: `bonus`, data: BONUS });
  });
}

mturkSuite.initialize();