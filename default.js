document.addEventListener('DOMContentLoaded', () => {
  defaultjs();
});

let user;

const defaultjs = () => {
  chrome.storage.local.get('user', (data) => {
    user = data.user || {dark: true, goal: 20};
    
    $('body').append(
      GOAL_WRITE(user.goal || 20),
      build_switch('darktheme', user.dark)
    );
    
    $('input').change( () => {
      user.goal = $('#goal').val();
      user.dark = $('#darktheme').prop('checked');
      chrome.runtime.sendMessage({msg: 'user', data: user});
      console.log(user);
    });
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

const build_switch = (name, prop) => {
  const html =
        `<div>` +
        `  <div class="switch" style="float: left;">` +
        `    <input id="${name}" type="checkbox" name="${name}" class="switch-checkbox" ${(prop ? 'checked' : '')}>` +
        `    <label class="switch-label" for="${name}">` +
        `      <span class="switch-inner"></span>` +
        `      <span class="switch-switch"></span>` +
        `    </label>` +
        `  </div>` +
        `  <div style="float: right;">${name}</div>` +
        `</div>`;
  return html;
};

