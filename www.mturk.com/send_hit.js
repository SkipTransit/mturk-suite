function SEND_HIT () {
  const hit = {
    reqname: 
      document.getElementsByName(`prevRequester`)[0].value,
    reqid: 
      document.getElementsByName(`requesterId`)[0] ?
      document.getElementsByName(`requesterId`)[0].value :
      document.getElementsByName(`prevRequester`)[0].value,
    title: 
      document.getElementsByClassName(`capsulelink_bold`)[0].textContent.trim(),
    reward: 
      document.getElementsByName(`prevReward`)[0].value.replace(/USD/, `$`),
    autoapp: 
      document.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value,
    hitid: 
      document.querySelector(`[class="popup-header"] > [name="hitId"]`).value,
    assignid: 
      document.querySelector(`[class="popup-header"] > [name="assignmentId"]`).value,
    status: 
      document.querySelector(`[class="popup-header"] > [name="isAccepted"]`).value === `true` ? 
      `Accepted` : 
      `Previewed`,
    source: 
      document.getElementsByTagName(`iframe`)[0] ?
      document.getElementsByTagName(`iframe`)[0].src :
      null,
    date:
      MTURK_DATE(WHEN_ACCEPTED(document.getElementById(`theTime`).textContent)),
    viewed:
      new Date().getTime(),
    submitted:
      null
  };
  chrome.runtime.sendMessage({ msg: `sendhit`, data: hit });
}

function WHEN_ACCEPTED (time) {
  const split = time.split(/:| /);
  const dd = split.length === 4 ? +(split[0]) : 0;
  const hh = split.length === 4 ? +(split[1]) : +(split[0]);
  const mm = split.length === 4 ? +(split[2]) : +(split[1]);
  const ss = split.length === 4 ? +(split[3]) : +(split[2]);
  const ms = (dd * 86400 + hh * 3600 + mm * 60 + ss) * 1000;
  return Date.now() - ms;
}

function MTURK_DATE (time) {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = DST() === true ? `-7` : `-8`;
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : (amz.getMonth() + 1).toString();
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

if (document.getElementsByName(`isAccepted`)[0]) {
  SEND_HIT();
}
