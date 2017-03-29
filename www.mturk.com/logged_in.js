const loggedIn = {
  execute () {    
    chrome.runtime.sendMessage({ 
      type: `loggedIn`,
      message `www`
    });
  }
};

if (document.querySelector(`a[href="/mturk/beginsignout"]`)) {
  loggedIn.execute();
}
