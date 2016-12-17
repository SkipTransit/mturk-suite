document.addEventListener('DOMContentLoaded', () => {
  GLOBALJS();
});

const GLOBALJS = () => {
  chrome.storage.local.get('tpe', (data) => {
    TPE_WRITE(data.tpe.tpe || 0, data.tpe.goal || 20);
  });
  
  chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.msg == 'sync_tpe_done') {
      TPE_MENU_WRITE();
    }
    if (request.msg == 'close_tpe_menu') {
      TPE_MENU_CLOSE();
    }
  });

  chrome.storage.onChanged.addListener( (changes) => {
    for (let key in changes) {
      if (key === 'tpe') {
        TPE_WRITE(
          changes[key].newValue.tpe !== undefined ? changes[key].newValue.tpe : changes[key].oldValue.tpe,
          changes[key].newValue.goal !== undefined ? changes[key].newValue.goal : changes[key].oldValue.goal
        );
      }
    }
  });
};

const TPE_WRITE = (earnings, goal) => {
  const html =
      `<div>` +
      `  <div id="tpe_goal_outer">` +
      `    <div id="tpe_goal_inner" style="width: ${Number(earnings) / Number(goal) * 100}%;"></div>` +
      `  </div>` +
      `  <div id="tpe_earnings">$${Number(earnings).toFixed(2)}/${Number(goal).toFixed(2)}<div>` +
      `</div>`
  ;
  
  if ($('#tpe').length) {
    $('#tpe').html(html);
  }
  else {
    $('#subtabs_and_searchbar').prepend(`<div id="tpe">${html}</div>`);
  }
};

const TPE_MENU_WRITE = () => {
  const html = `<iframe src="${chrome.runtime.getURL('todays_hits_menu.html')}" style="width: 100%; height: 100%;"></iframe>`;
  
  if ($('#tpe_menu').length) {
    $('#tpe_menu').html(html);
  }
  else {
    $('body').append(`<div id="tpe_menu">${html}</div>`);
  }
  /*
  $('body').append(
    `<div id="tpe_menu" style="padding: 1px; z-index: 99; position: fixed; width: 80%; height: 600px; left: 10%; top: 300px; margin-top: -250px;">` +
     +
    `</div>`
  );
  */
};

const TPE_MENU_CLOSE = () => {
  $('#tpe_menu').remove();
};

$('html').on('click', '#tpe', function () {
  TPE_MENU_WRITE();
});
