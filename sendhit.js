document.addEventListener('DOMContentLoaded', () => {
  if ($('input[name="isAccepted"]').length) {
    sendhit();
  }
});

const sendhit = () => {
  const reqname  = $('input[name="prevRequester"]').val() || null;
  const reqid    = $('input[name="requesterId"]').val() || reqname;
  const title    = $('.capsulelink_bold').text().trim();
  const reward   = $('input[name="prevReward"]').val().replace(/USD/, '$');
  const autoapp  = $('input[name="hitAutoAppDelayInSeconds"]').val();

  const hitid    = $('input[name="hitId"]').val();
  const assignid = $('input[name="assignmentId"]').val();
  const status   = $('input[name="isAccepted"]').val() === 'true' ? 'Accepted' : 'Previewed';

  const timer    = $('#theTime').text().trim();
  const accepted = whenwas(timer);
  const date     = mturk_date(accepted);

  const source = $('iframe').prop('src') || null;

  const data = {
    reqname   : reqname,
    reqid     : reqid,
    title     : title,
    reward    : reward,
    autoapp   : autoapp,
    status    : status,

    hitid     : hitid,
    assignid  : assignid,

    source    : source,

    date      : date,
    viewed    : new Date().getTime(),

    submitted : null
  };

  chrome.runtime.sendMessage({msg: 'sendhit', data: data});
};

// Get the date string for when the HIT was accepted
const whenwas = (time) => {
  const split = time.split(/:| /);
  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let milli = 0;
  if (split.length == 3) {
    hours = parseInt(split[0], 10);
    minutes = parseInt(split[1], 10);
    seconds = parseInt(split[2], 10);
  }
  if (split.length == 4) {
    days = parseInt(split[0], 10);
    hours = parseInt(split[1], 10);
    minutes = parseInt(split[2], 10);
    seconds = parseInt(split[3], 10);
  }
  milli = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  return Date.now() - milli;
};

// Get the date in PST
const mturk_date = (time) => {
  const given = new Date(time);
  const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
  const offset = dst() === true ? '-7' : '-8';
  const amz = new Date(utc + (3600000 * offset));
  const day = (amz.getDate()) < 10 ? '0' + (amz.getDate()).toString() : (amz.getDate()).toString();
  const month = (amz.getMonth() + 1) < 10 ? '0' + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
  const year = (amz.getFullYear()).toString();
  return month + day + year;
};

// Check if DST
const dst = () => {
  const today = new Date();
  const year = today.getFullYear();
  let start = new Date('March 14, ' + year + ' 02:00:00');
  let end = new Date('November 07, ' + year + ' 02:00:00');
  let day = start.getDay();
  start.setDate(14 - day);
  day = end.getDay();
  end.setDate(7 - day);
  return (today >= start && today < end) ? true : false;
};
