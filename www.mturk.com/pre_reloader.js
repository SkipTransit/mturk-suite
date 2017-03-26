const preReloader = {
  mts: {},
  execute: function () {
    console.log(`preReloader.execute()`);
    
    if (preReloader.mts.preReloader) {
      setTimeout( function () {
        window.location.reload();
      }, 1000);
    }
  }
};

if (document.getElementsByClassName(`error_title`)[0] && document.getElementsByClassName(`error_title`)[0].innerHTML.match(`You have exceeded the maximum allowed page request rate for this website.`)) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) {
      preReloader.mts = changes.settings.newValue;
      preReloader.execute();
    }
  });

  chrome.storage.local.get(`settings`, function (result) {
    preReloader.mts = result.settings;
    preReloader.execute();
  });
}
