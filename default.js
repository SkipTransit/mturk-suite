document.addEventListener('DOMContentLoaded', () => {
  defaultjs();
});

let user;

const defaultjs = () => {
  chrome.storage.local.get('user', (data) => {
    user = data.user || {dark: true};
    
    $('body').append(
      build_switch('darktheme', user.dark)
    );
    
    $(':checkbox').change( () => {
      user.dark = $('#darktheme').prop('checked');
      chrome.runtime.sendMessage({msg: 'user', data: user});
    });
  });
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

