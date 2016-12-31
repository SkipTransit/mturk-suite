document.addEventListener(`DOMContentLoaded`, function () {
  if ($(`input[name="isAccepted"]`).length) {
    SEND_HIT();
  }
});

function SEND_HIT () {
  const reqname  = $(`input[name="prevRequester"]`).val() || null;
  const reqid    = $(`input[name="requesterId"]`).val() || reqname;
  const title    = $(`.capsulelink_bold`).text().trim();
  const reward   = $(`input[name="prevReward"]`).val().replace(/USD/, `$`);
  const autoapp  = $(`input[name="hitAutoAppDelayInSeconds"]`).val();
  const hitid    = $(`.popup-header > input[name="hitId"]`).val();
  const assignid = $(`.popup-header > input[name="assignmentId"]`).val();
  const status   = $(`.popup-header > input[name="isAccepted"]`).val() === `true` ? `Accepted` : `Previewed`;
  const source   = $(`iframe`).prop(`src`) || null;
  const timer    = $(`#theTime`).text().trim();
  const accepted = WHEN_ACCEPTED(timer);
  const date     = MTURK_DATE(accepted);
  
  const data = {
    reqname: reqname,
    reqid: reqid,
    title: title,
    reward: reward,
    autoapp: autoapp,
    hitid: hitid,
    assignid: assignid,
    status: status,
    source: source,
    date: date,
    viewed: new Date().getTime(),
    submitted: null
  };

  chrome.runtime.sendMessage({msg: `sendhit`, data: data});
}

function WHEN_ACCEPTED (time) {
  const split = time.split(/:| /);
  const days = split.length == 4 ? parseInt(split[0], 10) : 0;
  const hours = split.length == 4 ? parseInt(split[1], 10) : parseInt(split[0], 10);
  const minutes = split.length == 4 ? parseInt(split[2], 10) : parseInt(split[1], 10);
  const seconds = split.length == 4 ? parseInt(split[3], 10) : parseInt(split[2], 10);
  const milli = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  return Date.now() - milli;
}

function MTURK_DATE (time) {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = DST() === true ? `-7` : `-8`;
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
  const year = (amz.getFullYear()).toString();
  return month + day + year;
}

function DST () {
  const today = new Date();
  const year = today.getFullYear();
  let start = new Date(`March 14, ${year} 02:00:00`);
  let end = new Date(`November 07, ${year} 02:00:00`);
  let day = start.getDay();
  start.setDate(14 - day);
  day = end.getDay();
  end.setDate(7 - day);
  return (today >= start && today < end) ? true : false;
}
