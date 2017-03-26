const acceptNext = {
  mts: {},
  execute: function () {
    console.log(`acceptNext.execute()`);
    
    const element = $(`span:contains(Auto-accept next HIT)`).prev()[0];
    const checked = element.checked;
    
    if (acceptNext.mts.acceptNext !== checked) {
      element.click();
    } 
  }
};

if ($(`span:contains(Auto-accept next HIT)`)[0]) {
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
