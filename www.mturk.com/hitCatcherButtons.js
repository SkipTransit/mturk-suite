function hitCatcherButtons () {
  for (let hit of document.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
    const key = hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1];
    
    hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(`beforebegin`,
      `<button type="button" class="hitCatcherButton"
        data-nickname="${hit.getElementsByClassName(`requesterIdentity`)[0].textContent.trim()}"
        data-hitsetid="${hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1]}"
      >HC</a>`
    );
  }
}

if (document.querySelector(`a[href^="/mturk/preview?groupId="]`)) {
  document.addEventListener(`click`, function (event) {
    const element = event.target;
  
    if (element.matches(`.hitCatcherButton`)) {
      chrome.storage.local.set({
        addWatcher: {
          nickName: element.dataset.nickname,
          hitSetId: element.dataset.hitsetid,
          panda: true
        }
      });
    }
    
  });
  
  hitCatcherButtons();
}