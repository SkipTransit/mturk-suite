const hitExport = {
  mts: {},
  hits: {},
  info: {},
  execute: function () {
    if (document.querySelector(`a[href*="roupId="]`)) {
      hitExport.executeMain();
    }
    if (document.getElementsByName(`groupId`)[0] && document.getElementsByName(`groupId`)[0].value !== ``) {
      hitExport.executeCapsule();
    }
  },
  executeMain: function () {
    let enabled = 0;
    if (hitExport.mts.hitExport.irc) enabled ++;
    if (hitExport.mts.hitExport.forum) enabled ++;
    if (hitExport.mts.hitExport.thDirect) enabled ++;
    if (hitExport.mts.hitExport.mtcDirect) enabled ++;
    
    for (let hit of document.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
      const key = hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1];
    
      hitExport.hits[key] = {
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
      
      let html = ``;
      
      if (enabled === 1) {
        html = 
          `<button class="MTS-export MTS-export_hit" type="button"` +
          (hitExport.mts.hitExport.irc ? `data-type="irc"` : ``) +
          (hitExport.mts.hitExport.forum ? `data-type="forum"` : ``) +
          (hitExport.mts.hitExport.thDirect ? `data-type="forum_th"` : ``) +
          (hitExport.mts.hitExport.mtcDirect ? `data-type="forum_mtc"` : ``) +
          `data-key="${key}">Export</button>`
        ;
      }
      
      if (enabled > 1) {
        html = 
          `<div class="MTS-dropdown">` +
            `<button class="MTS-dropdown-btn MTS-export" type="button">Export<span style="font-size: 75%;">▼</span></button>` +
            `<div class="MTS-dropdown-content">` +
              (hitExport.mts.hitExport.irc ? `<a class="MTS-export_hit" data-type="irc" data-key="${key}">IRC</a>` : ``) +
              (hitExport.mts.hitExport.forum ? `<a class="MTS-export_hit" data-type="forum" data-key="${key}">Forum</a>` : ``) +
              (hitExport.mts.hitExport.thDirect ? `<a class="MTS-export_hit" data-type="thDirect" data-key="${key}">TH Direct</a>` : ``) +
              (hitExport.mts.hitExport.mtcDirect ? `<a class="MTS-export_hit" data-type="mtcDirect" data-key="${key}">MTC Direct</a>` : ``) +
            `</div>` +
          `</div>`
        ;
      }
      
      if (hit.querySelector(`mts-exports`)) {
        hit.querySelector(`mts-exports`).innerHTML = html;
      }
      else {
        hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(`beforebegin`, `<mts-exports>${html}</mts-exports>`);
      }
    }
  },
  executeCapsule: function () {
    let enabled = 0;
    if (hitExport.mts.hitExport.irc) enabled ++;
    if (hitExport.mts.hitExport.forum) enabled ++;
    if (hitExport.mts.hitExport.thDirect) enabled ++;
    if (hitExport.mts.hitExport.mtcDirect) enabled ++;
    
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

    hitExport.hits[key] = {
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
  
    let html = ``;
      
    if (enabled === 1) {
        html = 
          `<button class="MTS-export MTS-export_hit" type="button"` +
          (hitExport.mts.hitExport.irc ? `data-type="irc"` : ``) +
          (hitExport.mts.hitExport.forum ? `data-type="forum"` : ``) +
          (hitExport.mts.hitExport.thDirect ? `data-type="forum_th"` : ``) +
          (hitExport.mts.hitExport.mtcDirect ? `data-type="forum_mtc"` : ``) +
          `data-key="${key}">Export</button>`
        ;
      }
      
      if (enabled > 1) {
        html = 
          `<div class="MTS-dropdown">` +
            `<button class="MTS-dropdown-btn MTS-export" type="button">Export<span style="font-size: 75%;">▼</span></button>` +
            `<div class="MTS-dropdown-content">` +
              (hitExport.mts.hitExport.irc ? `<a class="MTS-export_hit" data-type="irc" data-key="${key}">IRC</a>` : ``) +
              (hitExport.mts.hitExport.forum ? `<a class="MTS-export_hit" data-type="forum" data-key="${key}">Forum</a>` : ``) +
              (hitExport.mts.hitExport.thDirect ? `<a class="MTS-export_hit" data-type="thDirect" data-key="${key}">TH Direct</a>` : ``) +
              (hitExport.mts.hitExport.mtcDirect ? `<a class="MTS-export_hit" data-type="mtcDirect" data-key="${key}">MTC Direct</a>` : ``) +
            `</div>` +
          `</div>`
        ;
      }
      
    if (document.querySelector(`mts-exports`)) {
      document.querySelector(`mts-exports`).innerHTML = html;
    }
    else {
      document.getElementsByClassName(`capsulelink_bold`)[0].insertAdjacentHTML(`beforebegin`, `<mts-exports>${html}</mts-exports>`);
    }
  },
  irc: function (msg) {
    const to1 = msg.to.to1, to2 = msg.to.to2, links = msg.links;
    const hit = hitExport.hits[hitExport.info.key];
    
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
    
    const exportTemplate = [
      `Req: ${hit.reqname} ${links.req}`,
      `Title: ${hit.title} ${links.preview}`,
      `Time: ${hit.time}`,
      `Avail: ${hit.avail}`,
      `Reward: ${hit.reward}`,
      `TO 1: ${to1Template}`,
      `TO 2: ${to2Template}`,
      `PANDA: ${links.panda}`
    ];
  
    hitExport.copyToClip(`${hit.quals.match(/Masters (.+ granted|Exists)/) ? `MASTERS • ` : ``}${exportTemplate.join(` • `)}`);
  },
  forum: function (msg) {
    const to1 = msg.to1, to2 = msg.to2;
    const hit = hitExport.hits[hitExport.info.key];
    
    function to1Rating (rating) {
      if (rating > 3.99) return `[color=#00cc00]${rating}[/color]`;
      if (rating > 2.99) return `[color=#cccc00]${rating}[/color]`;
      if (rating > 1.99) return `[color=#cc6600]${rating}[/color]`;
      if (rating > 0.00) return `[color=#cc0000]${rating}[/color]`;
      return `${rating}`;
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
  
    const exportTemplate = [
      `[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]`,
      `[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]`,
      `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])`,
      `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO 1[/url]:[/b] ${to1Template}`,
      `[b][url=https://turkopticon.info/requesters/${hit.reqid}]TO 2[/url]:[/b] ${to2Template}`,
      `[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}`,
      `[b]Time:[/b] ${hit.time}`,
      `[b]HITs Available:[/b] ${hit.avail}`,
      `[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]`,
      `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]`,
      `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr]`,
      `[/table]`
    ];
    
    switch (hitExport.info.type) {
      case `forum`:
        exportTemplate.splice(10, 1);
        hitExport.copyToClip(exportTemplate.join(`\n`));
        break;
      case `thDirect`:
        hitExport.thDirect(`<p>${exportTemplate.join(`</p><p>`)}</p>`);
        break;
      case `mtcDirect`:
        hitExport.mtcDirect(`<p>${exportTemplate.join(`</p><p>`)}</p>`);
        break;
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
  },
  copyToClip: function (msg) {
    document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${msg}</textarea>`);
    document.getElementById(`clipboard`).select();
  
    const copy = document.execCommand(`copy`);
    alert(copy ? `HIT export has been copied to your clipboard.` : msg);

    document.body.removeChild(document.getElementById(`clipboard`));
  },
  response (msg) {
    alert(msg);
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
      case `exportResponse`:
        hitExport.response(request.message);
        break;
    }
  });
  
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) {
      hitExport.mts = changes.settings.newValue;
      hitExport.execute();
    }
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    hitExport.mts = result.settings;
    hitExport.execute();
  });
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
  
    const dropdowns = document.getElementsByClassName(`MTS-dropdown-content`);
    for (let i = 0; i < dropdowns.length; i ++) dropdowns[i].style.display = `none`;
  
    if (element.matches(`.MTS-dropdown-btn`)) {
      element.nextElementSibling.style.display = `block`;
    }
    
    if (element.matches(`.MTS-export_hit`)) {
      hitExport.info.key = element.dataset.key;
      hitExport.info.type = element.dataset.type;
      
      if (hitExport.info.type.match(/irc/)) {
        chrome.runtime.sendMessage({
          type: `ircHitExport`,
          message: {
            reqid: hitExport.hits[hitExport.info.key].reqid,
            groupid: hitExport.hits[hitExport.info.key].groupid
          }
        });
      }
      if (hitExport.info.type.match(/forum|thDirect|mtcDirect/)) {
        chrome.runtime.sendMessage({
          type: `forumHitExport`,
          message: hitExport.hits[hitExport.info.key].reqid
        });
      }
    }
  });
}
