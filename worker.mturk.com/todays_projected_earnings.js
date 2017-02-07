function TODAYS_PROJECTED_EARNINGS () {
  chrome.storage.local.get(`tpe`, function (data) {
    const tpe = data.tpe || {tpe: 0, goal: 20};
    TPE_WRITE(tpe.tpe, tpe.goal);
  });
}

function TPE_WRITE (earnings, goal) {
  const html =
    `<div>` +
      `<div id="tpe_goal_outer">` +
        `<div id="tpe_goal_inner" style="width: ${Number(earnings) / Number(goal) * 100}%;"></div>` +
      `</div>` +
      `<div id="tpe_earnings">$${Number(earnings).toFixed(2)}/${Number(goal).toFixed(2)}<div>` +
    `</div>`
  ;
  
  if (document.getElementById(`tpe`)) {
    document.getElementById(`tpe`).innerHTML = html;
  }
  else {
    document.querySelector(`a[href="/account"]`).parentElement.insertAdjacentHTML(`beforeend`, `<span id="tpe">${html}</span>`);
  }
}

function TPE_MENU_WRITE () {
  const html = `<iframe src="${chrome.runtime.getURL(`todays_hits_menu.html`)}" style="width: 100%; height: 100%;">`;
  
  if (document.getElementById(`tpe_menu`)) {
    document.getElementById(`tpe_menu`).innerHTML = html;
  }
  else {
    document.body.insertAdjacentHTML(`afterbegin`, `<div id="tpe_menu">${html}</div>`);
  }
}

function TPE_MENU_CLOSE () {
  document.body.removeChild(document.getElementById(`tpe_menu`));
}

if (document.querySelector(`a[href="/account"]`)) {
  chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    switch (request.msg) {
      case `sync_tpe_done`: TPE_MENU_WRITE(); break;
      case `close_tpe_menu`: TPE_MENU_CLOSE(); break;
    }
  });
  
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) {
      if (key === `tpe`) {
        const newVal = changes[key].newValue, oldVal = changes[key].oldValue;
        TPE_WRITE(newVal.tpe !== undefined ? newVal.tpe : oldVal.tpe, newVal.goal !== undefined ? newVal.goal : oldVal.goal);
      }
    }
  });
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
    
    if (element.closest(`#tpe`)) {
      TPE_MENU_WRITE();
    }
  });
  
  TODAYS_PROJECTED_EARNINGS();
}
