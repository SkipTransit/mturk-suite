const workspace = {
  mts: {},
  
  execute () {    
    const iframe = document.getElementsByTagName(`iframe`)[0];
    const wrapper = document.getElementById(`hit-wrapper`);
    
    if (this.mts.workspace && document.getElementsByName(`isAccepted`)[0].value === `true`) {
      if (iframe) {
        iframe.style.height = `100vh`;
        iframe.focus();
        iframe.scrollIntoView();
      }
      else if (wrapper) {
        wrapper.scrollIntoView();
      }
    }
    else if (iframe) {
      iframe.style.height = `500px`;
      document.body.scrollTop = 0;
    }
  },
  
  storageLocalGet (result) {
    workspace.mts = result.settings;
    workspace.execute();
  },
  
  storageOnChanged (changes) {
    if (changes.settings) {
      workspace.mts = changes.settings.newValue;
      workspace.execute();
    }
  }
};

if (document.getElementsByName(`isAccepted`)[0] && !document.getElementsByName(`userCaptchaResponse`)[0]) {
  chrome.storage.local.get(`settings`, workspace.storageLocalGet);
  chrome.storage.onChanged.addListener(workspace.storageOnChanged);
}
