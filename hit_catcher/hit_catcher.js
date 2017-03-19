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

// Deals with onMessage stuff
const onMessageHandler = {
  hitCatcherPing: function (tabId, message) {
    chrome.tabs.sendMessage(tabId, {
      type: `hitCatcherPing`,
      message: true
    });
  },
  hitCatcherAddWatcher: function (tabId, message) {
    watcher.add(message);
    watcher.draw(message);
    watcher.catchOn(message);
  },
  loggedIn: function (tabId, message) {
    if (catcher.paused.reason === `loggedOut`) {
      bootbox.hideAll();
      catcher.pauseOff();
    }
  },
  captchaCleared: function (tabId, message) {
    if (catcher.paused.reason === `captchaFound`) {
      bootbox.hideAll();
      catcher.pauseOff();
    }
  }
};

// Deals with storage stuff
const storageHandler = {
  loadHitCatcherWatchers: function () {
    console.log(`storageHandler.loadHitCatcherWatchers()`);
    chrome.storage.local.get(`hitCatcherWatchers`, function (result) {
      // Set watchers
      if (result.hitCatcherWatchers) {
        watcher.watchers = result.hitCatcherWatchers.watchers;
      }
      // Draw watchers in order from order array
      for (let key of result.hitCatcherWatchers.position) {
        watcher.draw(watcher.watchers[key]);
      }
      // Fallback for any watchers not in order array
      for (let key in watcher.watchers) {
        if (!document.getElementById(key)) {
          watcher.draw(watcher.watchers[key]);
        }
      }
    });
  },
  saveHitCatcherWatchers: function () {
    console.log(`storageHandler.saveHitCatcherWatchers()`);
    const obj = {}; const pos = [];
    
    for (let key in watcher.watchers) {
      obj[key] = {
        nickname: watcher.watchers[key].nickname,
        once: watcher.watchers[key].once,
        sound: watcher.watchers[key].sound,
        requesterName: watcher.watchers[key].requesterName,
        requesterId: watcher.watchers[key].requesterId,
        title: watcher.watchers[key].title,
        hitSetId: watcher.watchers[key].hitSetId,
        reward: watcher.watchers[key].reward,
        assignmentDuration: watcher.watchers[key].assignmentDuration,
        hitRequirements: watcher.watchers[key].hitRequirements,
        hitAutoAppDelay: watcher.watchers[key].hitAutoAppDelay
      };
    }
    
    for (let element of document.getElementById(`hits`).children) {
      pos.push(element.id);
    }
    
    chrome.storage.local.set({
      hitCatcherWatchers: {
        watchers: obj,
        position: pos
      }
    });
  },
  loadHitCatcherSettings: function () {
    console.log(`storageHandler.loadHitCatcherSettings()`);
    chrome.storage.local.get(`hitCatcherSettings`, function (result) {
      console.log(result);
      const hitCatcherSettings = result.hitCatcherSettings || {};
      
      catcher.settings = {
        speed:
          hitCatcherSettings.hasOwnProperty(`speed`) ?
          hitCatcherSettings.speed :
          1000,
        captchaPopup:
          hitCatcherSettings.hasOwnProperty(`captchaPopup`) ?
          hitCatcherSettings.captchaPopup :
          false,
        captchaOverride:
          hitCatcherSettings.hasOwnProperty(`captchaOverride`) ?
          hitCatcherSettings.captchaOverride :
          null,
      };
      
      document.getElementById(`speed`).value = catcher.settings.speed;
      document.getElementById(`captcha-popup`).checked = catcher.settings.captchaPopup;
      document.getElementById(`captcha-override`).value = catcher.settings.captchaOverride;
    });
  },
  saveHitCatcherSettings: function () {
    console.log(`storageHandler.saveHitCatcherSettings()`);
    const settings = {
      speed: +document.getElementById(`speed`).value,
      captchaPopup: document.getElementById(`captcha-popup`).checked,
      captchaOverride: document.getElementById(`captcha-override`).value
    };
    
    chrome.storage.local.set({
      hitCatcherSettings: settings
    });
  },
  updateHitCatcherSettings: function () {
    catcher.settings.speed = +document.getElementById(`speed`).value;
    catcher.settings.captchaPopup = document.getElementById(`captcha-popup`).checked;
    catcher.settings.captchaOverride = document.getElementById(`captcha-override`).value;
  }
};

const watcher = {
  watchers: {},
  add: function (obj) {
    console.log(`watcher.add()`, obj);
    if (!watcher.watchers[obj.hitSetId]) {
      watcher.watchers[obj.hitSetId] = obj;
      storageHandler.saveHitCatcherWatchers();
    }
  },
  update: function (obj) {
    console.log(`watcher.update()`, obj);
    document.getElementById(obj.hitSetId).getElementsByClassName(`name`)[0].textContent = obj.nickname ? obj.nickname : obj.requesterName ? obj.requesterName : obj.hitSetId;
  },
  remove: function (obj) {
    console.log(`watcher.remove()`, obj);
    bootbox.confirm({
      message: `Are you sure you want to delete this watcher?`,
      buttons: {
        confirm: {
          className: 'btn-sm btn-success'
        },
        cancel: {
          className: 'btn-sm btn-danger'
        }
      },
      animate: false,
      callback: function (result) {
        if (result) {
          delete watcher.watchers[obj.hitSetId];
          catcher.ids.splice(catcher.ids.indexOf(obj.hitSetId), 1);
          if (document.getElementById(obj.hitSetId)) {
            document.getElementById(obj.hitSetId).parentNode.removeChild(document.getElementById(obj.hitSetId));
          }
          storageHandler.saveHitCatcherWatchers();
        }
      }
    });
  },
  draw: function (obj) {
    console.log(`watcher.draw()`, obj);
    if (document.getElementById(obj.hitSetId)) return;
    
    document.getElementById(`hits`).insertAdjacentHTML(
      `beforeend`,
      `<div id="${obj.hitSetId}" class="col-sm-3">
        <div class="card card-inverse card-hit">
          <div class="card-header" style="word-wrap: break-word;">
            <div data-id="${obj.hitSetId}" class="move-right float-right" style="position: relative; left: 3px; background-color: #444; height: 100%;">
              <span class="glyphicon glyphicon-menu-right small" style="font-size: ;"></span>
            </div>
            <div class="float-right">
              <span data-id="${obj.hitSetId}" class="glyphicon glyphicon-cog text-muted align-top"></span>
              <span data-id="${obj.hitSetId}" class="glyphicon glyphicon-remove text-danger align-top"></span>
            </div>
            <div data-id="${obj.hitSetId}" class="move-left float-left" style="position: relative; left: -3px; background-color: #444;">
              <span class="glyphicon glyphicon-menu-left small" style="font-size: ;"></span>
           </div>
            <b class="name">${obj.nickname ? obj.nickname : obj.requesterName ? obj.requesterName : obj.hitSetId}</b>
          </div>
          <div class="card-block">
            <div class="card-text">
              <div>
                <div class="stats" style="font-size: 10px;">Caught: 0; Searched: 0; PRE: 0;</div>
                <button data-id="${obj.hitSetId}" class="catch btn btn-xxs btn-default">Catch</button>
                <button data-id="${obj.hitSetId}" class="sound btn btn-xxs ${obj.sound ? `btn-success` : `btn-default`}">Sound</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    );
  },
  moveLeft: function (obj) {
    console.log(`watcher.moveLeft()`, obj);
    const element = document.getElementById(obj.hitSetId);
    if (element.previousElementSibling) {
      element.parentNode.insertBefore(element, element.previousElementSibling);
    }
  },
  moveRight: function (obj) {
    console.log(`watcher.moveRight()`, obj);
    const element = document.getElementById(obj.hitSetId);
    if (element.nextElementSibling) {
      element.parentNode.insertBefore(element.nextElementSibling, element);
    }
  },
  stats: function (obj) {
    document.getElementById(obj.hitSetId).getElementsByClassName(`stats`)[0].textContent =
      `Caught: ${obj.caught ? obj.caught : 0}; Searched: ${obj.searched ? obj.searched : 0}; PRE: ${obj.pre ? obj.pre : 0};`
    ;
  },
  catchOn: function (obj) {
    console.log(`watcher.catchOn()`, obj);
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`catch`)[0];
    element.className = element.className.replace(`btn-default`, `btn-success`);
    if (catcher.ids.includes(obj.hitSetId) === false) {
      catcher.ids.push(obj.hitSetId);
      catcher.catch();
    }
  },
  catchOff: function (obj) {
    console.log(`watcher.catchOff()`, obj);
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`catch`)[0];
    element.className = element.className.replace(`btn-success`, `btn-default`);
    catcher.ids.splice(catcher.ids.indexOf(obj.hitSetId), 1);
  },
  soundOn: function (obj) {
    console.log(`watcher.soundOn()`, obj);
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`sound`)[0];
    element.className = element.className.replace(`btn-default`, `btn-success`);
    obj.sound = true;
    storageHandler.saveHitCatcherWatchers();
  }, 
  soundOff: function (obj) {
    console.log(`watcher.soundOff()`, obj);
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`sound`)[0];
    element.className = element.className.replace(`btn-success`, `btn-default`);
    obj.sound = false;
    storageHandler.saveHitCatcherWatchers();
  },
  settingsShow: function (obj) {
    console.log(`watcher.settingsShow()`, obj);
    document.getElementById(`watcher-settings-nickname`).value = obj.nickname;
    document.getElementById(`watcher-settings-once`).checked = obj.once;
    
    document.getElementById(`watcher-settings-requester-name`).textContent = obj.requesterName;
    document.getElementById(`watcher-settings-requester-id`).textContent = obj.requesterId;
    document.getElementById(`watcher-settings-title`).textContent = obj.title;
    document.getElementById(`watcher-settings-hit-set-id`).textContent = obj.hitSetId;
    document.getElementById(`watcher-settings-reward`).textContent = obj.reward;
    document.getElementById(`watcher-settings-duration`).textContent = obj.assignmentDuration;
    document.getElementById(`watcher-settings-requirements`).textContent = obj.hitRequirements;
    document.getElementById(`watcher-settings-auto-app-delay`).textContent = obj.hitAutoAppDelay;
    
    $(document.getElementById(`watcher-settings-modal`)).modal(`show`);
    
    $(document.getElementById(`watcher-settings-modal`)).on(`hidden.bs.modal`, function (event) {
      $(document.getElementById(`watcher-settings-modal`)).off(`hidden.bs.modal`);
      
      obj.nickname = document.getElementById(`watcher-settings-nickname`).value;
      obj.once = document.getElementById(`watcher-settings-once`).checked;
      watcher.update(obj);
      storageHandler.saveHitCatcherWatchers();
    });
  },
  found: function (obj) {
    console.log(`watcher.found()`, obj);
    if (obj.once) {
      watcher.catchOff(obj);
    }
    if (obj.sound) {
      notifications.speak(`HIT Caught: ${obj.nickname ? obj.nickname : obj.requesterName}, ${obj.reward}, ${obj.once ? obj.assignmentDuration : ``}`);
    }
  }
};

const catcher = {
  settings: {},
  id: null, ids: [], index: 0, timeout: null,
  paused: {
    status: false,
    reason: null
  },
  delay: function () {
    const nextCatch = catcher.time + catcher.settings.speed;
    const adjustedDelay = nextCatch - new Date().getTime();
    return adjustedDelay > 0 ? adjustedDelay : 1;
  },
  catch: function () {
    clearTimeout(catcher.timeout);
    
    if (!catcher.ids[0] || catcher.paused.status) {
      return;
    }
    
    catcher.id = catcher.ids[catcher.index = catcher.index >= catcher.ids.length -1 ? 0 : catcher.index + 1];
    catcher.time = new Date().getTime();
    
    $.ajax({
      url:
      `https://www.mturk.com/mturk/previewandaccept?groupId=${catcher.id}`,
      type:
      `GET`,
      timeout:
      5000
    }).then(catcher.wwwParse, catcher.wwwError);
  },
  pauseOn: function (reason) {
    const element = document.getElementById(`pause`);
    element.className = element.className.replace(`btn-default`, `btn-danger`);
    catcher.paused.status = true;
    catcher.paused.reason = reason;
  },
  pauseOff: function () {
    const element = document.getElementById(`pause`);
    element.className = element.className.replace(`btn-danger`, `btn-default`);
    catcher.paused.status = false;
    catcher.paused.reason = null;
    catcher.catch();
  },
  wwwParse: function (result, status, xhr) {
    const doc = document.implementation.createHTMLDocument().documentElement; doc.innerHTML = result;
    const obj = watcher.watchers[catcher.id];
    
    // Page request error
    if (doc.getElementsByClassName(`error_title`)[0]) {
      obj.pre = obj.pre > 0 ? obj.pre + 1 : 1;
    }
    
    // Logged out
    else if (!doc.querySelector(`[href="/mturk/beginsignout"]`)) {      
      catcher.loggedOut();
    }
    
    // Captcha
    else if (doc.querySelector(`[name="userCaptchaResponse"]`)) {      
      catcher.captchaFound();
    }
    
    // Accepted
    else if (doc.querySelector(`[name="isAccepted"]`)) {      
      const hit = {
        reqname: doc.querySelector(`[name="prevRequester"]`).value,
        reqid: doc.querySelector(`[name="prevRequester"]`).value,
        title: doc.querySelector('.capsulelink_bold').textContent.trim(),
        reward: doc.querySelector(`[name="prevReward"]`).value.replace(`USD`, `$`),
        autoapp: doc.querySelector(`[name="hitAutoAppDelayInSeconds"]`).value,
        status: `Accepted`,
        hitid: doc.querySelector(`.popup-header > [name="hitId"]`).value,
        assignid: doc.querySelector(`.popup-header > [name="assignmentId"]`).value,
        source: doc.querySelector(`iframe`) ? doc.querySelector(`iframe`).src : null,
        date: mturkDate(whenAccepted(doc.querySelector(`#theTime`).textContent.trim())),
        viewed: new Date().getTime(),
        submitted: null
      };
      
      chrome.runtime.sendMessage({
        msg: `sendhit`,
        data: hit
      });
      
      if (obj) {
        obj.title = hit.title;
        obj.reward = hit.reward;
        obj.requesterName = hit.reqname;
        obj.hitRequirements = doc.querySelectorAll(`.capsule_field_text`)[4].textContent.trim();
        obj.hitAutoAppDelay = secondsToString(hit.autoapp);
        obj.assignmentDuration = doc.querySelectorAll(`.capsule_field_text`)[3].textContent.trim();
        
        obj.caught = obj.caught > 0 ? obj.caught + 1 : 1;
        
        watcher.found(obj);
        watcher.update(obj);
      } 
    }
  
    if (obj) {
      obj.searched = obj.searched > 0 ? obj.searched + 1 : 1;
    } 
      
    watcher.stats(obj);
    catcher.timeout = setTimeout(catcher.catch, catcher.delay());
  },
  wwwError: function (result, status, xhr) {
    catcher.timeout = setTimeout(catcher.catch, catcher.settings.speed);
  },
  workerParse: function (result, status, xhr) {
    catcher.timeout = setTimeout(catcher.catch, catcher.settings.speed);
  },
  workerError: function (result, status, xhr) {
    catcher.timeout = setTimeout(catcher.catch, catcher.settings.speed);
  },
  loggedOut: function () {
    catcher.pauseOn(`loggedOut`);
    
    notifications.speak(`You are logged out. HIT Catcher paused.`);
    
    bootbox.confirm({
      message: `You are logged out. Do you want to resume HIT Catcher?`,
      buttons: {
        confirm: {
          className: `btn-sm btn-success`
        },
        cancel: {
          className: `btn-sm btn-danger`
        }
      },
      callback: function (result) {
        if (result) {
          catcher.pauseOff();
        }
      }
    });
  },
  captchaFound: function () {
    catcher.pauseOn(`captchaFound`);
    
    notifications.speak(`Captcha found. HIT Catcher paused.`);
    
    bootbox.confirm({
      message: `Captcha found. Do you want to resume HIT Catcher?`,
      buttons: {
        confirm: {
          className: `btn-sm btn-success`
        },
        cancel: {
          className: `btn-sm btn-danger`
        }
      },
      callback: function (result) {
        if (result) {
          catcher.pauseOff();
        }
      }
    });
    
    if (catcher.settings.captchaPopup) {
      window.open(`https://www.mturk.com/mturk/preview?groupId=${catcher.settings.captchaOverride ? catcher.settings.captchaOverride : catcher.id}`, `hcPopup`, `width=800, height=600`);
    }
  },
};

const notifications = {
  speak: function (phrase) {
    chrome.tts.speak(phrase, {
      enqueue: true,
      voiceName: `Google US English`
    });
  }
};

document.addEventListener(`click`, function (event) {
  const element = event.target;
  
  // Catcher pause button is clicked
  if (element.matches(`#pause`)) {
    if (element.className.match(`btn-default`)) {
      catcher.pauseOn();
    }
    else if (element.className.match(`btn-danger`)) {
      catcher.pauseOff();
    }
  }
  
  // Watcher left button is clicked
  if (element.matches(`.move-left`)) {
    watcher.moveLeft(watcher.watchers[element.dataset.id]);
  }
  
  // Watcher right button is clicked
  if (element.matches(`.move-right`)) {
    watcher.moveRight(watcher.watchers[element.dataset.id]);
  }
  
  // Watcher catch button is clicked
  if (element.matches(`.catch`)) {
    if (element.className.match(`btn-default`)) {
      watcher.catchOn(watcher.watchers[element.dataset.id]);
    }
    else if (element.className.match(`btn-success`)) {
      watcher.catchOff(watcher.watchers[element.dataset.id]);
    }
  }
  
  // Watcher sound button is clicked
  if (element.matches(`.sound`)) {
    if (element.className.match(`btn-default`)) {
      watcher.soundOn(watcher.watchers[element.dataset.id]);
    }
    else if (element.className.match(`btn-success`)) {
      watcher.soundOff(watcher.watchers[element.dataset.id]);
    }
  }
  
  // Watcher settings button is clicked
  if (element.matches(`.glyphicon-cog`)) {
    watcher.settingsShow(watcher.watchers[element.dataset.id]);
  }
  
  // Watcher remove button is clicked
  if (element.matches(`.glyphicon-remove`)) {
    watcher.remove(watcher.watchers[element.dataset.id]);
  }
  
  if (element.matches(`#advanced_settings`)) {
    $(document.getElementById(`advanced_settings_modal`)).modal(`show`);
  }
});

document.addEventListener(`change`, function (event) {
  storageHandler.saveHitCatcherSettings();
  storageHandler.updateHitCatcherSettings();
});


document.addEventListener(`keydown`, function (event) {
  const key = event.key;
  
  if (key === `Enter`) {
    if (document.getElementsByClassName(`bootbox`)[0]) {
      document.getElementsByClassName(`bootbox`)[0].querySelector(`[data-bb-handler="confirm"]`).click();
      bootbox.hideAll();
    }
  }
});

document.addEventListener(`DOMContentLoaded`, function () {
  storageHandler.loadHitCatcherWatchers();
  storageHandler.loadHitCatcherSettings();
});

window.addEventListener(`beforeunload`, function (event) {
  storageHandler.saveHitCatcherWatchers();
});

function whenAccepted (time) {
  const split = time.split(/:| /);
  const dd = split.length === 4 ? +(split[0]) : 0;
  const hh = split.length === 4 ? +(split[1]) : +(split[0]);
  const mm = split.length === 4 ? +(split[2]) : +(split[1]);
  const ss = split.length === 4 ? +(split[3]) : +(split[2]);
  const ms = (dd * 86400 + hh * 3600 + mm * 60 + ss) * 1000;
  return Date.now() - ms;
}

function mturkDate (time) {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = dst() === true ? `-7` : `-8`;
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
  const year = (amz.getFullYear()).toString();
  return month + day + year;
}

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

function secondsToString (seconds) {
  const dd = Math.floor(seconds / 86400);
  const hh = Math.floor(seconds / 3600 % 24);
  const mm = Math.floor(seconds / 60 % 60);

  const string =   
    (dd > 0 ? `${dd} day${dd > 1 ? `s` : ``} ` : ``) +
    (hh > 0 ? `${hh} hour${hh > 1 ? `s` : ``} ` : ``) +
    (mm > 0 ? `${mm} minute${mm > 1 ? `s` : ``} ` : ``)
  ;
  
  return seconds > 0 ? string : `0 seconds`;
}
