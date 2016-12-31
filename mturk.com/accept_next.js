document.addEventListener(`DOMContentLoaded`, function () {
  ACCEPT_NEXT();
});

chrome.storage.onChanged.addListener( function (changes) {
  for (let key in changes) {
    if (key === `user`) {
      ACCEPT_NEXT();
    }
  }
});

function ACCEPT_NEXT () {
  chrome.storage.local.get(`user`, (data) => {
    const user = {
      accept_next: data.user.hasOwnProperty(`accept_next`) ? data.user.accept_next : true
    };

    if (user.accept_next) return $(`input[name="autoAcceptEnabled"]`).prop(`checked`, true);
    $(`input[name="autoAcceptEnabled"]`).prop(`checked`, false);
  });
}
