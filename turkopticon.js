document.addEventListener('DOMContentLoaded', () => {
  if ($('a:contains(View a HIT in this group)').length) {
    turkopticon();
  }
});

const Ids = [];
const turkopticon = () => {
  for (let href of $('a[href*="&requesterId="]')) {
    const requesterId = href.href.split('&requesterId=')[1];
    Ids.push(requesterId);
  }
  chrome.runtime.sendMessage({msg: 'turkopticon', data: Ids});
};