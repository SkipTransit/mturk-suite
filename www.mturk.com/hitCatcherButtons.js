const hitCatcherButtons = {
  execute: function () {
    console.log(`hitCatcherButtons.execute()`);
    
    if (document.querySelector(`a[href^="/mturk/preview?groupId="]`)) {
      hitCatcherButtons.drawAll();
    }
    if (document.URL.match(/groupId=(.*)/)) {
      hitCatcherButtons.drawHeader();
    }
  },
  hits: {},
  html: function (key) {
    const html =
      `<button type="button" class="hitCatcherButtonPanda MTS-export" style="margin-right: 0px;" data-key="${key}">Panda</button>
      <button type="button" class="hitCatcherButtonOnce MTS-export" data-key="${key}">Once</button>`
    ;
    return html;
  },
  drawAll: function () {
    console.log(`hitCatcherButtons.drawAll()`);
    
    for (let hit of document.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
      const key = hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1];
    
      hitCatcherButtons.hits[key] = {
        nickname: null,
        once: false, 
        sound: true,
        requesterName: 
        hit.getElementsByClassName(`requesterIdentity`)[0].textContent.trim(),
        requesterId:
        hit.querySelector(`[href*="requesterId="]`).getAttribute(`href`).match(/requesterId=(.*)/)[1],      
        title:
        hit.getElementsByClassName(`capsulelink`)[0].textContent.trim(),
        hitSetId: 
        hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1],
        reward:
        hit.getElementsByClassName(`capsule_field_text`)[3].textContent.trim(),
        assignmentDuration:
        hit.getElementsByClassName(`capsule_field_text`)[2].textContent.trim(),
        hitRequirements: 
        hit.querySelector(`td[style="padding-right: 2em; white-space: nowrap;"]`) ?
        [...hit.querySelectorAll(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(element => `${element.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
        `None;`,
        hitAutoAppDelay:
        null
      };
    
      if (hit.getElementsByClassName(`MTS-exports`)[0]) {
        hit.getElementsByClassName(`MTS-exports`)[0].insertAdjacentHTML(
          `afterend`,
          hitCatcherButtons.html(key)
        );
      }
      else {
        hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(
          `beforebegin`,
          hitCatcherButtons.html(key)
        );
      }
    }
  },
  drawHeader: function () {
    console.log(`hitCatcherButtons.drawHeader()`);
    
    const key = document.URL.match(/roupId=(.*)/)[1];
    
    hitCatcherButtons.hits[key] = {
      nickname: null,
      once: false, 
      sound: true,
      requesterName: null,
      requesterId: null,      
      title: null,
      hitSetId: document.URL.match(/roupId=(.*)/)[1],
      reward: null,
      assignmentDuration: null,
      hitRequirements: null,
      hitAutoAppDelay: null
    };
    
    if (document.getElementById(`theTime`)) {
      document.getElementById(`theTime`).parentElement.insertAdjacentHTML(
        `beforeend`,
        hitCatcherButtons.html(key)
      );
    }
    
    else if (document.getElementById(`alertBox`)) {
      document.getElementById(`alertBox`).insertAdjacentHTML(
        `beforeend`,
        hitCatcherButtons.html(key)
      );
    }
  },
  sendOnceWatcher: function (obj) {
    console.log(`hitCatcherButtons.sendOnceWatcher()`);
    
    obj.once = true;
      
    chrome.runtime.sendMessage({ 
      type: `hitCatcherAddWatcher`,
      message: obj
    });
  },
  sendPandaWatcher: function (obj) {
    console.log(`hitCatcherButtons.sendPandaWatcher()`);
          
    chrome.runtime.sendMessage({ 
      type: `hitCatcherAddWatcher`,
      message: obj
    });
  }
};

if (document.querySelector(`a[href="/mturk/beginsignout"]`)) {
  chrome.runtime.onMessage.addListener( function (request) {
    if (request.type === `hitCatcherPing` && request.message === true) {
      hitCatcherButtons.execute();
    }
  });
  
  chrome.runtime.sendMessage({ 
    type: `hitCatcherPing`
  });
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
  
    if (element.matches(`.hitCatcherButtonOnce`)) {
      const obj = hitCatcherButtons.hits[element.dataset.key];
      hitCatcherButtons.sendOnceWatcher(obj);
    }
    
    if (element.matches(`.hitCatcherButtonPanda`)) {
      const obj = hitCatcherButtons.hits[element.dataset.key];
      hitCatcherButtons.sendPandaWatcher(obj);
    }
  });
}
