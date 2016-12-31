document.addEventListener(`DOMContentLoaded`, function () {
  if ($(`a[href="/mturk/beginsignout"]`).length) {
    TODAYS_PROJECTED_EARNINGS();
  }
});

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (request.msg == `sync_tpe_done`) {
    TPE_MENU_WRITE();
  }
  if (request.msg == `close_tpe_menu`) {
    TPE_MENU_CLOSE();
  }
});

chrome.storage.onChanged.addListener( function (changes) {
  for (let key in changes) {
    if (key === `tpe`) {
      TPE_WRITE(
        changes[key].newValue.tpe !== undefined ? changes[key].newValue.tpe : changes[key].oldValue.tpe,
        changes[key].newValue.goal !== undefined ? changes[key].newValue.goal : changes[key].oldValue.goal
      );
    }
  }
});

function TODAYS_PROJECTED_EARNINGS () {
  chrome.storage.local.get(`tpe`, function (data) {
    const tpe = {
      tpe: data.tpe.hasOwnProperty('tpe') ? data.tpe.tpe : 0,
      goal: data.tpe.hasOwnProperty('goal') ? data.tpe.goal : 20
    };
    TPE_WRITE(tpe.tpe, tpe.goal);
  });
}

function TPE_WRITE (earnings, goal) {
  const html =
      `<div>` +
      `  <div id="tpe_goal_outer">` +
      `    <div id="tpe_goal_inner" style="width: ${Number(earnings) / Number(goal) * 100}%;"></div>` +
      `  </div>` +
      `  <div id="tpe_earnings">$${Number(earnings).toFixed(2)}/${Number(goal).toFixed(2)}<div>` +
      `</div>`
  ;
  
  if ($(`#tpe`).length) return $(`#tpe`).html(html);
  $(`#subtabs_and_searchbar`).prepend(`<div id="tpe">${html}</div>`);
}

function TPE_MENU_WRITE () {
  const html = `<iframe src="${chrome.runtime.getURL(`todays_hits_menu.html`)}" style="width: 100%; height: 100%;">`;
  
  if ($(`#tpe_menu`).length) return $(`#tpe_menu`).html(html);
  $(`body`).append(`<div id="tpe_menu">${html}</div>`);
}

function TPE_MENU_CLOSE () {
  $(`#tpe_menu`).remove();
}

$(`html`).on(`click`, `#tpe`, function () {
  TPE_MENU_WRITE();
});
