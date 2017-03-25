const turkopticon = {
  mts: {},
  grabIds: function () {
    const ids = [];
    
    for (let element of document.querySelectorAll(`a[href*="requesterId="]`)) {
      if (element.href.match(/requesterId=(\w+)/)) {
        ids.push(element.href.match(/requesterId=(\w+)/)[1]);
      }
    }
    chrome.runtime.sendMessage({
      type: `turkopticon`,
      message: ids
    });
  },
  draw: function (to) {
    turkopticon.ratings = to;
    
    for (let element of document.getElementsByClassName(`requesterIdentity`)) {
      const reqid = 
        element.closest(`a[href*="requesterId="]`) ?
        element.closest(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1] :
        element.closest(`td[bgcolor="#F0F6F9"]`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/) ?
        element.closest(`td[bgcolor="#F0F6F9"]`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1] :
        null
      ;

      if (element.parentNode === element.closest(`a[href*="requesterId="]`)) {
        element.parentNode.insertAdjacentHTML(`beforebegin`, turkopticon.circle(reqid));
      }
      else {
        element.insertAdjacentHTML(`beforebegin`, turkopticon.circle(reqid));
      }
    }
    
    if (document.getElementsByName(`requesterId`)[0] || document.querySelector(`a[href^="/mturk/return?"]`) && document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)) {
      const reqid = 
        document.getElementsByName(`requesterId`)[0] ?
        document.getElementsByName(`requesterId`)[0].value :
        document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
        document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
        null;
    
      document.getElementsByClassName(`capsule_field_text`)[0].insertAdjacentHTML(`beforebegin`, turkopticon.circle(reqid));
    }
  },
  circle: function (id) {
    const to = turkopticon.ratings[id];
    const mts = turkopticon.mts;
    
    let color = `mts-toNone`;
    if (mts.to) {
      if (mts.to.to1 && to.to1) {
        if (mts.to.to1.use) {
          const pay = to.to1.attrs.pay;
          if (pay >= mts.to.to1.high) color = `mts-toHigh`;
          else if (pay >= mts.to.to1.good) color = `mts-toGood`;
          else if (pay >= mts.to.to1.average) color = `mts-toAverage`;
          else if (pay >= mts.to.to1.low) color = `mts-toLow`;
        }
      }
      if (mts.to.to2 && to.to2) {
        if (mts.to.to2.use) {
          const pay = to.to2.recent.reward[1] > 0 ? (to.to2.recent.reward[0] / to.to2.recent.reward[1]) * 60 ** 2 : 0;
          if (pay >= mts.to.to2.high) color = `mts-toHigh`;
          else if (pay >= mts.to.to2.good) color = `mts-toGood`;
          else if (pay >= mts.to.to2.average) color = `mts-toAverage`;
          else if (pay >= mts.to.to2.low) color = `mts-toLow`;
        }
      }
    }
    
    const html = 
      `<mts-to>
        <mts-to-circle class="${color}">TO</mts-to-circle>
        <mts-to-reviews>
          ${turkopticon.attrTable(to)}
          ${turkopticon.linkTable(id)}
        </mts-to-reviews>
      </mts-to>`
    ;
    return html;
  },
  attrTable: function (to) {
    const to1 = to.to1;
    const to2 = to.to2;
    const html =
      `<mts-table class="mts-attr-table">
        <mts-tr style="text-align: left; background-color: #CCDDE9;">
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
  linkTable: function (id) {
    const html = 
      `<mts-table class="mts-link-table">
        <mts-tr>
          <mts-td><a href="https://turkopticon.ucsd.edu/${id}">View on TO 1</a></mts-td>
          <mts-td><a href="https://turkopticon.info/requesters/${id}">View on TO 2</a></mts-td>
        </mts-tr>

        <mts-tr>
          <mts-td><a href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${id}">Add review on TO 1</a></mts-td>
          <mts-td><a href="https://turkopticon.info/reviews/new?rid=${id}">Add review on TO 2</a></mts-td>
        </mts-tr>
      </mts-table>`
    ;
    return html;
  }
};

if (document.querySelector(`a[href*="requesterId="]`)) {
  chrome.runtime.onMessage.addListener( function (request) {
    switch (request.type) {
      case `turkopticon`:
        turkopticon.draw(request.message);
        break;
    }
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    turkopticon.mts = result.settings ? result.settings : {};
    turkopticon.grabIds();
  });
}