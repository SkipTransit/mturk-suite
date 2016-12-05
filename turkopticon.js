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
  chrome.runtime.sendMessage({msg: 'turkopticon', data: ids});
};

const ratings = (data) => {
  const toformat = (type, rating) => {
    let color = '255, 0, 0, 0.6';
    if (rating >= 4.00) {color = '0, 255, 0, 0.6';}
    else if (rating >= 3.00) {color = '255, 255, 0, 0.6';}
    else if (rating >= 2.00) {color = '255, 140, 0, 0.6';}
    else if (rating === 'N/A') {color = '160, 160, 160, 0.6';}
    return `<span style="background-color: rgba(${color}); margin-right: 2px;">${type}:${rating}</span>`;
  };
  
  for (let element of $('.requesterIdentity')) {
    const rid = $(element).closest('a').prop('href') || $(element).closest('td[align="left"]:not(.capsule_field_text)').find('a:contains(Contact the Requester of this HIT)').prop('href');
    const id = rid.split('requesterId=')[1].split('&')[0];

    $(element).parent().parent().parent().after(
      `<tr>` +
      `<td align="left" valign="top" nowrap="" class="capsule_field_title"><a href="https://turkopticon.ucsd.edu/${id}" target="_blank" title="Reviews: ${data[id].reviews}, TOS Flags: ${data[id].tos_flags}">TO Rating:</a></td>` +
      `<td align="left" valign="top" nowrap="" class="capsule_field_text" width="100%">${toformat('Pay', data[id].attrs.pay) + toformat('Fair', data[id].attrs.fair) + toformat('Comm', data[id].attrs.comm) + toformat('Fast', data[id].attrs.fast)}</td>` +
      `</tr>`
    );
  }
};
