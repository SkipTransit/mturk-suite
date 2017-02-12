let USER = { goal: 20, dark_theme: false, hit_export: true, accept_next: true, workspace: true, pre_reloader: true };

function POPUP () {
  chrome.storage.local.get(`user`, function (result) {
    if (result.user) USER = result.user;
    
    document.getElementById(`options`).insertAdjacentHTML(`beforeend`,
      GOAL_WRITE(USER.goal) +
      SWITCH_WRITE(`dark_theme`,   USER.dark_theme,   `Dark Theme`) +
      SWITCH_WRITE(`hit_export`,   USER.hit_export,   `HIT Export`) +
      SWITCH_WRITE(`accept_next`,  USER.accept_next,  `Accept Next Checked`) +
      SWITCH_WRITE(`workspace`,    USER.workspace,    `Workspace Expand + Scroll`) +
      SWITCH_WRITE(`pre_reloader`, USER.pre_reloader, `Page Request Error Auto Reload`)
    );
  });
  
  document.getElementById(`version`).textContent = `v${chrome.runtime.getManifest().version}`;
}

function GOAL_WRITE (goal) {
  const html = 
    `<div class="form-inline">` +
      `<div class="input-group">` +
        `<div class="input-group-addon">Daily Goal</div>` +
        `<input id="goal" type="number" class="form-control" value="${(+goal).toFixed(2)}">` +
      `</div>` +
    `</div>`
  ;
  return html;
}

function SWITCH_WRITE (id, prop, name) {
  const html =
    `<div class="checkbox" style="padding: 2px; margin: 1px;">` +
      `<label>` +
        `<input id="${id}" type="checkbox" data-toggle="toggle" data-size="mini" data-onstyle="success" ${(prop ? `checked` : ``)}>` +
        `${name}` +
      `</label>` +
    `</div>`
  ;
  return html;
}

document.addEventListener(`DOMContentLoaded`, function () {
  $(`html`).on(`click`, `.checkbox, label`, function (event) {
    if (event.target !== this) return;
    $(this).find(`input[type="checkbox"]`).bootstrapToggle(`toggle`);
  });
  
  $(`html`).on(`change`, `input`, function () {
    USER.goal         = document.getElementById(`goal`).value;
    USER.dark_theme   = document.getElementById(`dark_theme`).checked;
    USER.hit_export   = document.getElementById(`hit_export`).checked;
    USER.accept_next  = document.getElementById(`accept_next`).checked;
    USER.workspace    = document.getElementById(`workspace`).checked;
    USER.pre_reloader = document.getElementById(`pre_reloader`).checked;
    chrome.runtime.sendMessage({msg: `user`, data: USER});
  });

  POPUP();
});
