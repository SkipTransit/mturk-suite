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

const hits = {};
const stuff = {key: null, export: null};

const hitexport = () => {
  for (let element of $('table[cellpadding="0"][cellspacing="5"][border="0"]').children().children()) {
    const hit = $(element);

    const requesterIdentity = hit.find('.requesterIdentity').text();
    const requesterId = hit.find('a[href*="&requesterId="]').prop('href').split('&requesterId=')[1];

    let groupId = 'na', preview = '', panda = '';
    if (hit.find('a[href*="?groupId="]').length) {
      groupId  = hit.find('a[href*="?groupId="]').prop('href').split('groupId=')[1];
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

    hit.find('a[id^="capsule"]').before(
      `<button class="vb export" data-key="${key}" type="button" style="height: 15px; width: 25px;">vB</button>` +
      `<button class="vb_mtc export" data-key="${key}" type="button" style="height: 15px; width: 25px;">MTC</button>` +
      `<button class="vb_th export" data-key="${key}" type="button" style="height: 15px; width: 25px;">TH</button>`
    );
  }
};

$('html').on('click', '.vb', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
});

$('html').on('click', '.vb_mtc', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb_mtc';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
});

$('html').on('click', '.vb_th', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb_th';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
});

const vbexport = (data) => {
  const hit = hits[stuff.key];
  
  const toformat = (type, rating) => {
    let color = 'red';
    if (rating >= 4.00) { color = 'green'; }
    else if (rating >= 3.00) { color = 'yellow'; }
    else if (rating >= 2.00) { color = 'orange'; }
    else if (rating === 'N/A') { color = 'grey'; }
    return `[b][${type}: [color=${color}]${rating}[/color]][/b]`;
  };

  const template =
        `[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]\n` +
        `[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])\n` +
        `([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ${toformat('Pay', data.attrs.pay)} ${toformat('Fair', data.attrs.fair)} ${toformat('Comm', data.attrs.comm)} ${toformat('Fast', data.attrs.fast)}\n` +
        `[b]Description:[/b] ${hit.desc}\n` +
        `[b]Time:[/b] ${hit.time}\n` +
        `[b]HITs Available:[/b] ${hit.avail}\n` +
        `[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]\n` +
        `[b]Qualifications:[/b] ${hit.quals}\n` +
        `[/td][/tr][/table]`;
  
  const direct_template =
        `<p>[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]</p>` +
        `<p>[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])</p>` +
        `<p>([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ${toformat('Pay', data.attrs.pay)} ${toformat('Fair', data.attrs.fair)} ${toformat('Comm', data.attrs.comm)} ${toformat('Fast', data.attrs.fast)}</p>` +
        `<p>[b]Description:[/b] ${hit.desc}</p>` +
        `<p>[b]Time:[/b] ${hit.time}</p>` +
        `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
        `<p>[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]</p>` +
        `<p>[b]Qualifications:[/b] ${hit.quals}[/td][/tr]</p>` +
        `[tr][td][CENTER][SIZE=2]HIT posted from Mturk Suite[/SIZE][/CENTER][/td][/tr][/table]</p>`;

  if (stuff.export === 'vb') {
    copyToClipboard(template);
  }
  
  if (stuff.export === 'vb_mtc') {
    const confirm_post = confirm('Do you want to post this HIT to MTC?');
    if (confirm_post) {
      SEND_MTC(direct_template);
    }
  }
  if (stuff.export === 'vb_th') {
    const confirm_post = confirm('Do you want to post this HIT to TH?');
    if (confirm_post) {
      SEND_TH(direct_template);
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

const SEND_MTC = (template) => {
  chrome.runtime.sendMessage({msg: 'send_mtc', data: template});
};

const SEND_TH = (template) => {
  chrome.runtime.sendMessage({msg: 'send_th', data: template});
};
