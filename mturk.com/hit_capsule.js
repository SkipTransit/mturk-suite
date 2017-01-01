document.addEventListener(`DOMContentLoaded`, function () {
  if ($(`input[name="isAccepted"]`).length) {
    HIT_CAPSULE();
  }
});

function HIT_CAPSULE () {
  const reqid =
        $(`input[name="requesterId"]`).length ?
        $(`input[name="requesterId"]`).val():
        $(`a[href^="/mturk/return?"]`).prop(`href`).match(/requesterId=(\w+)/) ?
        $(`a[href^="/mturk/return?"]`).prop(`href`).match(/requesterId=(\w+)/)[1]:
        null
  ;
  const reqname = $(`.capsule_field_text`).eq(0).text().trim();

  const aa = $(`input[name="hitAutoAppDelayInSeconds"]`).val();
  const d = Math.floor((aa / (60 * 60 * 24)));
  const h = Math.floor((aa / (60 * 60)) % 24);
  const m = Math.floor((aa / 60) % 60);

  let aa_time =   
      (d > 0 ? `${d} day${d > 1 ? `s` : ``} ` : ``) +
      (h > 0 ? `${h} hour${h > 1 ? `s` : ``} ` : ``) +
      (m > 0 ? `${m} minute${m > 1 ? `s` : ``} ` : ``)
  ;

  if (aa === 0) {
    aa_time = `0 seconds`;
  }

  $(`.capsule_field_text`).eq(0).parent().append(
    `<td>` +
    `  <img src="/media/spacer.gif" width="25" height="1" border="0">` +
    `</td>` +
    `<td align="right" valign="top" nowrap="" class="capsule_field_title">AA:&nbsp;&nbsp;</td>` +
    `<td align="left" valign="top" nowrap="" class="capsule_field_text">${aa_time}</td>`
  );

  
  $(`.capsule_field_text`).eq(0).html(
    `<a href="/mturk/searchbar?selectedSearchType=hitgroups&${(reqid ? `requesterId=${reqid}` : `searchWords=${reqname.replace(/ /g, `+`)}`)}" target="_blank">${reqname}</a>`
  );
}
