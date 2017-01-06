const DB_HITS = {};
const EXPORT = {key: null, type: null};

// Export Stuff
$('html').on('click', '.vb', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb';
  TODB_HIT_EXPORT(DB_HITS[key].reqid);
});

$('html').on('click', '.vb_th', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb_th';
  TODB_HIT_EXPORT(DB_HITS[key].reqid);
});

$('html').on('click', '.vb_mtc', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb_mtc';
  TODB_HIT_EXPORT(DB_HITS[key].reqid);
});

function VB_EXPORT (data) {
  const hit = DB_HITS[EXPORT.key];
  
  function attr (type, rating) {
    let color = '#B30000';
    if (rating > 1.99) {color = '#B37400';}
    if (rating > 2.99) {color = '#B3B300';}
    if (rating > 3.99) {color = '#00B300';}
    if (rating < 0.01) {color = 'grey'; rating = 'N/A';}
    return `[b][${type}: [color=${color}]${rating}[/color]][/b]`;
  }
  
  const template =
        `[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]\n` +
        `[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])\n` +
        `[b][URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]:[/b] ` +
        `${attr('Pay', data.attrs.pay)} ${attr('Fair', data.attrs.fair)} ` +
        `${attr('Comm', data.attrs.comm)} ${attr('Fast', data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? '[color=green]' + data.tos_flags : '[color=red]' + data.tos_flags}[/color]][/b]\n` +
        `[b]Description:[/b] ${hit.desc}\n` +
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
        `${attr('Pay', data.attrs.pay)} ${attr('Fair', data.attrs.fair)} ` +
        `${attr('Comm', data.attrs.comm)} ${attr('Fast', data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? '[color=green]' + data.tos_flags : '[color=red]' + data.tos_flags}[/color]][/b]\n</p>` +
        `<p>[b]Description:[/b] ${hit.desc}</p>` +
        `<p>[b]Time:[/b] ${hit.time}</p>` +
        `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
        `<p>[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]</p>` +
        `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]</p>` +
        `<p>[tr][td][CENTER][SIZE=2]HIT Finder Database last saw this HIT on [b]${new Date(hit.seen).toString()}[/b][/SIZE]</p>` +
        `<p>[SIZE=2]HIT posted from [URL=http://mturksuite.com/]Mturk Suite[/URL] v${chrome.runtime.getManifest().version}[/SIZE][/CENTER][/td][/tr][/table]</p>`
  ;

  if (EXPORT.type === 'vb') {
    COPY_TO_CLIP(template, 'HIT export has been copied to your clipboard.');
  }
  if (EXPORT.type === 'vb_th') {
    const confirm_post = prompt('Do you want to post this HIT to TurkerHub.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"', '');
    if (confirm_post !== null) {
      EXPORT_TO_TH(direct_template + `<p>${confirm_post}</p>`);
    }
  }
  if (EXPORT.type === 'vb_mtc') {
    const confirm_post = prompt('Do you want to post this HIT to MturkCrowd.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"', '');
    if (confirm_post !== null) {
      EXPORT_TO_MTC(direct_template + `<p>${confirm_post}</p>`);
    }
  }
}

function EXPORT_TO_TH (template) {
  chrome.runtime.sendMessage({msg: 'send_th', data: template});
}

function EXPORT_TO_MTC (template) {
  chrome.runtime.sendMessage({msg: 'send_mtc', data: template});
}


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

function TURKOPTICON_DB (HITS) {
  const ids = [];
  for (let i = 0; i < HITS.length; i ++) {if (ids.indexOf(HITS[i].reqid) === -1) ids.push(HITS[i].reqid);}
  let grab = false;
  const to = {};
  const time = new Date().getTime();
  const transaction = TODB.transaction([`requester`], `readonly`);
  const objectStore = transaction.objectStore(`requester`);
  
  for (let i = 0; i < ids.length; i ++) {
    const request = objectStore.get(ids[i]);
    request.onsuccess = function (event) {
      if (request.result && request.result.edited > time - 21600000) {
        to[ids[i]] = request.result;
      }
      else {
        grab = true;
      }
    };
  }
  
  transaction.oncomplete = function (event) {
    if (grab) {
      $.get(`https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${ids}`, function (data) {
        const transaction = TODB.transaction([`requester`], `readwrite`);
        const objectStore = transaction.objectStore(`requester`);

        const json = JSON.parse(data);
        for (let i = 0; i < ids.length; i ++) {
          const id = ids[i];
          if (json[id]) {
            to[id] = json[id];
            json[id].id = id;
            json[id].edited = time;
            objectStore.put(json[id]);
          }
          else {
            to[id] = {attrs: {comm: 0, fair: 0, fast: 0, pay: 0}, reviews: 0, tos_flags: 0};
          }
        }
        WRITE_DATABASE(HITS, to);
      });
    }
    else {
      WRITE_DATABASE(HITS, to);
    }
  };
}

function TODB_HIT_EXPORT (id) {
  const transaction = TODB.transaction([`requester`]);
  const objectStore = transaction.objectStore(`requester`);
  const request = objectStore.get(id);

  request.onsuccess = function (event) {
    if (request.result) {
      VB_EXPORT(request.result);
    }
    else {
      VB_EXPORT({attrs: {comm: 0, fair: 0, fast: 0, pay: 0}, reviews: 0, tos_flags: 0});
    }
  };
}

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

function GET_RESULTS (MATCH) {
  const transaction = HFDB.transaction([`hit`], 'readonly');
  const objectStore = transaction.objectStore(`hit`);
  
  objectStore.getAll().onsuccess = function (event) {
    FILTER_RESULTS(MATCH, event.target.result);
  };
}

function FILTER_RESULTS (MATCH, RESULTS) {
  const filtered = []; const match = MATCH.toLowerCase().trim();

  if (!match.length) {TURKOPTICON_DB(RESULTS); return;}
  
  for (let i = 0; i < RESULTS.length; i ++) {
    const hit = RESULTS[i];
    if (hit.reqname.toLowerCase().indexOf(match) !== -1) {filtered.push(hit); continue;}
    if (hit.reqid.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
    if (hit.title.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
    if (hit.groupid.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
    if (hit.reward.toLowerCase().indexOf(match) !== -1)  {filtered.push(hit); continue;}
    /*
    if (hit.reqname.toLowerCase() === match) {filtered.push(hit); continue;}
    if (hit.reqid.toLowerCase()   === match) {filtered.push(hit); continue;}
    if (hit.title.toLowerCase()   === match) {filtered.push(hit); continue;}
    if (hit.groupid.toLowerCase() === match) {filtered.push(hit); continue;}
    if (hit.reward.toLowerCase()  === match) {filtered.push(hit); continue;}
    */
  }
  
  TURKOPTICON_DB(filtered);
}

function WRITE_DATABASE (HITS, TO) {
  let html = '';
  console.log(TO);

  for (let i = 0; i < HITS.length; i ++) {
    const hit = HITS[i]; DB_HITS[hit.groupid] = hit;
    const tr_color = TO_COLOR(TO[hit.reqid].attrs.pay);
        
    html += 
      `<tr class="${tr_color}">` +
      // Date
        `<td class="text-center" data-toggle="tooltip" data-placement="right" data-container="body" title="${new Date(hit.seen).toString()}">${hit.date}</td>` +
      // Requester
        `<td>` +
          `<a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
        `</td>` +
      // Project
      `  <td>` +
      `    <div class="btn-group btn-group-xs">` +
      `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
      `        Export <span class="caret"></span>` +
      `      </button>` +
      `      <ul class="dropdown-menu">` +
      `        <li><a class="vb" data-key="${hit.groupid}">Forum</a></li>` +
      `        <li><a class="vb_th" data-key="${hit.groupid}">TH Direct</a></li>` +
      `        <li><a class="vb_mtc" data-key="${hit.groupid}">MTC Direct</a></li>` +
      `      </ul>` +
      `    </div>` +
      `    <a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" title="${hit.quals.replace(/; /g, `;<br>`)}">${hit.title}</a>` +
      `  </td>` +
      // Accept and Reward
      `  <td class="text-center"><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
      // TO
      `  <td class="text-center">` +
      `    <a href="https://turkopticon.ucsd.edu/${hit.reqid}" target="_blank" data-toggle="tooltip" data-placement="left" data-html="true" ` +
      `title="Pay: ${TO[hit.reqid].attrs.pay} Fair: ${TO[hit.reqid].attrs.fair}<br>Comm: ${TO[hit.reqid].attrs.comm} Fast: ${TO[hit.reqid].attrs.fast}<br>Reviews: ${TO[hit.reqid].reviews} ToS: ${TO[hit.reqid].tos_flags}">${TO[hit.reqid].attrs.pay}</a>` +
      `  </td>` +
      // Masters
      `  <td class="text-center">${hit.masters ? `Y` : `N`}</td>` +
      `</tr>`
    ;
  }

  document.getElementById(`shown`).textContent = HITS.length;
  document.getElementById(`results`).innerHTML = html;
  $('[data-toggle="tooltip"]').tooltip();
}

function TO_COLOR (rating) {
  let color = 'toLow';
  if (rating > 1.99) {color = 'toAverage';}
  if (rating > 2.99) {color = 'toGood';}
  if (rating > 3.99) {color = 'toHigh';}
  if (rating < 0.01) {color = 'toNone';}
  return color;
}

document.addEventListener(`click`, function (event) {
  const element = event.target;
  
  if (element.matches(`#search`)) {
    GET_RESULTS(document.getElementById(`matching`).value);
  }
});