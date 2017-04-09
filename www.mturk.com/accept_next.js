const acceptNext = {
  mts: {},
  
  init () {    
    if (this.mts.acceptNext) {
      doc.getElementsByName(`autoAcceptEnabled`)[0].checked = true;
    }
  },
  
  update () {
    
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

if (doc.getElementsByName(`autoAcceptEnabled`)[0]) {
  chrome.storage.local.get(`settings`, acceptNext.storageLocalGet);
  chrome.storage.onChanged.addListener(acceptNext.storageOnChanged);
}
