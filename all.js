chrome.extension.onMessage.addListener( (request, sender, sendResponse) => {
  if (request.msg == 'WorkerID') {
    $(':text:focus, textarea:focus').val($(':focus').val() + request.data);
  }
});
