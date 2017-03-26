const acceptNext = {
  mts: {},
  execute: function () {
    console.log(`acceptNext.execute()`);
    
    const element = $(`label:contains(Auto-accept Next Task)`).children()[0];
    const checked = element.checked;
    
    if (settings.accept_next !== checked) {
      element.click();
    } 
  }
};

if ($(`label:contains(Auto-accept Next Task)`)[0]) {
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
