document.addEventListener(`DOMContentLoaded`, function () {
  WRITE();
});

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (request.msg == `sync_tpe_running`) {
    SYNC_PROGRESS(request.data.current, request.data.total);
  }
});

let tpeexport = ``;

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
  
  chrome.storage.local.get(`hits`, function (data) {
    const hits = data.hits || {};
    let breakdown = {}, breakdown_html = ``, detailed_html = ``;
    
    const total = Object.keys(hits).length;
    let submitted = 0, submitted_pe = 0;
    let approved = 0, approved_pe = 0;
    
    for (let key in hits) {
      if (hits[key].status.match(/Submitted|Paid|Approved|Pending/)) {
        submitted ++;
        submitted_pe += Number(hits[key].reward.replace(/[^0-9.]/g, ``));
        
        if (hits[key].status.match(/Paid|Approved/)) {
          approved ++;
          approved_pe += Number(hits[key].reward.replace(/[^0-9.]/g, ``));
        }
        else if (hits[key].status.match(/Submitted|Pending/)) {
          const apped = IS_APPROVED(hits[key].autoapp, hits[key].submitted);
          if (apped) {
            approved ++;
            approved_pe += Number(hits[key].reward.replace(/[^0-9.]/g, ``));
          }
        }
      }
    }
    
    $(`#overview`).html(
      `<div style="font-size: 20px; line-height: normal;">` +
      `  <br>` +
      `  <span><b>${total}</b> HITs have been viewed, submitted or returned today.</span>` +
      `  <br>` +
      `  <br>` +
      `  <span><b>${submitted}</b> HITs have been submitted today for a total value of <b>$${submitted_pe.toFixed(2)}</b>.</span>` +
      `  <br>` +
      `  <br>` +
      `  <span><b>${approved}</b> HITs have been approved today for a total value of <b>$${approved_pe.toFixed(2)}</b>.</span>` +
      `</div>`
    );
    
    tpeexport =
      `[b]Today's Projected Earnings: $${submitted_pe.toFixed(2)}[/b] [SIZE=2](Exported from [URL=http://mturksuite.com/]Mturk Suite[/URL] v1.0.1)[/SIZE]\n` +
      `[spoiler=Today's Projected Earnings Full Details][table][tr][th][b]Requester[/b][/th][th][b]HITs[/b][/th][th][b]Projected[/b][/th][/tr]` +
      `[tr][td]Total[/td][td]${submitted}[/td][td]$${submitted_pe.toFixed(2)}[/td][/tr]\n`
    ;

    for (let key in hits) {
      if (hits[key].status.match(/(Submitted|Paid|Approved|Pending)/)) {
        const id = hits[key].reqid;
        
        if (!breakdown[id]) {
          breakdown[id] = {
            reqname : hits[key].reqname,
            reqid   : hits[key].reqid,
            hits    : 1,
            reward  : Number(hits[key].reward.replace(/[^0-9.]/g, ``))
          };
        }
        else {
          breakdown[id].hits   += 1;
          breakdown[id].reward += Number(hits[key].reward.replace(/[^0-9.]/g, ``));
        }
      }
    }
    
    const breakdown_sorted = Object.keys(breakdown).sort( (a, b) => { return breakdown[a].reward - breakdown[b].reward;});
    for (let i = breakdown_sorted.length - 1; i > -1; i --) {
      let hit = breakdown[breakdown_sorted[i]], reqlink = ``;
      
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
      
      tpeexport +=
        `[tr]` +
        `[td][url=${reqlink}]${hit.reqname}[/url][/td]` +
        `[td]${hit.hits}[/td]` +
        `[td]$${hit.reward.toFixed(2)}[/td]` +
        `[/tr]\n`
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

function COPY_TO_CLIPBOARD (template) {
  $(`body`).append(`<textarea id="COPY_TO_CLIPBOARD" style="opacity: 0;">${template}</textarea>`);
  $(`#COPY_TO_CLIPBOARD`).select();
  document.execCommand(`Copy`);
  $(`#COPY_TO_CLIPBOARD`).remove();
  alert(`Today's HITs Breakdown has been copied to your clipboard.`);
}

$(`html`).on(`click`, `#export`, function () {
  COPY_TO_CLIPBOARD(tpeexport);
});

$(`html`).on(`click`, `#sync`, function () {
  SYNC_PROGRESS(1, `???`);
  chrome.runtime.sendMessage({msg: `sync_tpe`});
});

$(`html`).on(`click`, `#close`, function () {
  chrome.runtime.sendMessage({msg: `close_tpe_menu`});
});

