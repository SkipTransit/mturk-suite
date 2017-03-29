const preReloader = {
  mts: {},
  
  execute () {   
    if (preReloader.mts.preReloader) {
      setTimeout( function () {
        window.location.reload();
      }, 1000);
    }
  },
  
  storageLocalGet (result) {
    preReloader.mts = result.settings;
    preReloader.execute();
  },
  
  storageOnChanged (changes) {
    if (changes.settings) {
      preReloader.mts = changes.settings.newValue;
      preReloader.execute();
    }
  }
};

if (document.getElementsByClassName(`error_title`)[0] && document.getElementsByClassName(`error_title`)[0].innerHTML.match(`You have exceeded the maximum allowed page request rate for this website.`)) {
  chrome.storage.local.get(`settings`, preReloader.storageLocalGet);
  chrome.storage.onChanged.addListener(preReloader.storageOnChanged);
}
