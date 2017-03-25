const HITS = {};
const EXPORT = {
  key: null,
  type: null
};

function HIT_EXPORT (settings) {
  if (document.querySelector(`a[href*="roupId="]`)) {
    HIT_EXPORT_MAIN(settings);
  }
  if (document.getElementsByName(`groupId`)[0] && document.getElementsByName(`groupId`)[0].value !== ``) {
    HIT_EXPORT_CAPSULE(settings);
  }
}

function HIT_EXPORT_MAIN (settings) {
  for (let hit of document.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
    const key = hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1];
    
    HITS[key] = {
      reqname: 
        hit.getElementsByClassName(`requesterIdentity`)[0].textContent.trim(),
      reqid:
        hit.querySelector(`[href*="requesterId="]`).getAttribute(`href`).match(/requesterId=(.*)/)[1],      
      title:
        hit.getElementsByClassName(`capsulelink`)[0].textContent.trim(),
      desc:
        hit.getElementsByClassName(`capsule_field_text`)[5].textContent.trim(),
      time:
        hit.getElementsByClassName(`capsule_field_text`)[2].textContent.trim(),
      reward:
        hit.getElementsByClassName(`capsule_field_text`)[3].textContent.trim(),
      avail:
        hit.getElementsByClassName(`capsule_field_text`)[4].textContent.trim(),
      groupid:
        hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1],
      quals: 
        hit.querySelector(`td[style="padding-right: 2em; white-space: nowrap;"]`) ?
        [...hit.querySelectorAll(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(element => `${element.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
        `None;`
    };
  }
  
  EXPORTS_WRITE_MAIN(settings);
}

function HIT_EXPORT_CAPSULE (settings) {
  const key = document.getElementsByName(`groupId`)[0].value;
  
  const aa = document.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value;
  const dd = Math.floor(aa / 86400);
  const hh = Math.floor(aa / 3600 % 24);
  const mm = Math.floor(aa / 60 % 60);

  const aa_time =   
    (dd > 0 ? `${dd} day${dd > 1 ? `s` : ``} ` : ``) +
    (hh > 0 ? `${hh} hour${hh > 1 ? `s` : ``} ` : ``) +
    (mm > 0 ? `${mm} minute${mm > 1 ? `s` : ``} ` : ``)
  ;

  HITS[key] = {
    reqname:
      document.getElementsByClassName(`capsule_field_text`)[0].textContent.trim(),
    reqid:
      document.getElementsByName(`requesterId`)[0] ?
      document.getElementsByName(`requesterId`)[0].value :
      document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
      document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
      null,
    title:
      document.getElementsByClassName(`capsulelink_bold`)[0].textContent.trim(),
    aa:
      aa !== 0 ? aa_time : `0 seconds`,
    time:
      document.getElementsByClassName(`capsule_field_text`)[3].textContent.trim(),
    reward:
      document.getElementsByClassName(`reward`)[1].textContent.trim(),
    avail:
      document.getElementsByClassName(`capsule_field_text`)[2].textContent.trim(),
    groupid:
      document.getElementsByName(`groupId`)[0].value,
    quals:
      `${document.getElementsByClassName(`capsule_field_text`)[5].textContent.trim()};`
  };
  
  EXPORTS_WRITE_CAPSULE(settings);
}

function EXPORTS_WRITE_MAIN (settings) {
  if  (!settings) settings = { hit_export: { irc: true, forum: true, forum_th: true, forum_mtc: true } };
        
  let enabled = 0;
  if (settings.hit_export.irc) enabled ++;
  if (settings.hit_export.forum) enabled ++;
  if (settings.hit_export.forum_th) enabled ++;
  if (settings.hit_export.forum_mtc) enabled ++;
    
  for (let hit of document.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
    const key = hit.querySelectorAll(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1];

    let html = ``;
      
    if (enabled === 1) {
      html = 
        `<button class="MTS-export MTS-export_hit" type="button"` +
        (settings.hit_export.irc ? `data-type="irc"` : ``) +
        (settings.hit_export.forum ? `data-type="forum"` : ``) +
        (settings.hit_export.forum_th ? `data-type="forum_th"` : ``) +
        (settings.hit_export.forum_mtc ? `data-type="forum_mtc"` : ``) +
        `data-key="${key}">Export</button>`
      ;
    }
      
    if (enabled > 1) {
      html = 
        `<div class="MTS-dropdown">` +
          `<button class="MTS-dropdown-btn MTS-export" type="button">Export<span style="font-size: 75%;">▼</span></button>` +
          `<div class="MTS-dropdown-content">` +
            (settings.hit_export.irc ? `<a class="MTS-export_hit" data-type="irc" data-key="${key}">IRC</a>` : ``) +
            (settings.hit_export.forum ? `<a class="MTS-export_hit" data-type="forum" data-key="${key}">Forum</a>` : ``) +
            (settings.hit_export.forum_th ? `<a class="MTS-export_hit" data-type="forum_th" data-key="${key}">TH Direct</a>` : ``) +
            (settings.hit_export.forum_mtc ? `<a class="MTS-export_hit" data-type="forum_mtc" data-key="${key}">MTC Direct</a>` : ``) +
          `</div>` +
        `</div>`
      ;
    }

    if (hit.getElementsByClassName(`MTS-exports`)[0]) {
      hit.getElementsByClassName(`MTS-exports`)[0].innerHTML = html;
    }
    else {
      hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(`beforebegin`, `<span class="MTS-exports">${html}</span>`);
    }
  }
}

function EXPORTS_WRITE_CAPSULE (settings) {
  if  (!settings) settings = { hit_export: { irc: true, forum: true, forum_th: true, forum_mtc: true } };
        
  let enabled = 0;
  if (settings.hit_export.irc) enabled ++;
  if (settings.hit_export.forum) enabled ++;
  if (settings.hit_export.forum_th) enabled ++;
  if (settings.hit_export.forum_mtc) enabled ++;
    
  const key = document.getElementsByName(`groupId`)[0].value;
      
  let html = ``;
      
  if (enabled === 1) {
    html = 
      `<button class="MTS-export MTS-export_hit" type="button"` +
      (settings.hit_export.irc ? `data-type="irc"` : ``) +
      (settings.hit_export.forum ? `data-type="forum"` : ``) +
      (settings.hit_export.forum_th ? `data-type="forum_th"` : ``) +
      (settings.hit_export.forum_mtc ? `data-type="forum_mtc"` : ``) +
      `data-key="${key}">Export</button>`
    ;
  }
      
  if (enabled > 1) {
    html = 
      `<div class="MTS-dropdown">` +
      `<button class="MTS-dropdown-btn MTS-export" type="button">Export<span style="font-size: 75%;">▼</span></button>` +
        `<div class="MTS-dropdown-content">` +
          (settings.hit_export.irc ? `<a class="MTS-export_hit" data-type="irc" data-key="${key}">IRC</a>` : ``) +
          (settings.hit_export.forum ? `<a class="MTS-export_hit" data-type="forum" data-key="${key}">Forum</a>` : ``) +
          (settings.hit_export.forum_th ? `<a class="MTS-export_hit" data-type="forum_th" data-key="${key}">TH Direct</a>` : ``) +
          (settings.hit_export.forum_mtc ? `<a class="MTS-export_hit" data-type="forum_mtc" data-key="${key}">MTC Direct</a>` : ``) +
        `</div>` +
      `</div>`
    ;
  }
      
  if (document.getElementsByClassName(`MTS-exports`)[0]) {
    document.getElementsByClassName(`MTS-exports`)[0].innerHTML = html;
  }
  else {
    document.getElementsByClassName(`capsulelink_bold`)[0].insertAdjacentHTML(`beforebegin`, `<span class="MTS-exports">${html}</span>`);
  }
}

function FORUM_HIT_EXPORT (data) {
  const hit = HITS[EXPORT.key];

  function to (type, rating) {
    if (rating > 3.99) return `[b][${type}: [color=#00cc00]${rating}[/color]][/b]`;
    if (rating > 2.99) return `[b][${type}: [color=#cccc00]${rating}[/color]][/b]`;
    if (rating > 1.99) return `[b][${type}: [color=#cc6600]${rating}[/color]][/b]`;
    if (rating > 0.01) return `[b][${type}: [color=#cc0000]${rating}[/color]][/b]`;
    return `[b][${type}: [color=grey]N/A[/color]][/b]`;
  }

  const forum_template =
    `[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]\n` +
    `[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]\n` +
    `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])\n` +
    `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/url]:[/b] ` +
    `${to(`Pay`, data.attrs.pay)} ${to(`Fair`, data.attrs.fair)} ` +
    `${to(`Comm`, data.attrs.comm)} ${to(`Fast`, data.attrs.fast)} ` +
    `[b][Reviews: ${data.reviews}][/b] ` +
    `[b][ToS: [color=${data.tos_flags === 0 ? `green` : `red`}]${data.tos_flags}[/color]][/b]\n` +
    `[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}\n` +
    `[b]Time:[/b] ${hit.time}\n` +
    `[b]HITs Available:[/b] ${hit.avail}\n` +
    `[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]\n` +
    `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}\n` +
    `[/td][/tr][/table]`
  ;
  
  const direct_template =
    `<p>[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]</p>` +
    `<p>[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]</p>` +
    `<p>[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])</p>` +
    `<p>[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/url]:[/b] ` +
    `${to(`Pay`, data.attrs.pay)} ${to(`Fair`, data.attrs.fair)} ` +
    `${to(`Comm`, data.attrs.comm)} ${to(`Fast`, data.attrs.fast)} ` +
    `[b][Reviews: ${data.reviews}][/b] ` +
    `[b][ToS: [color=${data.tos_flags === 0 ? `green` : `red`}]${data.tos_flags}[/color]][/b]</p>` +
    `<p>[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}</p>` +
    `<p>[b]Time:[/b] ${hit.time}</p>` +
    `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
    `<p>[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]</p>` +
    `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]</p>` +
    `<p>[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]</p>`
  ;

  switch (EXPORT.type) {
    case `forum`: EXPORT_TO_CLIP(forum_template); break;
    case `forum_th`: EXPORT_TO_TH(direct_template); break;
    case `forum_mtc`: EXPORT_TO_MTC(direct_template); break;
  }
}

function IRC_HIT_EXPORT (info) {
  const hit = HITS[EXPORT.key];
  
  const template = 
    `${hit.quals.match(/Masters has been granted|Masters Exists/) ? `MASTERS • ` : ``}` +
    `Req: ${hit.reqname} ${info.links.req} • ` +
    `Title: ${hit.title} ${info.links.preview} • ` +
    `Time: ${hit.time} • ` +
    `Avail: ${hit.avail} • ` +
    `Reward: ${hit.reward} • ` +
    `TO: Pay=${info.to.attrs.pay} Fair=${info.to.attrs.fair} Comm=${info.to.attrs.comm} Fast=${info.to.attrs.fast} Reviews=${info.to.reviews} TOS=${info.to.tos_flags} ${info.links.to} • ` +
    `PANDA: ${info.links.panda}`
  ;
  
  EXPORT_TO_CLIP(template);
}

function EXPORT_TO_CLIP (template) {
  document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  document.getElementById(`clipboard`).select();
  
  const copy = document.execCommand(`copy`);
  alert(copy ? `HIT export has been copied to your clipboard.` : template);

  document.body.removeChild(document.getElementById(`clipboard`));
}

const hitExport = {
  irc: function (msg) {
    console.log(`hitExport.irc`, msg);
    const to1 = msg.to.to1, to2 = msg.to.to2, links = msg.links;
    const hit = HITS[EXPORT.key];
    
    const to1Template =
      to1
    ?
      `Pay=${to1.attrs.pay} ` +
      `Fast=${to1.attrs.fast} ` +
      `Comm=${to1.attrs.comm} ` +
      `Fair=${to1.attrs.fair} ` +
      `Reviews=${to1.reviews} ` +
      `TOS=${to1.tos_flags} ` +
      `${links.to1}`
    :
      `N/A ${links.to1}`
    ;
    
    const to2Template = 
      to2
    ?
      `Rate=${to2.recent.reward[1] > 0 ? `$${((to2.recent.reward[0] / to2.recent.reward[1]) * 60 ** 2).toFixed(2)}/hr` : `--/hr`} ` +
      `Rej=${to2.recent.rejected[0]} ` +
      `TOS=${to2.recent.tos[0]} ` +
      `${links.to2}`
    :
      `N/A ${links.to2}`
    ;
    
    const template = 
      `${hit.quals.match(/Masters has been granted|Masters Exists/) ? `MASTERS • ` : ``}` +
      `Req: ${hit.reqname} ${links.req} • ` +
      `Title: ${hit.title} ${links.preview} • ` +
      `Time: ${hit.time} • ` +
      `Avail: ${hit.avail} • ` +
      `Reward: ${hit.reward} • ` +
      `TO 1: ${to1Template} • ` +
      `TO 2: ${to2Template} • ` +
      `PANDA: ${links.panda}`
    ;
  
    EXPORT_TO_CLIP(template);
  },
  forum: function (msg) {
    const to1 = msg.to1, to2 = msg.to2;
    const hit = HITS[EXPORT.key];
    
    function to1Rating (rating) {
      if (rating > 3.99) return `[color=#00cc00]${rating}[/color]`;
      if (rating > 2.99) return `[color=#cccc00]${rating}[/color]`;
      if (rating > 1.99) return `[color=#cc6600]${rating}[/color]`;
      return `[color=#cc0000]${rating}[/color]`;
    }
    
    function to2Rating (rating) {
      if (rating[1] > 0) {
        const percent = Math.round(100 * rating[0] / rating[1]);
        
        if (percent > 79) return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`;
        if (percent > 59) return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`;
        if (percent > 39) return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`;
        return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`;
      }
      return `-- of 0`;
    }
    
    const to1Template =
      to1
    ?
      `[b][Pay: ${to1Rating(to1.attrs.pay)}][/b] ` +
      `[b][Fast: ${to1Rating(to1.attrs.fast)}][/b] ` +
      `[b][Comm: ${to1Rating(to1.attrs.comm)}][/b] ` +
      `[b][Fair: ${to1Rating(to1.attrs.fair)}][/b] ` +
      `[b][Reviews: ${to1.reviews}][/b] ` +
      `[b][ToS: [color=${to1.tos_flags === 0 ? `#00cc00` : `#cc0000`}]${to1.tos_flags}[/color]][/b]`
    :
      `Not Available`
    ;
    
    const to2Template = 
      to2
    ?
      `[b][Rate: ${to2.recent.reward[1] > 0 ? `$${((to2.recent.reward[0] / to2.recent.reward[1]) * 60 ** 2).toFixed(2)}/hr` : `--/hr`}][/b] ` +
      `[b][Pen: ${to2.recent.pending > 0 ? `${(to2.recent.pending / 86400).toFixed(2)} days` : `-- days`}][/b] ` +
      `[b][Res: ${to2Rating(to2.recent.comm)}][/b] ` +
      `[b][Rec: ${to2Rating(to2.recent.recommend)}][/b] ` +
      `[b][Rej: [color=${to2.recent.rejected[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.rejected[0]}[/color]][/b] ` +
      `[b][ToS: [color=${to2.recent.tos[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.tos[0]}[/color]][/b] ` +
      `[b][Brk: [color=${to2.recent.broken[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.broken[0]}[/color]][/b]`
    :
      `Not Available`
    ;
    
    const forumTemplate =
      `[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]\n` +
      `[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]\n` +
      `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])\n` +
      `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO 1[/url]:[/b] ${to1Template}\n` +
      `[b][url=https://turkopticon.info/requesters/${hit.reqid}]TO 2[/url]:[/b] ${to2Template}\n` +
      `[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}\n` +
      `[b]Time:[/b] ${hit.time}\n` +
      `[b]HITs Available:[/b] ${hit.avail}\n` +
      `[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]\n` +
      `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}\n` +
      `[/td][/tr][/table]`
    ;
    
    const directTemplate =
      `<p>[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]</p>` +
      `<p>[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]</p>` +
      `<p>[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])</p>` +
      `<p>[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO 1[/url]:[/b] ${to1Template}</p>` +
      `<p>[b][url=https://turkopticon.info/requesters/${hit.reqid}]TO 2[/url]:[/b] ${to2Template}</p>` +
      `<p>[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}</p>` +
      `<p>[b]Time:[/b] ${hit.time}</p>` +
      `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
      `<p>[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]</p>` +
      `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]</p>` +
      `<p>[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]</p>`
    ;
    
    switch (EXPORT.type) {
      case `forum`: EXPORT_TO_CLIP(forumTemplate); break;
      case `forum_th`: hitExport.thDirect(directTemplate); break;
      case `forum_mtc`: hitExport.mtcDirect(directTemplate); break;
    }
  },
  thDirect: function (msg) {
    const confirm_post = prompt(
      `Do you want to post this HIT to TurkerHub.com?\n\n` +
      `Want to add a comment about your HIT? Fill out the box below.\n\n` +
      `To send the HIT, click "Ok" or hit "Enter"`,
      ``
    );
  
    if (confirm_post !== null) {
      chrome.runtime.sendMessage({
        type: `hitExportThDirect`,
        message: `${msg}<p>${confirm_post}</p>`
      });
    }
  },
  mtcDirect: function (msg) {
    const confirm_post = prompt(
      `Do you want to post this HIT to MturkCrowd.com?\n\n` +
      `Want to add a comment about your HIT? Fill out the box below.\n\n` +
      `To send the HIT, click "Ok" or hit "Enter"`,
      ``
    );
    
    if (confirm_post !== null) {
      chrome.runtime.sendMessage({
        type: `hitExportMtcDirect`,
        message: `${msg}<p>${confirm_post}</p>`
      });
    }
  }
};

if (document.querySelector(`a[href*="roupId="]`) || document.getElementsByName(`groupId`)[0] && document.getElementsByName(`groupId`)[0].value !== ``) {
  chrome.runtime.onMessage.addListener( function (request) {
    switch (request.type) {
      case `ircHitExport`:
        hitExport.irc(request.message);
        break;
      case `forumHitExport`:
        hitExport.forum(request.message);
        break;
    }
  });
  
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) HIT_EXPORT(changes.settings.newValue);
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    HIT_EXPORT(result.settings);
  });
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
  
    const dropdowns = document.getElementsByClassName(`MTS-dropdown-content`);
    for (let i = 0; i < dropdowns.length; i ++) dropdowns[i].style.display = `none`;
  
    if (element.matches(`.MTS-dropdown-btn`)) {
      element.nextElementSibling.style.display = `block`;
    }
    
    if (element.matches(`.MTS-export_hit`)) {
      EXPORT.key = element.dataset.key;
      EXPORT.type = element.dataset.type;
      
      if (EXPORT.type.match(/irc/)) {
        chrome.runtime.sendMessage({
          type: `ircHitExport`,
          message: {
            reqid: HITS[EXPORT.key].reqid,
            groupid: HITS[EXPORT.key].groupid
          }
        });
      }
      if (EXPORT.type.match(/forum/)) {
        chrome.runtime.sendMessage({
          type: `forumHitExport`,
          message: HITS[EXPORT.key].reqid
        });
      }
    }
  });
}
