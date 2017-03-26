const workspace = {
  mts: {},
  execute: function () {
    console.log(`workspace.execute()`);
    
    const container = document.getElementsByClassName(`task-question-iframe-container`)[0];

    if (settings.workspace && document.getElementsByName(`_method`)[0].value === `delete`) {
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
  }
};

if (document.getElementsByName(`_method`)[0] && !document.getElementById(`captchaInput`)) {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) {
      workspace.mts = changes.settings.newValue;
      workspace.execute();
    }
  });

  chrome.storage.local.get(`settings`, function (result) {
    workspace.mts = result.settings;
    workspace.execute();
  });
}
