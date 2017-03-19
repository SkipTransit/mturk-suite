function loggedIn () {
  chrome.runtime.sendMessage({ 
    type: `loggedIn`
  });
}

if (document.querySelector(`a[href="/mturk/beginsignout"]`)) {
  loggedIn();
}
