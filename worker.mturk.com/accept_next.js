function ACCEPT_NEXT () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || { accept_next: true };
    
    const element = $(`label:contains(Auto-accept Next Task)`).children()[0];
    element.checked = user.accept_next ? true : false;
    element.dispatchEvent(new Event(`change`, {bubbles: true}));
  });
}

if ($(`label:contains(Auto-accept Next Task)`)[0]) {
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) if (key === `user`) ACCEPT_NEXT();
  });

  ACCEPT_NEXT();
}
