function WORKSPACE () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {workspace: true};
    
    const iframe = document.getElementsByTagName(`iframe`)[0];
    const wrapper = document.getElementById(`hit-wrapper`);

    if (user.workspace && document.getElementsByName(`isAccepted`)[0].value === `true`) {
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
  });
}

if (document.getElementsByName(`isAccepted`)[0] && !document.getElementsByName(`userCaptchaResponse`)[0]) {
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) {
      if (key === `user`) {
        WORKSPACE();
      }
    }
  });
  
  WORKSPACE();
}
