function PRE_RELOADER (settings) {
  if (!settings) settings = { pre_reloader: true };
  if (settings.pre_reloader) setTimeout( function () { window.location.reload(); }, 1000);
}

if (document.getElementsByClassName(`error_title`)[0] && document.getElementsByClassName(`error_title`)[0].innerHTML.match(`You have exceeded the maximum allowed page request rate for this website.`)) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) PRE_RELOADER(changes.settings.newValue);
  });

  chrome.storage.local.get(`settings`, function (result) {
    PRE_RELOADER(result.settings ? result.settings : null);
  });
}
