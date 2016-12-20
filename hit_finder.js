document.addEventListener('DOMContentLoaded', () => {
  SET_CONFIG();
});

chrome.extension.onMessage.addListener( (request) => {
  if (request.msg == 'turkopticon.js') {
    console.log(request.data);
    HITS_WRITE(keys, request.data);
  }
  if (request.msg == 'hitexport.js') {
    VB_EXPORT(request.data);
  }
});

let hitlog = {};
let keys = [];

const stuff = {key: null, export: null};

const LOADED_CONFIG = JSON.parse(localStorage.getItem('CONFIG')) || {};

let CONFIG = {
  scan_delay : LOADED_CONFIG.scan_delay || '3',
  min_reward : LOADED_CONFIG.min_reward || '0.00',
  min_avail  : LOADED_CONFIG.min_avail  || '0',
  min_to     : LOADED_CONFIG.min_to     || '0.00',
  size       : LOADED_CONFIG.size       || '25',
  sort_by    : LOADED_CONFIG.sort_by    || 'latest',
  
  qualified  : LOADED_CONFIG.hasOwnProperty('qualified')  ? LOADED_CONFIG.qualified  : true,
  enable_to  : LOADED_CONFIG.hasOwnProperty('enable_to')  ? LOADED_CONFIG.enable_to  : true,
  hide_nl    : LOADED_CONFIG.hasOwnProperty('hide_nl')    ? LOADED_CONFIG.hide_nl    : false,
  hide_bl    : LOADED_CONFIG.hasOwnProperty('hide_bl')    ? LOADED_CONFIG.hide_bl    : false,
  hide_m     : LOADED_CONFIG.hasOwnProperty('hide_m')     ? LOADED_CONFIG.hide_m     : false,
  new_hit    : LOADED_CONFIG.hasOwnProperty('new_hit')    ? LOADED_CONFIG.new_hit    : true,
  pushbullet : LOADED_CONFIG.hasOwnProperty('pushbullet') ? LOADED_CONFIG.pushbullet : false
};

$('html').on('click', '#scan', function () {
  $(this).toggleClass('btn-success btn-danger');
  if ($(this).text() === 'Start') {
    $(this).text('Stop');
    FIND();
  }
  else {
    $(this).text('Start');
  }
});

$('html').on('change', '#sort_by, #qualified, #enable_to, #hide_nl, #hide_bl, #hide_m, #new_hit, #pushbullet', function () {
  SAVE_CONFIG();
});

$('html').on('input', '#scan_delay, #min_reward, #min_avail, #min_to, #size', function () {
  SAVE_CONFIG();
});

$('html').on('click', '.vb', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hitlog[key].reqid});
});

$('html').on('click', '.vb_th', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb_th';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hitlog[key].reqid});
});

$('html').on('click', '.vb_mtc', function () {
  const key = $(this).data('key');
  stuff.key = key;
  stuff.export = 'vb_mtc';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hitlog[key].reqid});
});

const FIND = () => {
  let url = '';
  //if () {
    url = 
      `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups` +
      `&sortType=${SEARCH_TYPE()}` +
      `&pageSize=${CONFIG.size}` +
      `&minReward=${CONFIG.min_reward}` +
      `&qualifiedFor=${(CONFIG.qualified ? 'on' : 'off')}`
    ;  
  //}
  if ($('#scan').text() === 'Stop') {
    $.get(url, (data) => { FIND_OLD(data); });
  }
};

const SEARCH_TYPE = () => {
  if (CONFIG.sort_by === 'latest') {
    return 'LastUpdatedTime%3A1';
  }
  if (CONFIG.sort_by === 'most') {
    return 'NumHITs%3A1';
  }
  if (CONFIG.sort_by === 'reward') {
    return 'Reward%3A1';
  }
};

const FIND_OLD = (data, timeis) => {
  let ids = []; keys = [];

  var $hits = $(data).find('table[cellpadding="0"][cellspacing="5"][border="0"]').eq(0).children('tbody').children('tr');
  
  for (var i = 0; i < $hits.length; i ++) {
    var $hit = $hits.eq(i);

    var req_name, req_id, req_link, to_link;

    var req = $hit.find('a[href^="/mturk/searchbar?selectedSearchType=hitgroups&requesterId="]');
    if (req.length) {
      logged_in = true;
      req_name  = $hit.find('span.requesterIdentity').text().trim();
      req_id    = req.prop('href').split('requesterId=')[1];
      req_link  = 'https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=' + req_id;
      to_link   = 'https://turkopticon.ucsd.edu/' + req_id;
    }
    else {
      logged_in = false;
      req_name  = $hit.find('span.requesterIdentity').text().trim();
      req_id    = $hit.find('span.requesterIdentity').text().trim();
      req_link  = 'https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=' + req_id.replace(/ /g, '+');
      con_link  = 'https://#';
      to_link   = 'https://turkopticon.ucsd.edu/main/php_search?field=name&query=' + req_id.replace(/ /g, '+');
    }

    var group_id, prev_link, pand_link;

    var prev = $hit.find('a[href*="groupId="]');
    if (prev.length) {
      group_id  = prev.prop('href').split('groupId=')[1].split('&')[0];
      prev_link = 'https://www.mturk.com/mturk/preview?groupId=' + group_id;
      pand_link = 'https://www.mturk.com/mturk/previewandaccept?groupId=' + group_id;
    }
    else {
      group_id  = 'na';
      prev_link = req_link;
      pand_link = req_link;
    }

    var title  = $hit.find('a.capsulelink').text();
    var desc   = $hit.find('.capsule_field_title:contains(Description:)').next().text();
    var time   = $hit.find('.capsule_field_title:contains(Time Allotted:)').next().text();
    var reward = $hit.find('.capsule_field_title:contains(Reward:)').next().text();
    var avail  = $hit.find('.capsule_field_title:contains(HITs Available:)').next().text() || 'N/A';

    var quals   = $hit.find('td[style="padding-right: 2em; white-space: nowrap;"]');
    var	qualif  = 'None';
    var	masters = 'N';

    if (quals.length) {
      qualif = '';
      for (var j = 0; j < quals.length; j ++) {
        qualif += quals.eq(j).text().trim().replace(/\s+/g, ' ') + '; ';
      }
      if (qualif.indexOf('Masters has been granted') !== -1) {
        masters = 'Y';
      }
    }

    var key = req_id.trim() + title.trim() + reward.trim() + group_id.trim();
    keys.push(key);

    if (!hitlog[key]) {
      hitlog[key] = {
        reqname  : req_name.trim(),
        reqid    : req_id.trim(),
        reqlink  : req_link.trim(),
        groupid  : group_id.trim(),
        prevlink : prev_link.trim(),
        pandlink : pand_link.trim(),
        title    : title.trim(),
        desc     : desc.trim(),
        time     : time.trim(),
        reward   : reward.trim(),
        avail    : avail.trim(),
        quals    : qualif.trim(),
        masters  : masters.trim(),
        key      : key.trim(),
        tolink   : to_link.trim(),
        to       : {comm: 0, fair: 0, fast: 0, pay : 0},
        new      : true
      };
    }
    else {
      hitlog[key].avail = avail.trim();
      hitlog[key].new = false;
    }
    ids.push(req_id);
  }
  if ($hits.length) {
    chrome.runtime.sendMessage({msg: 'turkopticon', data: ids});
    //HITS_WRITE(keys);
  }
  else {
    setTimeout( () => { FIND(); }, 2500);
  }
};

const HITS_WRITE = (keys, data) => {
  let found_html = '', logged_html = '';
  for (let i = 0; i < keys.length; i ++) {
    const hit = hitlog[keys[i]];
    const tr_color = TO_COLOR(data[hit.reqid].attrs.pay);
    
    found_html += 
      `<tr class="${tr_color}">` +
      `  <td>` +
      `    <div class="btn-group btn-group-xs">` +
      `      <button class="btn btn-danger" data-toggle="tooltip" data-placement="right" title="Block this requester.">R</button>` +
      `      <button class="btn btn-danger" data-toggle="tooltip" data-placement="right" title="Block this HIT.">T</button>` +
      `    </div>` +
      `    <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
      `  </td>` +
      `  <td>` +
      `    <div class="btn-group btn-group-xs">` +
      `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
      `        Export <span class="caret"></span>` +
      `      </button>` +
      `      <ul class="dropdown-menu">` +
      `        <li><a class="vb" href="#" data-key="${hit.key}">Forum</a></li>` +
      `        <li><a class="vb_th" href="#" data-key="${hit.key}">TH Direct</a></li>` +
      `        <li><a class="vb_mtc" href="#" data-key="${hit.key}">MTC Direct</a></li>` +
      `      </ul>` +
      `    </div>` +
      `    <a href="${hit.prevlink}" target="_blank">${hit.title}</a>` +
      `  </td>` +
      `  <td>${hit.avail}</td>` +
      `  <td><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
      `  <td>${data[hit.reqid].attrs.pay}</td>` +
      `  <td>?</td>` +
      `</tr>`
    ;
    
    if (hit.new) {
      logged_html += 
        `<tr class="${tr_color}">` +
        `  <td>12:00am</td>` +
        `  <td>` +
        `    <div class="btn-group btn-group-xs">` +
        `      <button class="btn btn-danger" data-toggle="tooltip" data-placement="right" title="Block this requester.">R</button>` +
        `      <button class="btn btn-danger" data-toggle="tooltip" data-placement="right" title="Block this HIT.">T</button>` +
        `    </div>` +
        `    <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
        `  </td>` +
        `  <td>` +
        `    <div class="btn-group btn-group-xs">` +
        `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
        `        Export <span class="caret"></span>` +
        `      </button>` +
        `      <ul class="dropdown-menu">` +
        `        <li><a class="vb" href="#" data-key="${hit.key}">Forum</a></li>` +
        `        <li><a class="vb_th" href="#" data-key="${hit.key}">TH Direct</a></li>` +
        `        <li><a class="vb_mtc" href="#" data-key="${hit.key}">MTC Direct</a></li>` +
        `      </ul>` +
        `    </div>` +
        `    <a href="${hit.prevlink}" target="_blank">${hit.title}</a>` +
        `  </td>` +
        `  <td><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
        `  <td>${data[hit.reqid].attrs.pay}</td>` +
        `  <td>?</td>` +
        `</tr>`
      ;
    }
  }
  $('#found_tbody').html(found_html);
  $('#logged_tbody').prepend(logged_html);
  $('[data-toggle="tooltip"]').tooltip({container: 'body'});
  
  if ($('#scan').text() === 'Stop') {
    setTimeout( () => { FIND(); }, CONFIG.scan_delay * 1000);
  }
};

const SET_CONFIG = () => {
  $('#scan_delay').val(CONFIG.scan_delay);
  $('#min_reward').val(CONFIG.min_reward);
  $('#min_avail').val(CONFIG.min_avail);
  $('#min_to').val(CONFIG.min_to);
  $('#size').val(CONFIG.size);
  $('#sort_by').val(CONFIG.sort_by);
  
  $('#qualified').prop('checked', CONFIG.qualified);
  $('#enable_to').prop('checked', CONFIG.enable_to);
  $('#hide_nl').prop('checked', CONFIG.hide_nl);
  $('#hide_bl').prop('checked', CONFIG.hide_bl);
  $('#hide_m').prop('checked', CONFIG.hide_m);
  $('#new_hit').prop('checked', CONFIG.new_hit);
  $('#pushbullet').prop('checked', CONFIG.pushbullet);
}

const SAVE_CONFIG = () => {
  CONFIG.scan_delay = $('#scan_delay').val();
  CONFIG.min_reward = $('#min_reward').val();
  CONFIG.min_avail = $('#min_avail').val();
  CONFIG.min_to = $('#min_to').val();
  CONFIG.size = $('#size').val();
  CONFIG.sort_by = $('#sort_by').val();
  
  CONFIG.qualified = $('#qualified').prop('checked');
  CONFIG.enable_to = $('#enable_to').prop('checked');
  CONFIG.hide_nl = $('#hide_nl').prop('checked');
  CONFIG.hide_bl = $('#hide_bl').prop('checked');
  CONFIG.hide_m = $('#hide_m').prop('checked');
  CONFIG.new_hit = $('#new_hit').prop('checked');
  CONFIG.pushbullet = $('#pushbullet').prop('checked');
  
  localStorage.setItem('CONFIG', JSON.stringify(CONFIG));

  $(CONFIG.hide_nl ? '.nl' : '.nl_hidden').toggleClass('nl nl_hidden');
  $(CONFIG.hide_bl ? '.bl' : '.bl_hidden').toggleClass('bl bl_hidden');
  $(CONFIG.hide_m ? '.m' : '.m_hidden').toggleClass('m m_hidden');
};

const TO_COLOR = (rating) => {
  let color = 'toLow';
  if (rating > 1.99) {color = 'toAverage';}
  if (rating > 2.99) {color = 'toGood';}
  if (rating > 3.99) {color = 'toHigh';}
  if (rating < 0.01) {color = 'toNone';}
  return color;
};

const VB_EXPORT = (data) => {
  const hit = hitlog[stuff.key];
  
  const attr = (type, rating) => {
    let color = '#B30000';
    if (rating > 1.99) {color = '#B37400';}
    if (rating > 2.99) {color = '#B3B300';}
    if (rating > 3.99) {color = '#00B300';}
    if (rating < 0.01) {color = 'grey'; rating = 'N/A';}
    return `[b][${type}: [color=${color}]${rating}[/color]][/b]`;
  };
  
  const template =
        `[table][tr][td][b]Title:[/b] [URL=${hit.prevlink}]${hit.title}[/URL] | [URL=${hit.pandlink}]PANDA[/URL]\n` +
        `[b]Requester:[/b] [URL=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/URL] [${hit.reqid}] ([URL=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/URL])\n` +
        `([URL=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/URL]): ` +
        `${attr('Pay', data.attrs.pay)} ${attr('Fair', data.attrs.fair)} ` +
        `${attr('Comm', data.attrs.comm)} ${attr('Fast', data.attrs.fast)} ` +
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? '[color=green]' + data.tos_flags : '[color=red]' + data.tos_flags}[/color]][/b]\n` +
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
        `[b][Reviews: ${data.reviews}][/b] ` +
        `[b][ToS: ${data.tos_flags === 0 ? '[color=green]' + data.tos_flags : '[color=red]' + data.tos_flags}[/color]][/b]\n</p>` +
        `<p>[b]Description:[/b] ${hit.desc}</p>` +
        `<p>[b]Time:[/b] ${hit.time}</p>` +
        `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
        `<p>[b]Reward:[/b] [COLOR=green][b] ${hit.reward}[/b][/COLOR]</p>` +
        `<p>[b]Qualifications:[/b] ${hit.quals}[/td][/tr]</p>` +
        `<p>[tr][td][CENTER][SIZE=2]HIT posted from Mturk Suite[/SIZE][/CENTER][/td][/tr][/table]</p>`;

  if (stuff.export === 'vb') {
    EXPORT_TO_CLIP(template);
  }
  
  if (stuff.export === 'vb_mtc') {
    const confirm_post = prompt('Do you want to post this HIT to MturkCrowd.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"', '');
    if (confirm_post !== null) {
      SEND_MTC(direct_template + `<p>${confirm_post}</p>`);
    }
  }
  if (stuff.export === 'vb_th') {
    const confirm_post = prompt('Do you want to post this HIT to TurkerHub.com?\n\nWant to add a comment about your HIT? Fill out the box below.\n\nTo send the HIT, click "Ok"', '');
    if (confirm_post !== null) {
      SEND_TH(direct_template + `<p>${confirm_post}</p>`);
    }
  }
};

const EXPORT_TO_CLIP = (template) => {
  $('body').append(`<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  $('#clipboard').select();
  document.execCommand('Copy');
  $('#clipboard').remove();
  alert('HIT export has been copied to your clipboard.');
};

const SEND_TH = (template) => {
  chrome.runtime.sendMessage({msg: 'send_th', data: template});
};

const SEND_MTC = (template) => {
  chrome.runtime.sendMessage({msg: 'send_mtc', data: template});
};
