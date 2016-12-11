document.addEventListener('DOMContentLoaded', () => {
  defaultjs();
});

let user;

const defaultjs = () => {
  chrome.storage.local.get('user', (data) => {
    user = data.user || {dark: true};
    
    $('body').append(build('darktheme', user.dark));
    
    $(':checkbox').change( () => {
      user.dark = $('#darktheme').prop('checked');
      chrome.runtime.sendMessage({msg: 'user', data: user});
    });
  });
};

const build = (name, prop) => {
  const html =
        `<div>` +
        `<div class="onoffswitch" style="float: left;">` +
        `<input type="checkbox" name="${name}" class="onoffswitch-checkbox" id="${name}" ${(prop ? 'checked' : '')}>` +
        `<label class="onoffswitch-label" for="${name}">` +
        `<span class="onoffswitch-inner"></span>` +
        `<span class="onoffswitch-switch"></span>` +
        `</label>` +
        `</div>` +
        `<div style="float: right;">${name}</div>` +
        `</div>`;
  return html;
};

