chrome.storage.onChanged.addListener( function (changes) {
  if (changes.addWatcher) {
    watcher.add(changes.addWatcher.newValue);
    watcher.draw(changes.addWatcher.newValue);
    watcher.catch(changes.addWatcher.newValue);
  } 
});

const watchers = {};

const watcher = {
  add: function (obj) {
    if (!watchers[obj.hitSetId]) {
      watchers[obj.hitSetId] = obj
    }
  },
  remove: function (obj) {
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
      backdrop: true,
      callback: function (result) {
        if (result) {
          delete watchers[obj.hitSetId];
          catcher.ids.splice(catcher.ids.indexOf(obj.hitSetId), 1);
          document.getElementById(obj.hitSetId).parentNode.removeChild(document.getElementById(obj.hitSetId));
        }
      }
    });
  },
  draw: function (obj) {
    if (document.getElementById(obj.hitSetId)) return;
    
    document.getElementById(`hits`).insertAdjacentHTML(
      `beforeend`,
      `<div id="${obj.hitSetId}" class="col-sm-3">
        <div class="card card-inverse card-hit">
          <div class="card-header">
            <div class="float-right" style="background-color: #444; border-left: 1px solid #FFFFFF;"> > </div>
            <div class="float-right">
              <span class="glyphicon glyphicon-cog align-top" data-id="${obj.hitSetId}"></span>
              <span class="glyphicon glyphicon-remove align-top" data-id="${obj.hitSetId}"></span>
            </div>
            <div class="float-left" style="background-color: #444; border-right: 1px solid #FFFFFF;"> < </div>
            <b>${obj.nickName}</b>
          </div>
          <div class="card-block">
            <div class="card-text">
              <div>
                <div class="stats" style="font-size: 10px;">Caught: 0; Searched: 0;</div>
                <button class="catch btn btn-xxs btn-default" data-id="${obj.hitSetId}">Catch</button>
                <button class="sound btn btn-xxs btn-success" data-id="${obj.hitSetId}">Sound</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    );
  },
  stats: function (obj) {
    document.getElementById(obj.hitSetId).getElementsByClassName(`stats`)[0].textContent =
      `Caught: ${obj.caught ? obj.caught : 0}; Searched: ${obj.searched ? obj.searched : 0};`
    ;
  }, 
  catchOn: function (obj) {
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`catch`)[0];
    element.className = element.className.replace(`btn-default`, `btn-success`);
    catcher.ids.push(obj.hitSetId);
    catcher.catch();
  },
  catchOff: function (obj) {
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`catch`)[0];
    element.className = element.className.replace(`btn-success`, `btn-default`);
    catcher.ids.splice(catcher.ids.indexOf(obj.hitSetId), 1);
  },
  soundOn: function (obj) {
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`sound`)[0];
    element.className = element.className.replace(`btn-default`, `btn-success`);
  }, 
  soundOff: function (obj) {
    const element = document.getElementById(obj.hitSetId).getElementsByClassName(`sound`)[0];
    element.className = element.className.replace(`btn-success`, `btn-default`);
  },
  alert: function (obj) {
    
  }
};

const hitCatcher = {
  load: function () {
    
  },
  save: function () {
    
  }
}

const catcher = {
  id: null, ids: [], index: 0, timeout: null,
  catch: function () {
    clearTimeout(catcher.timeout);
    
    if (!catcher.ids[0]) {
      return;
    }
    
    catcher.id = catcher.ids[catcher.index ++ % catcher.ids.length];
    console.log(`https://www.mturk.com/mturk/previewandaccept?groupId=${catcher.id}`);
    
    $.ajax({
      url:
      `https://www.mturk.com/mturk/previewandaccept?groupId=${catcher.id}`,
      type:
      `GET`,
      timeout:
      5000
    }).then(catcher.wwwParse, catcher.wwwError);
  },
  wwwParse: function (result, status, xhr) {
    const doc = document.implementation.createHTMLDocument().documentElement; doc.innerHTML = result;
    const obj = watchers[catcher.id];
    
    // Page request error
    if (doc.getElementsByClassName(`error_title`)[0]) {
      console.log(`pre`);
    }
    
    // Captcha encountered
    else if (doc.querySelector(`[name="userCaptchaResponse"]`)) {
      console.log(`captcha`);
    }
    
    // HIT accepted
    else if (doc.querySelector(`[name="isAccepted"]`)) {
      console.log(`accepted`);
      
      const hit = {
        reqname : doc.querySelector(`[name="prevRequester"]`).value,
        reqid   : doc.querySelector(`[name="prevRequester"]`).value,
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
        obj.caught = obj.caught > 0 ? obj.caught + 1 : 1;
      } 
    }
  
    if (obj) {
      obj.searched = obj.searched > 0 ? obj.searched + 1 : 1;
    } 
      
    watcher.stats(obj);
    catcher.timeout = setTimeout(catcher.catch, 1000);
  },
  wwwError: function (result, status, xhr) {
    catcher.timeout = setTimeout(catcher.catch, 1000);
  },
  workerParse: function (result, status, xhr) {
    catcher.timeout = setTimeout(catcher.catch, 1000);
  },
  workerError: function (result, status, xhr) {
    catcher.timeout = setTimeout(catcher.catch, 1000);
  },
}

const alerts = {
  
};

document.addEventListener(`click`, function (event) {
  const element = event.target;
    
  // If the watcher's catch button is clicked
  if (element.matches(`.catch`)) {
    if (element.className.match(`btn-default`)) {
      watcher.catchOn(watchers[element.dataset.id]);
    }
    else if (element.className.match(`btn-success`)) {
      watcher.catchOff(watchers[element.dataset.id]);
    }
  }
  
  // IF the watcher's sound button is clicked
  if (element.matches(`.sound`)) {
    if (element.className.match(`btn-default`)) {
      watcher.soundOn(watchers[element.dataset.id]);
    }
    else if (element.className.match(`btn-success`)) {
      watcher.soundOff(watchers[element.dataset.id]);
    }
  }
  
  // IF the watcher's remove button is clicked
  if (element.matches(`.glyphicon-remove`)) {
    watcher.remove(watchers[element.dataset.id]);
  }
});

const structure = {
  nickName: `Test HIT 1`,
  hitSetId: `3YVLYSYEBF5EJAO35WSGKPFABSF0QM`,
  panda: true
};

document.addEventListener(`DOMContentLoaded`, function () {
  watcher.add(structure);
  watcher.draw(structure);
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