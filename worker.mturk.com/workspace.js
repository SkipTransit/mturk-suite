function WORKSPACE () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {workspace: true};
    
    const container = document.getElementsByClassName(`task-question-iframe-container`)[0];

    if (user.workspace && document.getElementsByName(`_method`)[0].value === `delete`) {
      if (container) {
        container.style.height = `100vh`;
        container.children[0].focus();
        container.scrollIntoView();
      }
    }
    else if (container) {
      container.style.height = `500px`;
      document.body.scrollTop = 0;
    }
  });
}

if (document.getElementsByName(`_method`)[0] && !document.getElementById(`captchaInput`)) {
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) if (key === `user`) WORKSPACE();
  });
  
  WORKSPACE();
}
