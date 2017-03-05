function ACCEPT_NEXT (settings) {
  if (!settings) settings = { accept_next: true };
  document.getElementsByName(`autoAcceptEnabled`)[0].checked = settings.accept_next ? true : false;
}

if (document.getElementsByName(`autoAcceptEnabled`)[0]) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) ACCEPT_NEXT(changes.settings.newValue);
  });

  chrome.storage.local.get(`settings`, function (result) {
    ACCEPT_NEXT(result.settings ? result.settings : null);
  });
}
