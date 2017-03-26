const acceptLinks = {
  execute: function () {
    console.log(`acceptLinks.execute()`);
    
    for (let element of document.querySelectorAll(`a[href^="/mturk/preview?groupId="]`)) {
      element.insertAdjacentHTML(
        `beforebegin`,
        `<a href="${element.href.replace(`preview?`, `previewandaccept?`)}" target="_blank" style="padding-right: 5px;">Accept</a>`
      );
    }
  }
};

if (document.querySelector(`a[href^="/mturk/preview?groupId="]`)) {
  acceptLinks.execute();
}
