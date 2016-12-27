document.addEventListener(`DOMContentLoaded`, () => {
  if ($(`a[href*="roupId="]`).length) {
    HIT_EXPORT_MAIN();
  }
  if ($('[name="groupId"]').length && $('[name="groupId"]').val() !== '') {
    HIT_EXPORT_CAPSULE();
  }
});

chrome.extension.onMessage.addListener( (request) => {
  if (request.msg == `hitexport.js`) {
    VB_EXPORT(request.data);
  }
});

chrome.storage.onChanged.addListener( (changes) => {
  for (let key in changes) {
    if (key === `user`) {
      EXPORTS_WRITE();
    }
  }
});

const hits = {};
const EXPORT = {key: null, type: null};

const HIT_EXPORT_MAIN = () => {
  for (let element of $(`table[cellpadding="0"][cellspacing="5"][border="0"]`).children().children()) {
    const hit = $(element);

    const requesterIdentity = hit.find(`.requesterIdentity`).text();
    const requesterId = hit.find(`a[href*="&requesterId="]`).prop(`href`).split(`&requesterId=`)[1];

    const groupId = hit.find('a[href*="roupId="]').prop('href').match(/roupId=(.*)/)[1];
    const preview = `https://www.mturk.com/mturk/preview?groupId=${groupId}`;
    const panda = `https://www.mturk.com/mturk/previewandaccept?groupId=${groupId}`;
  
    const title = hit.find(`a.capsulelink`).text();
    const description = hit.find(`.capsule_field_title:contains(Description:)`).next().text();
    const time = hit.find(`.capsule_field_title:contains(Time Allotted:)`).next().text();
    const reward = hit.find(`.capsule_field_title:contains(Reward:)`).next().text();
    const available = hit.find(`.capsule_field_title:contains(HITs Available:)`).next().text();

    let qualifications = ``;
    for (let qual of hit.find(`td[style="padding-right: 2em; white-space: nowrap;"]`)) {
      qualifications += qual.textContent.trim().replace(/\s+/g, ` `) + `; `;
    }

    const key = groupId;

    hits[key] = {
      reqname  : requesterIdentity.trim(),
      reqid    : requesterId.trim(),
      groupid  : groupId.trim(),
      prevlink : preview !== `` ? preview.trim() : `https://www.mturk.com/mturk/searchbar?requesterId=${requesterId}`,
      pandlink : panda !== `` ? panda.trim() : `https://www.mturk.com/mturk/searchbar?requesterId=${requesterId}`,
      title    : title.trim(),
      desc     : description.trim(),
      time     : time.trim(),
      reward   : reward.trim(),
      avail    : available.trim(),
      quals    : qualifications !== `` ? qualifications.trim() : `None;`,
    };
  }
  
  EXPORTS_WRITE_MAIN();
};

const EXPORTS_WRITE_MAIN = () => {
  chrome.storage.local.get(`user`, (data) => {
    const user = data.user || {hit_export: true};
    
    for (let element of $(`table[cellpadding="0"][cellspacing="5"][border="0"]`).children().children()) {
      const hit = $(element);
      const key = hit.find('a[href*="roupId="]').prop('href').match(/roupId=(.*)/)[1];
      
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
      
      if (hit.find(`.exports`).length) {
        hit.find(`.exports`).html(html);
      }
      else {
        hit.find(`a[id^="capsule"]`).before(`<span class="exports">${html}</span>`);
      }
    }
  });
};

const HIT_EXPORT_CAPSULE = () => {
  const key = $(`input[name="groupId"]`).val();
  
  const aa = $(`input[name="hitAutoAppDelayInSeconds"]`).eq(0).val();
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

  hits[key] = {
    reqname:
    $(`.capsule_field_title:contains(Requester:)`).next().text().trim(),
      
    reqid:
    $(`input[name="requesterId"]`).val(),
      
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
    $(`.capsule_field_title:contains(Qualifications Required:)`).next().text().trim() + `;`,
  };
  
  EXPORTS_WRITE_CAPSULE();
};

const EXPORTS_WRITE_CAPSULE = () => {
  chrome.storage.local.get(`user`, (data) => {
    const user = data.user || {hit_export: true};
    
      const key = $(`input[name="groupId"]`).val();
      
      const html = 
            user.hit_export ?
            `<div class="dropdown">` +
            `  <button type="button" class="dropbtn export">Export <span style="font-size: 75%;">▼</span></button>` +
            `  <div id="myDropdown" class="dropdown-content">` +
            `    <a class="vb" data-key="${key}">Forum</a>` +
            `    <a class="vb_th" data-key="${key}">TH Direct</a>` +
            `    <a class="vb_mtc" data-key="${key}">MTC Direct</a>` +
            `  </div>` +
            `</div>` : ``
      ;
      
    $(`.capsulelink_bold`).before(`<span class="exports">${html}</span>`);
  });
};

$(`html`).on(`click`, `.vb`, function () {
  const key = $(this).data(`key`);
  EXPORT.key = key;
  EXPORT.type = `vb`;
  chrome.runtime.sendMessage({msg: `hitexport`, data: hits[key].reqid});
});

$(`html`).on(`click`, `.vb_th`, function () {
  const key = $(this).data(`key`);
  EXPORT.key = key;
  EXPORT.type = `vb_th`;
  chrome.runtime.sendMessage({msg: `hitexport`, data: hits[key].reqid});
});

$(`html`).on(`click`, `.vb_mtc`, function () {
  const key = $(this).data(`key`);
  EXPORT.key = key;
  EXPORT.type = `vb_mtc`;
  chrome.runtime.sendMessage({msg: `hitexport`, data: hits[key].reqid});
});

const VB_EXPORT = (data) => {
  const hit = hits[EXPORT.key];
  
  const attr = (type, rating) => {
    let color = `#B30000`;
    if (rating > 1.99) {color = `#B37400`;}
    if (rating > 2.99) {color = `#B3B300`;}
    if (rating > 3.99) {color = `#00B300`;}
    if (rating < 0.01) {color = `grey`; rating = `N/A`;}
    return `[b][${type}: [color=${color}]${rating}[/color]][/b]`;
  };
  
  const template =
        `[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]\n` +
        `[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])\n` +
        `([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ` +
        `${attr(`Pay`, data.attrs.pay)} ${attr(`Fair`, data.attrs.fair)} ` +
        `${attr(`Comm`, data.attrs.comm)} ${attr(`Fast`, data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? `[color=green]` + data.tos_flags : `[color=red]` + data.tos_flags}[/color]][/b]\n` +
        (hit.desc ? `[b]Description:[/b] ${hit.desc}\n` : `[b]Auto Approval:[/b] ${hit.aa}\n`) +
        `[b]Time:[/b] ${hit.time}\n` +
        `[b]HITs Available:[/b] ${hit.avail}\n` +
        `[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]\n` +
        `[b]Qualifications:[/b] ${hit.quals}\n` +
        `[/td][/tr][/table]`
  ;
  
  const direct_template =
        `<p>[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]</p>` +
        `<p>[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])</p>` +
        `<p>([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ` +
        `${attr(`Pay`, data.attrs.pay)} ${attr(`Fair`, data.attrs.fair)} ` +
        `${attr(`Comm`, data.attrs.comm)} ${attr(`Fast`, data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? `[color=green]` + data.tos_flags : `[color=red]` + data.tos_flags}[/color]][/b]\n</p>` +
        (hit.desc ? `<p>[b]Description:[/b] ${hit.desc}</p>` : `<p>[b]Auto Approval:[/b] ${hit.aa}</p>`) +
        `<p>[b]Time:[/b] ${hit.time}</p>` +
        `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
        `<p>[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]</p>` +
        `<p>[b]Qualifications:[/b] ${hit.quals}[/td][/tr]</p>` +
        `<p>[tr][td][CENTER][SIZE=2]HIT posted from Mturk Suite[/SIZE][/CENTER][/td][/tr][/table]</p>`
  ;

  if (EXPORT.type === `vb`) {
    EXPORT_TO_CLIP(template);
  }
  
  if (EXPORT.type === `vb_th`) {
    const confirm_post = prompt(`Do you want to post this HIT to TurkerHub.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"`, ``);
    if (confirm_post !== null) {
      SEND_TH(direct_template + `<p>${confirm_post}</p>`);
    }
  }
  
  if (EXPORT.type === `vb_mtc`) {
    const confirm_post = prompt(`Do you want to post this HIT to MturkCrowd.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"`, ``);
    if (confirm_post !== null) {
      SEND_MTC(direct_template + `<p>${confirm_post}</p>`);
    }
  }
};

const EXPORT_TO_CLIP = (template) => {
  $(`body`).append(`<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  $(`#clipboard`).select();
  document.execCommand(`Copy`);
  $(`#clipboard`).remove();
  alert(`HIT export has been copied to your clipboard.`);
};

const SEND_TH = (template) => {
  chrome.runtime.sendMessage({msg: `send_th`, data: template});
};

const SEND_MTC = (template) => {
  chrome.runtime.sendMessage({msg: `send_mtc`, data: template});
};

document.onclick = (event) => {
  const e = event.target;
  
  if (e.matches('.dropbtn')) {
    $('.dropdown-content').hide();
    $(e).next().show();
  } 
  if (!e.matches('.dropbtn')) {
    $('.dropdown-content').hide();
  }
}
