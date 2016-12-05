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
      `<button class="vb export" data-key="${key}" type="button" style="height: 15px; width: 25px;">vB</button>`
    );
  }

  const css = `
<style id="css" type="text/css">

.export {
display: inline-block;
font-weight: normal;
text-align: center;
white-space: nowrap;
vertical-align: middle;
cursor: pointer;
user-select: none;
padding: 0;
border-radius: 0.214rem;
background-color: #DC8C1B;
font-size: 0.70rem;
background-image: linear-gradient(to bottom, #f7dfa5 0%, #f0c14b 100%);
background-repeat: repeat-x;
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF7DFA5', endColorstr='#FFF0C14B', GradientType=0);
border: 1px solid;
border-color: #a88734 #9c7e31 #846a29;
margin-right: 3px;
}

</style>
`;

  $('head').append(css);

  $('body').on('click', '.vb', function () {
    const key = $(this).data('key')
    stuff.key = key;
    stuff.export = 'vb';
    chrome.runtime.sendMessage({msg: 'hitexport', data: hits[key].reqid});
  });
};

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

  copyToClipboard(template);
};

const copyToClipboard = (template) => {
  $('body').append(`<textarea id="copyToClipboard" style="opacity: 0;">${template}</textarea>`);
  $('#copyToClipboard').select();
  document.execCommand('Copy');
  $('#copyToClipboard').remove();
  alert('HIT export has been copied to your clipboard.');
};
