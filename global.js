document.addEventListener('DOMContentLoaded', () => {
  globaljs();
  tpe_menu();
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

const tpe_advanced = () => {
  
  
};

const _tpe = () => {
  $('#tpe_menu').show();
  
  let html = '', c1 = 0, c2 = 0, tpe = 0;

  chrome.storage.local.get('hits', (data) => {
    let hits = data.hits || {};

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
        source = '<a href="' + hits[key].source + '" target="_blank" style="text-decoration: none;">&#x1F5D7;</a> ';
      }
      if (pend) {
        if (hits[key].autoapp && hits[key].submitted) {
          autoapp = _time_til_aa(hits[key].autoapp, hits[key].submitted);
        }
        else {
          autoapp = 'There is no AA data for this HIT.';
        }
      }
      
     html +=
       '<tr class="' + status + '">' +
       '  <td><div>' + source + hits[key].reqname +'</div></td>' +
       '  <td>' + hits[key].title + '</td>' +
       '  <td style="width: 100px; text-align: center;">' + hits[key].reward + '</td>' +
       '  <td style="width: 100px; text-align: center; color: ' + color + '; cursor: context-menu;" data-toggle="tooltip" data-placement="left" title="' + autoapp + '">' + hits[key].status.split(/\s/)[0] + '</td>' +
       '</tr>'
      ;
    }
  
    $('#tbody').html(html);
  });
};

function _time_til_aa (aa, sub) {
  var willapp = 'This HIT will approve in ';
  var autoapp = Number(aa);
  var submit  = Number(sub);
  var current = new Date().getTime() / 1000;
  var remain  = Math.round(submit + autoapp - current);

  if (remain > 0) {
    var dd = Math.floor((remain / (60 * 60 * 24)));
    var hh = Math.floor((remain / (60 * 60)) % 24);
    var mm = Math.floor((remain / (60)) % 60);
    var ss = remain % 60;
        
    willapp +=
      (dd === 0 ? '' : dd + (dd > 1 ? ' days '    : ' day '))    +
      (hh === 0 ? '' : hh + (hh > 1 ? ' hours '   : ' hour '))   +
      (mm === 0 ? '' : mm + (mm > 1 ? ' minutes ' : ' minute ')) +
      (ss === 0 ? '' : ss + (ss > 1 ? ' seconds ' : ' second '))
    ;
  }
  else {
    willapp = "This HIT should be approved.";
  }
  return willapp;
}


const tpe_menu = () => {
  $('body').append(
    '<div id="tpe_menu" style="display: none; z-index: 99; position: fixed; width: 80%; height: 550px; left: 10%; top: 300px; margin-top: -250px; background-color: #373b44;">' +
    '  <span style="float: right;">' +
    '    <button id="tpe_export" class="menu" type="button" height="18px" style="height: 25px; margin-top: 5px;">Export</button>' +
    '    <button id="tpe_sync" class="menu" type="button" height="18px" style="height: 25px; margin-top: 5px;">Sync</button>' +
    '    <button id="tpe_close" class="menu" type="button" height="18px" style=" height: 25px; margin-top: 5px;">Close</button>' +
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
  
  const css = `
<style id="css" type="text/css">

.menu {
display: inline-block;
font-weight: normal;
text-align: center;
white-space: nowrap;
vertical-align: middle;
cursor: pointer;
user-select: none;
border-radius: 0.214rem;
background-color: #DC8C1B;
background-image: linear-gradient(to bottom, #f7dfa5 0%, #f0c14b 100%);
background-repeat: repeat-x;
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF7DFA5', endColorstr='#FFF0C14B', GradientType=0);
border: 1px solid;
border-color: #a88734 #9c7e31 #846a29;
margin-right: 3px;
}

#tpe_menu table * {
color: #FFF;
}

#tpe_menu table td {
background-color: #22252a;
}

</style>
`;

  $('head').append(css);
};

$('html').on('click', '#tpe', () => {
  _tpe();
});

$('html').on('click', '#tpe_close', () => {
  $('#tpe_menu').hide();
});