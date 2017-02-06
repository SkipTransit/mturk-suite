function TURKOPTICON () {
  const ids = [];

  for (let element of document.querySelectorAll(`a[href^="/requesters/"]`)) {
    if (element.href.match(/requesters\/(\w+)/)) {
      ids.push(element.href.match(/requesters\/(\w+)/)[1]);
    }
  }
  chrome.runtime.sendMessage({msg: `turkopticon`, data: ids});
}

function TURKOPTICON_WRITE (data) {
  function to (id) {
    const html = 
      `<span class="label MTS-TO ${color(data[id].attrs.pay)}">TO</span>` +
      `<div class="MTS-RATINGS">` +
        rating(`Fair`, data[id].attrs.fair) +
        rating(`Fast`, data[id].attrs.fast) +
        rating(`Pay`, data[id].attrs.pay) +
        rating(`Comm`, data[id].attrs.comm) +
        `Scores based on <a href="https://turkopticon.ucsd.edu/${id}" target="_blank">${data[id].reviews} review(s)</a><br>` +
        `Terms of Service violation flags: ${data[id].tos_flags}<br>` +
        `<a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${id}" target="_blank">Report your experience with this requester »</a>` +
      `</div>`
    ;
    return html;
  }
  
  function rating (type, rating) {
    let html = ``;
    
    if (rating > 0.01) {
      html =
        `<table width="100%">` +
          `<td width="20%">${type}:</td>` +
          `<td width="20%">${rating} / 5</td>` +
          `<td width="60%">` +
            `<div style="width: 100%; height: 12px; border: 1px solid; border-radius: 2px; overflow: hidden;">` +
              `<div class="${color(rating)}" style="height: 100%; user-select: none; width: ${rating / 5 * 100}%;"></div>` +
            `</div>` +
          `</td>` +
        `</table>`
      ;
    }
    else {
      html =
        `<table width="100%">` +
          `<td width="20%">${type}:</td>` +
          `<td width="20%">No Data</td>` +
          `<td width="60%">` +
            `<div style="width: 100%; height: 12px; border: 1px solid; border-radius: 2px;"></div>` +
          `</td>` +
        `</table>`
      ;
    }
    return html;
  }
  
  function color (rating) {
    if (rating > 3.99) return `MTS-toHigh`;
    if (rating > 2.99) return `MTS-toGood`;
    if (rating > 1.99) return `MTS-toAverage`;
    if (rating > 0.01) return `MTS-toLow`;
    return `MTS-toNone`;
  }
  
  for (let element of document.querySelectorAll(`a[href^="/requesters/"]`)) {
    const reqid =
      element.href.match(/requesters\/(\w+)/) ?
      element.href.match(/requesters\/(\w+)/)[1] :
      null
    ;
    
    element.insertAdjacentHTML(`beforebegin`, to(reqid));
  }
}

if (document.querySelector(`a[href^="/requesters/"]`)) {
  chrome.runtime.onMessage.addListener( function (request) {
    switch (request.msg) {
      case `turkopticon.js`: TURKOPTICON_WRITE(request.data); break;
    }
  });

  TURKOPTICON();
}
