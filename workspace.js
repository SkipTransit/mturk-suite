document.addEventListener('DOMContentLoaded', () => {
  if (!$('[name="userCaptchaResponse"]').length) {
    WORKSPACE();
  }
});

const WORKSPACE = () => {
  console.log('workspace');
  let $workspace;
  const $iframe = $('iframe');
  const $wrapper = $('#hit-wrapper');
  const $timer = $('#theTime');

  //if (document.querySelectorAll('input[name="isAccepted"][value="true"]').length) {
    if ($iframe.length) {
      $iframe.height('100vh');
      $iframe.focus();
      $workspace = $iframe;
    }
    else if ($wrapper.length) {
      $workspace = $wrapper;
    }
    $workspace[0].scrollIntoView();
    
 // }
//  else if (timer) {
  //  timer.scrollIntoView();
//  }
};
