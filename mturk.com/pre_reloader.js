function PRE_RELOADER () {
  chrome.storage.local.get(`user`, function (result) {
    const user = result.user || { pre_reloader: true };
    if (user.pre_reloader) setTimeout( function () { window.location.reload(); }, 1000);
  });
}

if (document.getElementsByClassName(`error_title`)[0] && document.getElementsByClassName(`error_title`)[0].innerHTML.match(`You have exceeded the maximum allowed page request rate for this website.`)) {
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) if (key === `user`) PRE_RELOADER();
  });
  
  PRE_RELOADER();
}
