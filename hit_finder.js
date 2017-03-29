document.addEventListener(`DOMContentLoaded`, function () {
  SET_CONFIG();
  BLOCK_LIST_WRITE();
  INCLUDE_LIST_WRITE();
  turkopticon.initialize();
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

const BLOCK_LIST = JSON.parse(localStorage.getItem(`BLOCK_LIST`)) || {};
const INCLUDE_LIST = JSON.parse(localStorage.getItem(`INCLUDE_LIST`)) || {};

const EXPORT = {key: null, type: null};

const LOADED_CONFIG = JSON.parse(localStorage.getItem(`CONFIG`)) || {};

const CONFIG = {
  scan_delay : LOADED_CONFIG.scan_delay || `3`,
  min_reward : LOADED_CONFIG.min_reward || `0.00`,
  min_avail  : LOADED_CONFIG.min_avail  || `0`,
  min_to     : LOADED_CONFIG.min_to     || `0.00`,
  size       : LOADED_CONFIG.size       || `25`,
  sort_by    : LOADED_CONFIG.sort_by    || `latest`,
  
  qualified  : LOADED_CONFIG.hasOwnProperty(`qualified`)  ? LOADED_CONFIG.qualified  : true,
  enable_to  : LOADED_CONFIG.hasOwnProperty(`enable_to`)  ? LOADED_CONFIG.enable_to  : true,
  hide_nl    : LOADED_CONFIG.hasOwnProperty(`hide_nl`)    ? LOADED_CONFIG.hide_nl    : false,
  hide_bl    : LOADED_CONFIG.hasOwnProperty(`hide_bl`)    ? LOADED_CONFIG.hide_bl    : false,
  hide_m     : LOADED_CONFIG.hasOwnProperty(`hide_m`)     ? LOADED_CONFIG.hide_m     : false,
  new_hit    : LOADED_CONFIG.hasOwnProperty(`new_hit`)    ? LOADED_CONFIG.new_hit    : true,
  pushbullet : LOADED_CONFIG.hasOwnProperty(`pushbullet`) ? LOADED_CONFIG.pushbullet : false,
  
  pushbullet_token : LOADED_CONFIG.pushbullet_token || `access_token_here`,
  site_to_scan     : LOADED_CONFIG.site_to_scan     || `mturk`,
  new_hit_sound    : LOADED_CONFIG.new_hit_sound    || `1`,
  include_voice    : LOADED_CONFIG.include_voice    || `0`,
  include_sound    : LOADED_CONFIG.include_sound    || `1`, 
  
  irc : LOADED_CONFIG.hasOwnProperty(`irc`) ? LOADED_CONFIG.irc : true,
  forum : LOADED_CONFIG.hasOwnProperty(`forum`) ? LOADED_CONFIG.forum : true,
  forum_th : LOADED_CONFIG.hasOwnProperty(`forum_th`) ? LOADED_CONFIG.forum_th : true,
  forum_mtc : LOADED_CONFIG.hasOwnProperty(`forum_mtc`) ? LOADED_CONFIG.forum_mtc : true,
  
  to1Use : LOADED_CONFIG.hasOwnProperty(`to1Use`) ? LOADED_CONFIG.to1Use : true,
  to1High : LOADED_CONFIG.hasOwnProperty(`to1High`) ? LOADED_CONFIG.to1High : 4.00,
  to1Good : LOADED_CONFIG.hasOwnProperty(`to1Good`) ? LOADED_CONFIG.to1Good : 3.00,
  to1Average : LOADED_CONFIG.hasOwnProperty(`to1Average`) ? LOADED_CONFIG.to1Average : 2.00,
  to1Low : LOADED_CONFIG.hasOwnProperty(`to1Low`) ? LOADED_CONFIG.to1Low : 0.01,
  
  to2Use : LOADED_CONFIG.hasOwnProperty(`to2Use`) ? LOADED_CONFIG.to2Use : false,
  to2High : LOADED_CONFIG.hasOwnProperty(`to2High`) ? LOADED_CONFIG.to2High : 12.00,
  to2Good : LOADED_CONFIG.hasOwnProperty(`to2Good`) ? LOADED_CONFIG.to2Good : 9.00,
  to2Average : LOADED_CONFIG.hasOwnProperty(`to2Average`) ? LOADED_CONFIG.to2Average : 6.00,
  to2Low : LOADED_CONFIG.hasOwnProperty(`to2Low`) ? LOADED_CONFIG.to2Low : 0.01,
};

// Find HITs Stuff
function FIND () {
  clearTimeout(timeout);
  
  switch (CONFIG.site_to_scan) {
    case `mturk`: GET_OLD(); break;
    case `worker`: GET_NEW(); break;
  }
}

function GET_OLD () {
  $.ajax({
    url: `https://www.mturk.com/mturk/searchbar`,
    type: `GET`,
    data: {
      selectedSearchType: `hitgroups`,
      sortType: CONFIG.sort_by === `latest` ? `LastUpdatedTime:1` : CONFIG.sort_by === `most` ? `NumHITs:1` : `Reward:1`,
      pageSize: CONFIG.size,
      minReward: CONFIG.min_reward,
      qualifiedFor: CONFIG.qualified ? `on` : `off`
    },
    timeout: 5000
  }).then(PARSE_OLD, GET_ERROR);
}

function GET_NEW () {
  $.ajax({
    url: `https://worker.mturk.com/`,
    type: `GET`,
    data: {
      page_size: CONFIG.size,
      sort: CONFIG.sort_by === `latest` ? `updated_desc` : CONFIG.sort_by === `most` ? `num_hits_desc` : `reward_desc`,
      filters : {
        qualified: CONFIG.qualified ? true : false, 
        masters: false,
        min_reward: CONFIG.min_reward
      }
    },
    timeout: 5000
  }).then(PARSE_NEW, GET_ERROR);
}

function GET_ERROR (result, status, xhr) {
  console.error(status, xhr);
  if (result.status === 429) {
    document.getElementById(`total_scans`).textContent = TOTAL_SCANS ++;
    document.getElementById(`request_errors`).textContent = REQUEST_ERRORS ++;
  }
  timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
}

function PARSE_OLD (result, status, xhr) {
  const ids = []; KEYS = [];
  
  const doc = document.implementation.createHTMLDocument().documentElement; doc.innerHTML = result;
  const hits = doc.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`);
  const logged_in = doc.querySelector(`a[href="/mturk/beginsignout"]`);
   
  if (doc.querySelector(`.error_title`)) {
    document.getElementById(`total_scans`).textContent = TOTAL_SCANS ++;
    document.getElementById(`request_errors`).textContent = REQUEST_ERRORS ++;
    timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
    return;
  }  
  
  for (let i = 0; i < hits.length; i ++) {
    const hit = selector => hits[i].querySelectorAll(selector);
        
    const obj = {
      reqid:
        logged_in ?
        hit(`[href*="requesterId="]`)[0].getAttribute(`href`).match(/requesterId=(.*)/)[1]:
        hit(`.requesterIdentity`)[0].textContent.trim(),
      reqname: 
        hit(`.requesterIdentity`)[0].textContent.trim(),
      reqlink:
        logged_in ?
        `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit(`[href*="requesterId="]`)[0].getAttribute(`href`).match(/requesterId=(.*)/)[1]}`:
        `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit(`.requesterIdentity`)[0].textContent.trim().replace(/ /g, `+`)}`,
      title:
        hit(`a.capsulelink`)[0].textContent.trim(),
      desc:
        hit(`.capsule_field_text`)[5].textContent.trim(),
      time:
        hit(`.capsule_field_text`)[2].textContent.trim(),
      reward:
        hit(`.capsule_field_text`)[3].textContent.trim(),
      avail:
        logged_in ?
        hit(`.capsule_field_text`)[4].textContent.trim():
        `N/A`,
      groupid:
        hit(`[href*="roupId="]`)[0] ?
        hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1]:
        `null`,
      prevlink:
        hit(`[href*="roupId="]`)[0] ?
        `https://www.mturk.com/mturk/preview?groupId=${hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1]}`:
        `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit(`a.capsulelink`)[0].textContent.trim()}`,
      pandlink:
        hit(`[href*="roupId="]`)[0] ?
        `https://www.mturk.com/mturk/previewandaccept?groupId=${hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1]}`:
        `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=${hit(`a.capsulelink`)[0].textContent.trim()}`,
      quals: 
        hit(`td[style="padding-right: 2em; white-space: nowrap;"]`)[0] ?
        [...hit(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(element => `${element.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
        `None;`,
      masters:
        false,
      new:
        true,
      seen:
        new Date().getTime()
    };
        
    const key = obj.groupid !== `null` ? obj.groupid : obj.reqid + obj.title + obj.reward; KEYS.push(key);
    
    if (ids.indexOf(obj.reqid) === -1) {
      ids.push(obj.reqid);
    } 
    if (obj.quals.indexOf(`Masters has been granted`) !== -1) {
      obj.masters = true;
    }
    if (HITS[key]) {
      obj.new = false;
    }
    HITS[key] = obj;
  }

  if (hits.length) {
    if (logged_in) {
      HIT_FINDER_DB(KEYS);
      if (CONFIG.enable_to) {
        turkopticon.check(ids);
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
    timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
  }
  
  if (LOGGED_IN && !logged_in) {
    LOGGED_IN = false;
    SPEAK(`Attention, You are logged out.`);
    $(`.panel`).removeClass(`panel-primary`).addClass(`panel-danger`);
  }
  if (!LOGGED_IN && logged_in) {
    LOGGED_IN = true;
    SPEAK(`Attention, You are logged in.`);
    $(`.panel`).removeClass(`panel-danger`).addClass(`panel-primary`);
  }
}

function PARSE_NEW (result, status, xhr) {
  if ($.type(result) !== `object`) {
    if (LOGGED_IN) {
      LOGGED_IN = false;
      SPEAK(`Attention, You are logged out.`);
      $(`.panel`).removeClass(`panel-primary`).addClass(`panel-danger`);
    }
    $(`#total_scans`).text(TOTAL_SCANS ++);
    return timeout = setTimeout(FIND, CONFIG.scan_delay * 1000);
  }
  
  if (!LOGGED_IN) {
    LOGGED_IN = true;
    SPEAK(`Attention, You are logged in.`);
    $(`.panel`).removeClass(`panel-danger`).addClass(`panel-primary`);
  }
  
  const ids = []; KEYS = [];
  
  const hits = result.results;
  
  for (let i = 0; i < hits.length; i ++) {
    const hit = hits[i];
    
    const obj = {
      reqid:
        hit.requester_id,
      reqname:
        hit.requester_name,
      reqlink:
        `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit.requester_id}`,
      title:
        hit.title,
      desc:
        hit.description,
      time:
        SECONDS_TO_STRING(hit.assignment_duration_in_seconds),
      reward:
        `$${hit.monetary_reward.amount_in_dollars.toFixed(2)}`,
      avail:
        hit.assignable_hits_count,
      groupid:
        hit.hit_set_id,
      prevlink:
        `https://www.mturk.com/mturk/preview?groupId=${hit.hit_set_id}`,
      pandlink:
        `https://www.mturk.com/mturk/previewandaccept?groupId=${hit.hit_set_id}`,
      quals:
        hit.hit_requirements.length ?
        hit.hit_requirements.map(obj => `${obj.qualification_type.name} ${obj.comparator} ${obj.qualification_values.map(val => val).join(`, `)};`).join(` `) :
        `None;`,
      masters:
        false,
      new:
        true,
      seen:
        new Date().getTime()
    };
    
    const key = obj.groupid; KEYS.push(key);
    
    if (ids.indexOf(obj.reqid) === -1) {
      ids.push(obj.reqid);
    } 
    if (obj.quals.indexOf(`Masters Exists`) !== -1) {
      obj.masters = true;
    }
    if (HITS[key]) {
      obj.new = false;
    }
    HITS[key] = obj;
  }
  HIT_FINDER_DB(KEYS);
  
  if (CONFIG.enable_to) {
    turkopticon.check(ids);
  }
  else {
    HITS_WRITE_LOGGED_IN(false);
  }
}

function HITS_WRITE_LOGGED_IN (to) {
  let found_html = ``, logged_html = ``, hits_hidden = 0, logged = false;
  
  for (let i = 0; i < KEYS.length; i ++) {
    const hit = HITS[KEYS[i]];
    const time = TIME();
    const tr_color = TO_COLOR(to[hit.reqid]);
    const blocked = IS_BLOCKED(hit);
    const included = IS_INCLUDED(hit);
    const toRating = TO_RATING(to[hit.reqid]);
    
    let classes = ``, log = true;
    
    if (included) {
      classes += ` il`;
      INCLUDED_ALERTS(included, hit);
    }
    else if (blocked) {
      classes += CONFIG.hide_bl ? ` bl_hidden` : ` bl`;
      classes += CONFIG.hide_nl ? ` nl_hidden` : ` nl`;
    }
    else {
      classes += CONFIG.hide_nl ? ` nl_hidden` : ` nl`;
    }
    if (hit.masters) {
      classes += CONFIG.hide_m ? ` m_hidden` : ` m`;
      if (CONFIG.hide_m) {log = false;}
    }
    if (Number(CONFIG.min_avail) > Number(hit.avail) || to && (+CONFIG.min_to) > toRating && toRating > 0) {
      classes += ` hidden`;
      log = false;
    }
    if (classes.indexOf(`hidden`) !== -1) {
      hits_hidden ++;
    }
        
    function hit_write (logged) {
      const html = 
        `<tr class="${tr_color}${classes}">` +
        // Time
        (logged ? `<td>${time}</td>` : ``) +
        // Requester
        `  <td>` +
        `    <div class="btn-group btn-group-xxs">` +
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
        `    ${EXPORT_WRITE(hit.groupid)}` +
        `    <a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" title="${hit.quals.replace(/; /g, `;<br>`)}">${hit.title}</a>` +
        `  </td>` +
        // Tasks
        (!logged ? `<td class="text-center">${hit.avail}</td>` : ``) +
        // Accept and Reward
        `  <td class="text-center"><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>` +
        // TO
        `  <td class="text-center">` +
        `    <a class="to-hover" href="${CONFIG.to1Use ? `https://turkopticon.ucsd.edu/` : `https://turkopticon.info/requesters/`}${hit.reqid}" target="_blank">${CONFIG.to1Use ? (+toRating).toFixed(2) : toRating > 0 ? `$${(toRating).toFixed(2)}/hr` : `--/hr`}</a>` +
        `    ${hitFinder.draw.to(to[hit.reqid])}` +
        `  </td>` +
        // Masters
        `  <td class="text-center">${hit.masters ? `Y` : `N`}</td>` +
        `</tr>`
      ;
      return html;
    }
    
    found_html += hit_write(false);
    
    if (hit.new && !blocked && log) {
      LOGGED_HITS ++; logged = true;
      logged_html += hit_write(true);
    }
  }
  if (logged && CONFIG.new_hit) NEW_HIT_SOUND();
  document.getElementById(`hits_found`).textContent = KEYS.length ++;
  document.getElementById(`hits_hidden`).textContent = hits_hidden;
  document.getElementById(`total_scans`).textContent = TOTAL_SCANS ++;
  document.getElementById(`hits_logged`).textContent = LOGGED_HITS;
  document.getElementById(`found_tbody`).innerHTML = found_html;
  document.getElementById(`logged_tbody`).insertAdjacentHTML(`afterbegin`, logged_html);
  $(`[data-toggle="tooltip"]`).tooltip();
  
  timeout = document.getElementById(`scan`).textContent === `Stop` ? setTimeout(FIND, CONFIG.scan_delay * 1000) : null;
}

function HITS_WRITE_LOGGED_OUT () {
  let found_html = ``, logged_html = ``;
  
  for (let i = 0; i < KEYS.length; i ++) {
    const hit = HITS[KEYS[i]];
    const time = TIME();
    const tr_color = TO_COLOR(0);
    const blocked = IS_BLOCKED(hit);
    const included = IS_INCLUDED(hit);
    
    let classes = ``, log = true;
    if (included) {
      classes += ` il`;
      INCLUDED_ALERTS(included, hit);
    }
    else if (blocked) {
      classes += CONFIG.hide_bl ? ` bl_hidden` : ` bl`;
      classes += CONFIG.hide_nl ? ` nl_hidden` : ` nl`;
    }
    else {
      classes += CONFIG.hide_nl ? ` nl_hidden` : ` nl`;
    }
    if (hit.masters) {
      classes += CONFIG.hide_m ? ` m_hidden` : ` m`;
      if (CONFIG.hide_m) {log = false;}
    }
    if (Number(CONFIG.min_avail) > Number(hit.avail)) {
      classes += ` hidden`;
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
        `  <td>${hit.masters ? `Y` : `N`}</td>` +
        `</tr>`
      ;
    }
  }
  
  document.getElementById(`hits_found`).textContent = KEYS.length ++;
  //document.getElementById(`hits_hidden`).textContent = hits_hidden;
  document.getElementById(`total_scans`).textContent = TOTAL_SCANS ++;
  document.getElementById(`hits_logged`).textContent = LOGGED_HITS;
  document.getElementById(`found_tbody`).innerHTML = found_html;
  document.getElementById(`logged_tbody`).insertAdjacentHTML(`afterbegin`, logged_html);
  $(`[data-toggle="tooltip"]`).tooltip();
  
  timeout = document.getElementById(`scan`).textContent === `Stop` ? setTimeout(FIND, CONFIG.scan_delay * 1000) : null;
}

function TO_COLOR (to) {
  let color = `toNone`;
  if (to) {
    if (to.to1) {
      if (CONFIG.to1Use) {
        const pay = to.to1.attrs.pay;
        if (pay >= CONFIG.to1High) color = `toHigh`;
        else if (pay >= CONFIG.to1Good) color = `toGood`;
        else if (pay >= CONFIG.to1Average) color = `toAverage`;
        else if (pay >= CONFIG.to1Low) color = `toLow`;
      }
    }
    if (to.to2) {
      if (CONFIG.to2Use) {
        const pay = to.to2.recent.reward[1] > 0 ? (to.to2.recent.reward[0] / to.to2.recent.reward[1]) * 60 ** 2 : 0;
        if (pay >= CONFIG.to2High) color = `toHigh`;
        else if (pay >= CONFIG.to2Good) color = `toGood`;
        else if (pay >= CONFIG.to2Average) color = `toAverage`;
        else if (pay >= CONFIG.to2Low) color = `toLow`;
      }
    }
  }
  return color;
}

function TO_RATING (to) {
  let rating = 0.00;
  if (to) {
    if (to.to1) {
      if (CONFIG.to1Use) {
        rating = to.to1.attrs.pay;
      }
    }
    if (to.to2) {
      if (CONFIG.to2Use) {
        rating = to.to2.recent.reward[1] > 0 ? (to.to2.recent.reward[0] / to.to2.recent.reward[1]) * 60 ** 2 : 0.00;
      }
    }
  }
  return rating;
}

function EXPORT_WRITE (key) {
  let enabled = 0;
  if (CONFIG.irc) enabled ++;
  if (CONFIG.forum) enabled ++;
  if (CONFIG.forum_th) enabled ++;
  if (CONFIG.forum_mtc) enabled ++;
  
  let html = ``;
      
  if (enabled === 1) {
    html = 
      `<button type="button" class="btn btn-primary btn-xxs export_hit" ` +
      (CONFIG.irc ? `data-type="irc"` : ``) +
      (CONFIG.forum ? `data-type="forum"` : ``) +
      (CONFIG.forum_th ? `data-type="thDirect"` : ``) +
      (CONFIG.forum_mtc ? `data-type="mtcDirect"` : ``) +
      `data-key="${key}">Export</button>`
    ;
  }
      
  if (enabled > 1) {
    html =
      `<div class="btn-group btn-group-xxs">` +
      `<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
      `Export <span class="caret"></span>` +
      `</button>` +
      `<ul class="dropdown-menu">` +
      (CONFIG.irc ? `<li><a class="export_hit" data-type="irc" data-key="${key}">IRC</a></li>` : ``) +
      (CONFIG.forum ? `<li><a class="export_hit" data-type="forum" data-key="${key}">Forum</a></li>` : ``) +
      (CONFIG.forum_th ? `<li><a class="export_hit" data-type="thDirect" data-key="${key}">TH Direct</a></li>` : ``) +
      (CONFIG.forum_mtc ? `<li><a class="export_hit" data-type="mtcDirect" data-key="${key}">MTC Direct</a></li>` : ``) +
      `</ul>` +
      `</div>`
    ;
  }
  
  return html;
}

function SECONDS_TO_STRING (s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  return `${h > 0 ? `${h} hour${h > 1 ? `s` : ``} ` : ``}${m > 0 ? `${m} minute${m > 1 ? `s` : ``}` : ``}`;
}

const hitFinder = {
  draw: {
    to: function (to) {
      //console.log(to);
      const html = 
        `<mts-to-reviews>
          ${hitFinder.draw.toAttrTable(to)}
          ${hitFinder.draw.toLinkTable(to.id)}
        </mts-to-reviews>`
      return html;
    },
    toAttrTable: function (to) {
      const to1 = to.to1;
      const to2 = to.to2;
    const html =
      `<mts-table class="mts-attr-table">
        <mts-tr style="color: #FFFFFF; background-color: #222222;">
          <mts-th>TO 1</mts-th><mts-th></mts-th>
          <mts-th>TO 2</mts-th><mts-th>Last 90 Days</mts-th><mts-th>All Time</mts-th>
        </mts-tr>
        <mts-tr>
          <mts-td>Pay:</mts-td>
          <mts-td>${to1 ? `${to1.attrs.pay} / 5` : `null`}</mts-td>

          <mts-td>Pay Rate:</mts-td>
          <mts-td>${to2 ? to2.recent.reward[1] > 0 ? `$${((to2.recent.reward[0] / to2.recent.reward[1]) * 60 ** 2).toFixed(2)}/hr` : `--/hr` : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.reward[1] > 0 ? `$${((to2.all.reward[0] / to2.all.reward[1]) * 60 ** 2).toFixed(2)}/hr` : `--/hr` : `null`}</mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td>Fast:</mts-td>
          <mts-td>${to1 ? `${to1.attrs.fast} / 5` : `null`}</mts-td>

          <mts-td>Time Pending:</mts-td>
          <mts-td>${to2 ? to2.recent.pending > 0 ? `${(to2.recent.pending / 86400).toFixed(2)} days` : `-- days` : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.pending > 0 ? `${(to2.all.pending / 86400).toFixed(2)} days` : `-- days` : `null`}</mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td>Comm:</mts-td>
          <mts-td>${to1 ? `${to1.attrs.comm} / 5` : `null`}</mts-td>

          <mts-td>Response:</mts-td>
          <mts-td>${to2 ? to2.recent.comm[1] > 0 ? `${Math.round(100 * to2.recent.comm[0] / to2.recent.comm[1])}% of ${to2.recent.comm[1]}` : `-- of 0` : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.comm[1] > 0 ? `${Math.round(100 * to2.all.comm[0] / to2.all.comm[1])}% of ${to2.all.comm[1]}` : `-- of 0` : `null`}</mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td>Fair:</mts-td>
          <mts-td>${to1 ? `${to1.attrs.fair} / 5` : `null`}</mts-td>

          <mts-td>Recommend:</mts-td>
          <mts-td>${to2 ? to2.recent.recommend[1] > 0 ? `${Math.round(100 * to2.recent.recommend[0] / to2.recent.recommend[1])}% of ${to2.recent.recommend[1]}` : `-- of 0` : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.recommend[1] > 0 ? `${Math.round(100 * to2.all.recommend[0] / to2.all.recommend[1])}% of ${to2.all.recommend[1]}` : `-- of 0` : `null`}</mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td>Reviews:</mts-td>
          <mts-td>${to1 ? `${to1.reviews}` : `null`}</mts-td>

          <mts-td>Rejected:</mts-td>
          <mts-td>${to2 ? to2.recent.rejected[0] : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.rejected[0] : `null`}</mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td>TOS:</mts-td>
          <mts-td>${to1 ? `${to1.tos_flags}` : `null`}</mts-td>

          <mts-td>TOS:</mts-td>
          <mts-td>${to2 ? to2.recent.tos[0] : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.tos[0] : `null`}</mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td></mts-td>
          <mts-td></mts-td>

          <mts-td>Broken:</mts-td>
          <mts-td>${to2 ? to2.recent.broken[0] : `null`}</mts-td>
          <mts-td>${to2 ? to2.all.broken[0] : `null`}</mts-td>
        </mts-tr>
      </mts-table>`
    ;
    return html;
    },
    toLinkTable: function (id) {
      const html = 
      `<mts-table class="mts-link-table">
        <mts-tr>
          <mts-td><a target="_blank" href="https://turkopticon.ucsd.edu/${id}">View on TO 1</a></mts-td>
          <mts-td><a target="_blank" href="https://turkopticon.info/requesters/${id}">View on TO 2</a></mts-td>
        </mts-tr>
      </mts-table>`
    ;
    return html;
    }
  }
};

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
  $(document.getElementById(`block_list_modal`)).modal(`show`);
}

function ADD_BLOCK_LIST () {
  document.getElementById(`save_block_list_term`).value = ``;
  document.getElementById(`save_block_list_name`).value = ``;
  
  $(document.getElementById(`block_list_add`)).modal(`show`);
}

function RT_ADD_BLOCK_LIST (term, name) {
  document.getElementById(`save_block_list_term`).value = term;
  document.getElementById(`save_block_list_name`).value = name;
  
  $(document.getElementById(`block_list_add`)).modal(`show`);
}

function SAVE_BLOCK_LIST () {
  const key = document.getElementById(`save_block_list_term`).value;
  
  BLOCK_LIST[key] = {
    term: 
      document.getElementById(`save_block_list_term`).value,
    name:
      document.getElementById(`save_block_list_name`).value
  };
  
  BLOCK_LIST_WRITE();
  
  $(document.getElementById(`block_list_add`)).modal(`hide`);
}

function EDIT_BLOCK_LIST (key) {
  document.getElementById(`edit_block_list_term`).value = BLOCK_LIST[key].term;
  document.getElementById(`edit_block_list_name`).value = BLOCK_LIST[key].name;
  
  $(document.getElementById(`block_list_edit`)).modal(`show`);
}

function SAVE_EDIT_BLOCK_LIST () {
  const key = document.getElementById(`edit_block_list_term`).value;
  
  BLOCK_LIST[key] = {
    term:
      document.getElementById(`edit_block_list_term`).value,
    name:
      document.getElementById(`edit_block_list_name`).value
  }
  
  BLOCK_LIST_WRITE();
  
  $(document.getElementById(`block_list_edit`)).modal(`hide`);
}

function DELETE_EDIT_BLOCK_LIST () {
  const key = document.getElementById(`edit_block_list_term`).value;
  delete BLOCK_LIST[key];
  BLOCK_LIST_WRITE();
  
  $(document.getElementById(`block_list_edit`)).modal(`hide`);
}

function IMPORT_BLOCK_LIST () {
  const import_block_list  = prompt(
    `Block List Import\n\n` +
    `This will not delete your current block list, only add to it.\n\n` +
    `Please enter your block list here.`,
    ``
  );

  if (import_block_list !== null) {
    const bl = VALIDATE_JSON(import_block_list);

    if (!bl) return alert(`An error occured while importing.\n\nPlease check if you have a valid import and try again.`);

    for (let key in bl) {
      if (bl[key].hasOwnProperty(`term`) && bl[key].hasOwnProperty(`name`) && !bl[key].hasOwnProperty(`sound`)) {
        BLOCK_LIST[key] = {
          term:
            bl[key].term,
          name:
            bl[key].name
        };
      }
      else continue;
    }
    BLOCK_LIST_WRITE();
  }
}

function EXPORT_BLOCK_LIST () {
  COPY_TO_CLIP(localStorage.getItem(`BLOCK_LIST`), `Your block list has been copied to your clipboard.`);
}

function BLOCK_LIST_WRITE () {
  let block_list_sorted = [], html = ``;
  
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
  
  document.getElementById(`block_list_modal`).getElementsByClassName(`modal-body`)[0].innerHTML = html;
  
  localStorage.setItem(`BLOCK_LIST`, JSON.stringify(BLOCK_LIST));
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
      headers: {Authorization: `Bearer ${CONFIG.pushbullet_token}`},
      url: `https://api.pushbullet.com/v2/pushes`,
      data: push
    });
  }
}

function INCLUDED_ALERTS (il, hit) {
  const delay_alerts = DELAY_ALERTS.indexOf(hit.key) !== -1;
  const delay_pushbullet = DELAY_PUSHBULLET.indexOf(hit.key) !== -1;
  
  if (delay_alerts) return;
  
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
    const n = new Notification(`${hit.reqname} | ${hit.reward}`, {
      icon: `/media/icon_128.png`,
      body: `${hit.title}`,
    });
    n.onclick = function (e) {
      e.preventDefault();
      window.open(hit.prevlink, `_blank`);
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
      headers: {Authorization: `Bearer ${CONFIG.pushbullet_token}`},
      url: `https://api.pushbullet.com/v2/pushes`,
      data: push
    });
      
    DELAY_PUSHBULLET.unshift(hit.key);
    setTimeout( function () { DELAY_PUSHBULLET.pop(); }, 900000);
  }
    
  DELAY_ALERTS.unshift(hit.key);
  setTimeout( function () { DELAY_ALERTS.pop(); }, 60 * 1000);
}

function SHOW_INCLUDE_LIST () {
  $(document.getElementById(`include_list_modal`)).modal(`show`);
}

function ADD_INCLUDE_LIST () {
  document.getElementById(`save_include_list_term`).value = ``;
  document.getElementById(`save_include_list_name`).value = ``;
  
  $(document.getElementById(`include_list_add`)).modal(`show`);
}

function RT_ADD_INCLUDE_LIST (term, name) {
  document.getElementById(`save_include_list_term`).value = term;
  document.getElementById(`save_include_list_name`).value = name;
  
  $(document.getElementById(`include_list_add`)).modal(`show`);
}

function SAVE_INCLUDE_LIST () {
  const key = document.getElementById(`save_include_list_term`).value;
  
  INCLUDE_LIST[key] = {
    term: 
      document.getElementById(`save_include_list_term`).value,
    name: 
      document.getElementById(`save_include_list_name`).value,
    type: 
      document.getElementById(`save_include_list_type`).value,
    sound: 
      document.getElementById(`save_include_list_sound`).checked,
    notification: 
      document.getElementById(`save_include_list_notification`).checked,
    pushbullet: 
      document.getElementById(`save_include_list_pushbullet`).checked
  };
  
  INCLUDE_LIST_WRITE();
  
  $(document.getElementById(`include_list_add`)).modal(`hide`);
}

function EDIT_INCLUDE_LIST (key) {
  document.getElementById(`edit_include_list_term`).value = INCLUDE_LIST[key].term;
  document.getElementById(`edit_include_list_name`).value = INCLUDE_LIST[key].name;
  document.getElementById(`edit_include_list_type`).value = INCLUDE_LIST[key].type;
  document.getElementById(`edit_include_list_sound`).checked = INCLUDE_LIST[key].sound;
  document.getElementById(`edit_include_list_notification`).checked = INCLUDE_LIST[key].notification;
  document.getElementById(`edit_include_list_pushbullet`).checked = INCLUDE_LIST[key].pushbullet;
  
  $(document.getElementById(`include_list_edit`)).modal(`show`);
}

function SAVE_EDIT_INCLUDE_LIST () {
  const key = document.getElementById(`edit_include_list_term`).value;
  
  INCLUDE_LIST[key] = {
    term: 
      document.getElementById(`edit_include_list_term`).value,
    name: 
      document.getElementById(`edit_include_list_name`).value,
    type: 
      document.getElementById(`edit_include_list_type`).value,
    sound: 
      document.getElementById(`edit_include_list_sound`).checked,
    notification: 
      document.getElementById(`edit_include_list_notification`).checked,
    pushbullet: 
      document.getElementById(`edit_include_list_pushbullet`).checked
  };
  
  INCLUDE_LIST_WRITE();
  
  $(document.getElementById(`include_list_edit`)).modal(`hide`);
}

function DELETE_EDIT_INCLUDE_LIST () {
  const key = document.getElementById(`edit_include_list_term`).value;
  delete INCLUDE_LIST[key];
  INCLUDE_LIST_WRITE();
  
  $(document.getElementById(`include_list_edit`)).modal(`hide`);
}

function IMPORT_INCLUDE_LIST () {
  const import_include_list  = prompt(
    `Include List Import\n\n` +
    `This will not delete your current include list, only add to it.\n\n` +
    `Please enter your include list here.`,
    ``
  );

  if (import_include_list) {
    const il = VALIDATE_JSON(import_include_list);

    if (!il) return alert(`An error occured while importing.\n\n Please check that you have a valid import and try again.`);
    
    for (let key in il) {
      if (il[key].hasOwnProperty(`term`) && il[key].hasOwnProperty(`name`) && il[key].hasOwnProperty(`sound`)) {
        INCLUDE_LIST[key] = {
          term:
            il[key].term,
          name:
            il[key].name,
          type:
            il[key].type || 0,
          sound:
            il[key].hasOwnProperty(`sound`) ? il[key].sound : true,
          notification:
            il[key].hasOwnProperty(`notification`) ? il[key].notification : true,
          pushbullet:
            il[key].hasOwnProperty(`pushbullet`) ? il[key].pushbullet : true
        };
      }
      else continue;
    }
    INCLUDE_LIST_WRITE();
  }
}

function EXPORT_INCLUDE_LIST () {
  COPY_TO_CLIP(localStorage.getItem(`INCLUDE_LIST`), `Your include list has been copied to your clipboard.`);
}

function INCLUDE_LIST_WRITE () {
  let include_list_sorted = [], html = ``;
  
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
  
  document.getElementById(`include_list_modal`).getElementsByClassName(`modal-body`)[0].innerHTML = html;
    
  localStorage.setItem(`INCLUDE_LIST`, JSON.stringify(INCLUDE_LIST));
}

// Settings Stuff
function SET_CONFIG () {
  document.getElementById(`scan_delay`).value = CONFIG.scan_delay;
  document.getElementById(`min_reward`).value = (+CONFIG.min_reward).toFixed(2);
  document.getElementById(`min_avail`).value  = CONFIG.min_avail;
  document.getElementById(`min_to`).value     = (+CONFIG.min_to).toFixed(2);
  document.getElementById(`size`).value       = CONFIG.size;
  document.getElementById(`sort_by`).value    = CONFIG.sort_by;
  
  document.getElementById(`qualified`).checked  = CONFIG.qualified;
  document.getElementById(`enable_to`).checked  = CONFIG.enable_to;
  document.getElementById(`hide_nl`).checked    = CONFIG.hide_nl;
  document.getElementById(`hide_bl`).checked    = CONFIG.hide_bl;
  document.getElementById(`hide_m`).checked     = CONFIG.hide_m;
  document.getElementById(`new_hit`).checked    = CONFIG.new_hit;
  document.getElementById(`pushbullet`).checked = CONFIG.pushbullet;
  
  document.getElementById(`pushbullet_token`).value = CONFIG.pushbullet_token;
  document.getElementById(`site_to_scan`).value     = CONFIG.site_to_scan;
  document.getElementById(`new_hit_sound`).value    = CONFIG.new_hit_sound;
  document.getElementById(`include_voice`).value    = CONFIG.include_voice;
  document.getElementById(`include_sound`).value    = CONFIG.include_sound;
  
  document.getElementById(`irc`).checked = CONFIG.irc;
  document.getElementById(`forum`).checked = CONFIG.forum;
  document.getElementById(`forum_th`).checked = CONFIG.forum_th;
  document.getElementById(`forum_mtc`).checked = CONFIG.forum_mtc;
  
  document.getElementById(`to1-use`).checked = CONFIG.to1Use;
  document.getElementById(`to1-high`).value = CONFIG.to1High;
  document.getElementById(`to1-good`).value = CONFIG.to1Good;
  document.getElementById(`to1-average`).value = CONFIG.to1Average;
  document.getElementById(`to1-low`).value = CONFIG.to1Low;
  
  document.getElementById(`to2-use`).checked = CONFIG.to2Use;
  document.getElementById(`to2-high`).value = CONFIG.to2High;
  document.getElementById(`to2-good`).value = CONFIG.to2Good;
  document.getElementById(`to2-average`).value = CONFIG.to2Average;
  document.getElementById(`to2-low`).value = CONFIG.to2Low;
}

function SAVE_CONFIG () {
  CONFIG.scan_delay = document.getElementById(`scan_delay`).value;
  CONFIG.min_reward = document.getElementById(`min_reward`).value;
  CONFIG.min_avail  = document.getElementById(`min_avail`).value;
  CONFIG.min_to     = document.getElementById(`min_to`).value;
  CONFIG.size       = document.getElementById(`size`).value;
  CONFIG.sort_by    = document.getElementById(`sort_by`).value;
  
  CONFIG.qualified  = document.getElementById(`qualified`).checked;
  CONFIG.enable_to  = document.getElementById(`enable_to`).checked;
  CONFIG.hide_nl    = document.getElementById(`hide_nl`).checked;
  CONFIG.hide_bl    = document.getElementById(`hide_bl`).checked;
  CONFIG.hide_m     = document.getElementById(`hide_m`).checked;
  CONFIG.new_hit    = document.getElementById(`new_hit`).checked;
  CONFIG.pushbullet = document.getElementById(`pushbullet`).checked;
  
  CONFIG.pushbullet_token = document.getElementById(`pushbullet_token`).value;
  CONFIG.site_to_scan     = document.getElementById(`site_to_scan`).value;
  CONFIG.new_hit_sound    = document.getElementById(`new_hit_sound`).value;
  CONFIG.include_voice    = document.getElementById(`include_voice`).value;
  CONFIG.include_sound    = document.getElementById(`include_sound`).value;
  
  CONFIG.irc = document.getElementById(`irc`).checked;
  CONFIG.forum = document.getElementById(`forum`).checked;
  CONFIG.forum_th = document.getElementById(`forum_th`).checked;
  CONFIG.forum_mtc = document.getElementById(`forum_mtc`).checked;
  
  CONFIG.to1Use = document.getElementById(`to1-use`).checked;
  CONFIG.to1High = document.getElementById(`to1-high`).value;
  CONFIG.to1Good = document.getElementById(`to1-good`).value;
  CONFIG.to1Average = document.getElementById(`to1-average`).value;
  CONFIG.to1Low = document.getElementById(`to1-low`).value;
  
  CONFIG.to2Use = document.getElementById(`to2-use`).checked;
  CONFIG.to2High = document.getElementById(`to2-high`).value;
  CONFIG.to2Good = document.getElementById(`to2-good`).value;
  CONFIG.to2Average = document.getElementById(`to2-average`).value;
  CONFIG.to2Low = document.getElementById(`to2-low`).value;
  
  localStorage.setItem(`CONFIG`, JSON.stringify(CONFIG));

  $(CONFIG.hide_nl ? `.nl` : `.nl_hidden`).toggleClass(`nl nl_hidden`);
  $(CONFIG.hide_bl ? `.bl` : `.bl_hidden`).toggleClass(`bl bl_hidden`);
  $(CONFIG.hide_m ? `.m` : `.m_hidden`).toggleClass(`m m_hidden`);
}

function SHOW_ADVANCED_SETTINGS () {
  $(document.getElementById(`advanced_settings_modal`)).modal(`show`);
}

// HIT Export
function FORUM_HIT_EXPORT (data) {
  const hit = HITS[EXPORT.key];

  function to (type, rating) {
    if (rating > 3.99) return `[b][${type}: [color=#00cc00]${rating}[/color]][/b]`;
    if (rating > 2.99) return `[b][${type}: [color=#cccc00]${rating}[/color]][/b]`;
    if (rating > 1.99) return `[b][${type}: [color=#cc6600]${rating}[/color]][/b]`;
    if (rating > 0.01) return `[b][${type}: [color=#cc0000]${rating}[/color]][/b]`;
    return `[b][${type}: [color=grey]N/A[/color]][/b]`;
  }

  const forum_template =
    `[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]\n` +
    `[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]\n` +
    `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])\n` +
    `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/url]:[/b] ` +
    `${to(`Pay`, data.attrs.pay)} ${to(`Fair`, data.attrs.fair)} ` +
    `${to(`Comm`, data.attrs.comm)} ${to(`Fast`, data.attrs.fast)} ` +
    `[b][Reviews: ${data.reviews}][/b] ` +
    `[b][ToS: [color=${data.tos_flags === 0 ? `green` : `red`}]${data.tos_flags}[/color]][/b]\n` +
    `[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}\n` +
    `[b]Time:[/b] ${hit.time}\n` +
    `[b]HITs Available:[/b] ${hit.avail}\n` +
    `[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]\n` +
    `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}\n` +
    `[/td][/tr][/table]`
  ;
  
  const direct_template =
    `<p>[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]</p>` +
    `<p>[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]</p>` +
    `<p>[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])</p>` +
    `<p>[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO[/url]:[/b] ` +
    `${to(`Pay`, data.attrs.pay)} ${to(`Fair`, data.attrs.fair)} ` +
    `${to(`Comm`, data.attrs.comm)} ${to(`Fast`, data.attrs.fast)} ` +
    `[b][Reviews: ${data.reviews}][/b] ` +
    `[b][ToS: [color=${data.tos_flags === 0 ? `green` : `red`}]${data.tos_flags}[/color]][/b]</p>` +
    `<p>[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}</p>` +
    `<p>[b]Time:[/b] ${hit.time}</p>` +
    `<p>[b]HITs Available:[/b] ${hit.avail}</p>` +
    `<p>[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]</p>` +
    `<p>[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]</p>` +
    `<p>[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr][/table]</p>`
  ;

  switch (EXPORT.type) {
    case `forum`: EXPORT_TO_CLIP(forum_template); break;
    case `forum_th`: EXPORT_TO_TH(direct_template); break;
    case `forum_mtc`: EXPORT_TO_MTC(direct_template); break;
  }
}

function IRC_HIT_EXPORT (info) {
  const hit = HITS[EXPORT.key];
  
  const template = 
    `${hit.quals.match(/Masters has been granted|Masters Exists/) ? `MASTERS • ` : ``}` +
    `Req: ${hit.reqname} ${info.links.req} • ` +
    `Title: ${hit.title} ${info.links.preview} • ` +
    `Time: ${hit.time} • ` +
    `Avail: ${hit.avail} • ` +
    `Reward: ${hit.reward} • ` +
    `TO: Pay=${info.to.attrs.pay} Fair=${info.to.attrs.fair} Comm=${info.to.attrs.comm} Fast=${info.to.attrs.fast} Reviews=${info.to.reviews} TOS=${info.to.tos_flags} ${info.links.to} • ` +
    `PANDA: ${info.links.panda}`
  ;
  
  EXPORT_TO_CLIP(template);
}

function EXPORT_TO_CLIP (template) {
  document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${template}</textarea>`);
  document.getElementById(`clipboard`).select();
  
  const copy = document.execCommand(`copy`);
  alert(copy ? `HIT export has been copied to your clipboard.` : template);

  document.body.removeChild(document.getElementById(`clipboard`));
}

function EXPORT_TO_TH (template) {
  const confirm_post = prompt(
    `Do you want to post this HIT to TurkerHub.com?\n\n` +
    `Want to add a comment about your HIT? Fill out the box below.\n\n` +
    `To send the HIT, click "Ok" or hit "Enter"`,
    ``
  );
  if (confirm_post !== null) chrome.runtime.sendMessage({msg: `send_th`, data: `${template}<p>${confirm_post}</p>`});
}

function EXPORT_TO_MTC (template) {
  const confirm_post = prompt(
    `Do you want to post this HIT to MturkCrowd.com?\n\n` +
    `Want to add a comment about your HIT? Fill out the box below.\n\n` +
    `To send the HIT, click "Ok" or hit "Enter"`,
    ``
  );
  if (confirm_post !== null) chrome.runtime.sendMessage({msg: `send_mtc`, data: `${template}<p>${confirm_post}</p>`});
}

// Random Stuff
function COPY_TO_CLIP (string, message) {
  $(`body`).append(`<textarea id="clipboard" style="opacity: 0;">${string}</textarea>`);
  $(`#clipboard`).select();
  document.execCommand(`Copy`);
  $(`#clipboard`).remove();
  alert(message);
}

function VALIDATE_JSON (data) {
  try {
    return JSON.parse(data);
  }
  catch (e) {
    return false;
  }
}

function SPEAK (phrase) {
  chrome.tts.speak(phrase, { enqueue: true, voiceName: CONFIG.include_voice === `0` ? `native` : `Google US English` });
}

function INCLUDE_SOUND () {
  const audio = new Audio();
  audio.src = `media/audio/include_list_${CONFIG.include_sound}.ogg`;
  audio.play();
}

function NEW_HIT_SOUND () {
  const audio = new Audio();
  audio.src = `media/audio/new_hit_${CONFIG.new_hit_sound}.ogg`;
  audio.play();
}

function TIME () {
  const date = new Date();
  let hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? `pm` : `am`;
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? `0` + minutes : minutes;
  return `${ hours }:${ minutes }${ ampm }`;
}

const turkopticon = {
  db: null,
  
  initialize () {    
    const open = window.indexedDB.open(`TODB`, 1);
    
    open.onsuccess = function (event) {
      turkopticon.db = event.target.result;
    };
    open.onupgradeneeded = function (event) {
      turkopticon.db = event.target.result;
      turkopticon.db.createObjectStore(`requester`, {keyPath: `id`});
    };
  },
  
  check (ids) {    
    const temp = {};
    const time = new Date().getTime();
    const transaction = turkopticon.db.transaction([`requester`], `readonly`);
    const objectStore = transaction.objectStore(`requester`);
    
    let get = false;
       
    for (let i = 0; i < ids.length; i ++) {
      const id = ids[i];
      const request = objectStore.get(id);      
      
      request.onsuccess = function (event) {
        if (this.result) {
          temp[id] = this.result;
          
          if (this.result.time < time - 3600000 * 2) {
            get = true;
          }
        }
        else {
          temp[id] = {
            id: id
          };
          get = true;
        }
      };
    }
    
    transaction.oncomplete = function (event) {
      if (get) {
        turkopticon.fetch(ids, temp);
      }
      else {
        turkopticon.send(temp);
      }
    };
  },
  
  fetch (ids, temp) {
    $.when(
      $.ajax({
        url: `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${ids}`,
        type: `GET`,
        timeout: 1500
      }),
      $.ajax({
        url: `https://api.turkopticon.info/requesters?rids=${ids}&fields[requesters]=rid,aggregates`,
        type: `GET`,
        timeout: 1500
      })
    ).done(
      function (to1, to2) {
        temp = turkopticon.to1Parse(to1, ids, temp);
        temp = turkopticon.to2Parse(to2, ids, temp);
        turkopticon.fetchDone(ids, temp);
      }
    ).fail(
      function () {
        turkopticon.send(temp);
      }
    );
  },
  
  to1Parse (result, ids, temp) {
    const json = JSON.parse(result[0]);
    
    for (let i = 0; i < ids.length; i ++) {
      const id = ids[i];
      
      if (json[id]) {
        temp[id].to1 = json[id];
      }
    }
    
    return temp;
  },
  
  to2Parse (result, ids, temp) {
    const array = result[0].data;
    
    for (let i = 0; i < array.length; i ++) {
      const id = array[i].id;
      
      temp[id].to2 = array[i].attributes.aggregates;
    }
    
    return temp;
  },
  
  fetchDone (ids, temp) {
    const time = new Date().getTime();
    const transaction = turkopticon.db.transaction([`requester`], `readwrite`);
    const objectStore = transaction.objectStore(`requester`);
    
    for (let key in temp) {
      if (temp[key].hasOwnProperty(`id`)) {
        temp[key].time = time;
        objectStore.put(temp[key]);
      }
    }
    
    turkopticon.send(temp);
  },
  
  send (temp) {    
    HITS_WRITE_LOGGED_IN(temp);
  }
};

const hitExport = {
  info: {},
  irc: function (msg) {
    console.log(`hitExport.irc()`);
    
    const to1 = msg.to.to1, to2 = msg.to.to2, links = msg.links;
    const hit = HITS[hitExport.info.key];
    
    const to1Template =
      to1
    ?
      `Pay=${to1.attrs.pay} ` +
      `Fast=${to1.attrs.fast} ` +
      `Comm=${to1.attrs.comm} ` +
      `Fair=${to1.attrs.fair} ` +
      `Reviews=${to1.reviews} ` +
      `TOS=${to1.tos_flags} ` +
      `${links.to1}`
    :
      `N/A ${links.to1}`
    ;
    
    const to2Template = 
      to2
    ?
      `Rate=${to2.recent.reward[1] > 0 ? `$${((to2.recent.reward[0] / to2.recent.reward[1]) * 60 ** 2).toFixed(2)}/hr` : `--/hr`} ` +
      `Rej=${to2.recent.rejected[0]} ` +
      `TOS=${to2.recent.tos[0]} ` +
      `${links.to2}`
    :
      `N/A ${links.to2}`
    ;
    
    const exportTemplate = [
      `Req: ${hit.reqname} ${links.req}`,
      `Title: ${hit.title} ${links.preview}`,
      `Time: ${hit.time}`,
      `Avail: ${hit.avail}`,
      `Reward: ${hit.reward}`,
      `TO 1: ${to1Template}`,
      `TO 2: ${to2Template}`,
      `PANDA: ${links.panda}`
    ];
  
    hitExport.copyToClip(`${hit.quals.match(/Masters (.+ granted|Exists)/) ? `MASTERS • ` : ``}${exportTemplate.join(` • `)}`);
  },
  forum: function (msg) {
    console.log(`hitExport.forum()`);
    
    const to1 = msg.to1, to2 = msg.to2;
    const hit = HITS[hitExport.info.key];
    
    function to1Rating (rating) {
      if (rating > 3.99) return `[color=#00cc00]${rating}[/color]`;
      if (rating > 2.99) return `[color=#cccc00]${rating}[/color]`;
      if (rating > 1.99) return `[color=#cc6600]${rating}[/color]`;
      return `[color=#cc0000]${rating}[/color]`;
    }
    
    function to2Rating (rating) {
      if (rating[1] > 0) {
        const percent = Math.round(100 * rating[0] / rating[1]);
        
        if (percent > 79) return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`;
        if (percent > 59) return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`;
        if (percent > 39) return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`;
        return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`;
      }
      return `-- of 0`;
    }
    
    const to1Template =
      to1
    ?
      `[b][Pay: ${to1Rating(to1.attrs.pay)}][/b] ` +
      `[b][Fast: ${to1Rating(to1.attrs.fast)}][/b] ` +
      `[b][Comm: ${to1Rating(to1.attrs.comm)}][/b] ` +
      `[b][Fair: ${to1Rating(to1.attrs.fair)}][/b] ` +
      `[b][Reviews: ${to1.reviews}][/b] ` +
      `[b][ToS: [color=${to1.tos_flags === 0 ? `#00cc00` : `#cc0000`}]${to1.tos_flags}[/color]][/b]`
    :
      `Not Available`
    ;
    
    const to2Template = 
      to2
    ?
      `[b][Rate: ${to2.recent.reward[1] > 0 ? `$${((to2.recent.reward[0] / to2.recent.reward[1]) * 60 ** 2).toFixed(2)}/hr` : `--/hr`}][/b] ` +
      `[b][Pen: ${to2.recent.pending > 0 ? `${(to2.recent.pending / 86400).toFixed(2)} days` : `-- days`}][/b] ` +
      `[b][Res: ${to2Rating(to2.recent.comm)}][/b] ` +
      `[b][Rec: ${to2Rating(to2.recent.recommend)}][/b] ` +
      `[b][Rej: [color=${to2.recent.rejected[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.rejected[0]}[/color]][/b] ` +
      `[b][ToS: [color=${to2.recent.tos[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.tos[0]}[/color]][/b] ` +
      `[b][Brk: [color=${to2.recent.broken[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.broken[0]}[/color]][/b]`
    :
      `Not Available`
    ;
  
    const exportTemplate = [
      `[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]`,
      `[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]`,
      `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])`,
      `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO 1[/url]:[/b] ${to1Template}`,
      `[b][url=https://turkopticon.info/requesters/${hit.reqid}]TO 2[/url]:[/b] ${to2Template}`,
      `[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}`,
      `[b]Time:[/b] ${hit.time}`,
      `[b]HITs Available:[/b] ${hit.avail}`,
      `[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]`,
      `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]`,
      `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr]`,
      `[/table]`
    ];
    
    switch (hitExport.info.type) {
      case `forum`:
        exportTemplate.splice(10, 1);
        hitExport.copyToClip(exportTemplate.join(`\n`));
        break;
      case `thDirect`:
        hitExport.thDirect(`<p>${exportTemplate.join(`</p><p>`)}</p>`);
        break;
      case `mtcDirect`:
        hitExport.mtcDirect(`<p>${exportTemplate.join(`</p><p>`)}</p>`);
        break;
    }
  },
  initIrc: function (msg) {
    console.log(`hitExport.initIrc()`);
    
    const obj = { 
      links: {
        req: `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${msg.reqid}`,
        preview: `https://www.mturk.com/mturk/preview?groupId=${msg.groupid}`,
        panda: `https://www.mturk.com/mturk/previewandaccept?groupId=${msg.groupid}`,
        to1: `https://turkopticon.ucsd.edu/${msg.reqid}`,
        to2: `https://turkopticon.info/requesters/${msg.reqid}`
      }
    };
  
    function ns4tSuccess (result, status, xhr) {
      const urls = result.split(`;`);
      obj.links.req = urls[0];
      obj.links.preview = urls[1];
      obj.links.panda = urls[2];
      obj.links.to1 = urls[3];
      obj.links.to2 = urls[4];
    
      getTo();
    }
  
    function ns4tError (result, status, xhr) {
      getTo();
    }
  
    function getTo () {
      const request = turkopticon.db.transaction([`requester`]).objectStore(`requester`).get(msg.reqid);
      request.onsuccess = function (event) {
        obj.to = request.result ? request.result : {};
        hitExport.irc(obj);
      };
    }

    $.get(`https://ns4t.net/yourls-api.php?action=bulkshortener&title=MTurk&signature=39f6cf4959&urls[]=${encodeURIComponent(obj.links.req)}&urls[]=${encodeURIComponent(obj.links.preview)}&urls[]=${encodeURIComponent(obj.links.panda)}&urls[]=${encodeURIComponent(obj.links.to1)}&urls[]=${encodeURIComponent(obj.links.to2)}`).then(ns4tSuccess, ns4tError);

  },
  initForum: function (msg) {
    console.log(`hitExport.initForum()`);
    
    const request = turkopticon.db.transaction([`requester`]).objectStore(`requester`).get(msg);
    request.onsuccess = function (event) {
      hitExport.forum(request.result ? request.result : {});
    };
  },
  thDirect: function (msg) {
    console.log(`hitExport.thDirect()`);
    
    const confirm_post = prompt(
      `Do you want to post this HIT to TurkerHub.com?\n\n` +
      `Want to add a comment about your HIT? Fill out the box below.\n\n` +
      `To send the HIT, click "Ok" or hit "Enter"`,
      ``
    );
  
    if (confirm_post !== null) {
      chrome.runtime.sendMessage({
        type: `hitExportThDirect`,
        message: `${msg}<p>${confirm_post}</p>`
      });
    }
  },
  mtcDirect: function (msg) {
    console.log(`hitExport.mtcDirect()`);
    
    const confirm_post = prompt(
      `Do you want to post this HIT to MturkCrowd.com?\n\n` +
      `Want to add a comment about your HIT? Fill out the box below.\n\n` +
      `To send the HIT, click "Ok" or hit "Enter"`,
      ``
    );
    
    if (confirm_post !== null) {
      chrome.runtime.sendMessage({
        type: `hitExportMtcDirect`,
        message: `${msg}<p>${confirm_post}</p>`
      });
    }
  },
  sendThDirect: function (msg) {
    console.log(`hitExport.sendThDirect()`);
    
    $.get(`https://turkerhub.com/forums/2/?order=post_date&direction=desc`, function (data) {
      const $data = $(data);
      const thread = $data.find(`li[id^="thread-"]`).eq(1).prop(`id`).replace(`thread-`, ``);
      const xfToken = $data.find(`input[name="_xfToken"]`).eq(0).val();

      $.get(`https://turkerhub.com/hub.php?action=getPosts&thread_id=${thread}&order_by=post_date`, function (data) {
        const groupId = msg.match(/groupId=(\w+)/)[1];
      
        for (let i = 0; i < data.posts.length; i ++) {
          if (data.posts[i].message.indexOf(groupId) !== -1) {
            return;
          }
        } 
           
        $.post(`https://turkerhub.com/threads/${thread}/add-reply`, {
          _xfToken: xfToken,
          message_html: msg
        });
      });
    });
  },
  sendMtcDirect: function (msg) {
    console.log(`hitExport.sendMtcDirect()`);
    
    $.get(`http://www.mturkcrowd.com/forums/4/?order=post_date&direction=desc`, function (data) {
      const $data = $(data);
      const thread = $data.find(`li[id^="thread-"]`).eq(1).prop(`id`).replace(`thread-`, ``);
      const xfToken = $data.find(`input[name="_xfToken"]`).eq(0).val();

      $.get(`http://www.mturkcrowd.com/api.php?action=getPosts&thread_id=${thread}&order_by=post_date`, function (data) {
        const groupId = msg.match(/groupId=(\w+)/)[1];
      
        for (let i = 0; i < data.posts.length; i ++) {
          if (data.posts[i].message.indexOf(groupId) !== -1) {
            return;
          }
        }
          
        $.post(`http://www.mturkcrowd.com/threads/${thread}/add-reply`, {
          _xfToken: xfToken,
          message_html: msg
        });
      });
    });
  },
  copyToClip: function (msg) {
    console.log(`hitExport.copyToClip()`);
    
    document.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${msg}</textarea>`);
    document.getElementById(`clipboard`).select();
  
    const copy = document.execCommand(`copy`);
    alert(copy ? `HIT export has been copied to your clipboard.` : msg);

    document.body.removeChild(document.getElementById(`clipboard`));
  }
};


// Export Stuff
$(`html`).on(`click`, `.export_hit`, function () {
  hitExport.info.key = $(this).data(`key`);
  hitExport.info.type = $(this).data(`type`);
    
  if (hitExport.info.type.match(/irc/)) {
    hitExport.initIrc({reqid: HITS[hitExport.info.key].reqid, groupid: HITS[hitExport.info.key].groupid})
  }
  if (hitExport.info.type.match(/forum|thDirect|mtcDirect/)) {
    hitExport.initForum(HITS[hitExport.info.key].reqid);
  }
});

// HIT Finder IndexedDB
let HFDB;
const HFDB_request = window.indexedDB.open(`HFDB`, 1);
HFDB_request.onsuccess = function (event) {
  HFDB = event.target.result;
};
HFDB_request.onupgradeneeded = function (event) {
  const HFDB = event.target.result;
  
  const createObjectStore = HFDB.createObjectStore(`hit`, { keyPath: `groupid` });
  for (let index of [`reqid`, `reqname`, `title`, `reward`, `date`]) {
    createObjectStore.createIndex(index, index, { unique: false });
  }
};

function HIT_FINDER_DB (keys) {
  const transaction = HFDB.transaction([`hit`], `readwrite`);
  const objectStore = transaction.objectStore(`hit`);

  for (let i = 0; i < keys.length; i ++) {
    const hit = HITS[keys[i]];
    objectStore.put({
      reqid   : hit.reqid,
      reqname : hit.reqname,
      title   : hit.title,
      desc    : hit.desc,
      time    : hit.time,
      reward  : hit.reward,
      groupid : hit.groupid,
      quals   : hit.quals,
      masters : hit.masters,
      seen    : hit.seen
    });
  }
}

$(`html`).on(`click`, `#scan`, function () {
  clearTimeout(timeout);
  $(this).toggleClass(`btn-success btn-danger`);
 
  switch ($(this).text()) {
    case `Stop`: $(this).text(`Start`); break;
    case `Start`: $(this).text(`Stop`); FIND(); break;
  }
});

// Block List Stuff
$(`html`).on(`click`, `#block_list`, function () {
  SHOW_BLOCK_LIST();
});

$(`html`).on(`click`, `#add_block_list`, function () {
  ADD_BLOCK_LIST();
});

$(`html`).on(`click`, `#save_block_list`, function () {
  SAVE_BLOCK_LIST();
});

$(`html`).on(`click`, `.bl_item`, function () {
  EDIT_BLOCK_LIST($(this).data(`key`));
});

$(`html`).on(`click`, `#save_edit_block_list`, function () {
  SAVE_EDIT_BLOCK_LIST();
});

$(`html`).on(`click`, `#delete_edit_block_list`, function () {
  DELETE_EDIT_BLOCK_LIST();
});

$(`html`).on(`click`, `#import_block_list`, function () {
  IMPORT_BLOCK_LIST();
});

$(`html`).on(`click`, `#export_block_list`, function () {
  EXPORT_BLOCK_LIST();
});

$(`html`).on(`click`, `.rt_block`, function () {
  RT_ADD_BLOCK_LIST($(this).data(`term`), $(this).data(`name`));
});

// Include List Stuff
$(`html`).on(`click`, `#include_list`, function () {
  SHOW_INCLUDE_LIST();
});

$(`html`).on(`click`, `#add_include_list`, function () {
  ADD_INCLUDE_LIST();
});

$(`html`).on(`click`, `#save_include_list`, function () {
  SAVE_INCLUDE_LIST();
});

$(`html`).on(`click`, `.il_item`, function () {
  EDIT_INCLUDE_LIST($(this).data(`key`));
});

$(`html`).on(`click`, `#save_edit_include_list`, function () {
  SAVE_EDIT_INCLUDE_LIST();
});

$(`html`).on(`click`, `#delete_edit_include_list`, function () {
  DELETE_EDIT_INCLUDE_LIST();
});

$(`html`).on(`click`, `#import_include_list`, function () {
  IMPORT_INCLUDE_LIST();
});

$(`html`).on(`click`, `#export_include_list`, function () {
  EXPORT_INCLUDE_LIST();
});

$(`html`).on(`click`, `#test_include_list`, function () {
  const test = {
    term: $(`#save_include_list_term`).val(),
    name: $(`#save_include_list_name`).val() === `` ? $(`#save_include_list_term`).val() : $(`#save_include_list_name`).val(),
    type: $(`#save_include_list_type`).val(),
    sound: $(`#save_include_list_sound`).prop(`checked`),
    notification: $(`#save_include_list_notification`).prop(`checked`),
    pushbullet: $(`#save_include_list_pushbullet`).prop(`checked`)
  };
  INCLUDED_ALERTS_TEST(test);
});

$(`html`).on(`click`, `#test_edit_include_list`, function () {
  const test = {
    term: $(`#edit_include_list_term`).val(),
    name: $(`#edit_include_list_name`).val() === `` ? $(`#edit_include_list_term`).val() : $(`#edit_include_list_name`).val(),
    type: $(`#edit_include_list_type`).val(),
    sound: $(`#edit_include_list_sound`).prop(`checked`),
    notification: $(`#edit_include_list_notification`).prop(`checked`),
    pushbullet: $(`#edit_include_list_pushbullet`).prop(`checked`)
  };
  INCLUDED_ALERTS_TEST(test);
});

$(`html`).on(`click`, `.rt_include`, function () {
  RT_ADD_INCLUDE_LIST($(this).data(`term`), $(this).data(`name`));
});

// Setting Stuff
$(`html`).on(`change`, `input, select`, function () {
  SAVE_CONFIG();
});

$(`html`).on(`click`, `#advanced_settings`, function () {
  SHOW_ADVANCED_SETTINGS();
});

$(`html`).on(`change`, `#include_voice`, function () {
  SPEAK(`This is my voice.`);
});

$(`html`).on(`change`, `#include_sound`, function () {
  INCLUDE_SOUND();
});

$(`html`).on(`change`, `#new_hit_sound`, function () {
  NEW_HIT_SOUND();
});

// Modal Stuff
$(document).on(`show.bs.modal`, `.modal`, function (event) {
  const zindex = 1040 + (10 * $(`.modal:visible`).length);
  $(this).css(`z-index`, zindex);
  setTimeout( function () { $(`.modal-backdrop`).not(`.modal-stack`).css(`z-index`, zindex - 1).addClass(`modal-stack`); }, 0);
});

//
$(`html`).on(`click`, `.panel-heading.toggle`, function () {
  $(this).children(`.glyphicon`).toggleClass(`glyphicon-resize-small glyphicon-resize-full`);
  $(this).next().toggle();
});
