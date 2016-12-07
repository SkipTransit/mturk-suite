document.addEventListener('DOMContentLoaded', () => {
  globaljs();
});

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
    '<div id="tpe_menu" style="z-index: 99; position: fixed; width: 80%; height: 550px; left: 10%; top: 300px; margin-top: -250px; background-color: #373b44;">' +
    '  <span style="float: right;">' +
    '    <button id="tpe_export" class="menu" type="button" style="height: 25px; margin-top: 5px;">Export</button>' +
    '    <button id="tpe_sync" class="menu" type="button" style="height: 25px; margin-top: 5px;">Sync</button>' +
    '    <button id="tpe_close" class="menu" type="button" style=" height: 25px; margin-top: 5px;">Close</button>' +
    '  </span>' +
    '  <div>' +
    '    <h1 style="padding: 2px; color: #FFF;">Today\'s Projected Earnings Menu</h1>' +
    '  </div>' +
    '  <div style="height: 500px; overflow: auto;">' +
    '    <table style="width: 100%;">' +
    '      <thead style="display; block;">' +
    '        <tr>' +
    '          <th style="text-align: left;">Requester</th>' +
    '          <th style="text-align: left;">Title</th>' +
    '          <th style="text-align: center;">Reward</th>' +
    '          <th style="text-align: center;">Status</th>' +
    '        </tr>' +
    '      </thead>' +
    '      <tbody id="tbody" style="display; block; height: 500px; overflow: auto;;"></tbody>' +
    '    </table>' +
    '  </div>' +
    '</div>'
  );
  
  chrome.storage.local.get('hits', (data) => {
    let hits = data.hits || {}, html = '';
    
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
      
     html +=
       `<tr class="${status}">` +
       `  <td><div>${source + hits[key].reqname}</div></td>` +
       `  <td>${hits[key].title}</td>` +
       `  <td style="width: 100px; text-align: center;">${hits[key].reward}</td>` +
       `  <td style="width: 100px; text-align: center; color: ${color}; cursor: context-menu;" data-toggle="tooltip" data-placement="left" title="${autoapp}">${hits[key].status.split(/\s/)[0]}</td>'` +
       `</tr>`
      ;
    }
  
    $('#tbody').html(html);
  });
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

$('html').on('click', '#tpe', () => {
  tpe_menu();
});

$('html').on('click', '#tpe_close', () => {
  $('#tpe_menu').remove();
});
