
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


const todaysProjectedEarnings = {
  mts: {},
  execute: function () {
    console.log(`todaysProjectedEarnings.execute()`);
    
    const html =
      `<div>
        <div id="tpe_goal_outer">
          <div id="tpe_goal_inner" style="width: ${+todaysProjectedEarnings.mts.tpe / +todaysProjectedEarnings.mts.goal * 100}%;"></div>
        </div>
        <div id="tpe_earnings">$${(+todaysProjectedEarnings.mts.tpe).toFixed(2)}/${(+todaysProjectedEarnings.mts.goal).toFixed(2)}<div>
      </div>`
    ;
    
    if (document.getElementById(`tpe`)) {
      document.getElementById(`tpe`).innerHTML = html;
    }
    else {
      document.querySelector(`a[href="/account"]`).parentElement.insertAdjacentHTML(
        `beforeend`,
        `<span id="tpe">${html}</span>`
      );
    }
  },
};

if (document.querySelector(`a[href="/account"]`)) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.tpe) {
      const newVal = changes.tpe.newValue, oldVal = changes.tpe.oldValue;
      todaysProjectedEarnings.mts = {
        tpe: newVal.tpe ? newVal.tpe : oldVal.tpe,
        goal: newVal.goal ? newVal.goal : oldVal.goal
      }
      todaysProjectedEarnings.execute();
    }
  });
  
  chrome.storage.local.get(`tpe`, function (result) {
    todaysProjectedEarnings.mts = result.tpe;
    todaysProjectedEarnings.execute();
  });
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
     
    if (element.closest(`#tpe`)) {
      window.open(chrome.runtime.getURL(`/todays_hits_menu.html`));
     }
  });
}
