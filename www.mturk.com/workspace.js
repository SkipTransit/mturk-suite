function WORKSPACE (settings) {
  if (!settings) settings = { workspace: true };
    
  const iframe = document.getElementsByTagName(`iframe`)[0];
  const wrapper = document.getElementById(`hit-wrapper`);

  if (settings.workspace && document.getElementsByName(`isAccepted`)[0].value === `true`) {
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
}

if (document.getElementsByName(`isAccepted`)[0] && !document.getElementsByName(`userCaptchaResponse`)[0]) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) WORKSPACE(changes.settings.newValue);
  });

  chrome.storage.local.get(`settings`, function (result) {
    WORKSPACE(result.settings ? result.settings : null);
  });
}
