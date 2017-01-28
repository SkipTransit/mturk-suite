function HIT_CAPSULE () {
  const reqname = document.getElementsByClassName(`capsule_field_text`)[0].textContent;
  const reqid =
    document.getElementsByName(`requesterId`)[0] ?
    document.getElementsByName(`requesterId`)[0].value :
    document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
    document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
    null
  ;
  
  const aa = document.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value;
  const dd = Math.floor(aa / 86400);
  const hh = Math.floor(aa / 3600 % 24);
  const mm = Math.floor(aa / 60 % 60);

  const aa_time =   
      (dd > 0 ? `${dd} day${dd > 1 ? `s` : ``} ` : ``) +
      (hh > 0 ? `${hh} hour${hh > 1 ? `s` : ``} ` : ``) +
      (mm > 0 ? `${mm} minute${mm > 1 ? `s` : ``} ` : ``)
  ;

  document.getElementsByClassName(`capsule_field_text`)[0].parentElement.insertAdjacentHTML(`beforeend`,
    `<td><img src="/media/spacer.gif" width="25" height="1" border="0"></td>` +
    `<td align="right" valign="top" nowrap="" class="capsule_field_title">AA:&nbsp;&nbsp;</td>` +
    `<td align="left" valign="top" nowrap="" class="capsule_field_text">${aa !== 0 ? aa_time : `0 seconds`}</td>`
  );
  
  document.getElementsByClassName(`capsule_field_text`)[0].innerHTML =
    `<a href="/mturk/searchbar?selectedSearchType=hitgroups&${reqid ? `requesterId=${reqid}` : `searchWords=${reqname.trim().replace(/ /g, `+`)}`}" target="_blank">${reqname}</a>`
  ;
}

if (document.getElementsByName(`isAccepted`)[0]) {
  HIT_CAPSULE();
}
