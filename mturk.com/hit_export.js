document.addEventListener(`DOMContentLoaded`, function () {
  if ($(`a[href*="roupId="]`).length ) {
    HIT_EXPORT_MAIN();
  }
  if ($(`input[name="groupId"]`).length && $(`input[name="groupId"]`).val() !== ``) {
    HIT_EXPORT_CAPSULE();
  }
});

chrome.extension.onMessage.addListener( function (request) {
  if (request.msg == `hitexport.js`) {
    EXPORT_HIT(request.data);
  }
});

chrome.storage.onChanged.addListener( function (changes) {
  for (let key in changes) {
    if (key === `user`) {
      if ($(`a[href*="roupId="]`).length ) {
        EXPORTS_WRITE_MAIN();
      }
      if ($(`input[name="groupId"]`).length && $(`input[name="groupId"]`).val() !== ``) {
        EXPORTS_WRITE_CAPSULE();
      }
    }
  }
});

const HITS = {};
const EXPORT = {key: null, type: null};

function HIT_EXPORT_MAIN () {
  for (let element of $(`table[cellpadding="0"][cellspacing="5"][border="0"]`).children().children()) {
    const hit = $(element);
    const key = hit.find(`a[href*="roupId="]`).prop(`href`).match(/roupId=(.*)/)[1];
    
    HITS[key] = {
      reqname:
      hit.find(`.capsule_field_title:contains(Requester:)`).next().text().trim(),
      
      reqid:
      hit.find(`a[href*="requesterId="]`).prop(`href`).split(`requesterId=`)[1],
      
      groupid: 
      hit.find(`a[href*="roupId="]`).prop(`href`).match(/roupId=(.*)/)[1],
      
      prevlink:
      `https://www.mturk.com/mturk/preview?groupId=${hit.find(`a[href*="roupId="]`).prop(`href`).match(/roupId=(.*)/)[1]}`,
      
      pandlink:
      `https://www.mturk.com/mturk/previewandaccept?groupId=${hit.find(`a[href*="roupId="]`).prop(`href`).match(/roupId=(.*)/)[1]}`,
      
      title:
      hit.find(`a.capsulelink`).text().trim(),
      
      desc:
      hit.find(`.capsule_field_title:contains(Description:)`).next().text().trim(),
      
      time:
      hit.find(`.capsule_field_title:contains(Time Allotted:)`).next().text().trim(),
      
      reward:
      hit.find(`.capsule_field_title:contains(Reward:)`).next().text().trim(),
      
      avail:
      hit.find(`.capsule_field_title:contains(HITs Available:)`).next().text().trim(),
      
      quals: 
      hit.find(`td[style="padding-right: 2em; white-space: nowrap;"]`).length ?
      hit.find(`td[style="padding-right: 2em; white-space: nowrap;"]`).map( function () { return $(this).text().trim().replace(/\s+/g, ` `) + `;`; }).get().join(` `):
      `None;`
    };
  }
  
  EXPORTS_WRITE_MAIN();
}

function HIT_EXPORT_CAPSULE () {
  const key = $(`input[name="groupId"]`).val();
  
  const aa = $(`input[name="hitAutoAppDelayInSeconds"]`).val();
  const days = Math.floor((aa / (60 * 60 * 24)));
  const hours = Math.floor((aa / (60 * 60)) % 24);
  const mins = Math.floor((aa / 60) % 60);
  const secs = aa % 60;
  
  let aa_time = 
      (days  === 0 ? `` : days  + ` day(s)`) +
      (hours === 0 ? `` : hours + ` hour(s)`) +
      (mins  === 0 ? `` : mins  + ` minute(s)`) +
      (secs  === 0 ? `` : secs  + ` seconds(s)`);

  if (aa === 0) {
    aa_time = `0 seconds`;
  }

  HITS[key] = {
    reqname:
    $(`.capsule_field_title:contains(Requester:)`).next().text().trim(),
      
    reqid:
    $(`input[name="requesterId"]`).length ?
    $(`input[name="requesterId"]`).val():
    $(`a[href^="/mturk/return?"]`).prop(`href`).match(/requesterId=(\w+)/) ?
    $(`a[href^="/mturk/return?"]`).prop(`href`).match(/requesterId=(\w+)/)[1]:
    null,
      
    groupid: 
    $(`input[name="groupId"]`).val(),
      
    prevlink:
    `https://www.mturk.com/mturk/preview?groupId=${$(`input[name="groupId"]`).val()}`,
      
    pandlink:
    `https://www.mturk.com/mturk/previewandaccept?groupId=${$(`input[name="groupId"]`).val()}`,
      
    title:
    $(`.capsulelink_bold`).text().trim(),
      
    aa: aa_time,
      
    time:
    $(`.capsule_field_title:contains(Duration:)`).next().text().trim(),
      
    reward:
    $(`.capsule_field_title:contains(Reward:)`).next().text().trim().split(` `)[0],
      
    avail:
    $(`.capsule_field_title:contains(HITs Available:)`).next().text().trim(),
      
    quals:
    `${$(`.capsule_field_title:contains(Qualifications Required:)`).next().text().trim()};`,
  };
  
  EXPORTS_WRITE_CAPSULE();
}

function EXPORTS_WRITE_MAIN () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {hit_export: true};
    
    for (let element of $(`table[cellpadding="0"][cellspacing="5"][border="0"]`).children().children()) {
      const hit = $(element);
      const key = hit.find(`a[href*="roupId="]`).prop(`href`).match(/roupId=(.*)/)[1];
      
      const html = 
            user.hit_export ?
            `<div class="dropdown">` +
            `  <button class="dropbtn export">Export <span style="font-size: 75%;">▼</span></button>` +
            `  <div id="myDropdown" class="dropdown-content">` +
            `    <a class="vb" data-key="${key}">Forum</a>` +
            `    <a class="vb_th" data-key="${key}">TH Direct</a>` +
            `    <a class="vb_mtc" data-key="${key}">MTC Direct</a>` +
            `  </div>` +
            `</div>` : ``
      ;
      
      if (hit.find(`.exports`).length) return hit.find(`.exports`).html(html);
      hit.find(`a[id^="capsule"]`).before(`<span class="exports">${html}</span>`);
    }
  });
}

function EXPORTS_WRITE_CAPSULE () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {hit_export: true};
    
      const key = $(`input[name="groupId"]`).val();
      
      const html = 
            user.hit_export && HITS[key].reqid ?
            `<div class="dropdown">` +
            `  <button type="button" class="dropbtn export">Export <span style="font-size: 75%;">▼</span></button>` +
            `  <div id="myDropdown" class="dropdown-content">` +
            `    <a class="vb" data-key="${key}">Forum</a>` +
            `    <a class="vb_th" data-key="${key}">TH Direct</a>` +
            `    <a class="vb_mtc" data-key="${key}">MTC Direct</a>` +
            `  </div>` +
            `</div>` : ``
      ;
      
    if ($(`.exports`).length) return $(`.exports`).html(html);
    $(`.capsulelink_bold`).before(`<span class="exports">${html}</span>`);
  });
}

function EXPORT_HIT (data) {
  const hit = HITS[EXPORT.key];
  
  function attr (type, rating) {
    let color = `#B30000`;
    if (rating > 1.99) {color = `#B37400`;}
    if (rating > 2.99) {color = `#B3B300`;}
    if (rating > 3.99) {color = `#00B300`;}
    if (rating < 0.01) {color = `grey`; rating = `N/A`;}
    return `[b][${type}: [color=${color}]${rating}[/color]][/b]`;
  }

  const template =
        `[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]\n` +
        `[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])\n` +
        `[b][URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]:[b] ` +
        `${attr(`Pay`, data.attrs.pay)} ${attr(`Fair`, data.attrs.fair)} ` +
        `${attr(`Comm`, data.attrs.comm)} ${attr(`Fast`, data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? `[color=green]` + data.tos_flags : `[color=red]` + data.tos_flags}[/color]][/b]\n` +
        (hit.desc ? `[b]Description:[/b] ${hit.desc}\n` : `[b]Auto Approval:[/b] ${hit.aa}\n`) +
        `[b]Time:[/b] ${hit.time}\n` +
        `[b]HITs Available:[/b] ${hit.avail}\n` +
        `[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]\n` +
        `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`)}\n` +
        `[/td][/tr][/table]`
  ;
  
  const direct_template =
        `<p>[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]</p>` +
        `<p>[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])</p>` +
        `<p>[b][URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]:[/b] ` +
        `${attr(`Pay`, data.attrs.pay)} ${attr(`Fair`, data.attrs.fair)} ` +
        `${attr(`Comm`, data.attrs.comm)} ${attr(`Fast`, data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? `[color=green]` + data.tos_flags : `[color=red]` + data.tos_flags}[/color]][/b]</p>` +
        `<p>${(hit.desc ? `[b]Description:[/b] ${hit.desc}` : `[b]Auto Approval:[/b] ${hit.aa}`)}</p>` +
        `<p>[b]Time:[/b] ${hit.time}</p>` +
        `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
        `<p>[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]</p>` +
        `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`)}[/td][/tr]</p>` +
        `<p>[tr][td][CENTER][SIZE=2]HIT posted from Mturk Suite[/SIZE][/CENTER][/td][/tr][/table]</p>`
  ;

  if (EXPORT.type === `vb`) {
    EXPORT_TO_CLIP(template);
  }
  
  if (EXPORT.type === `vb_th`) {
    const confirm_post = prompt(
      `Do you want to post this HIT to TurkerHub.com?\n\n` +
      `To post a comment with this HIT, fill the box below.\n\n` +
      `To post this HIT, click "Ok"`,
      ``
    );
    if (confirm_post !== null) {
      EXPORT_TO_TH(`${direct_template}<p>${confirm_post}</p>`);
    }
  }
  
  if (EXPORT.type === `vb_mtc`) {
    const confirm_post = prompt(
      `Do you want to post this HIT to MturkCrowd.com?\n\n` +
      `To post a comment with this HIT, fill the box below.\n\n` +
      `To post this HIT, click "Ok"`,
      ``
    );
    if (confirm_post !== null) {
      EXPORT_TO_MTC(`${direct_template}<p>${confirm_post}</p>`);
    }
  }
}

function EXPORT_TO_CLIP (template) {
  $(`body`).append(`<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  $(`#clipboard`).select();
  document.execCommand(`Copy`);
  $(`#clipboard`).remove();
  alert(`HIT export has been copied to your clipboard.`);
}

function EXPORT_TO_TH (template) {
  chrome.runtime.sendMessage({msg: `send_th`, data: template});
}

function EXPORT_TO_MTC (template) {
  chrome.runtime.sendMessage({msg: `send_mtc`, data: template});
}

document.onclick = function (event) {
  const e = event.target;
  
  if (e.matches(`.dropbtn`)) {
    $(`.dropdown-content`).hide();
    $(e).next().show();
  } 
  if (!e.matches(`.dropbtn`)) {
    $(`.dropdown-content`).hide();
  }
};

$(`html`).on(`click`, `.vb`, function () {
  const key = $(this).data(`key`);
  EXPORT.key = key;
  EXPORT.type = `vb`;
  chrome.runtime.sendMessage({msg: `hitexport`, data: HITS[key].reqid});
});

$(`html`).on(`click`, `.vb_th`, function () {
  const key = $(this).data(`key`);
  EXPORT.key = key;
  EXPORT.type = `vb_th`;
  chrome.runtime.sendMessage({msg: `hitexport`, data: HITS[key].reqid});
});

$(`html`).on(`click`, `.vb_mtc`, function () {
  const key = $(this).data(`key`);
  EXPORT.key = key;
  EXPORT.type = `vb_mtc`;
  chrome.runtime.sendMessage({msg: `hitexport`, data: HITS[key].reqid});
});
