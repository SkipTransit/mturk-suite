const turkopticon = {
  mts: {},
  
  execute () {
    const ids = [];
    
    for (let elem of document.querySelectorAll(`a[href*="requesterId="]`)) {
      if (elem.href.match(/requesterId=(\w+)/)) {
        ids.push(elem.href.match(/requesterId=(\w+)/)[1]);
      }
    }
    
    chrome.runtime.sendMessage({
      type: `turkopticon`,
      message: ids
    });
  },
  
  draw () {
    for (let elem of document.getElementsByClassName(`requesterIdentity`)) {
      const reqId =
        elem.closest(`a[href*="requesterId="]`) ?
        elem.closest(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1] :
        elem.closest(`td[bgcolor="#F0F6F9"]`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/) ?
        elem.closest(`td[bgcolor="#F0F6F9"]`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1] :
        null
      ;

      if (elem.parentNode === elem.closest(`a[href*="requesterId="]`)) {
        elem.parentNode.insertAdjacentHTML(`beforebegin`, this.element(reqId));
      }
      else {
        elem.insertAdjacentHTML(`beforebegin`, this.element(reqId));
      }
    }
    
    if (document.getElementsByName(`requesterId`)[0] || document.querySelector(`a[href^="/mturk/return?"]`) && document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)) {
      const reqId =
        document.getElementsByName(`requesterId`)[0] ?
        document.getElementsByName(`requesterId`)[0].value :
        document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
        document.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
        null;
    
      document.getElementsByClassName(`capsule_field_text`)[0].insertAdjacentHTML(`beforebegin`, this.element(reqId));
    }
  },
  
  element (id) {
    const to = this.ratings[id];
    const mts = this.mts;
        
    function colors (pay, rate) {
      if (pay >= rate.high) return `rgba(0, 255, 0, 0.65)`;
      if (pay >= rate.good) return `rgba(255, 255, 0, 0.65)`;
      if (pay >= rate.average) return `rgba(255, 140, 0, 0.65)`;
      if (pay >= rate.low) return `rgba(255, 0, 0, 0.65)`;
      return `rgba(160, 160, 160, 0.65)`;
    }
    
    const to1Pay = to.to1 ? to.to1.attrs.pay : null;
    const to1Color = colors(to1Pay, mts.to.to1);
            
    const to2Pay = to.to2 ? to.to2.recent.reward[1] > 0 ? (to.to2.recent.reward[0] / to.to2.recent.reward[1]) * 60 ** 2 : 0 : null;
    const to2Color = colors(to2Pay, mts.to.to2);
    
    const style = 
      mts.to.to1.use && mts.to.to2.use ?
      `style="background: linear-gradient(90deg, ${to1Color} 50%, ${to2Color} 50%);"` :
      `style="background: ${mts.to.to1.use ? to1Color : mts.to.to2.use ? to2Color : `rgba(160, 160, 160, 0.65)`}"`
    ;
    
    const html =
      `<mts-to ${style}>TO
        <mts-to-reviews>
          ${this.attrTable(to)}
          ${this.linkTable(to)}
        </mts-to-reviews>
      </mts-to>`
    ;
    return html;
  },
  
  attrTable (to) {
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
  
  linkTable (to) {
    const html =
      `<mts-table class="mts-link-table">
        <mts-tr>
          <mts-td><a target="_blank" href="https://turkopticon.ucsd.edu/${to.id}">View on TO 1</a></mts-td>
          <mts-td><a target="_blank" href="https://turkopticon.info/requesters/${to.id}">View on TO 2</a></mts-td>
        </mts-tr>
        <mts-tr>
          <mts-td><a target="_blank" href="https://turkopticon.ucsd.edu/report?requester[amzn_id]=${to.id}">Add review on TO 1</a></mts-td>
          <mts-td><a target="_blank" href="https://turkopticon.info/reviews/new?rid=${to.id}">Add review on TO 2</a></mts-td>
        </mts-tr>
      </mts-table>`
    ;
    return html;
  },
  
  onMessage (request) {
    switch (request.type) {
      case `turkopticon`:
        turkopticon.ratings = request.message;
        turkopticon.draw();
        break;
    }
  },
  
  storageLocalGet (result) {
    turkopticon.mts = result.settings;
    turkopticon.execute();
  },
};

if (document.querySelector(`a[href*="requesterId="]`)) {
  chrome.runtime.onMessage.addListener(turkopticon.onMessage);
  chrome.storage.local.get(`settings`, turkopticon.storageLocalGet);
}
