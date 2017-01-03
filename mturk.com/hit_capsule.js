function HIT_CAPSULE () {
  const reqid =
        document.getElementsByName(`requesterId`)[0] ?
        document.getElementsByName(`requesterId`)[0].value :
        document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
        document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1]:
        null
  ;
  const reqname = document.getElementsByClassName(`capsule_field_text`)[0].textContent;

  const aa = document.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value;
  const d = Math.floor(aa / 86400);
  const h = Math.floor(aa / 3600 % 24);
  const m = Math.floor(aa / 60 % 60);

  let aa_time =   
      (d > 0 ? `${d} day${d > 1 ? `s` : ``} ` : ``) +
      (h > 0 ? `${h} hour${h > 1 ? `s` : ``} ` : ``) +
      (m > 0 ? `${m} minute${m > 1 ? `s` : ``} ` : ``)
  ;

  document.getElementsByClassName(`capsule_field_text`)[0].parentElement.insertAdjacentHTML(`beforeend`,
    `<td><img src="/media/spacer.gif" width="25" height="1" border="0"></td>` +
    `<td align="right" valign="top" nowrap="" class="capsule_field_title">AA:&nbsp;&nbsp;</td>` +
    `<td align="left" valign="top" nowrap="" class="capsule_field_text">${aa !== 0 ? aa_time : `0 seconds`}</td>`
  );
  
  document.getElementsByClassName(`capsule_field_text`)[0].innerHTML =
    `<a href="/mturk/searchbar?selectedSearchType=hitgroups&${reqid ? `requesterId=${reqid}` : `searchWords=${reqname.replace(/ /g, `+`)}`}" target="_blank">${reqname}</a>`
  ;
}

if (document.getElementsByName(`isAccepted`)[0]) {
  HIT_CAPSULE();
}
