const HITS = {};
const EXPORT = {key: null, type: null};

// Turkopticon IndexedDB
let TODB;
const TODB_request = indexedDB.open(`TODB`, 1);
TODB_request.onsuccess = function (event) {
  TODB = event.target.result;
};
TODB_request.onupgradeneeded = function (event) {
  const TODB = event.target.result;
  TODB.createObjectStore(`requester`, {keyPath: `id`});
};

// HIT Finder IndexedDB
let HFDB; 
const HFDB_request = indexedDB.open(`HFDB`, 1);
HFDB_request.onsuccess = function (event) {
  HFDB = event.target.result;
};
HFDB_request.onupgradeneeded = function (event) {
  const HFDB = event.target.result;
  
  const createObjectStore = HFDB.createObjectStore(`hit`, {keyPath: `groupid`});
  for (let index of [`reqid`, `reqname`, `title`, `reward`, `date`]) {
    createObjectStore.createIndex(index, index, {unique: false});
  }
};

function TURKOPTICON_DB (hits) {
  const to = {};
  const transaction = TODB.transaction([`requester`], `readonly`);
  const objectStore = transaction.objectStore(`requester`);
  
  for (let i = 0; i < hits.length; i ++) {
    const id = hits[i].reqid;
    const request = objectStore.get(id);
    
    request.onsuccess = function (event) {
      if (request.result) {
        to[id] = request.result;
      }
      else {
        to[id] = {attrs: {comm: `0.00`, fair: `0.00`, fast: `0.00`, pay: `0.00`}, reviews: 0, tos_flags: 0};
      }
    };
  }

  transaction.oncomplete = function (event) {
    WRITE_DATABASE(hits, to);
  };
}

function TODB_HIT_EXPORT (id) {
  const transaction = TODB.transaction([`requester`]);
  const objectStore = transaction.objectStore(`requester`);
  const request = objectStore.get(id);

  request.onsuccess = function (event) {
    if (request.result) {
      HIT_EXPORT(request.result);
    }
    else {
      HIT_EXPORT({attrs: {comm: `0.00`, fair: `0.00`, fast: `0.00`, pay: `0.00`}, reviews: 0, tos_flags: 0});
    }
  };
}

function GET_RESULTS () {
  const transaction = HFDB.transaction([`hit`], `readonly`);
  const objectStore = transaction.objectStore(`hit`);
  
  objectStore.getAll().onsuccess = function (event) {
    FILTER_RESULTS(event.target.result);
  };
}

function FILTER_RESULTS (results) {
  const filtered = [];
  const date_from =  DATE_TO_TIME_FROM(document.getElementById(`date_from`).value);
  const date_to = DATE_TO_TIME_TO(document.getElementById(`date_to`).value);
  const match = document.getElementById(`matching`).value.toLowerCase().trim();
  const find = document.getElementById(`find`).value;
  
  for (let i = 0; i < results.length; i ++) {
    const hit = results[i];
    const filter = find === `all` ? true : IS_INCLUDED(hit);
    
    if (date_from < hit.seen && hit.seen < date_to && filter) {
      if (!match.length) {filtered.push(hit); continue;}
      if (hit.reqname.toLowerCase().indexOf(match) !== -1) {filtered.push(hit); continue;}
      if (hit.reqid.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
      if (hit.title.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
      if (hit.groupid.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
      if (hit.reward.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
    }
  }
  TURKOPTICON_DB(filtered);
}

function WRITE_DATABASE (hits, to) {
  let html = ``; hits.sort( (a, b) => b.seen - a.seen);
  
  for (let i = 0; i < hits.length; i ++) {
    const hit = hits[i]; HITS[hit.groupid] = hit;
    const tr_color = TO_COLOR(to[hit.reqid].attrs.pay);
        
    html += 
    `<tr class="${tr_color}">` +
      // Date
      `<td class="text-center" data-toggle="tooltip" data-placement="right" data-container="body" title="${new Date(hit.seen)}">${FORMAT_DATE(hit.seen)}</td>` +
      // Requester
      `<td>` +
        `<a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
      `</td>` +
      // Project
      `<td>` +
        `<div class="btn-group btn-group-xxs">` +
          `<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
            `Export <span class="caret"></span>` +
          `</button>` +
          `<ul class="dropdown-menu">` +
            `<li><a class="hit_export" data-type="vb" data-key="${hit.groupid}">Forum</a></li>` +
            `<li><a class="hit_export" data-type="vb_th" data-key="${hit.groupid}">TH Direct</a></li>` +
            `<li><a class="hit_export" data-type="vb_mtc" data-key="${hit.groupid}">MTC Direct</a></li>` +
          `</ul>` +
        `</div> ` +
        `<a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" title="${hit.quals.replace(/; /g, `;<br>`)}">${hit.title}</a>` +
      `</td>` +
      // Accept and Reward
      `<td class="text-center"><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
      // TO
      `<td class="text-center">` +
        `<a href="https://turkopticon.ucsd.edu/${hit.reqid}" target="_blank" data-toggle="tooltip" data-placement="left" data-html="true" ` +
        `title="Pay: ${to[hit.reqid].attrs.pay} Fair: ${to[hit.reqid].attrs.fair}<br>Comm: ${to[hit.reqid].attrs.comm} Fast: ${to[hit.reqid].attrs.fast}<br>Reviews: ${to[hit.reqid].reviews} ToS: ${to[hit.reqid].tos_flags}">${to[hit.reqid].attrs.pay}</a>` +
      `</td>` +
      // Masters
      `<td class="text-center">${hit.masters ? `Y` : `N`}</td>` +
    `</tr>`
    ;
  }

  document.getElementById(`shown`).textContent = hits.length;
  document.getElementById(`results`).innerHTML = html;
  $(document.querySelectorAll(`[data-toggle="tooltip"]`)).tooltip();
}

function TO_COLOR (rating) {
  let color = `toLow`;
  if (rating > 1.99) {color = `toAverage`;}
  if (rating > 2.99) {color = `toGood`;}
  if (rating > 3.99) {color = `toHigh`;}
  if (rating < 0.01) {color = `toNone`;}
  return color;
}

function FORMAT_DATE (date) {
  const d = new Date(date)
  const mm = d.getMonth() + 1 > 10 ? d.getMonth() + 1 : `0${d.getMonth() + 1}`;
  const dd = d.getDate() > 10 ? d.getDate() : `0${d.getDate()}`;
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

function IS_INCLUDED (hit) {
  const include_list = JSON.parse(localStorage.getItem(`INCLUDE_LIST`)) || {};

  for (let key in include_list) {
    const il = include_list[key];
    if (il.term.toLowerCase() === hit.reqname.toLowerCase() || il.term.toLowerCase() === hit.title.toLowerCase()   || 
        il.term.toLowerCase() === hit.reqid.toLowerCase()   || il.term.toLowerCase() === hit.groupid.toLowerCase() ){
      return true;
    }
  }
  return false;
}

function DATE_TO_TIME_FROM (date) {
  if (!date.length) return 0;
  return new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000 - 1;
}

function DATE_TO_TIME_TO (date) {
  if (!date.length) return new Date().getTime();
  return new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000 + 86400000 - 1;
}

function HIT_EXPORT (to) {
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
  `[table][tr][td][b]Title:[/b] [url=${hit.prevlink}]${hit.title}[/url] | [url=${hit.pandlink}]PANDA[/url]\n` +
  `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])\n` +
  `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/url]:[/b] ` +
  `${attr(`Pay`, to.attrs.pay)} ${attr(`Fair`, to.attrs.fair)} ` +
  `${attr(`Comm`, to.attrs.comm)} ${attr(`Fast`, to.attrs.fast)} ` +
  `[b][Reviews: ${to.reviews}][/b] ` +
  `[b][ToS: ${to.tos_flags === 0 ? `[color=green]${to.tos_flags}` : `[color=red]${to.tos_flags}`}[/color]][/b]\n` +
  `[b]Description:[/b] ${hit.desc}\n` +
  `[b]Time:[/b] ${hit.time}\n` +
  `[b]HITs Available:[/b] ${hit.avail}\n` +
  `[b]Reward:[/b] [color=green][b]${hit.reward}[/b][/color]\n` +
  `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]\n` +
  `[tr][td][center][size=2]HIT Finder Database last saw this HIT on [b]${new Date(hit.seen).toString()}[/b][/size][/center][/td][/tr][/table]`
  ;
  
  const direct_template =
  `<p>[table][tr][td][b]Title:[/b] [url=${hit.prevlink}]${hit.title}[/url] | [url=${hit.pandlink}]PANDA[/url]</p>` +
  `<p>[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])</p>` +
  `<p>[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/url]:[/b] ` +
  `${attr(`Pay`, to.attrs.pay)} ${attr(`Fair`, to.attrs.fair)} ` +
  `${attr(`Comm`, to.attrs.comm)} ${attr(`Fast`, to.attrs.fast)} ` +
  `[b][Reviews: ${to.reviews}][/b] ` +
  `[b][ToS: ${to.tos_flags === 0 ? `[color=green]${to.tos_flags}` : `[color=red]${to.tos_flags}`}[/color]][/b]\n</p>` +
  `<p>[b]Description:[/b] ${hit.desc}</p>` +
  `<p>[b]Time:[/b] ${hit.time}</p>` +
  `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
  `<p>[b]Reward:[/b] [color=green][b]${hit.reward}[/b][/color]</p>` +
  `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]</p>` +
  `<p>[tr][td][center][size=2]HIT Finder Database last saw this HIT on [b]${new Date(hit.seen).toString()}[/b][/size]</p>` +
  `<p>[size=2]HIT posted from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]</p>`
  ;

  switch (EXPORT.type) {
    case `vb`: COPY_TO_CLIP(template, `HIT export has been copied to your clipboard.`); break;
    case `vb_th`: DIRECT_TH(direct_template); break;
    case `vb_mtc`: DIRECT_MTC(direct_template); break;
  }
}

function DIRECT_TH (template) {
  const confirm_post = prompt(`Do you want to post this HIT to TurkerHub.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok" or hit "Enter"`, ``);
  if (confirm_post !== null) chrome.runtime.sendMessage({msg: `send_th`, data: `${template}<p>${confirm_post}</p>`});
}

function DIRECT_MTC (template) {
  const confirm_post = prompt(`Do you want to post this HIT to MturkCrowd.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok" or hit "Enter"`, ``);
  if (confirm_post !== null) chrome.runtime.sendMessage({msg: `send_mtc`, data: `${template}<p>${confirm_post}</p>`});
}

function COPY_TO_CLIP (string, message) {
  $(`body`).append(`<textarea id="clipboard" style="opacity: 0;">${string}</textarea>`);
  $(`#clipboard`).select();
  document.execCommand(`Copy`);
  $(`#clipboard`).remove();
  alert(message);
}

document.addEventListener(`click`, function (event) {
  const element = event.target;
  
  if (element.matches(`#search`)) {
    GET_RESULTS(document.getElementById(`matching`).value);
  }
  
  if (element.matches(`.hit_export`)) {
    EXPORT.key = element.dataset.key;
    EXPORT.type = element.dataset.type;
    TODB_HIT_EXPORT(HITS[EXPORT.key].reqid);
  }
});


