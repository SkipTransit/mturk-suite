document.addEventListener(`DOMContentLoaded`, function () {
  WRITE();
});

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  switch (request.msg) {
    case `sync_tpe_running`:
      SYNC_PROGRESS(request.data.current, request.data.total);
      break;
    case `bonus`:
      BONUS(request.data.starting, request.data.current);
      break;
  }
});

let tpeexport = ``;

const OVERVIEW = {
  all: 0, all_val: 0,
  sub: 0, sub_val: 0,
  app: 0, app_val: 0,
  ret: 0, ret_val: 0,
  bonus: 0
};

const BREAKDOWN = {
  bonus: {reqname: `Bonuses`, hits: `N/A`, reward: 0}
};

function WRITE () {
  $(`#overview`).html(
    `<h3>Loading Information.....</h3>`
  );
  
  $(`#requester`).html(
    `    <table class="table table-striped table-condensed table-bordered table-fixed table-requester">` +
    `      <thead>` +
    `        <tr>` +
    `          <th>Requester</th>` +
    `          <th>HITs</th>` +
    `          <th>Reward</th>` +
    `        </tr>` +
    `      </thead>` +
    `      <tbody id="requester_tbody"></tbody>` +
    `    </table>`
  );
  
  $(`#detailed`).html(
    `    <table class="table table-striped table-condensed table-bordered table-fixed table-detailed">` +
    `      <thead>` +
    `        <tr>` +
    `          <th>Requester</th>` +
    `          <th>Title</th>` +
    `          <th>Reward</th>` +
    `          <th>Status</th>` +
    `        </tr>` +
    `      </thead>` +
    `      <tbody id="detailed_tbody"></tbody>` +
    `    </table>`
  );
  
  chrome.runtime.sendMessage({msg: `bonus`});
  
  chrome.storage.local.get(`hits`, function (data) {
    const hits = data.hits || {};
    
    let breakdown_html = ``, detailed_html = ``;
    
    const total = Object.keys(hits).length; let total_pe = 0;
    let submitted = 0, submitted_pe = 0;
    let approved = 0, approved_pe = 0;
    let returned = 0, returned_pe = 0;
    
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
        if (hits[key].status.match(/Submitted|Pending/)) {
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
    
    document.getElementById(`overview`).innerHTML =
      `<div style="font-size: 20px; line-height: normal;">` +
      `  <br>` +
      `  <span><b>${OVERVIEW.all}</b> HITs have been viewed, submitted or returned today.</span>` +
      `  <br>` +
      `  <br>` +
      `  <span><b>${OVERVIEW.sub}</b> HITs have been submitted today for a total value of <b>$${OVERVIEW.sub_val.toFixed(2)}</b>.</span>` +
      `  <br>` +
      `  <br>` +
      `  <span><b>${OVERVIEW.app}</b> HITs have been approved today for a total value of <b>$${OVERVIEW.app_val.toFixed(2)}</b>.</span>` +
      `  <br>` +
      `  <br>` +
      `  <span><b>${OVERVIEW.ret}</b> HITs have been returned today for a total value of <b>$${OVERVIEW.ret_val.toFixed(2)}</b>.</span>` +
      `  <br>` +
      `  <br>` +
      `  <span>You have recieved <b id="bonus">$${OVERVIEW.bonus.toFixed(2)}</b> in bonuses today.</span>` +
      `</div>`
    ;
    
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
          BREAKDOWN[id].hits   += 1;
          BREAKDOWN[id].reward += +hits[key].reward.replace(/[^0-9.]/g, ``);
        }
      }
    }
    
    const breakdown_sorted = Object.keys(BREAKDOWN).sort( (a, b) => BREAKDOWN[a].reward - BREAKDOWN[b].reward);
    for (let i = breakdown_sorted.length - 1; i > -1; i --) {
      let hit = BREAKDOWN[breakdown_sorted[i]], reqlink = ``;
      
      if (hit.reqname !== hit.reqid) {
        reqlink =
          `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit.reqid}`
        ;
      }
      else {
        reqlink =
          `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit.reqid.replace(/ /, `+`)}`
        ;
      }

      breakdown_html +=
        `<tr>` +
        `  <td><a href="${reqlink}" target="_blank">${hit.reqname}</td>` +
        `  <td>${hit.hits}</td>` +
        `  <td>$${hit.reward.toFixed(2)}</td>` +
        `</tr>`
      ;
    }
    
    $(`#requester_tbody`).html(breakdown_html);
    
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
          `  <span class="glyphicon glyphicon-envelope" aria-hidden="true" data-toggle="tooltip" data-placement="right" title="Contact the requester about this HIT."></span>` +
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

      detailed_html +=
        `<tr class="${status} ${trclass}">` +
        `  <td>${contact} ${reqlink}</div></td>` +
        `  <td>${source} ${hit.title}</td>` +
        `  <td>${hit.reward}</td>` +
        `  <td style="color: ${color};" data-toggle="tooltip" data-placement="left" title="${autoapp}">${hit.status.split(/\s/)[0]}</td>` +
        `</tr>`
      ;
    }
  
    $(`#detailed_tbody`).html(detailed_html);
    $(`[data-toggle="tooltip"]`).tooltip();
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
  $(`#overview, #requester, #detailed`).html(
    `<div class="text-center">` +
    `  <h1>Syncing page ${current} of ${total}</h1>` +
    `</div>` +
    `<div class="progress">` +
    `  <div class="progress-bar" role="progressbar" aria-valuenow="${width}" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: ${width}%">${width}%</div>` +
    `</div>`
  );
}

function BONUS (starting, current) {
  OVERVIEW.bonus = BREAKDOWN.bonus.reward = current - starting;
  if (document.getElementById(`bonus`)) document.getElementById(`bonus`).textContent = `$${OVERVIEW.bonus.toFixed(2)}`;
}

function EXPORT_OVERVIEW () {
  const template = 
    `[b]Today's Projected Earnings: $${OVERVIEW.sub_val.toFixed(2)}[/b] ${OVERVIEW.bonus !== 0 ? `[b]+ Bonuses: $${OVERVIEW.bonus.toFixed(2)} = $${(OVERVIEW.sub_val + OVERVIEW.bonus).toFixed(2)}[/b]` : ``} [SIZE=2](Exported from [URL=http://mturksuite.com/]Mturk Suite[/URL] v${chrome.runtime.getManifest().version})[/SIZE]\n\n` +
    `[spoiler=Today's Projected Earnings - Overview]\n` +
    `[table]\n` +
    `[tr][th][b]&#8291;[/b][/th][th][b]HITs[/b][/th][th][b]Value[/b][/th][/tr]\n` +
    `[tr][td]All HITs[/td][td]${OVERVIEW.all}[/td][td]$${OVERVIEW.all_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Submitted[/td][td]${OVERVIEW.sub}[/td][td]$${OVERVIEW.sub_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Approved[/td][td]${OVERVIEW.app}[/td][td]$${OVERVIEW.app_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Returned[/td][td]${OVERVIEW.ret}[/td][td]$${OVERVIEW.ret_val.toFixed(2)}[/td][/tr]\n` +
    `[tr][td]Bonuses[/td][td]N/A[/td][td]$${OVERVIEW.bonus.toFixed(2)}[/td][/tr]\n` +
    `[/table]\n` +
    `[/spoiler]`
  ;
  
  COPY_TO_CLIPBOARD(template);
}

function EXPORT_REQUESTER_BREAKDOWN () {
  let template = 
    `[b]Today's Projected Earnings: $${OVERVIEW.sub_val.toFixed(2)}[/b] ${OVERVIEW.bonus !== 0 ? `[b]+ Bonuses: $${OVERVIEW.bonus.toFixed(2)} = $${(OVERVIEW.sub_val + OVERVIEW.bonus).toFixed(2)}[/b]` : ``} [SIZE=2](Exported from [URL=http://mturksuite.com/]Mturk Suite[/URL] v${chrome.runtime.getManifest().version})[/SIZE]\n\n` +
    `[spoiler=Today's Projected Earnings - Requester Breakdown]\n` +
    `[table]\n` +
    `[tr][th][b]Requester[/b][/th][th][b]HITs[/b][/th][th][b]Value[/b][/th][/tr]\n`
  ;
   
  const sorted = Object.keys(BREAKDOWN).sort( (a, b) => BREAKDOWN[a].reward - BREAKDOWN[b].reward);
  
  for (let i = sorted.length - 1; i > -1; i --) {
    let hit = BREAKDOWN[sorted[i]], reqlink = ``;
    
    if (hit.reqname === `Bonuses`) {
      template +=
        `[tr]` +
        `[td]${hit.reqname}[/td]` +
        `[td]${hit.hits}[/td]` +
        `[td]$${hit.reward.toFixed(2)}[/td]` +
        `[/tr]\n`
      ;
      continue;
    }
    
    template +=
      `[tr]` +
      `[td][url=https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&${hit.reqname !== hit.reqid ? `requesterId=${hit.reqid}` : `searchWords=${hit.reqid.replace(/ /, `+`)}`}]${hit.reqname}[/url][/td]` +
      `[td]${hit.hits}[/td]` +
      `[td]$${hit.reward.toFixed(2)}[/td]` +
      `[/tr]\n`
    ;
  }
  
  tpeexport += `[/table][/spoiler]`
  
  COPY_TO_CLIPBOARD(template);
}

function COPY_TO_CLIPBOARD (template) {
  document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  document.getElementById(`clipboard`).select();
  
  const copy = document.execCommand(`copy`);
  alert(copy ? `Export has been copied to your clipboard.` : template);

  document.body.removeChild(document.getElementById(`clipboard`));
}

 document.addEventListener(`click`, function (event) {
   const element = event.target;
      
   if (element.matches(`#export_overview`)) {
     EXPORT_OVERVIEW();
   }
   if (element.matches(`#export_breakdown`)) {
     EXPORT_REQUESTER_BREAKDOWN();
   }
   if (element.matches(`#sync`)) {
     SYNC_PROGRESS(1, `???`);
     chrome.runtime.sendMessage({msg: `sync_tpe`});
   }
   if (element.matches(`#close`)) {
     chrome.runtime.sendMessage({msg: `close_tpe_menu`});
   }
});
