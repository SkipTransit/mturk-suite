const loggedIn = {
  execute: function () {
    console.log(`loggedIn.execute()`);
    
    chrome.runtime.sendMessage({ 
      type: `loggedIn`
    });
  }
};

if (document.querySelector(`a[href="/mturk/beginsignout"]`)) {
  loggedIn.execute();
}
