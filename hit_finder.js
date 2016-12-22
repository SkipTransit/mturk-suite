document.addEventListener('DOMContentLoaded', () => {
  SET_CONFIG();
  SETTINGS_WRITE();
  BLOCK_LIST_WRITE();
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

const BLOCK_LIST = JSON.parse(localStorage.getItem('BLOCK_LIST')) || {};

const EXPORT = {key: null, type: null};

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

// Block List Stuff
$('html').on('click', '#block_list', function () {
  SHOW_BLOCK_LIST();
});

$('html').on('click', '#add_block_list', function () {
  ADD_BLOCK_LIST();
});

$('html').on('click', '#save_block_list', function () {
  SAVE_BLOCK_LIST();
});

$('html').on('click', '.bl_item', function () {
  EDIT_BLOCK_LIST($(this).data('key'));
});

$('html').on('click', '#save_edit_block_list', function () {
  SAVE_EDIT_BLOCK_LIST();
});

$('html').on('click', '#delete_edit_block_list', function () {
  DELETE_EDIT_BLOCK_LIST();
});

$('html').on('click', '#import_block_list', function () {
  IMPORT_BLOCK_LIST();
});

$('html').on('click', '#export_block_list', function () {
  EXPORT_BLOCK_LIST();
});

$('html').on('click', '.rt_block', function () {
  RT_ADD_BLOCK_LIST($(this).data('term'), $(this).data('name'));
});

// Include List Stuff
$('html').on('click', '#include_list', function () {
  SHOW_INCLUDE_LIST();
});

$('html').on('click', '#add_include_list', function () {
  ADD_INCLUDE_LIST();
});

// Setting Stuff
$('html').on('change', '#sort_by, #qualified, #enable_to, #hide_nl, #hide_bl, #hide_m, #new_hit, #pushbullet', function () {
  SAVE_CONFIG();
});

$('html').on('input', '#scan_delay, #min_reward, #min_avail, #min_to, #size', function () {
  SAVE_CONFIG();
});

$('html').on('click', '#settings', function () {
  SHOW_SETTINGS();
});

$('html').on('change', '#voices', function () {
  const msg = new SpeechSynthesisUtterance();
  msg.text = 'This is my voice.';
  msg.voice = window.speechSynthesis.getVoices()[$('#voices').val()];
  window.speechSynthesis.speak(msg);
});

// Export Stuff
$('html').on('click', '.vb', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hitlog[key].reqid});
});

$('html').on('click', '.vb_th', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb_th';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hitlog[key].reqid});
});

$('html').on('click', '.vb_mtc', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb_mtc';
  chrome.runtime.sendMessage({msg: 'hitexport', data: hitlog[key].reqid});
});

$(document).on('show.bs.modal', '.modal', function (event) {
  const zindex = 1040 + (10 * $('.modal:visible').length);
  $(this).css('z-index', zindex);
  setTimeout( () => { $('.modal-backdrop').not('.modal-stack').css('z-index', zindex - 1).addClass('modal-stack'); }, 0);
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

const FIND_OLD = (data) => {
  let ids = []; keys = [];

  var $hits = $(data).find('table[cellpadding="0"][cellspacing="5"][border="0"]').eq(0).children('tbody').children('tr');
  
  for (let i = 0; i < $hits.length; i ++) {
    var $hit = $hits.eq(i);

    let req_id, req_name, req_link, to_link;
    var req = $hit.find('a[href*="requesterId="]');
    if (req.length) {
      req_id    = req.prop('href').split('requesterId=')[1];
      req_name  = $hit.find('span.requesterIdentity').text().trim();
      req_link  = 'https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=' + req_id;
      to_link   = 'https://turkopticon.ucsd.edu/' + req_id;
    }
    else {
      req_name  = $hit.find('span.requesterIdentity').text().trim();
      req_id    = $hit.find('span.requesterIdentity').text().trim();
      req_link  = 'https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=' + req_id.replace(/ /g, '+');
      con_link  = 'https://#';
      to_link   = 'https://turkopticon.ucsd.edu/main/php_search?field=name&query=' + req_id.replace(/ /g, '+');
    }

    const group_id = $hit.find('a[href*="roupId="]').length ? $hit.find('a[href*="roupId="]').prop('href').match(/roupId=(.*)/)[1] : null;
    const prev_link = `https://www.mturk.com/mturk/preview?groupId=${group_id}`;
    const pand_link = `https://www.mturk.com/mturk/previewandaccept?groupId=${group_id}`;

    const title  = $hit.find('a.capsulelink').text();
    const desc   = $hit.find('.capsule_field_title:contains(Description:)').next().text();
    const time   = $hit.find('.capsule_field_title:contains(Time Allotted:)').next().text();
    const reward = $hit.find('.capsule_field_title:contains(Reward:)').next().text();
    const avail  = $hit.find('.capsule_field_title:contains(HITs Available:)').next().text() || 'N/A';

    const quals   = $hit.find('td[style="padding-right: 2em; white-space: nowrap;"]');
    let	qualif  = 'None;', masters = 'N';
    if (quals.length) {
      qualif = '';
      for (var j = 0; j < quals.length; j ++) {
        qualif += quals.eq(j).text().trim().replace(/\s+/g, ' ') + '; ';
      }
      if (qualif.indexOf('Masters has been granted') !== -1) {
        masters = 'Y';
      }
    }

    var key = group_id || req_id.trim() + title.trim() + reward.trim();
    keys.push(key);

    if (!hitlog[key]) {
      hitlog[key] = {
        reqid    : req_id.trim(),
        reqname  : req_name.trim(),
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
    const time = TIME();
    const tr_color = TO_COLOR(data[hit.reqid].attrs.pay);
    const blocked = IS_BLOCKED(hit);
    
    let classes = '';
    if (blocked) {
      classes += CONFIG.hide_bl ? ' bl_hidden' : ' bl';
    }
    
    found_html += 
      `<tr class="${tr_color}${classes}">` +
      // Requester
      `  <td>` +
      `    <div class="btn-group btn-group-xs">` +
      `      <button class="btn btn-danger rt_block" data-toggle="tooltip" data-placement="right" title="Block this requester." data-term="${hit.reqid}" data-name="${hit.reqname}">R</button>` +
      `      <button class="btn btn-danger rt_block" data-toggle="tooltip" data-placement="right" title="Block this HIT." data-term="${hit.groupid}" data-name="${hit.title}">T</button>` +
      `    </div>` +
      `    <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
      `  </td>` +
      // Project
      `  <td>` +
      `    <div class="btn-group btn-group-xs">` +
      `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
      `        Export <span class="caret"></span>` +
      `      </button>` +
      `      <ul class="dropdown-menu">` +
      `        <li><a class="vb" data-key="${hit.key}">Forum</a></li>` +
      `        <li><a class="vb_th" data-key="${hit.key}">TH Direct</a></li>` +
      `        <li><a class="vb_mtc" data-key="${hit.key}">MTC Direct</a></li>` +
      `      </ul>` +
      `    </div>` +
      `    <a href="${hit.prevlink}" target="_blank">${hit.title}</a>` +
      `  </td>` +
      // Tasks
      `  <td>${hit.avail}</td>` +
      // Accept and Reward
      `  <td><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
      // TO
      `  <td>${data[hit.reqid].attrs.pay}</td>` +
      // Masters
      `  <td>${hit.masters}</td>` +
      `</tr>`
    ;
    
    if (hit.new && !blocked) {
      logged_html += 
        `<tr class="${tr_color}">` +
        // Time
        `  <td>${time}</td>` +
        // Requester
        `  <td>` +
        `    <div class="btn-group btn-group-xs">` +
        `      <button class="btn btn-danger rt_block" data-toggle="tooltip" data-placement="right" title="Block this requester." data-term="${hit.reqid}" data-name="${hit.reqname}">R</button>` +
        `      <button class="btn btn-danger rt_block" data-toggle="tooltip" data-placement="right" title="Block this HIT." data-term="${hit.groupid}" data-name="${hit.title}">T</button>` +
        `    </div>` +
        `    <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
        `  </td>` +
        // Project
        `  <td>` +
        `    <div class="btn-group btn-group-xs">` +
        `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
        `        Export <span class="caret"></span>` +
        `      </button>` +
        `      <ul class="dropdown-menu">` +
        `        <li><a class="vb" data-key="${hit.key}">Forum</a></li>` +
        `        <li><a class="vb_th" data-key="${hit.key}">TH Direct</a></li>` +
        `        <li><a class="vb_mtc" data-key="${hit.key}">MTC Direct</a></li>` +
        `      </ul>` +
        `    </div>` +
        `    <a href="${hit.prevlink}" target="_blank">${hit.title}</a>` +
        `  </td>` +
        // Accept and Reward
        `  <td><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
        // TO
        `  <td>${data[hit.reqid].attrs.pay}</td>` +
        // Masters
        `  <td>${hit.masters}</td>` +
        `</tr>`
      ;
    }
  }
  $('#found_tbody').html(found_html);
  $('#logged_tbody').prepend(logged_html);
  $('[role="tooltip"]').remove();
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
};

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

const TIME = () => {
  const date = new Date();
  let hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes}${ampm}`;
};

// Block List Stuff
const IS_BLOCKED = (hit) => {
  for (let key in BLOCK_LIST) {
    const bl = BLOCK_LIST[key];
    if (bl.term.toLowerCase() === hit.reqname.toLowerCase() || bl.term.toLowerCase() === hit.title.toLowerCase() || bl.term.toLowerCase() === hit.reqid.toLowerCase() || bl.term.toLowerCase() === hit.groupid.toLowerCase()) {
      return true;
    }
  }
}

const SHOW_BLOCK_LIST = () => {
  $('#block_list_modal').modal('show');
};

const ADD_BLOCK_LIST = () => {
  $('#block_list_add').modal('show');
};

const RT_ADD_BLOCK_LIST = (term, name) => {
  $('#save_block_list_term').val(term);
  $('#save_block_list_name').val(name);
  $('#block_list_add').modal('show');
};

const SAVE_BLOCK_LIST = () => {
  const term = $('#save_block_list_term').val();
  const name = $('#save_block_list_name').val() === '' ? $('#save_block_list_term').val() : $('#save_block_list_name').val();
  
  if (!BLOCK_LIST[term]) {
    BLOCK_LIST[term] = {term: term, name: name};
    BLOCK_LIST_WRITE();
  }
  $('#block_list_add').modal('hide');
  $('#save_block_list_term, #save_block_list_name').val('');
};

const EDIT_BLOCK_LIST = (key) => {
  $('#edit_block_list_term').val(BLOCK_LIST[key].term);
  $('#edit_block_list_name').val(BLOCK_LIST[key].name);
  $('#block_list_edit').modal('show');
};

const SAVE_EDIT_BLOCK_LIST = () => {
  const term = $('#edit_block_list_term').val();
  const name = $('#edit_block_list_name').val() === '' ? $('#edit_block_list_term').val() : $('#edit_block_list_name').val();
  BLOCK_LIST[term].name = name;
  BLOCK_LIST_WRITE();
  $('#block_list_edit').modal('hide');
};

const DELETE_EDIT_BLOCK_LIST = () => {
  const term = $('#edit_block_list_term').val();
  delete BLOCK_LIST[term];
  BLOCK_LIST_WRITE();
  $('#block_list_edit').modal('hide');
};

const BLOCK_LIST_WRITE = () => {
  let block_list_sorted = [], html = '';
  
  for (let key in BLOCK_LIST) {
    block_list_sorted.push([key, BLOCK_LIST[key].name]);
  }
  
  block_list_sorted.sort( (a, b) => {
    if (a[1].toLowerCase() < b[1].toLowerCase()) return -1;
    if (a[1].toLowerCase() > b[1].toLowerCase()) return 1;
    return 0;
  });
  
  for (let i = 0; i < block_list_sorted.length; i ++) {
    const bl = BLOCK_LIST[block_list_sorted[i][0]];
    html += `<button type="button" class="btn btn-xs btn-danger bl_item" data-key="${bl.term}" style="margin: 2px;">${bl.name}</button>`;
  }
  
  $('#block_list_modal').find('.modal-body').html(html);
  
  localStorage.setItem('BLOCK_LIST', JSON.stringify(BLOCK_LIST));
};

const IMPORT_BLOCK_LIST = () => {
  let import_block_list  = prompt(
    `Block List Import\n\n` +
    `This will not delete your current block list, only add to it.\n\n` +
    `Please enter your block list here.`,
    ``
  );

  if (import_block_list) {
    const json = VALID_JSON(import_block_list);

    if (json) {
      const bl = JSON.parse(import_block_list);
      for (let key in bl) {
        if (bl[key].hasOwnProperty(`term`) && bl[key].hasOwnProperty(`name`) && !bl[key].hasOwnProperty(`sound`)) {
          if (!BLOCK_LIST[key]) {
            BLOCK_LIST[key] = {
              term : bl[key].term,
              name : bl[key].name
            };
          }
        }
        else {
          alert('An error occured while importing.\n\n Please check if you have a valid import and try again.');
          break;
        }
      }
      BLOCK_LIST_WRITE();
    }
  }
  else {
    alert('An error occured while importing.\n\n Please check if you have a valid import and try again.');
  }
};

const EXPORT_BLOCK_LIST = () => {
  COPY_TO_CLIP(localStorage.getItem('BLOCK_LIST'), 'Your block list has been copied to your clipboard.');
};

//Incude List Stuff
const SHOW_INCLUDE_LIST = () => {
  $('#include_list_modal').modal('show');
};

const ADD_INCLUDE_LIST = () => {
  $('#include_list_add').modal('show');
};

// Settings Stuff
const SHOW_SETTINGS = () => {
  $('#settings_modal').modal('show');
};

const SETTINGS_WRITE = () => {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices().forEach( (voice, index) => {
      $('#voices').append(`<option value="${index}">${(voice.name + (voice.default ? ' (default)' :''))}</option>`);
    });
  }
};

// Export Stuff
const VB_EXPORT = (data) => {
  const hit = hitlog[EXPORT.key];
  
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
        `[/td][/tr][/table]`
  ;
  
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
        `<p>[tr][td][CENTER][SIZE=2]HIT posted from Mturk Suite[/SIZE][/CENTER][/td][/tr][/table]</p>`
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
};

const EXPORT_TO_TH = (template) => {
  chrome.runtime.sendMessage({msg: 'send_th', data: template});
};

const EXPORT_TO_MTC = (template) => {
  chrome.runtime.sendMessage({msg: 'send_mtc', data: template});
};

// Random Stuff
const COPY_TO_CLIP = (string, message) => {
  $('body').append(`<textarea id="clipboard" style="opacity: 0;">${string}</textarea>`);
  $('#clipboard').select();
  document.execCommand('Copy');
  $('#clipboard').remove();
  alert(message);
};

const VALID_JSON = (data) => {
  try {
    JSON.parse(data);
    return true;
  }
  catch (e) {
    return false;
  }
};
