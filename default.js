document.addEventListener(`DOMContentLoaded`, () => {
  POPUP_JS();
});

let user;

const POPUP_JS = () => {
  chrome.storage.local.get(`user`, (data) => {
    user = data.user || {dark: true, goal: 20};
    
    $(`#options`).append(
      GOAL_WRITE(user.goal || 20),
      SWITCH_WRITE(`darktheme`, user.dark, `Dark Theme`),
      SWITCH_WRITE(`hit_export`, user.hit_export, `HIT Export`),
      //SWITCH_WRITE(`vb`, user.vb, `Forum Export`),
      //SWITCH_WRITE(`vb_th`, user.vb_th, `TH Direct Export`),
      //SWITCH_WRITE(`vb_mtc`, user.vb_mtc, `MTC Direct Export`),
      SWITCH_WRITE(`accept_next`, user.accept_next, `Accept Next Checked`),
      SWITCH_WRITE(`workspace`, user.workspace, `Workspace Expand + Scroll`)
    );
  });
};

const GOAL_WRITE = (goal) => {
  const html = 
        `<div class="form-inline">` +
        `  <div class="input-group">` +
        `    <div class="input-group-addon">Daily Goal</div>` +
        `    <input id="goal" type="number" class="form-control" value="${Number(goal).toFixed(2)}">` +
        `  </div>` +
        `</div>`
  ;
  return html;
};

const SWITCH_WRITE = (id, prop, name) => {
  const html =
        `<div class="checkbox" style="padding: 2px; margin: 1px;">` +
        `  <label>` +
        `    <input id="${id}" type="checkbox" data-toggle="toggle" data-size="mini" data-onstyle="success" ${(prop ? `checked` : ``)}>` +
        `${name}` +
        `  </label>` +
        `</div>`
  ;
  return html;
};

$(`html`).on(`click`, `.checkbox, label`, function (e) {
  if (e.target !== this) return;
  $(this).find(`input[type="checkbox"]`).bootstrapToggle(`toggle`);
});

$(`html`).on(`change`, `input`, function () {
  user.goal = $(`#goal`).val();
  user.dark = $(`#darktheme`).prop(`checked`);
  user.hit_export = $(`#hit_export`).prop(`checked`);
  //user.vb = $(`#vb`).prop(`checked`);
  //user.vb_th = $(`#vb_th`).prop(`checked`);
  //user.vb_mtc = $(`#vb_mtc`).prop(`checked`);
  user.accept_next = $(`#accept_next`).prop(`checked`);
  user.workspace = $(`#workspace`).prop(`checked`);
  chrome.runtime.sendMessage({msg: `user`, data: user});
});
