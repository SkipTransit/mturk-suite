const OVERVIEW = { all: 0, all_val: 0, sub: 0, sub_val: 0, app: 0, app_val: 0, ret: 0, ret_val: 0, bonus: 0 };
const BREAKDOWN = {};

function WRITE () {
  chrome.runtime.sendMessage({ msg: `bonus` });
  
  chrome.storage.local.get(`hits`, function (result) {
    const hits = result.hits || {};
    
    // Overview
    for (let key in hits) {
      OVERVIEW.all ++;
      OVERVIEW.all_val += +hits[key].reward.replace(/[^0-9.]/g, ``);
      
      if (hits[key].status.match(/Submitted|Paid|Approved|Pending/)) {
        OVERVIEW.sub ++;
        OVERVIEW.sub_val += +hits[key].reward.replace(/[^0-9.]/g, ``);
        
        if (hits[key].status.match(/Paid|Approved/)) {
          OVERVIEW.app ++;
          OVERVIEW.app_val += +hits[key].reward.replace(/[^0-9.]/g, ``);
        }
        else if (hits[key].status.match(/Submitted|Pending/)) {
          const apped = IS_APPROVED(hits[key].autoapp, hits[key].submitted);
          if (apped) {
            OVERVIEW.app ++;
            OVERVIEW.app_val += +hits[key].reward.replace(/[^0-9.]/g, ``);
          }
        }
      }
      else if (hits[key].status.match(/Returned/)) {
        OVERVIEW.ret ++;
        OVERVIEW.ret_val += +hits[key].reward.replace(/[^0-9.]/g, ``);
      }
    }
    
    document.getElementById(`all`).textContent = OVERVIEW.all;
    document.getElementById(`all_val`).textContent = `$${OVERVIEW.all_val.toFixed(2)}`;
    
    document.getElementById(`sub`).textContent = OVERVIEW.sub;
    document.getElementById(`sub_val`).textContent = `$${OVERVIEW.sub_val.toFixed(2)}`;
    
    document.getElementById(`app`).textContent = OVERVIEW.app;
    document.getElementById(`app_val`).textContent = `$${OVERVIEW.app_val.toFixed(2)}`;
    
    document.getElementById(`ret`).textContent = OVERVIEW.ret;
    document.getElementById(`ret_val`).textContent = `$${OVERVIEW.ret_val.toFixed(2)}`;
    
    document.getElementById(`bonus`).textContent = OVERVIEW.bonus.toFixed(2);
    
    for (let id of [`tpe1`, `tpe2`, `tpe3`]) document.getElementById(id).textContent = `$${OVERVIEW.sub_val.toFixed(2)}`;
    for (let id of [`tpb1`, `tpb2`, `tpb3`]) document.getElementById(id).innerHTML = OVERVIEW.bonus !== 0 ? `+ Bonuses: <u>$${OVERVIEW.bonus.toFixed(2)}</u> = <u>$${(OVERVIEW.sub_val + OVERVIEW.bonus).toFixed(2)}</u>` : ``;
    
    // Requester Breakdown
    for (let key in hits) {
      if (hits[key].status.match(/(Submitted|Paid|Approved|Pending)/)) {
        const id = hits[key].reqid;
        
        if (!BREAKDOWN[id]) {
          BREAKDOWN[id] = {
            reqname : hits[key].reqname,
            reqid   : hits[key].reqid,
            hits    : 1,
            reward  : +hits[key].reward.replace(/[^0-9.]/g, ``)
          };
        }
        else {
          BREAKDOWN[id].hits ++;
          BREAKDOWN[id].reward += +hits[key].reward.replace(/[^0-9.]/g, ``);
        }
      }
    }
    
    const breakdown_sorted = Object.keys(BREAKDOWN).sort( (a, b) => BREAKDOWN[a].reward - BREAKDOWN[b].reward);
    for (let i = breakdown_sorted.length - 1; i > -1; i --) {
      let hit = BREAKDOWN[breakdown_sorted[i]];
      
      document.getElementById(`requester_tbody`).insertAdjacentHTML(`beforeend`,
        `<tr>` +
          `<td><a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&${hit.reqname !== hit.reqid ? `requesterId=${hit.reqid}` : `searchWords=${hit.reqid.replace(/ /, `+`)}`}" target="_blank">${hit.reqname}</td>` +
          `<td>${hit.hits}</td>` +
          `<td>$${hit.reward.toFixed(2)}</td>` +
        `</tr>`
      );
    }
    
    // Detailed Breakdown
    const sorted = Object.keys(hits).sort( (a, b) => {return hits[a].viewed - hits[b].viewed;});
    for (let i = 0; i < sorted.length; i ++) {
      let hit = hits[sorted[i]], contact = ``, reqlink = ``, color = ``, source = ``, autoapp = ``, pend = false, trclass = ``;
      
      if (hit.status.match(/Paid|Approved/)) {
        color = `green`;  trclass = `success`;
      }
      else if (hit.status.match(/Pending|Submitted/)) {
        color = `orange`; pend = true;  trclass = `warning`;
      }
      else if (hit.status.match(/Rejected/)) {
        color = `red`; trclass = `danger`;
      }
      else if (hit.status.match(/Accepted|Previewed/)) {
      }
      if (hit.source) {
        source = `<a href="${hit.source}" target="_blank"><span class="glyphicon glyphicon-new-window" aria-hidden="true" data-toggle="tooltip" data-placement="right" title="Opens the HIT source in a new window."></span></a> `;
      }
      if (pend) {
        if (hit.autoapp && hit.submitted) {
          autoapp = APPROVES_WHEN(hit.autoapp, hit.submitted);
        }
        else {
          autoapp = `There is no AA data for this HIT.`;
        }
      }
      
      if (hit.reqname !== hit.reqid) {
        contact =
          `<a href="https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}&hitId=${hit.hitid}&requesterName=${hit.reqname}&subject=Regarding+Amazon+Mechanical+Turk+HIT+${hit.hitid}" target="_blank">` +
            `<span class="glyphicon glyphicon-envelope" aria-hidden="true" data-toggle="tooltip" data-placement="right" title="Contact the requester about this HIT."></span>` +
          `</a>`
        ;
        reqlink =
          `<a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit.reqid}" target="_blank">${hit.reqname}</a>`
        ;
      }
      else {
        contact =
          `<span class="glyphicon glyphicon-envelope text-muted" aria-hidden="true" data-toggle="tooltip" data-placement="right" title="Sync to be able to contact requester."></span>`
        ;
        reqlink =
          `<a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit.reqid.replace(/ /, `+`)}" target="_blank">${hit.reqname}</a>`
        ;
      }
      
      document.getElementById(`detailed_tbody`).insertAdjacentHTML(`beforeend`, 
        `<tr class="${status} ${trclass}">` +
          `<td>${contact} ${reqlink}</div></td>` +
          `<td>${source} ${hit.title}</td>` +
          `<td>${hit.reward}</td>` +
          `<td style="color: ${color};" data-toggle="tooltip" data-placement="left" title="${autoapp}">${hit.status.split(/\s/)[0]}</td>` +
        `</tr>`
      );
    }
  
    $(document.querySelectorAll(`[data-toggle="tooltip"]`)).tooltip();
  });  
}

function IS_APPROVED (aa, sub) {
  const autoapp = Number(aa);
  const submit  = Number(sub);
  const current = new Date().getTime() / 1000;
  const remain  = Math.round(submit + autoapp - current);
  return remain > 0 ? false : true;
}

function APPROVES_WHEN (aa, sub) {
  let willapp = `This HIT will approve in `;
  const autoapp = Number(aa);
  const submit  = Number(sub);
  const current = new Date().getTime() / 1000;
  const remain  = Math.round(submit + autoapp - current);

  if (remain > 0) {
    const dd = Math.floor((remain / (60 * 60 * 24)));
    const hh = Math.floor((remain / (60 * 60)) % 24);
    const mm = Math.floor((remain / (60)) % 60);
    const ss = remain % 60;
        
    willapp +=
      (dd === 0 ? `` : dd + (dd > 1 ? ` days ` : ` day `)) +
      (hh === 0 ? `` : hh + (hh > 1 ? ` hours ` : ` hour `)) +
      (mm === 0 ? `` : mm + (mm > 1 ? ` minutes ` : ` minute `)) +
      (ss === 0 ? `` : ss + (ss > 1 ? ` seconds ` : ` second `))
    ;
  }
  else {
    willapp = `This HIT should be approved.`;
  }
  return willapp;
}

function SYNC_PROGRESS (current, total) {
  const width = total === `???` ? 0 : Math.round(current / total * 100);
  for (let id of [`overview`, `requester`, `detailed`]) {
    document.getElementById(id).innerHTML =
      `<div class="text-center">` +
        `<h1>Syncing page ${current} of ${total}</h1>` +
      `</div>` +
      `<div class="progress">` +
        `<div class="progress-bar" role="progressbar" aria-valuenow="${width}" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: ${width}%">${width}%</div>` +
      `</div>`
    ;
  }
}

function BONUS (starting, current) {
  OVERVIEW.bonus = current - starting;
  document.getElementById(`bonus`).textContent = `$${OVERVIEW.bonus.toFixed(2)}`;
  for (let id of [`tpb1`, `tpb2`, `tpb3`]) document.getElementById(id).innerHTML = OVERVIEW.bonus !== 0 ? `+ Bonuses: <u>$${OVERVIEW.bonus.toFixed(2)}</u> = <u>$${(OVERVIEW.sub_val + OVERVIEW.bonus).toFixed(2)}</u>` : ``;
}

function EXPORT_OVERVIEW () {
  const template = 
    `[b]Today's Projected Earnings: $${OVERVIEW.sub_val.toFixed(2)}[/b] ${OVERVIEW.bonus !== 0 ? `[b]+ Bonuses: $${OVERVIEW.bonus.toFixed(2)} = $${(OVERVIEW.sub_val + OVERVIEW.bonus).toFixed(2)}[/b]` : ``} [SIZE=2](Exported from [URL=http://mturksuite.com/]Mturk Suite[/URL] v${chrome.runtime.getManifest().version})[/SIZE]\n\n` +
    `[spoiler=Today's Projected Earnings - Overview]\n` +
    `[table]\n` +
    `[tr][th][b]&#8291;[/b][/th][th][b]HITs[/b][/th][th][b]Value[/b][/th][/tr]\n` +
    `[tr][td]Viewed[/td][td]${OVERVIEW.all}[/td][td]$${OVERVIEW.all_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Submitted[/td][td]${OVERVIEW.sub}[/td][td]$${OVERVIEW.sub_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Approved[/td][td]${OVERVIEW.app}[/td][td]$${OVERVIEW.app_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Returned[/td][td]${OVERVIEW.ret}[/td][td]$${OVERVIEW.ret_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Bonuses[/td][td]N/A[/td][td]$${OVERVIEW.bonus.toFixed(2)}[/td][/tr]\n` +
    `[/table]\n` +
    `[/spoiler]`
  ;
  
  COPY_TO_CLIPBOARD(template);
}

function EXPORT_BREAKDOWN () {
  let template = 
    `[b]Today's Projected Earnings: $${OVERVIEW.sub_val.toFixed(2)}[/b] ${OVERVIEW.bonus !== 0 ? `[b]+ Bonuses: $${OVERVIEW.bonus.toFixed(2)} = $${(OVERVIEW.sub_val + OVERVIEW.bonus).toFixed(2)}[/b]` : ``} [SIZE=2](Exported from [URL=http://mturksuite.com/]Mturk Suite[/URL] v${chrome.runtime.getManifest().version})[/SIZE]\n\n` +
    `[spoiler=Today's Projected Earnings - Requester Breakdown]\n` +
    `[table]\n` +
    `[tr][th][b]Requester[/b][/th][th][b]HITs[/b][/th][th][b]Value[/b][/th][/tr]\n`
  ;
   
  const sorted = Object.keys(BREAKDOWN).sort( (a, b) => BREAKDOWN[a].reward - BREAKDOWN[b].reward);
  
  for (let i = sorted.length - 1; i > -1; i --) {
    let hit = BREAKDOWN[sorted[i]];
    
    template +=
      `[tr]` +
      `[td][url=https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&${hit.reqname !== hit.reqid ? `requesterId=${hit.reqid}` : `searchWords=${hit.reqid.replace(/ /, `+`)}`}]${hit.reqname}[/url][/td]` +
      `[td]${hit.hits}[/td]` +
      `[td]$${hit.reward.toFixed(2)}[/td]` +
      `[/tr]\n`
    ;
  }
  
  template += `[/table][/spoiler]`;
  
  COPY_TO_CLIPBOARD(template);
}

function COPY_TO_CLIPBOARD (template) {
  document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  document.getElementById(`clipboard`).select();
  
  const copy = document.execCommand(`copy`);
  alert(copy ? `Export has been copied to your clipboard.` : template);

  document.body.removeChild(document.getElementById(`clipboard`));
}

document.addEventListener(`DOMContentLoaded`, function () {
  chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    switch (request.msg) {
      case `sync_tpe_running`:
        SYNC_PROGRESS(request.data.current, request.data.total);
        break;
      case `sync_tpe_done`:
        window.location.reload();
        break;
      case `bonus`:
        BONUS(request.data.starting, request.data.current);
        break;
    }
  });

  document.addEventListener(`click`, function (event) {
    const element = event.target;
      
    if (element.matches(`#export_overview`)) {
      EXPORT_OVERVIEW();
    }
    if (element.matches(`#export_breakdown`)) {
      EXPORT_BREAKDOWN();
    }
    if (element.matches(`#sync`)) {
      SYNC_PROGRESS(1, `???`);
      chrome.runtime.sendMessage({msg: `sync_tpe`});
    }
    if (element.matches(`#close`)) {
      chrome.runtime.sendMessage({msg: `close_tpe_menu`});
    }
  });

  WRITE();
});
