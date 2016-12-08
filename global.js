document.addEventListener('DOMContentLoaded', () => {
  globaljs();
});

let tpeexport = '';

const globaljs = () => {
  chrome.storage.local.get('tpe', (data) => {
    const tpe = data.tpe || 0;

    $('#subtabs_and_searchbar').prepend(
      `<b style="position: absolute; right: 8px; margin-top: -15px; color: #CC6600;">` +
      `Today's Projected Earnings: ` +
      `<span id="tpe" style="color: #008000; cursor: pointer;">$${tpe.toFixed(2)}<span>` +
      `</b>`
    );
  });
  
  chrome.runtime.onMessage.addListener( (request) => {
    if (request.msg == 'sync_tpe_running') {
      progress(request.data.current, request.data.total);
    }
    if (request.msg == 'sync_tpe_done') {
      $('#tpe_menu').remove();
      tpe_menu();
    }
  });

  chrome.storage.onChanged.addListener( (changes) => {
    for (let change in changes) {
      if (change === 'tpe') {
        $('#tpe').text(`$${changes[change].newValue.toFixed(2)}`);
      }
    }
  });
};

const tpe_menu = () => {
  $('body').append(
    '<div id="tpe_menu" style="padding: 1px;z-index: 99; position: fixed; width: 80%; height: 600px; left: 10%; top: 300px; margin-top: -250px; background-color: #373b44;">' +
    '  <span style="float: right;">' +
    '    <button id="tpe_export" class="menu" type="button" style="height: 25px; margin-top: 5px;">Export</button>' +
    '    <button id="tpe_sync" class="menu" type="button" style="height: 25px; margin-top: 5px;">Sync</button>' +
    '    <button id="tpe_close" class="menu" type="button" style=" height: 25px; margin-top: 5px;">Close</button>' +
    '  </span>' +
    '  <div>' +
    '    <h1 style="color: #FFF;">Today\'s HITs Menu</h1>' +
    '  </div>' +
    
    '  <div>' +
    '    <ul class="tab">'+
    '      <li><a href="javascript:void(0)" class="tablinks Overview active">Overview</a></li>'+
    '      <li><a href="javascript:void(0)" class="tablinks Breakdown">Breakdown</a></li>'+
    '      <li><a href="javascript:void(0)" class="tablinks Detailed">Detailed</a></li>'+
    '    </ul>'+
    '  </div>' +
    

    '  <div id="Overview" class="tabcontent" style="display: block;">'+
    '    <h3>Loading Information.....</h3>'+
    '  </div>'+
    
    
    '  <div id="Breakdown" class="tabcontent" style="height: 540px; overflow: auto;">' +
    '    <table style="width: 100%;">' +
    '      <thead style="display; block;">' +
    '        <tr>' +
    '          <th style="text-align: left;">Requester</th>' +
    '          <th style="text-align: left;">HITs</th>' +
    '          <th style="text-align: center;">Reward</th>' +
    '        </tr>' +
    '      </thead>' +
    '      <tbody id="breakdown_tbody" style="display; block; height: 500px; overflow: auto;"></tbody>' +
    '    </table>' +
    '  </div>' +
    
    '  <div id="Detailed" class="tabcontent" style="height: 523px; overflow: auto;">' +
    '    <table style="width: 100%;">' +
    '      <thead>' +
    '        <tr>' +
    '          <th style="text-align: left;">Requester</th>' +
    '          <th style="text-align: left;">Title</th>' +
    '          <th style="text-align: center;">Reward</th>' +
    '          <th style="text-align: center;">Status</th>' +
    '        </tr>' +
    '      </thead>' +
    '      <tbody id="detailed_tbody"></tbody>' +
    '    </table>' +
    '  </div>' +
    
    '</div>'
  );
  
  chrome.storage.local.get('hits', (data) => {
    const hits = data.hits || {};
    let breakdown = {}, breakdown_html = '', detailed_html = '';
    
    // Overview
    const total = Object.keys(hits).length
    let submitted = 0, submitted_pe = 0;
    let returned = 0;
    let approved = 0, approved_pe = 0;
    
    for (let key in hits) {
      if (hits[key].status.match(/Submitted|Paid|Approved|Pending/)) {
        submitted ++;
        submitted_pe += Number(hits[key].reward.replace(/[^0-9.]/g, ''));
        
        if (hits[key].status.match(/Paid|Approved/)) {
          approved ++;
          approved_pe += Number(hits[key].reward.replace(/[^0-9.]/g, ''));
        };
        
        if (hits[key].status.match(/Submitted|Pending/)) {
          const apped = is_approved(hits[key].autoapp, hits[key].submitted);
          if (apped) {
            approved ++;
            approved_pe += Number(hits[key].reward.replace(/[^0-9.]/g, ''));
          }
        }
      }
    }
    
    $('#Overview').html(
      `<div style="font-size: 20px; line-height: normal;">` +
      `<br>` +
      `<span><b>${total}</b> HITs have been viewed, submitted or returned today.</span>` +
      `<br>` +
      `<br>` +
      //`<span><b>${submitted}</b> HITs have been submitted today for a total value of <b>$295.00</b>.</span>` +
      `<span><b>${submitted}</b> HITs have been submitted today for a total value of <b>$${submitted_pe.toFixed(2)}</b>.</span>` +
      `<br>` +
      `<br>` +
      //`<span><b>${approved}</b> HITs have been approved today for a total value of <b>$295.00</b>.</span>` +
      `<span><b>${approved}</b> HITs have been approved today for a total value of <b>$${approved_pe.toFixed(2)}</b>.</span>` +
      `</div>`
    );
    
    // Breakdown
    tpeexport +=
        `[b]Today\'s Projected Earnings: $${submitted_pe.toFixed(2)}[/b] (Exported from Mturk Suite)\n` +
        `[spoiler=Today's Projected Earnings Full Details][table][tr][th][b]Requester[/b][/th][th][b]HITs[/b][/th][th][b]Projected[/b][/th][/tr]`;

    for (let key in hits) {
      if (hits[key].status.match(/(Submitted|Paid|Approved|Pending)/)) {
        const id = hits[key].reqid;
        
        if (!breakdown[id]) {
          breakdown[id] = {
            reqname : hits[key].reqname,
            hits : 1,
            reward : Number(hits[key].reward.replace(/[^0-9.]/g, ''))
          };
        }
        else {
          breakdown[id].hits   += 1;
          breakdown[id].reward += Number(hits[key].reward.replace(/[^0-9.]/g, ''));
        }
      }
    }
    
    const breakdown_sorted = Object.keys(breakdown).sort( (a, b) => { return breakdown[a].reward - breakdown[b].reward;});
    for (let i = breakdown_sorted.length - 1; i > -1; i --) {
      let key = breakdown_sorted[i];

      breakdown_html +=
        `<tr>` +
        //`  <td>reqname</td>` +
        `  <td>${breakdown[key].reqname}</td>` +
        `  <td style="width: 50px; text-align: right;">${breakdown[key].hits}</td>` +
        //`  <td style="width: 50px; text-align: right;">$295.00</td>` +
        `  <td style="width: 50px; text-align: right;">$${breakdown[key].reward.toFixed(2)}</td>` +
        `</tr>`
      ;
      
     tpeexport +=
        `[tr]` +
        `[td][url=https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${key}]${breakdown[key].reqname}[/url][/td]` +
        `[td]${breakdown[key].hits}[/td]` +
        `[td]$${breakdown[key].reward.toFixed(2)}[/td]` +
        `[/tr]\n`
      ;
    }
    
    $('#breakdown_tbody').html(breakdown_html);
    
    // Detailed
    const sorted = Object.keys(hits).sort( (a, b) => {return hits[a].viewed - hits[b].viewed;});
    for (let i = 0; i < sorted.length; i ++) {
      let key = sorted[i], color = '', source = '', autoapp = '', pend = false, status = 'allhits ';
      
      if (hits[key].status.match(/Paid|Approved/)) {
        color = 'green'; status += 'app';
      }
      else if (hits[key].status.match(/Pending|Submitted/)) {
        color = 'orange'; pend = true; status += 'pen';
      }
      else if (hits[key].status.match(/Rejected/)) {
        color = 'red'; status += 'rej';
      }
      else if (hits[key].status.match(/Accepted|Previewed/)) {
        status += 'vie';
      }
      if (hits[key].source) {
        source = `<a href="${hits[key].source}" target="_blank">&#x1F5D7;</a> `;
      }
      if (pend) {
        if (hits[key].autoapp && hits[key].submitted) {
          autoapp = approve_when(hits[key].autoapp, hits[key].submitted);
        }
        else {
          autoapp = 'There is no AA data for this HIT.';
        }
      }
      
     detailed_html +=
       `<tr class="${status}">` +
       //`  <td><div>reqname</div></td>` +
       //`  <td>title</td>` +
       //`  <td style="width: 100px; text-align: center;">$295.00</td>` +
       `  <td><div>${source + hits[key].reqname}</div></td>` +
       `  <td>${hits[key].title}</td>` +
       `  <td style="width: 100px; text-align: center;">${hits[key].reward}</td>` +
       `  <td style="width: 100px; text-align: center; color: ${color};" title="${autoapp}">${hits[key].status.split(/\s/)[0]}</td>` +
       `</tr>`
      ;
    }
  
    $('#detailed_tbody').html(detailed_html);
  });
};

const progress = (current, total) => {
  const width = total === '???' ? 0 : current / total * 100;
  $('#Overview, #Breakdown, #Detailed').html(
    `<div style="text-align: center; padding: 5px;">` +
    `  <h1>Syncing page ${current} of ${total}</h1>` +
    `  <div style="width: 100%; height: 7px; border: 1px solid rgb(220, 140, 27); border-radius: 3px; overflow: hidden; margin-top: 3px; text-align: center; -webkit-user-select: none; -moz-user-select: none;">` +
    `    <div style="height: 100%; background-color: rgb(220, 140, 27); user-select: none; width: ${width}%; background-image: linear-gradient(rgb(247, 223, 165) 0%, rgb(240, 193, 75) 100%);"></div>` +
    `  </div>` +
    `</div>`
  );
};

const is_approved = (aa, sub) => {
  const autoapp = Number(aa);
  const submit  = Number(sub);
  const current = new Date().getTime() / 1000;
  const remain  = Math.round(submit + autoapp - current);
  return remain > 0 ? false : true;
};

const approve_when = (aa, sub) => {
  let willapp = 'This HIT will approve in ';
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
      (dd === 0 ? '' : dd + (dd > 1 ? ' days ' : ' day ')) +
      (hh === 0 ? '' : hh + (hh > 1 ? ' hours ' : ' hour ')) +
      (mm === 0 ? '' : mm + (mm > 1 ? ' minutes ' : ' minute ')) +
      (ss === 0 ? '' : ss + (ss > 1 ? ' seconds ' : ' second '))
    ;
  }
  else {
    willapp = 'This HIT should be approved.';
  }
  return willapp;
}

const tablinks = (id) => {
  $('.tabcontent').hide();
  $('.tablinks').removeClass('active');

  $(`#${id}`).show();
  $(`.${id}`).addClass('active');
}

const copyToClipboard1 = (template) => {
  $('body').append(`<textarea id="copyToClipboard" style="opacity: 0;">${template}</textarea>`);
  $('#copyToClipboard').select();
  document.execCommand('Copy');
  $('#copyToClipboard').remove();
  alert(`Today's HITs Breakdown has been copied to your clipboard.`);
};


$('html').on('click', '#tpe', () => {
  tpe_menu();
});

$('html').on('click', '#tpe_export', () => {
  copyToClipboard1(tpeexport);
});

$('html').on('click', '#tpe_sync', () => {
  progress(1, '???');
  chrome.runtime.sendMessage({msg: 'sync_tpe'});
});

$('html').on('click', '#tpe_close', () => {
  $('#tpe_menu').remove();
});

$('html').on('click', '.tablinks', function () {
  tablinks($(this).text());
});
