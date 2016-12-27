document.addEventListener(`DOMContentLoaded`, () => {
  ACCEPT_LINKS();
});

const ACCEPT_LINKS = () => {
  for (let element of $(`a[href^="/mturk/preview?groupId="]`)) {
    $(element).before(
      `<a href="${element.href.replace(`preview?`, `previewandaccept?`)}" target="_blank" style="padding-right: 5px;">Accept</a>`
    );
  }
};