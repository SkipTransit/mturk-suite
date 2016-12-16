document.addEventListener('DOMContentLoaded', () => {
  defaultjs();
});

let user;

const defaultjs = () => {
  chrome.storage.local.get('user', (data) => {
    user = data.user || {dark: true, goal: 20};
    
    $('body').prepend(
      GOAL_WRITE(user.goal || 20)
    );
    
    $('#options').append(
      SWITCH_WRITE('darktheme', user.dark, 'Dark Theme'),
      SWITCH_WRITE('vb', user.vb, 'Forum Export'),
      SWITCH_WRITE('vb_th', user.vb_th, 'TH Direct Export'),
      SWITCH_WRITE('vb_mtc', user.vb_mtc, 'MTC Direct Export'),
      SWITCH_WRITE('accept_next', user.accept_next, 'Accept Next Checked'),
      SWITCH_WRITE('workspace', user.workspace, 'Workspace Expand + Scroll')
    );
  });
};

const GOAL_WRITE = (goal) => {
  const html =
        `<div>` +
        `  <label>Daily Goal: ` +
        `    <input id="goal" type="number" value="${Number(goal).toFixed(2)}" style="width: 60px;">` +
        `  </label>` +
        `</div>`;
  return html;
};

const SWITCH_WRITE = (id, prop, name) => {
  const html =
        `<tr style=" width: 100%;">` +
        `  <td class="switch">` +
        `    <input id="${id}" type="checkbox" name="${name}" class="switch-checkbox" ${(prop ? 'checked' : '')}>` +
        `    <label class="switch-label" for="${id}">` +
        `      <span class="switch-inner"></span>` +
        `      <span class="switch-switch"></span>` +
        `    </label>` +
        `  </td>` +
        `  <td>${name}</td>` +
        `</tr>`;
  return html;
};

$('html').on('change', 'input', function () {
  user.goal = $('#goal').val();
  user.dark = $('#darktheme').prop('checked');
  user.vb = $('#vb').prop('checked');
  user.vb_th = $('#vb_th').prop('checked');
  user.vb_mtc = $('#vb_mtc').prop('checked');
  user.accept_next = $('#accept_next').prop('checked');
  user.workspace = $('#workspace').prop('checked');
  
  chrome.runtime.sendMessage({msg: 'user', data: user});
});
