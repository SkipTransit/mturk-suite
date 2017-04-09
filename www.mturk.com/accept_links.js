const acceptLinks = {
  init () {    
    for (let elem of doc.querySelectorAll(`a[href^="/mturk/preview?groupId="]`)) {
      elem.insertAdjacentHTML(
        `beforebegin`,
        `<a href="${elem.href.replace(`preview?`, `previewandaccept?`)}" target="_blank" style="padding-right: 5px;">Accept</a>`
      );
    }
  }
};

if (doc.querySelector(`a[href^="/mturk/preview?groupId="]`)) {
  acceptLinks.init();
}
