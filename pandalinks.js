document.addEventListener('DOMContentLoaded', () => {
  if ($('a[href^="/mturk/preview?groupId="]').length) {
    pandalinks();
  }
});

const pandalinks = () => {
  for (let element of $('a[href^="/mturk/preview?groupId="]')) {
    $(element).before(
      `<a href="${element.href.replace('preview?', 'previewandaccept?')}" target="_blank" style="padding-right: 20px;">Accept</a>`
    );
  }
};
