const HITS = {};
const EXPORT = {key: null, type: null};

function HIT_EXPORT() {
  if (document.querySelector(`a[href*="roupId="]`)) {
    HIT_EXPORT_MAIN();
  }
  if (document.getElementsByName(`groupId`)[0] && document.getElementsByName(`groupId`)[0].value !== ``) {
    HIT_EXPORT_CAPSULE();
  }
}

function EXPORTS_WRITE () {
  if (document.querySelector(`a[href*="roupId="]`)) {
    EXPORTS_WRITE_MAIN();
  }
  if (document.getElementsByName(`groupId`)[0] && document.getElementsByName(`groupId`)[0].value !== ``) {
    HIT_EXPORT_CAPSULE();
  }
}

function HIT_EXPORT_MAIN () {
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
      
      prevlink:
      `https://www.mturk.com/mturk/preview?groupId=${hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1]}`,
      
      pandlink:
      `https://www.mturk.com/mturk/previewandaccept?groupId=${hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1]}`,  
      
      quals: 
      hit.querySelector(`td[style="padding-right: 2em; white-space: nowrap;"]`) ?
      [...hit.querySelectorAll(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(element => `${element.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
      `None;`
    };
  }
  EXPORTS_WRITE_MAIN();
}

function HIT_EXPORT_CAPSULE () {
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
      
    prevlink:
    `https://www.mturk.com/mturk/preview?groupId=${document.getElementsByName(`groupId`)[0].value}`,
      
    pandlink:
    `https://www.mturk.com/mturk/previewandaccept?groupId=${document.getElementsByName(`groupId`)[0].value}`,
      
    quals:
    `${document.getElementsByClassName(`capsule_field_text`)[3].textContent.trim()};`,
  };
  EXPORTS_WRITE_CAPSULE();
}

function EXPORTS_WRITE_MAIN () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {hit_export: true};
    
    for (let hit of document.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
      const key = hit.querySelectorAll(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1];
      
      const html = 
            user.hit_export ?
            `<div class="dropdown">` +
              `<button class="dropbtn export">Export <span style="font-size: 75%;">▼</span></button>` +
              `<div id="myDropdown" class="dropdown-content">` +
                `<a class="export_hit" data-type="vb" data-key="${key}">Forum</a>` +
                `<a class="export_hit" data-type="vb_th" data-key="${key}">TH Direct</a>` +
                `<a class="export_hit" data-type="vb_mtc" data-key="${key}">MTC Direct</a>` +
              `</div>` +
            `</div>` : ``
      ;
      
      if (hit.getElementsByClassName(`exports`)[0]) {
        hit.getElementsByClassName(`exports`)[0].innerHTML = html;
      }
      else {
        hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(`beforebegin`, `<span class="exports">${html}</span>`);
      }
    }
  });
}

function EXPORTS_WRITE_CAPSULE () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {hit_export: true};
    
    const key = document.getElementsByName(`groupId`)[0].value;
      
    const html = 
          user.hit_export && HITS[key].reqid ?
          `<div class="dropdown">` +
            `<button type="button" class="dropbtn export">Export <span style="font-size: 75%;">▼</span></button>` +
            `<div id="myDropdown" class="dropdown-content">` +
              `<a class="export_hit" data-type="vb" data-key="${key}">Forum</a>` +
              `<a class="export_hit" data-type="vb_th" data-key="${key}">TH Direct</a>` +
              `<a class="export_hit" data-type="vb_mtc" data-key="${key}">MTC Direct</a>` +
            `</div>` +
          `</div>` : ``
      ;
      
    if (document.getElementsByClassName(`exports`)[0]) {
      document.getElementsByClassName(`exports`)[0].innerHTML = html;
    }
    else {
      document.getElementsByClassName(`capsulelink_bold`)[0].insertAdjacentHTML(`beforebegin`, `<span class="exports">${html}</span>`);
    }
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
        `[b][URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]:[/b] ` +
        `${attr(`Pay`, data.attrs.pay)} ${attr(`Fair`, data.attrs.fair)} ` +
        `${attr(`Comm`, data.attrs.comm)} ${attr(`Fast`, data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? `[color=green]` + data.tos_flags : `[color=red]` + data.tos_flags}[/color]][/b]\n` +
        (hit.desc ? `[b]Description:[/b] ${hit.desc}\n` : `[b]Auto Approval:[/b] ${hit.aa}\n`) +
        `[b]Time:[/b] ${hit.time}\n` +
        `[b]HITs Available:[/b] ${hit.avail}\n` +
        `[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]\n` +
        `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}\n` +
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
        `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]</p>` +
        `<p>[tr][td][CENTER][SIZE=2]HIT exported from [URL=http://mturksuite.com/]Mturk Suite[/URL] v${chrome.runtime.getManifest().version}[/SIZE][/CENTER][/td][/tr][/table]</p>`
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
  document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  document.getElementById(`clipboard`).select();
  
  try {
    const copy = document.execCommand(`copy`);
    if (copy) {
      alert(`HIT export has been copied to your clipboard.`);
    }
    else {
      prompt(`Copy the HIT Export below with Ctrl+C`, template);
    }
    document.body.removeChild(document.getElementById(`clipboard`));
  }
  catch (err) {
    prompt(`Copy the HIT Export below with Ctrl+C`, template);
    document.body.removeChild(document.getElementById(`clipboard`));
  }
}

function EXPORT_TO_TH (template) {
  chrome.runtime.sendMessage({msg: `send_th`, data: template});
}

function EXPORT_TO_MTC (template) {
  chrome.runtime.sendMessage({msg: `send_mtc`, data: template});
}

if (document.querySelector(`a[href*="roupId="]`) || document.getElementsByName(`groupId`)[0] && document.getElementsByName(`groupId`)[0].value !== ``) {
  chrome.runtime.onMessage.addListener( function (request) {
    if (request.msg == `hitexport.js`) {
      EXPORT_HIT(request.data);
    }
  }); 
  
  chrome.storage.onChanged.addListener( function (changes) {
    for (let key in changes) {
      if (key === `user`) {
        EXPORTS_WRITE();
      }
    }
  });
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
  
    const dropdowns = document.getElementsByClassName(`dropdown-content`);
    for (let i = 0; i < dropdowns.length; i ++) {dropdowns[i].style.display = `none`;}
  
    if (element.matches(`.dropbtn`)) {
      element.nextElementSibling.style.display = `block`;
    }
  
    if (element.matches(`.export_hit`)) {
      EXPORT.key = element.dataset.key;
      EXPORT.type = element.dataset.type;
      chrome.runtime.sendMessage({msg: `hitexport`, data: HITS[EXPORT.key].reqid});
    }
  });
  
  HIT_EXPORT();
}
