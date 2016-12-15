document.addEventListener('DOMContentLoaded', () => {
  if ($('a:contains(View a HIT in this group)').length) {
    hitexport();
  }
});

chrome.extension.onMessage.addListener( (request) => {
  if (request.msg == 'hitexport.js') {
    vbexport(request.data);
  }
});

chrome.storage.onChanged.addListener( (changes) => {
  for (let key in changes) {
    if (key === 'user') {
      EXPORTS_WRITE();
    }
  }
});

const hits = {};
const stuff = {key: null, export: null};

const hitexport = () => {
  for (let element of $('table[cellpadding="0"][cellspacing="5"][border="0"]').children().children()) {
    const hit = $(element);

    const requesterIdentity = hit.find('.requesterIdentity').text();
    const requesterId = hit.find('a[href*="&requesterId="]').prop('href').split('&requesterId=')[1];

    let groupId = 'na', preview = '', panda = '';
    if (hit.find('a[href*="?groupId="]').length) {
      groupId = hit.find('a[href*="?groupId="]').prop('href').split('groupId=')[1];
      preview = `https://www.mturk.com/mturk/preview?groupId=${groupId}`;
      panda = `https://www.mturk.com/mturk/previewandaccept?groupId=${groupId}`;
    }

    const title = hit.find('a.capsulelink').text();
    const description = hit.find('.capsule_field_title:contains(Description:)').next().text();
    const time = hit.find('.capsule_field_title:contains(Time Allotted:)').next().text();
    const reward = hit.find('.capsule_field_title:contains(Reward:)').next().text();
    const available = hit.find('.capsule_field_title:contains(HITs Available:)').next().text();

    let qualifications = '';
    for (let qual of hit.find('td[style="padding-right: 2em; white-space: nowrap;"]')) {
      qualifications += qual.textContent.trim().replace(/\s+/g, ' ') + '; ';
    }

    const key = requesterId + groupId + reward;

    hits[key] = {
      reqname  : requesterIdentity.trim(),
      reqid    : requesterId.trim(),
      groupid  : groupId.trim(),
      prevlink : preview !== '' ? preview.trim() : `https://www.mturk.com/mturk/searchbar?requesterId=${requesterId}`,
      pandlink : panda !== '' ? panda.trim() : `https://www.mturk.com/mturk/searchbar?requesterId=${requesterId}`,
      title    : title.trim(),
      desc     : description.trim(),
      time     : time.trim(),
      reward   : reward.trim(),
      avail    : available.trim(),
      quals    : qualifications !== '' ? qualifications.trim() : 'None;',
    };
  }
  
  EXPORTS_WRITE();
};

const EXPORTS_WRITE = () => {
  chrome.storage.local.get('user', (data) => {
    const user = data.user || {vb: true, vb_th: false, vb_mtc: false};
    
    for (let element of $('table[cellpadding="0"][cellspacing="5"][border="0"]').children().children()) {
      const hit = $(element);
      const requesterId = hit.find('a[href*="&requesterId="]').prop('href').split('&requesterId=')[1];
      const groupId = hit.find('a[href*="?groupId="]').length ? hit.find('a[href*="?groupId="]').prop('href').split('groupId=')[1] : 'na';
      const reward = hit.find('.capsule_field_title:contains(Reward:)').next().text();
      const key = requesterId + groupId + reward;
      
      let html = '';
      html += user.vb ? `<button class="vb export" data-key="${key}" type="button" style="height: 15px; width: 25px;">vB</button>` : '';
      html += user.vb_th ? `<button class="vb_th export" data-key="${key}" type="button" style="height: 15px; width: 25px;">TH</button>` : '';
      html += user.vb_mtc ? `<button class="vb_mtc export" data-key="${key}" type="button" style="height: 15px; width: 25px;">MTC</button>` : '';
      
      if (hit.find('.exports').length) {
        hit.find('.exports').html(html);
      }
      else {
        hit.find('a[id^="capsule"]').before(`<span class="exports">${html}</span>`);
      }
    }
  });
};

$('html').on('click', '.vb', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
});

$('html').on('click', '.vb_th', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb_th';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
});

$('html').on('click', '.vb_mtc', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb_mtc';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
});

const vbexport = (data) => {
  const hit = hits[stuff.key];
  
  const attr = (type, rating) => {
    let color = 'red';
    if (rating > 1.99) {color = 'orange';}
    if (rating > 2.99) {color = 'yellow';}
    if (rating > 3.99) {color = 'green';}
    if (rating < 0.01) {color = 'grey'; rating = 'N/A'}
    return `[b][${type}: [color=${color}]${rating}[/color]][/b]`;
  };
  
  const template =
        `[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]\n` +
        `[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])\n` +
        `([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ` +
        `${attr('Pay', data.attrs.pay)} ${attr('Fair', data.attrs.fair)} ` +
        `${attr('Comm', data.attrs.comm)} ${attr('Fast', data.attrs.fast)} ` +
        `[Reviews: ${data.reviews}] [ToS: ${data.tos_flags === 0 ? data.tos_flags : '[color=red]' + data.tos_flags + '[/color]'}]\n` +
        `[b]Description:[/b] ${hit.desc}\n` +
        `[b]Time:[/b] ${hit.time}\n` +
        `[b]HITs Available:[/b] ${hit.avail}\n` +
        `[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]\n` +
        `[b]Qualifications:[/b] ${hit.quals}\n` +
        `[/td][/tr][/table]`;
  
  const direct_template =
        `<p>[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]</p>` +
        `<p>[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])</p>` +
        `<p>([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ` +
        `${attr('Pay', data.attrs.pay)} ${attr('Fair', data.attrs.fair)} ` +
        `${attr('Comm', data.attrs.comm)} ${attr('Fast', data.attrs.fast)} ` +
        `[Reviews: ${data.reviews}] [ToS: ${data.tos_flags === 0 ? data.tos_flags : '[color=red]' + data.tos_flags + '[/color]'}]</p>` +
        `<p>[b]Description:[/b] ${hit.desc}</p>` +
        `<p>[b]Time:[/b] ${hit.time}</p>` +
        `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
        `<p>[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]</p>` +
        `<p>[b]Qualifications:[/b] ${hit.quals}[/td][/tr]</p>` +
        `<p>[tr][td][CENTER][SIZE=2]HIT posted from Mturk Suite[/SIZE][/CENTER][/td][/tr][/table]</p>`;

  if (stuff.export === 'vb') {
    copyToClipboard(template);
  }
  
  if (stuff.export === 'vb_mtc') {
    const confirm_post = prompt('Do you want to post this HIT to MturkCrowd.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"', '');
    if (confirm_post != null) {
      SEND_MTC(direct_template + `<p>${confirm_post}</p>`);
    }
  }
  if (stuff.export === 'vb_th') {
    const confirm_post = prompt('Do you want to post this HIT to TurkerHub.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"', '');
    if (confirm_post != null) {
      SEND_TH(direct_template + `<p>${confirm_post}</p>`);
    }
  }
};

const copyToClipboard = (template) => {
  $('body').append(`<textarea id="copyToClipboard" style="opacity: 0;">${template}</textarea>`);
  $('#copyToClipboard').select();
  document.execCommand('Copy');
  $('#copyToClipboard').remove();
  alert('HIT export has been copied to your clipboard.');
};

const SEND_TH = (template) => {
  chrome.runtime.sendMessage({msg: 'send_th', data: template});
};

const SEND_MTC = (template) => {
  chrome.runtime.sendMessage({msg: 'send_mtc', data: template});
};

