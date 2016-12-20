chrome.extension.onMessage.addListener( (request, sender, sendResponse) => {
  if (request.msg == 'WorkerID') {
    PASTE_WORKER_ID($(':focus'), request.data);
    //$(':text:focus, textarea:focus').val(($(':focus').val() + request.data).trim());
  }
});

const PASTE_WORKER_ID = (element, workerid) => {
  $('body').append(`<textarea id="clipboard" style="opacity: 0;">${workerid}</textarea>`);
  $('#clipboard').select();
  document.execCommand('Copy');
  $('#clipboard').remove();
  element[0].focus();
  document.execCommand('Paste');
};
