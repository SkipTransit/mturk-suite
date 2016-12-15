document.addEventListener('DOMContentLoaded', () => {
  ACCEPT_NEXT();
});

chrome.storage.onChanged.addListener( (changes) => {
  for (let key in changes) {
    if (key === 'user') {
      ACCEPT_NEXT();
    }
  }
});

const ACCEPT_NEXT = () => {
  chrome.storage.local.get('user', (data) => {
    const user = data.user || {accept_next: true};

    if (user.accept_next) {
      $('input[name="autoAcceptEnabled"]').prop('checked', true);
    }
    else {
      $('input[name="autoAcceptEnabled"]').prop('checked', false);
    }
  });
};
