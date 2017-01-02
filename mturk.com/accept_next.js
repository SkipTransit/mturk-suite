function ACCEPT_NEXT () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {accept_next: true};

    if (user.accept_next) {
      document.getElementsByName(`autoAcceptEnabled`)[0].checked = true;
    }
    else {
      document.getElementsByName(`autoAcceptEnabled`)[0].checked = false;
    }
  });
}

if (document.getElementsByName(`autoAcceptEnabled`)[0]) {
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) {
      if (key === `user`) {
        ACCEPT_NEXT();
      }
    }
  });

  ACCEPT_NEXT();
}
