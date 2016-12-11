document.addEventListener('DOMContentLoaded', () => {
  if ($('a[href*="requesterId="]').length) {
    turkopticon();
  }
});

chrome.runtime.onMessage.addListener( (request) => {
  if (request.msg == 'turkopticon.js') {
    ratings(request.data);
  }
});

const ids = [];

const turkopticon = () => {
  for (let element of $('a[href*="requesterId="]')) {
    const requesterId = element.href.split('requesterId=')[1].split('&')[0];
    ids.push(requesterId);
  }
  for (let element of $('input[name="requesterId"]')) {
    ids.push($(element).val());
  }
  chrome.runtime.sendMessage({msg: 'turkopticon', data: ids});
};

const ratings = (data) => {
  /*
  const toformat = (type, rating) => {
    let color = '255, 0, 0, 0.6';
    if (rating >= 4.00) {color = '0, 255, 0, 0.6';}
    else if (rating >= 3.00) {color = '255, 255, 0, 0.6';}
    else if (rating >= 2.00) {color = '255, 140, 0, 0.6';}
    else if (rating === 'N/A') {color = '160, 160, 160, 0.6';}
    return `<span style="background-color: rgba(${color}); margin-right: 2px;">${type}:${rating}</span>`;
  };
  */
  
  const to = (id) => {
    const html = 
          `<span style="float:left;">${circle(data[id].attrs.pay)}` +
          `<div class="ratings">` +
          rating('Fair', data[id].attrs.fair) +
          rating('Fast', data[id].attrs.fast) +
          rating('Pay', data[id].attrs.pay) +
          rating('Comm', data[id].attrs.comm) +
          `<br>` +
          `<div>Scores based on <a href="https://turkopticon.ucsd.edu/${id}" target="_blank" style="color: #FFFFFF;">${data[id].reviews} review(s)</a></div>` +
          `<div>Terms of Service violation flags: ${data[id].tos_flags}</div>` +
          `<div><a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${id}" target="_blank" style="color: #FFFFFF;">Report your experience with this requester »</a></div>` +
          `</div>` +
          `</span>`;
    
    return html;
  }
  
  const circle = (rating) => {
    let color = '255, 0, 0, 0.6';
    if (rating > 1.99) {color = '255, 140, 0, 0.6';}
    if (rating > 2.99) {color = '255, 255, 0, 0.6';}
    if (rating > 3.99) {color = '0, 255, 0, 0.6';}
    if (rating < 0.01) {color = '160, 160, 160, 0.6';}
    return `<div class="circle" style="background-color: rgba(${color}); margin-right: 2px;">TO</div>`;
  };
  
  const rating = (type, rating) => {
    let color = '255, 0, 0, 0.6', html = '';
    if (rating > 1.99) {color = '255, 140, 0, 0.6';}
    if (rating > 2.99) {color = '255, 255, 0, 0.6';}
    if (rating > 3.99) {color = '0, 255, 0, 0.6';}
    if (rating < 0.01) {color = '160, 160, 160, 0.6';}
    
    if (rating > 0.01) {
      html =
        `<div style="display: table; width: 100%; cursor: default; height: 25px;">` +
        `<div style="display: table-cell; width:20%;">${type}:</div>` +
        `<div style="display: table-cell; width:20%;">${rating} / 5</div>` +
        `<div style="display: table-cell; width:60%;">` +
        `<div style="width: 100%; height: 12px; border: 1px solid rgba(${color}); border-radius: 3px;">` +
        `<div style="height: 100%; background-color: rgba(${color}); user-select: none; width: ${rating/5 * 100}%;"></div>` +
        `</div>` +
        `</div>` +
        `</div>`;
    }
    else {
      html =
        `<div style="display: table; width: 100%; cursor: default; height: 25px;">` +
        `<div style="display: table-cell; width:20%;">${type}:</div>` +
        `<div style="display: table-cell; width:20%;">No Data</div>` +
        `<div style="display: table-cell; width:60%;">` +
        `<div style="width: 100%; height: 12px; border: 1px solid rgba(160, 160, 160, 0.6); border-radius: 3px;"></div>` +
        `</div>` +
        `</div>`;
    }
    return html
  }
  
  for (let element of $('.requesterIdentity')) {
    const rid = $(element).closest('a').prop('href') || $(element).closest('td[align="left"]:not(.capsule_field_text)').find('a:contains(Contact the Requester of this HIT)').prop('href');
    const id = rid.split('requesterId=')[1].split('&')[0];

    if ($(element).parent('a').length) {
      $(element).parent().before(to(id));
    }
    else {
      $(element).before(to(id));
    }
    
    /* // Old TO display
    $(element).parent().parent().parent().after(
      `<tr>` +
      `<td align="left" valign="top" nowrap="" class="capsule_field_title"><a href="https://turkopticon.ucsd.edu/${id}" target="_blank" title="Reviews: ${data[id].reviews}, TOS Flags: ${data[id].tos_flags}">TO Rating:</a></td>` +
      `<td align="left" valign="top" nowrap="" class="capsule_field_text" width="100%">${toformat('Pay', data[id].attrs.pay) + toformat('Fair', data[id].attrs.fair) + toformat('Comm', data[id].attrs.comm) + toformat('Fast', data[id].attrs.fast)}</td>` +
      `</tr>`
    );
    */
  }
  if ($('input[name="requesterId"]').length) {
    const id = $('input[name="requesterId"]').eq(0).val();
    $('.capsule_field_text').eq(0).before(to(id));
  }
};
