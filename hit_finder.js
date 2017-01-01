document.addEventListener('DOMContentLoaded', function () {
  SET_CONFIG();
  BLOCK_LIST_WRITE();
  INCLUDE_LIST_WRITE();
  window.speechSynthesis.getVoices();
});

let timeout;
let KEYS = [];
let HITS = {};
let LOGGED_IN = true;
let TOTAL_SCANS = 1;
let LOGGED_HITS = 0;
let REQUEST_ERRORS = 1;
const DELAY_ALERTS = [];
const DELAY_PUSHBULLET = [];

const BLOCK_LIST = JSON.parse(localStorage.getItem('BLOCK_LIST')) || {};
const INCLUDE_LIST = JSON.parse(localStorage.getItem('INCLUDE_LIST')) || {};

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
  pushbullet : LOADED_CONFIG.hasOwnProperty('pushbullet') ? LOADED_CONFIG.pushbullet : false,
  
  pushbullet_token : LOADED_CONFIG.pushbullet_token || 'access_token_here',
  site_to_scan     : LOADED_CONFIG.site_to_scan     || 'mturk',
  new_hit_sound    : LOADED_CONFIG.new_hit_sound    || '1',
  include_voice    : LOADED_CONFIG.include_voice    || '0',
  include_sound    : LOADED_CONFIG.include_sound    || '1'
  
};

$('html').on('click', '#scan', function () {
  clearTimeout(timeout);
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

$('html').on('click', '#save_include_list', function () {
  SAVE_INCLUDE_LIST();
});

$('html').on('click', '.il_item', function () {
  EDIT_INCLUDE_LIST($(this).data('key'));
});

$('html').on('click', '#save_edit_include_list', function () {
  SAVE_EDIT_INCLUDE_LIST();
});

$('html').on('click', '#delete_edit_include_list', function () {
  DELETE_EDIT_INCLUDE_LIST();
});

$('html').on('click', '#import_include_list', function () {
  IMPORT_INCLUDE_LIST();
});

$('html').on('click', '#export_include_list', function () {
  EXPORT_INCLUDE_LIST();
});

$('html').on('click', '#test_include_list', function () {
  const test = {
    term: $('#save_include_list_term').val(),
    name: $('#save_include_list_name').val() === '' ? $('#save_include_list_term').val() : $('#save_include_list_name').val(),
    type: $('#save_include_list_type').val(),
    sound: $('#save_include_list_sound').prop('checked'),
    notification: $('#save_include_list_notification').prop('checked'),
    pushbullet: $('#save_include_list_pushbullet').prop('checked')
  };
  INCLUDED_ALERTS_TEST(test);
});

$('html').on('click', '#test_edit_include_list', function () {
  const test = {
    term: $('#edit_include_list_term').val(),
    name: $('#edit_include_list_name').val() === '' ? $('#edit_include_list_term').val() : $('#edit_include_list_name').val(),
    type: $('#edit_include_list_type').val(),
    sound: $('#edit_include_list_sound').prop('checked'),
    notification: $('#edit_include_list_notification').prop('checked'),
    pushbullet: $('#edit_include_list_pushbullet').prop('checked')
  };
  INCLUDED_ALERTS_TEST(test);
});

$('html').on('click', '.rt_include', function () {
  RT_ADD_INCLUDE_LIST($(this).data('term'), $(this).data('name'));
});

// Setting Stuff
$('html').on('change', '#sort_by, #qualified, #enable_to, #hide_nl, #hide_bl, #hide_m, #new_hit, #pushbullet, #site_to_scan, #new_hit_sound, #include_voice, #include_sound', function () {
  SAVE_CONFIG();
});

$('html').on('input', '#scan_delay, #min_reward, #min_avail, #min_to, #size, #pushbullet_token', function () {
  SAVE_CONFIG();
});

$('html').on('click', '#advanced_settings', function () {
  SHOW_ADVANCED_SETTINGS();
});

$('html').on('click', '#save_advanced_settings', function () {
  SAVE_ADVANCED_SETTINGS();
});

$('html').on('change', '#include_voice', function () {
  SPEAK(`This is my voice.`);
});

$('html').on('change', '#include_sound', function () {
  INCLUDE_SOUND();
});

$('html').on('change', '#new_hit_sound', function () {
  NEW_HIT_SOUND();
});

// Export Stuff
$('html').on('click', '.vb', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb';
  TODB_HIT_EXPORT(HITS[key].reqid);
});

$('html').on('click', '.vb_th', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb_th';
  TODB_HIT_EXPORT(HITS[key].reqid);
});

$('html').on('click', '.vb_mtc', function () {
  const key = $(this).data('key');
  EXPORT.key = key;
  EXPORT.type = 'vb_mtc';
  TODB_HIT_EXPORT(HITS[key].reqid);
});

// Modal Stuff
$(document).on('show.bs.modal', '.modal', function (event) {
  const zindex = 1040 + (10 * $('.modal:visible').length);
  $(this).css('z-index', zindex);
  setTimeout( function () { $('.modal-backdrop').not('.modal-stack').css('z-index', zindex - 1).addClass('modal-stack'); }, 0);
});

//
$('html').on('click', '.panel-heading.toggle', function () {
  $(this).children(`.glyphicon`).toggleClass(`glyphicon-resize-small glyphicon-resize-full`);
  $(this).next().toggle();
});


// Find HITs Stuff
function FIND () {
  clearTimeout(timeout);
  
  if (CONFIG.site_to_scan === `mturk`) {
  const  url = 
        `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups` +
        `&sortType=${SEARCH_TYPE()}` +
        `&pageSize=${CONFIG.size}` +
        `&minReward=${CONFIG.min_reward}` +
        `&qualifiedFor=${(CONFIG.qualified ? 'on' : 'off')}`
  ;  
  GET_HITS(url, PARSE_OLD_HITS);
  }
  
  if (CONFIG.site_to_scan === `worker`) {
    $.ajax({
      url: `https://worker.mturk.com/`,
      type: `GET`,
      data: {
        page_size: CONFIG.size,
        sort: CONFIG.sort_by === 'latest' ? `updated_desc` : CONFIG.sort_by === 'most' ? `num_hits_desc` : `reward_desc`,
        filters : {
          qualified: CONFIG.qualified ? true : false, 
          masters: false,
          min_reward: CONFIG.min_reward
        }
      },
      statusCode: {
        200: function (response) {
          if ($.type(response) === `object`) {
            PARSE_NEW_HITS(response);
          }
          else {
            if (LOGGED_IN) {
              LOGGED_IN = false;
              SPEAK(`Attention, You are logged out.`);
              $('.panel').removeClass('panel-primary').addClass('panel-danger');
            }
            $(`#total_scans`).text(TOTAL_SCANS ++);
            timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
          }
        },
        429: function () {
          $(`#total_scans`).text(TOTAL_SCANS ++);
          $(`#request_errors`).text(REQUEST_ERRORS ++);
          timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
        }
      }
    });
  }
}

function GET_HITS (url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.send();
  xhr.onload = function () {
    if (this.status === 200) {
      callback(this.response);
    }
    else {
      console.log(`Error: ${this.status} | ${this.statusText}`);
    }
  };
  xhr.onerror = function () {
    console.log(`Error: ${this.status} | ${this.statusText}`);
  };
}

function SEARCH_TYPE () {
  if (CONFIG.sort_by === 'latest') {
    return 'LastUpdatedTime%3A1';
  }
  if (CONFIG.sort_by === 'most') {
    return 'NumHITs%3A1';
  }
  if (CONFIG.sort_by === 'reward') {
    return 'Reward%3A1';
  }
}

function PARSE_NEW_HITS (data) {
  const ids = []; KEYS = [];

  const hits = data.results;

  for (let i = 0; i < hits.length; i ++) {
    const hit = hits[i];
    
    const obj = {
      reqid: hit.requester_id,
      reqname: hit.requester_name,
      reqlink: `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit.requester_id}`,
      title: hit.title,
      desc: hit.description,
      time: SECONDS_TO_STRING(hit.assignment_duration_in_seconds),
      reward: `$${hit.monetary_reward.amount_in_dollars.toFixed(2)}`,
      avail: hit.assignable_hits_count,
      groupid: hit.hit_set_id,
      prevlink: `https://www.mturk.com/mturk/preview?groupId=${hit.hit_set_id}`,
      pandlink: `https://www.mturk.com/mturk/previewandaccept?groupId=${hit.hit_set_id}`,
      
      quals:
      hit.hit_requirements.length ?
      hit.hit_requirements.map(obj => `${obj.qualification_type.name} ${obj.comparator} ${obj.qualification_values.map(val => val).join(`, `)};`).join(` `):
      `None;`,
      
      masters: `N`,
      new: true
    }
    
    const key = obj.groupid;
    KEYS.push(key);
    
    if (ids.indexOf(obj.reqid) === -1) {
      ids.push(obj.reqid);
    } 
    if (obj.quals.indexOf('Masters Exists') !== -1) {
      obj.masters = 'Y';
    }
    if (HITS[key]) {
      obj.new = false;
    }
    HITS[key] = obj;
  }
  
  HIT_FINDER_DB();
  
  if (CONFIG.enable_to) {
    TURKOPTICON_DB(ids);
  }
  else {
    HITS_WRITE_LOGGED_IN(false);
  }

  if (!LOGGED_IN) {
    LOGGED_IN = true;
    SPEAK(`Attention, You are logged in.`);
    $('.panel').removeClass('panel-danger').addClass('panel-primary');
  }
}

function PARSE_OLD_HITS (data) {
  const ids = []; KEYS = [];
  
  const doc = document.implementation.createHTMLDocument().documentElement; doc.innerHTML = data;
  const hits = doc.querySelectorAll('table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr');
  const logged_in = doc.querySelector(`a[href="/mturk/beginsignout"]`);
 
  const request_error = doc.querySelector(`.error_title`) ? doc.querySelector(`.error_title`).textContent.match(/You have exceeded/) ? true : false : false;
  if (request_error) {
    document.getElementById(`total_scans`).textContent = TOTAL_SCANS ++;
    document.getElementById(`request_errors`).textContent = REQUEST_ERRORS ++;
    timeout = setTimeout(FIND, 2500);
    return;
  }  
  
  for (let i = 0; i < hits.length; i ++) {    
    const hit = selector => hits[i].querySelectorAll(selector);
    
    const obj = {
      reqid:
      logged_in ?
      hit('[href*="requesterId="]')[0].getAttribute('href').match(/requesterId=(.*)/)[1]:
      hit('.requesterIdentity')[0].textContent.trim(),
      
      reqname: 
      hit('.requesterIdentity')[0].textContent.trim(),
          
      reqlink:
      logged_in ?
      `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit('[href*="requesterId="]')[0].getAttribute('href').match(/requesterId=(.*)/)[1]}`:
      `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit('.requesterIdentity')[0].textContent.trim().replace(/ /g, `+`)}`,
          
      title:
      hit('a.capsulelink')[0].textContent.trim(),
         
      desc:
      hit('.capsule_field_text')[5].textContent.trim(),

      time:
      hit('.capsule_field_text')[2].textContent.trim(),
          
      reward:
      hit('.capsule_field_text')[3].textContent.trim(),
          
      avail:
      logged_in ?
      hit('.capsule_field_text')[4].textContent.trim():
      `N/A`,

      groupid:
      hit('[href*="roupId="]')[0] ?
      hit('[href*="roupId="]')[0].getAttribute('href').match(/roupId=(.*)/)[1]:
      `null`,
                
      prevlink:
      hit('[href*="roupId="]')[0] ?
      `https://www.mturk.com/mturk/preview?groupId=${hit('[href*="roupId="]')[0].getAttribute('href').match(/roupId=(.*)/)[1]}`:
      `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit('a.capsulelink')[0].textContent.trim()}`,
          
      pandlink:
      hit('[href*="roupId="]')[0] ?
      `https://www.mturk.com/mturk/previewandaccept?groupId=${hit('[href*="roupId="]')[0].getAttribute('href').match(/roupId=(.*)/)[1]}`:
      `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit('a.capsulelink')[0].textContent.trim()}`,
  
      quals: 
      hit('td[style="padding-right: 2em; white-space: nowrap;"]')[0] ?
      [...hit('td[style="padding-right: 2em; white-space: nowrap;"]')].map(element => `${element.textContent.trim()};`).join(` `):
      `None;`,
      
      masters: 'N',
      new: true
    };
        
    const key = obj.groupid !== `null` ? obj.groupid : obj.reqid + obj.title + obj.reward;
    KEYS.push(key);
    
    if (ids.indexOf(obj.reqid) === -1) {
      ids.push(obj.reqid);
    } 
    if (obj.quals.indexOf('Masters has been granted') !== -1) {
      obj.masters = 'Y';
    }
    if (HITS[key]) {
      obj.new = false;
    }
    HITS[key] = obj;
  }
  
  if (hits.length) {
    if (logged_in) {
      HIT_FINDER_DB();
      if (CONFIG.enable_to) {
        TURKOPTICON_DB(ids);
      }
      else {
        HITS_WRITE_LOGGED_IN(false);
      }
    }
    else {
      HITS_WRITE_LOGGED_OUT();
    }
  }
  else {
    timeout = setTimeout(FIND, 2500);
  }
  
  if (LOGGED_IN && !logged_in) {
    LOGGED_IN = false;
    SPEAK(`Attention, You are logged out.`);
    $('.panel').removeClass('panel-primary').addClass('panel-danger');
  }
  if (!LOGGED_IN && logged_in) {
    LOGGED_IN = true;
    SPEAK(`Attention, You are logged in.`);
    $('.panel').removeClass('panel-danger').addClass('panel-primary');
  }
}

function HITS_WRITE_LOGGED_IN (data) {
  let found_html = '', logged_html = '', hits_hidden = 0, logged = false;
  
  for (let i = 0; i < KEYS.length; i ++) {
    const hit = HITS[KEYS[i]];
    const time = TIME();
    const tr_color = TO_COLOR((data ? data[hit.reqid].attrs.pay : 0));
    const blocked = IS_BLOCKED(hit);
    const included = IS_INCLUDED(hit);
    
    let classes = '', log = true;
    if (blocked) {
      classes += CONFIG.hide_bl ? ' bl_hidden' : ' bl';
      classes += CONFIG.hide_nl ? ' nl_hidden' : ' nl';
    }
    else if (included) {
      classes += ' il';
      INCLUDED_ALERTS(included, hit);
    }
    else {
      classes += CONFIG.hide_nl ? ' nl_hidden' : ' nl';
    }
    if (hit.masters === 'Y') {
      classes += CONFIG.hide_m ? ' m_hidden' : ' m';
      log = false;
    }
    if (Number(CONFIG.min_avail) > Number(hit.avail) || data && Number(CONFIG.min_to) > Number(data[hit.reqid].attrs.pay)) {
      classes += ' hidden';
      log = false;
    }
    if (classes.indexOf(`hidden`) !== -1) {
      hits_hidden ++;
    }
        
    function hit_write (to, logged) {
      const html = 
        `<tr class="${tr_color}${classes}">` +
        // Time
        (logged ? `<td>${time}</td>` : ``) +
        // Requester
        `  <td>` +
        `    <div class="btn-group btn-group-xs">` +
        `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
        `        <span class="glyphicon glyphicon-wrench" aria-hidden="true"></span>` +
        `        <span class="caret"></span>` +
        `      </button>` +
        `      <ul class="dropdown-menu">` +
        `        <li><a class="rt_block" data-term="${hit.reqid}" data-name="${hit.reqname}">Block List Requester</a></li>` +
        `        <li><a class="rt_block" data-term="${hit.groupid}" data-name="${hit.title}">Block List HIT</a></li>` +
        `        <li><a class="rt_include" data-term="${hit.reqid}" data-name="${hit.reqname}">Include List Requester</a></li>` +
        `        <li><a class="rt_include" data-term="${hit.groupid}" data-name="${hit.title}">Include List HIT</a></li>` +
        `      </ul>` +
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
        `        <li><a class="vb" data-key="${KEYS[i]}">Forum</a></li>` +
        `        <li><a class="vb_th" data-key="${KEYS[i]}">TH Direct</a></li>` +
        `        <li><a class="vb_mtc" data-key="${KEYS[i]}">MTC Direct</a></li>` +
        `      </ul>` +
        `    </div>` +
        `    <a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" title="${hit.quals.replace(/; /g, `;<br>`)}">${hit.title}</a>` +
        `  </td>` +
        // Tasks
        (!logged ? `<td class="text-center">${hit.avail}</td>>` : ``) +
        // Accept and Reward
        `  <td class="text-center"><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
        // TO
        `  <td class="text-center">` +
        `    <a href="https://turkopticon.ucsd.edu/${hit.reqid}" target="_blank" data-toggle="tooltip" data-placement="left" data-html="true" ` +
        (to ?`title="Pay: ${to[hit.reqid].attrs.pay} Fair: ${to[hit.reqid].attrs.fair}<br>Comm: ${to[hit.reqid].attrs.comm} Fast: ${to[hit.reqid].attrs.fast}<br>Reviews: ${to[hit.reqid].reviews} ToS: ${to[hit.reqid].tos_flags}">${to[hit.reqid].attrs.pay}</a>`: `title="TO Off">Off</a>`) +
        `  </td>` +
        // Masters
        `  <td class="text-center">${hit.masters}</td>` +
        `</tr>`
      ;
      return html;
    }
    
    found_html += hit_write(data, false);
    
    if (hit.new && !blocked && log) {
      LOGGED_HITS ++; logged = true;
      logged_html += hit_write(data, true);
    }
  }
  if (logged && CONFIG.new_hit) { NEW_HIT_SOUND(); }
  $('#hits_found').text(KEYS.length);
  $('#hits_hidden').text(hits_hidden);
  $('#total_scans').text(TOTAL_SCANS ++);
  $('#hits_logged').text(LOGGED_HITS);
  $('#found_tbody').html(found_html);
  $('#logged_tbody').prepend(logged_html);
  $('[data-toggle="tooltip"]').tooltip();

  if ($('#scan').text() === 'Stop') {
    timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
  }
}

function HITS_WRITE_LOGGED_OUT () {
  let found_html = '', logged_html = '';
  
  for (let i = 0; i < KEYS.length; i ++) {
    const hit = HITS[KEYS[i]];
    const time = TIME();
    const tr_color = TO_COLOR(0);
    const blocked = IS_BLOCKED(hit);
    const included = IS_INCLUDED(hit);
    
    let classes = '', log = true;
    if (blocked) {
      classes += CONFIG.hide_bl ? ' bl_hidden' : ' bl';
      classes += CONFIG.hide_nl ? ' nl_hidden' : ' nl';
    }
    else if (included) {
      classes += ' il';
      INCLUDED_ALERTS(included, hit);
    }
    else {
      classes += CONFIG.hide_nl ? ' nl_hidden' : ' nl';
    }
    if (hit.masters === 'Y') {
      classes += CONFIG.hide_m ? ' m_hidden' : ' m';
      log = false;
    }
    if (Number(CONFIG.min_avail) > Number(hit.avail)) {
      classes += ' hidden';
      log = false;
    }
    
    const qualtip = hit.quals.replace(/; /g, `;<br>`);
        
    found_html += 
      `<tr class="${tr_color}${classes}">` +
      // Requester
      `  <td>` +
      `    <div class="btn-group btn-group-xs">` +
      `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
      `        <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>` +
      `        <span class="caret"></span>` +
      `      </button>` +
      `      <ul class="dropdown-menu">` +
      `        <li><a class="rt_block" data-term="${hit.reqid}" data-name="${hit.reqname}">Block List Requester</a></li>` +
      `        <li><a class="rt_block" data-term="${(hit.groupid !== `null` ? hit.groupid: hit.title)}" data-name="${hit.title}">Block List HIT</a></li>` +
      `        <li><a class="rt_include" data-term="${hit.reqid}" data-name="${hit.reqname}">Include List Requester</a></li>` +
      `        <li><a class="rt_include" data-term="${(hit.groupid !== `null` ? hit.groupid: hit.title)}" data-name="${hit.title}">Include List HIT</a></li>` +
      `      </ul>` +
      `    </div>` +
      `    <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
      `  </td>` +
      // Project
      `  <td>` +
      `    <a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" title="${qualtip}">${hit.title}</a>` +
      `  </td>` +
      // Tasks
      `  <td>${hit.avail}</td>` +
      // Accept and Reward
      `  <td><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
      // TO
      `  <td>` +
      `    <a href="https://turkopticon.ucsd.edu/main/php_search?field=name&query=${hit.reqname}" target="_blank" data-toggle="tooltip" data-placement="left" data-html="true" title="Logged Out">N/A</a>` +
      `  </td>` +
      // Masters
      `  <td>${hit.masters}</td>` +
      `</tr>`
    ;
    
    if (hit.new && !blocked && log) {
      LOGGED_HITS ++;
      
      logged_html += 
        `<tr class="${tr_color}${classes}">` +
        // Time
        `  <td>${time}</td>` +
        // Requester
        `  <td>` +
        `    <div class="btn-group btn-group-xs">` +
        `      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
        `        <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>` +
        `        <span class="caret"></span>` +
        `      </button>` +
        `      <ul class="dropdown-menu">` +
        `        <li><a class="rt_block" data-term="${hit.reqid}" data-name="${hit.reqname}">Block List Requester</a></li>` +
        `        <li><a class="rt_block" data-term="${(hit.groupid !== `null` ? hit.groupid: hit.title)}" data-name="${hit.title}">Block List HIT</a></li>` +
        `        <li><a class="rt_include" data-term="${hit.reqid}" data-name="${hit.reqname}">Include List Requester</a></li>` +
        `        <li><a class="rt_include" data-term="${(hit.groupid !== `null` ? hit.groupid: hit.title)}" data-name="${hit.title}">Include List HIT</a></li>` +
        `      </ul>` +
        `    </div>` +
        `    <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>` +
        `  </td>` +
        // Project
        `  <td>` +
        `    <a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" title="${qualtip}">${hit.title}</a>` +
        `  </td>` +
        // Accept and Reward
        `  <td><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
        // TO
        `  <td>` +
        `    <a href="https://turkopticon.ucsd.edu/main/php_search?field=name&query=${hit.reqname}" target="_blank" data-toggle="tooltip" data-placement="left" data-html="true" title="Logged Out">N/A</a>` +
        `  </td>` +
        // Masters
        `  <td>${hit.masters}</td>` +
        `</tr>`
      ;
    }
  }
  $('#hits_found').text(KEYS.length);
  $('#total_scans').text(TOTAL_SCANS);
  $('#hits_logged').text(LOGGED_HITS);
  $('#found_tbody').html(found_html);
  $('#logged_tbody').prepend(logged_html);
  $('[data-toggle="tooltip"]').tooltip();
  
  if ($('#scan').text() === 'Stop') {
    timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
  }
}

function TO_COLOR (rating) {
  let color = 'toLow';
  if (rating > 1.99) {color = 'toAverage';}
  if (rating > 2.99) {color = 'toGood';}
  if (rating > 3.99) {color = 'toHigh';}
  if (rating < 0.01) {color = 'toNone';}
  return color;
}

function TIME () {
  const date = new Date();
  let hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? `pm` : `am`;
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? `0` + minutes : minutes;
  return `${hours}:${minutes}${ampm}`;
}

function SECONDS_TO_STRING (s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  return `${(h > 0 ? `${h} hour${h > 1 ? `s` : ``} ` : ``)}${(m > 0 ? `${m} minute${m > 1 ? `s` : ``}` : ``)}`;
}

// Block List Stuff
function IS_BLOCKED (hit) {
  for (let key in BLOCK_LIST) {
    const bl = BLOCK_LIST[key];
    if (bl.term.toLowerCase() === hit.reqname.toLowerCase() || bl.term.toLowerCase() === hit.title.toLowerCase() || bl.term.toLowerCase() === hit.reqid.toLowerCase() || bl.term.toLowerCase() === hit.groupid.toLowerCase()) {
      return bl;
    }
  }
}

function SHOW_BLOCK_LIST () {
  $('#block_list_modal').modal('show');
}

function ADD_BLOCK_LIST () {
  $('#save_block_list_term').val('');
  $('#save_block_list_name').val('');
  
  $('#block_list_add').modal('show');
}

function RT_ADD_BLOCK_LIST (term, name) {
  $('#save_block_list_term').val(term);
  $('#save_block_list_name').val(name);
  
  $('#block_list_add').modal('show');
}

function SAVE_BLOCK_LIST () {
  const term = $('#save_block_list_term').val();
  const name = $('#save_block_list_name').val() === '' ? $('#save_block_list_term').val() : $('#save_block_list_name').val();
  
  if (!BLOCK_LIST[term]) {
    BLOCK_LIST[term] = {term: term, name: name};
    BLOCK_LIST_WRITE();
  }
  
  $('#block_list_add').modal('hide');
  $('#save_block_list_term, #save_block_list_name').val('');
}

function EDIT_BLOCK_LIST (key) {
  $('#edit_block_list_term').val(BLOCK_LIST[key].term);
  $('#edit_block_list_name').val(BLOCK_LIST[key].name);
  
  $('#block_list_edit').modal('show');
}

function SAVE_EDIT_BLOCK_LIST () {
  const term = $('#edit_block_list_term').val();
  const name = $('#edit_block_list_name').val() === '' ? $('#edit_block_list_term').val() : $('#edit_block_list_name').val();
  
  BLOCK_LIST[term].name = name;
  BLOCK_LIST_WRITE();
  
  $('#block_list_edit').modal('hide');
}

function DELETE_EDIT_BLOCK_LIST () {
  const term = $('#edit_block_list_term').val();
  delete BLOCK_LIST[term];
  BLOCK_LIST_WRITE();
  
  $('#block_list_edit').modal('hide');
}

function IMPORT_BLOCK_LIST () {
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
}

function EXPORT_BLOCK_LIST () {
  COPY_TO_CLIP(localStorage.getItem('BLOCK_LIST'), 'Your block list has been copied to your clipboard.');
}

function BLOCK_LIST_WRITE () {
  let block_list_sorted = [], html = '';
  
  for (let key in BLOCK_LIST) {
    block_list_sorted.push([key, BLOCK_LIST[key].name]);
  }
  
  block_list_sorted.sort( function (a, b) {
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
}

//Incude List Stuff
function IS_INCLUDED (hit) {
  for (let key in INCLUDE_LIST) {
    const il = INCLUDE_LIST[key];
    if (il.term.toLowerCase() === hit.reqname.toLowerCase() || il.term.toLowerCase() === hit.title.toLowerCase() || il.term.toLowerCase() === hit.reqid.toLowerCase() || il.term.toLowerCase() === hit.groupid.toLowerCase()) {
      return il;
    }
  }
}

function INCLUDED_ALERTS_TEST (test) {
  if (test.sound) {
    if (test.type === `sound`) {
      INCLUDE_SOUND();
    }
    else {
      SPEAK(`ATTENTION, HIT found for ${test.name}`);
    }
  }
  if (test.notification) {
    Notification.requestPermission();
    var n = new Notification(`Requester | $0.00`, {
      icon: `/icon_128.png`,
      body: `Title`,
    });
    setTimeout(n.close.bind(n), 5000);
  }
  if (test.pushbullet) {
    const push = {
      type: `note`,
      title: `HIT Finder`,
      body: `[Requester]\n[Title]\n[$0.00]\n[link]`
    };

    $.ajax({
      type: `POST`,
      headers: {'Authorization': `Bearer ${CONFIG.pushbullet_token}`},
      url: `https://api.pushbullet.com/v2/pushes`,
      data: push
    });
  }
}

function INCLUDED_ALERTS (il, hit) {
  var delay_alerts = DELAY_ALERTS.indexOf(hit.key) !== -1;
  var delay_pushbullet = DELAY_PUSHBULLET.indexOf(hit.key) !== -1;
  
  if (!delay_alerts) {
    if (il.sound) {
      if (il.type === `sound`) {
        INCLUDE_SOUND();
      }
      else {
        SPEAK(`ATTENTION, HIT found for ${il.name}`);
      }
    }
    if (il.notification) {
      Notification.requestPermission();
      var n = new Notification(`${hit.reqname} | ${hit.reward}`, {
        icon: `/icon_128.png`,
        body: `${hit.title}`,
      });
      n.onclick = function (e) {
        e.preventDefault();
        window.open(hit.prevlink, '_blank');
      };
      setTimeout(n.close.bind(n), 5000);
    }
    if (il.pushbullet && !delay_pushbullet) {
      const push = {
        type: `note`,
        title: `HIT Finder`,
        body: `[${hit.reqname}]\n[${hit.title}]\n[${hit.reward}]\n[${hit.prevlink}]`
      };

      $.ajax({
        type: `POST`,
        headers: {'Authorization': `Bearer ${CONFIG.pushbullet_token}`},
        url: `https://api.pushbullet.com/v2/pushes`,
        data: push
      });
      
      DELAY_PUSHBULLET.unshift(hit.key);
      setTimeout( function () { DELAY_PUSHBULLET.pop(); }, 900000);
    }
    
    DELAY_ALERTS.unshift(hit.key);
    setTimeout( function () { DELAY_ALERTS.pop(); }, 60 * 1000);
  }
}

function SHOW_INCLUDE_LIST () {
  $('#include_list_modal').modal('show');
}

function ADD_INCLUDE_LIST () {
  $('#save_include_list_term').val('');
  $('#save_include_list_name').val('');
  
  $('#include_list_add').modal('show');
}

function RT_ADD_INCLUDE_LIST (term, name) {
  $('#save_include_list_term').val(term);
  $('#save_include_list_name').val(name);
  
  $('#include_list_add').modal('show');
}

function SAVE_INCLUDE_LIST () {
  const term = $('#save_include_list_term').val();
  const name = $('#save_include_list_name').val() === '' ? $('#save_include_list_term').val() : $('#save_include_list_name').val();
  const type = $('#save_include_list_type').val();
  const sound = $('#save_include_list_sound').prop('checked');
  const notification = $('#save_include_list_notification').prop('checked');
  const pushbullet = $('#save_include_list_pushbullet').prop('checked');
  
  if (!INCLUDE_LIST[term]) {
    INCLUDE_LIST[term] = {
      term: term,
      name: name,
      type: type,
      sound: sound,
      notification: notification,
      pushbullet: pushbullet
    };
    INCLUDE_LIST_WRITE();
  }
  
  $('#include_list_add').modal('hide');
  $('#save_include_list_term, #save_include_list_name').val('');
}

function EDIT_INCLUDE_LIST (key) {
  $('#edit_include_list_term').val(INCLUDE_LIST[key].term);
  $('#edit_include_list_name').val(INCLUDE_LIST[key].name);
  $('#edit_include_list_type').val(INCLUDE_LIST[key].type);
  $('#edit_include_list_sound').prop('checked', INCLUDE_LIST[key].sound);
  $('#edit_include_list_notification').prop('checked', INCLUDE_LIST[key].notification);
  $('#edit_include_list_pushbullet').prop('checked', INCLUDE_LIST[key].pushbullet);
  
  $('#include_list_edit').modal('show');
}

function SAVE_EDIT_INCLUDE_LIST () {
  const term = $('#edit_include_list_term').val();
  const name = $('#edit_include_list_name').val() === '' ? $('#edit_include_list_term').val() : $('#edit_include_list_name').val();
  const type = $('#edit_include_list_type').val();
  const sound = $('#edit_include_list_sound').prop('checked');
  const notification = $('#edit_include_list_notification').prop('checked');
  const pushbullet = $('#edit_include_list_pushbullet').prop('checked');

  INCLUDE_LIST[term].name = name;
  INCLUDE_LIST[term].type = type;
  INCLUDE_LIST[term].sound = sound;
  INCLUDE_LIST[term].notification = notification;
  INCLUDE_LIST[term].pushbullet = pushbullet;
  INCLUDE_LIST_WRITE();
  
  $('#include_list_edit').modal('hide');
}

function DELETE_EDIT_INCLUDE_LIST () {
  const term = $('#edit_include_list_term').val();
  delete INCLUDE_LIST[term];
  INCLUDE_LIST_WRITE();
  
  $('#include_list_edit').modal('hide');
}

function IMPORT_INCLUDE_LIST () {
  var import_include_list  = prompt(
    'Include List Import\n\n' +
    'This will not delete your current include list, only add to it.\n\n' +
    'Please enter your include list here.',
    ''
  );

  if (import_include_list) {
    const json = VALID_JSON(import_include_list);

    if (json) {
      var il = JSON.parse(import_include_list);

      for (let key in il) {
        if (il[key].hasOwnProperty('term') && il[key].hasOwnProperty('name') && il[key].hasOwnProperty('sound')) {
          if (!INCLUDE_LIST[key]) {
            INCLUDE_LIST[key] = {
              term: il[key].term,
              name: il[key].name,
              type: il[key].type || 0,
              sound: il[key].sound || true,
              notification: il[key].notification || true,
              pushbullet: il[key].pushbullet || true
            };
          }
        }
        else {
          alert('An error occured while importing.\n\n Please check that you have a valid import and try again.');
          break;
        }
      }
      INCLUDE_LIST_WRITE();
    }
  }
  else {
    alert('An error occured while importing.\n\n Please check that you have a valid import and try again.');
  }
}

function EXPORT_INCLUDE_LIST () {
  COPY_TO_CLIP(localStorage.getItem('INCLUDE_LIST'), 'Your include list has been copied to your clipboard.');
}

function INCLUDE_LIST_WRITE () {
  let include_list_sorted = [], html = '';
  
  for (let key in INCLUDE_LIST) {
    include_list_sorted.push([key, INCLUDE_LIST[key].name]);
  }
  
  include_list_sorted.sort( function (a, b) {
    if (a[1].toLowerCase() < b[1].toLowerCase()) return -1;
    if (a[1].toLowerCase() > b[1].toLowerCase()) return 1;
    return 0;
  });
  
  for (let i = 0; i < include_list_sorted.length; i ++) {
    const il = INCLUDE_LIST[include_list_sorted[i][0]];
    html += `<button type="button" class="btn btn-xs btn-success il_item" data-key="${il.term}" style="margin: 2px;">${il.name}</button>`;
  }
  
  $('#include_list_modal').find('.modal-body').html(html);
  
  localStorage.setItem('INCLUDE_LIST', JSON.stringify(INCLUDE_LIST));
}

// Settings Stuff
function SET_CONFIG () {
  $('#scan_delay').val(CONFIG.scan_delay);
  $('#min_reward').val(Number(CONFIG.min_reward).toFixed(2));
  $('#min_avail').val(CONFIG.min_avail);
  $('#min_to').val(Number(CONFIG.min_to).toFixed(2));
  $('#size').val(CONFIG.size);
  $('#sort_by').val(CONFIG.sort_by);
  
  $('#qualified').prop('checked', CONFIG.qualified);
  $('#enable_to').prop('checked', CONFIG.enable_to);
  $('#hide_nl').prop('checked', CONFIG.hide_nl);
  $('#hide_bl').prop('checked', CONFIG.hide_bl);
  $('#hide_m').prop('checked', CONFIG.hide_m);
  $('#new_hit').prop('checked', CONFIG.new_hit);
  $('#pushbullet').prop('checked', CONFIG.pushbullet);
  
  
  $('#pushbullet_token').val(CONFIG.pushbullet_token);
  $('#site_to_scan').val(CONFIG.site_to_scan);
  $('#new_hit_sound').val(CONFIG.new_hit_sound);
  $('#include_voice').val(CONFIG.include_voice);
  $('#include_sound').val(CONFIG.include_sound);
}

function SAVE_CONFIG () {
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
  
  CONFIG.pushbullet_token = $('#pushbullet_token').val();
  CONFIG.site_to_scan = $('#site_to_scan').val();
  CONFIG.new_hit_sound = $('#new_hit_sound').val();
  CONFIG.include_voice = $('#include_voice').val();
  CONFIG.include_sound = $('#include_sound').val();
  
  
  localStorage.setItem('CONFIG', JSON.stringify(CONFIG));

  $(CONFIG.hide_nl ? '.nl' : '.nl_hidden').toggleClass('nl nl_hidden');
  $(CONFIG.hide_bl ? '.bl' : '.bl_hidden').toggleClass('bl bl_hidden');
  $(CONFIG.hide_m ? '.m' : '.m_hidden').toggleClass('m m_hidden');
}

function SHOW_ADVANCED_SETTINGS () {
  $('#advanced_settings_modal').modal('show');
}

// Export Stuff
function VB_EXPORT (data) {
  const hit = HITS[EXPORT.key];
  
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
}

function EXPORT_TO_TH (template) {
  chrome.runtime.sendMessage({msg: 'send_th', data: template});
}

function EXPORT_TO_MTC (template) {
  chrome.runtime.sendMessage({msg: 'send_mtc', data: template});
}

// Random Stuff
function COPY_TO_CLIP (string, message) {
  $('body').append(`<textarea id="clipboard" style="opacity: 0;">${string}</textarea>`);
  $('#clipboard').select();
  document.execCommand('Copy');
  $('#clipboard').remove();
  alert(message);
}

function VALID_JSON (data) {
  try {
    JSON.parse(data);
    return true;
  }
  catch (e) {
    return false;
  }
}

function SPEAK (phrase) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = phrase;
  msg.voice = window.speechSynthesis.getVoices()[$(`#include_voice`).val()];
  window.speechSynthesis.speak(msg);
}

function INCLUDE_SOUND () {
  const audio = new Audio();
  audio.src = `media/audio/include_list_${$('#include_sound').val()}.ogg`;
  audio.play();
}

function NEW_HIT_SOUND () {
  const audio = new Audio();
  audio.src = `media/audio/new_hit_${$('#new_hit_sound').val()}.ogg`;
  audio.play();
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

function TURKOPTICON_DB (ids) {
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
        HITS_WRITE_LOGGED_IN(to);
      });
    }
    else {
      HITS_WRITE_LOGGED_IN(to);
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
  for (let index of [`reqid`, `reqname`, `title`, `reward`]) {
    createObjectStore.createIndex(index, index, { unique: false });
  }
};

function HIT_FINDER_DB () {
  const transaction = HFDB.transaction([`hit`], `readwrite`);
  const objectStore = transaction.objectStore(`hit`);

  for (let i = 0; i < KEYS.length; i ++) {
    const key = KEYS[i];
    objectStore.put(HITS[key]);
  }
}
