const acceptNext = {
  mts: {},
  
  execute () {
    console.log(`acceptNext.execute()`);
    
    if (this.mts.acceptNext) {
      document.getElementsByName(`autoAcceptEnabled`)[0].checked = true;
    }
  },
  
  storageLocalGet (result) {
    acceptNext.mts = result.settings;
    acceptNext.execute();
  },
  
  storageOnChanged (changes) {
    if (changes.settings) {
      acceptNext.mts = changes.settings.newValue;
      acceptNext.execute();
    }
  }
};

if (document.getElementsByName(`autoAcceptEnabled`)[0]) {
  chrome.storage.local.get(`settings`, acceptNext.storageLocalGet);
  chrome.storage.onChanged.addListener(acceptNext.storageOnChanged);
}
