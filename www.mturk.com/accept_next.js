const acceptNext = {
  mts: {},
  execute: function () {
    console.log(`acceptNext.execute()`);
    
    document.getElementsByName(`autoAcceptEnabled`)[0].checked = acceptNext.mts.acceptNext ? true : false;
  }
};

if (document.getElementsByName(`autoAcceptEnabled`)[0]) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) {
      acceptNext.mts = changes.settings.newValue;
      acceptNext.execute();
    }
  });

  chrome.storage.local.get(`settings`, function (result) {
    acceptNext.mts = result.settings;
    acceptNext.execute();
  });
}
