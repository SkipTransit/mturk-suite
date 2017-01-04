function TURKOPTICON () {
  const ids = [];

  for (let element of document.querySelectorAll(`a[href*="requesterId="]`)) {
    if (element.href.match(/requesterId=(\w+)/)) {
      ids.push(element.href.match(/requesterId=(\w+)/)[1]);
    }
  }
  chrome.runtime.sendMessage({msg: `turkopticon`, data: ids});
}

function TURKOPTICON_WRITE (data) {
  function to (id) {
    const html = 
          `<div style="float:left;">` +
            `<div class="circle" style="background-color: ${color(data[id].attrs.pay)};">TO</div>` +
            `<div class="ratings">` +
               rating(`Fair`, data[id].attrs.fair) +
               rating(`Fast`, data[id].attrs.fast) +
               rating(`Pay`, data[id].attrs.pay) +
               rating(`Comm`, data[id].attrs.comm) +
              `<br>` +
              `<div>Scores based on <a href="https://turkopticon.ucsd.edu/${id}" target="_blank">${data[id].reviews} review(s)</a></div>` +
              `<div>Terms of Service violation flags: ${data[id].tos_flags}</div>` +
              `<div>` +
                `<a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${id}" target="_blank">Report your experience with this requester »</a>` +
              `</div>` +
            `</div>` +
          `</div>`;
    return html;
  }
  
  function rating (type, rating) {
    let html = ``;
    if (rating > 0.01) {
      html =
        `<div style="display: table; width: 100%; cursor: default; height: 25px;">` +
          `<div class="capsule_field_title" style="display: table-cell; width:20%;">${type}:</div>` +
          `<div style="display: table-cell; width:20%;">${rating} / 5</div>` +
          `<div style="display: table-cell; width:60%;">` +
            `<div style="width: 100%; height: 12px; border: 1px solid; border-radius: 3px; overflow: hidden;">` +
              `<div style="height: 100%; background-color: ${color(rating)}; user-select: none; width: ${rating / 5 * 100}%;"></div>` +
            `</div>` +
          `</div>` +
        `</div>`;
    }
    else {
      html =
        `<div style="display: table; width: 100%; cursor: default; height: 25px;">` +
          `<div class="capsule_field_title" style="display: table-cell; width:20%;">${type}:</div>` +
          `<div style="display: table-cell; width:20%;">No Data</div>` +
          `<div style="display: table-cell; width:60%;">` +
            `<div style="width: 100%; height: 12px; border: 1px solid; border-radius: 3px;"></div>` +
          `</div>` +
        `</div>`;
    }
    return html;
  }
  
  function color (rating) {
    let color = `255, 0, 0, 0.65`;
    if (rating > 1.99) {color = `255, 140, 0, 0.65`;}
    if (rating > 2.99) {color = `255, 255, 0, 0.65`;}
    if (rating > 3.99) {color = `0, 255, 0, 0.65`;}
    if (rating < 0.01) {color = `160, 160, 160, 0.65`;}
    return `rgba(${color})`;
  }
  
  for (let element of document.getElementsByClassName(`requesterIdentity`)) {
    const reqid = 
          element.closest(`a[href*="requesterId="]`) ?
          element.closest(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1] :
          element.closest(`td[bgcolor="#F0F6F9"]`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/) ?
          element.closest(`td[bgcolor="#F0F6F9"]`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1] :
          null;

    if (element.parentNode === element.closest(`a[href*="requesterId="]`)) {
      element.parentNode.insertAdjacentHTML(`beforebegin`, to(reqid));
    } 
    else {
      element.insertAdjacentHTML(`beforebegin`, to(reqid));
    }
  }
  
  if (document.getElementsByName(`requesterId`)[0] || document.querySelector(`a[href^="/mturk/return?"]`) && document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)) {
    const reqid = 
          document.getElementsByName(`requesterId`)[0] ?
          document.getElementsByName(`requesterId`)[0].value :
          document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
          document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
          null;
    
    document.getElementsByClassName(`capsule_field_text`)[0].insertAdjacentHTML(`beforebegin`, to(reqid));
  }
}

if (document.querySelector(`a[href*="requesterId="]`)) {
  TURKOPTICON();
}

chrome.runtime.onMessage.addListener( function (request) {
  if (request.msg == `turkopticon.js`) {
    TURKOPTICON_WRITE(request.data);
  }
});
