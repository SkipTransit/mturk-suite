document.addEventListener(`DOMContentLoaded`, () => {
  if ($(`a[href*="requesterId="]`).length) {
    TURKOPTICON();
  }
});

chrome.runtime.onMessage.addListener( (request) => {
  if (request.msg == `turkopticon.js`) {
    TURKOPTICON_WRITE(request.data);
  }
});

const TURKOPTICON = () => {
  const ids = [];

  for (let element of $(`a[href*="requesterId="]`)) {
    ids.push(element.href.split(`requesterId=`)[1].split(`&`)[0]);
  }
  for (let element of $(`input[name="requesterId"]`)) {
    ids.push(element.value);
  }
  chrome.runtime.sendMessage({msg: `turkopticon`, data: ids});
};

const TURKOPTICON_WRITE = (data) => {
  const to = (id) => {
    const html = 
          `<div style="float:left;">` +
          `  <div class="circle" style="background-color: ${color(data[id].attrs.pay)};">TO</div>` +
          `  <div class="ratings">` +
               rating(`Fair`, data[id].attrs.fair) +
               rating(`Fast`, data[id].attrs.fast) +
               rating(`Pay`, data[id].attrs.pay) +
               rating(`Comm`, data[id].attrs.comm) +
          `    <br>` +
          `    <div>Scores based on <a href="https://turkopticon.ucsd.edu/${id}" target="_blank">${data[id].reviews} review(s)</a></div>` +
          `    <div>Terms of Service violation flags: ${data[id].tos_flags}</div>` +
          `    <div>` +
          `      <a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${id}" target="_blank">Report your experience with this requester »</a>` +
          `    </div>` +
          `  </div>` +
          `</div>`;
    return html;
  };
  
  const rating = (type, rating) => {
    let html = ``;
    if (rating > 0.01) {
      html =
        `<div style="display: table; width: 100%; cursor: default; height: 25px;">` +
        `  <div class="capsule_field_title" style="display: table-cell; width:20%;">${type}:</div>` +
        `  <div style="display: table-cell; width:20%;">${rating} / 5</div>` +
        `  <div style="display: table-cell; width:60%;">` +
        `    <div style="width: 100%; height: 12px; border: 1px solid; border-radius: 3px; overflow: hidden;">` +
        `      <div style="height: 100%; background-color: ${color(rating)}; user-select: none; width: ${rating / 5 * 100}%;"></div>` +
        `    </div>` +
        `  </div>` +
        `</div>`;
    }
    else {
      html =
        `<div style="display: table; width: 100%; cursor: default; height: 25px;">` +
        `  <div class="capsule_field_title" style="display: table-cell; width:20%;">${type}:</div>` +
        `  <div style="display: table-cell; width:20%;">No Data</div>` +
        `  <div style="display: table-cell; width:60%;">` +
        `    <div style="width: 100%; height: 12px; border: 1px solid; border-radius: 3px;"></div>` +
        `  </div>` +
        `</div>`;
    }
    return html;
  };
  
  const color = (rating) => {
    let color = `255, 0, 0, 0.65`;
    if (rating > 1.99) {color = `255, 140, 0, 0.65`;}
    if (rating > 2.99) {color = `255, 255, 0, 0.65`;}
    if (rating > 3.99) {color = `0, 255, 0, 0.65`;}
    if (rating < 0.01) {color = `160, 160, 160, 0.65`;}
    return `rgba(${color})`;
  };
  
  for (let element of $(`.requesterIdentity`)) {
    const rid = $(element).closest(`a`).prop(`href`) || $(element).closest(`td[align="left"]:not(.capsule_field_text)`).find(`a:contains(Contact the Requester of this HIT)`).prop(`href`);
    const id = rid.split(`requesterId=`)[1].split(`&`)[0];

    if ($(element).parent(`a`).length) {
      $(element).parent().before(to(id));
    }
    else {
      $(element).before(to(id));
    } 
  }
  if ($(`input[name="requesterId"]`).length || $(`a[href^="/mturk/return?"]`).length && $(`a[href^="/mturk/return?"]`).prop(`href`).match(/requesterId=(\w+)/)) {
    const id = $(`input[name="requesterId"]`).val() || $(`a[href^="/mturk/return?"]`).prop(`href`).match(/requesterId=(\w+)/)[1];
    $(`.capsule_field_text`).eq(0).before(to(id));
  }
};
