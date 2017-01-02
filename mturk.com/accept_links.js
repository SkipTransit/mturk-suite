function ACCEPT_LINKS () {
  for (let element of document.querySelectorAll(`a[href^="/mturk/preview?groupId="]`)) {
    element.insertAdjacentHTML(`beforebegin`,
      `<a href="${element.href.replace(`preview?`, `previewandaccept?`)}" target="_blank" style="padding-right: 10px;">Accept</a>`
    );
  }
}

if (document.querySelector(`a[href^="/mturk/preview?groupId="]`)) {
  ACCEPT_LINKS();
}
