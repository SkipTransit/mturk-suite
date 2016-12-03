document.addEventListener('DOMContentLoaded', () => {
  workerid();
});

const workerid = () => {
  const WorkerID = $('.orange_text_right:contains(Your Worker ID: )').text().split('ID: ')[1];
  if (WorkerID) {
    chrome.runtime.sendMessage({msg: 'WorkerID', data: WorkerID});
  }
};