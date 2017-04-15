//Element.prototype.qs = () => return element;

const finder = {
  settings: {
    irc: true,
    to: {
      to1: {
        use: true,
        high: 4,
        good: 3, 
        average: 2,
        low: 0.01,
      },
      to2: {
        use: true,
        high: 12,
        good: 9, 
        average: 6,
        low: 0.01,
      }
    }
  },
  
  hits: {}, keys: [],
  
  scrape (method, text) {
    if (method === `hc`) this.scrapeHC(text);
      
    
  },
  
  scrapeHC (text) {    
    finder.parseText(text)
    .then(turkopticon.getTO)
    .then(finder.drawHITs)
    .catch(function (error) {
      console.log(error);
    });
  },
  
  scrapeWww () {
    
  },
  
  scrapeWorker () {
    
  },
      
  parseText (result) {
    return new Promise(function (resolve, reject) {
      const doc = document.implementation.createHTMLDocument().documentElement; doc.innerHTML = result;
      const hits = doc.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`);
   
      if (!doc.querySelector(`a[href="/mturk/beginsignout"]`)) {
        reject(`Logged Out`);
      }
    
      if (doc.querySelector(`.error_title`)) {
        reject(`Page Request Error`);
      }
      
      if (!hits.length) {
        reject(`No HITs`);
      }
    
      const ids = [], keys = [];
      
      for (let i = 0; i < hits.length; i ++) {
        const hit = selector => hits[i].querySelectorAll(selector);
      
        const key = hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1]; keys.push(key);
      
        const obj = {
          reqid:
            hit(`[href*="requesterId="]`)[0].getAttribute(`href`).match(/requesterId=(.*)/)[1],
          reqname: 
            hit(`.requesterIdentity`)[0].textContent.trim(),
          reqlink:
            `https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=${hit(`[href*="requesterId="]`)[0].getAttribute(`href`).match(/requesterId=(.*)/)[1]}`,
          title:
            hit(`a.capsulelink`)[0].textContent.trim(),
          desc:
            hit(`.capsule_field_text`)[5].textContent.trim(),
          time:
            hit(`.capsule_field_text`)[2].textContent.trim(),
          reward:
            hit(`.capsule_field_text`)[3].textContent.trim(),
          avail:
            hit(`.capsule_field_text`)[4].textContent.trim(),
          groupid:
            hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1],
          prevlink:
            `https://www.mturk.com/mturk/preview?groupId=${hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1]}`,
          pandlink:
            `https://www.mturk.com/mturk/previewandaccept?groupId=${hit(`[href*="roupId="]`)[0].getAttribute(`href`).match(/roupId=(.*)/)[1]}`,
          quals: 
            hit(`td[style="padding-right: 2em; white-space: nowrap;"]`)[0] ?
            [...hit(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(elem => `${elem.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
            `None;`,
          masters:
            false,
          new:
            finder.hits[key] ? true : false,
          seen:
            new Date().getTime()
        };
     
        if (obj.quals.indexOf(`Masters has been granted`) !== -1) {
          obj.masters = true;
        }
      
        ids.push(obj.reqid);
        finder.hits[key] = obj;
      }
      
      resolve({ids: ids, keys: keys});
    });
  },
  
  parseJSON (result) {
    
  },
  
  hitHTML (hit) {
    const to1 = turkopticon.ratings[hit.reqid].to1;
    const to2 = turkopticon.ratings[hit.reqid].to2;
    const use = false;
    const rating = to1 || to2 ? use ? to1 ? to1.attrs.pay : `N/A` : to2 ? to2.recent.reward[1] > 0 ? `$${(tools.hourly(to2.recent.reward)).toFixed(2)}/hr` : `--/hr` : `N/A` : `New`;

    const to1Pay = to1 ? to1.attrs.pay : null;
    const to1Color = this.hitColor(to1Pay, this.settings.to.to1);
            
    const to2Pay = to2 ? to2.recent.reward[1] > 0 ? tools.hourly(to2.recent.reward) : 0 : null;
    const to2Color = this.hitColor(to2Pay, this.settings.to.to2);
    
    const html = 
      `<tr class="${this.settings.to.to1.use ? to1Color: to2Color}">
        <td>
          ${this.hitWrenchHTML(hit)}
          <a href="${hit.reqlink}" target="_blank">${hit.reqname}</a>
        </td>
        <td>
          ${this.hitExportHTML(hit)}
          <a href="${hit.prevlink}" target="_blank" data-toggle="tooltip" data-placement="top" data-html="true" data-animation="false" title="${hit.quals.replace(/; /g, `;<br>`)}">${hit.title}</a>
        </td>
        <td class="text-center">${hit.avail}</td>
        <td class="text-center"><a href="${hit.pandlink}" target="_blank">${hit.reward}</a></td>
        <td class="text-center">
          ${this.hitTurkopticonHTML(hit)}
        </td>
        <td class="text-center">${hit.masters ? `Y` : `N`}</td>
      </tr>`
    ;
    return html;
  },
  
  hitColor (pay, rate) {
    if (pay >= rate.high) return `toHigh`;
    if (pay >= rate.good) return `toGood`;
    if (pay >= rate.average) return `toAverage`;
    if (pay >= rate.low) return `toLow`;
    return `toNone`;
  },
  
  hitWrenchHTML (hit) {
    const html =
      `<div class="btn-group btn-group-xs">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span class="glyphicon glyphicon-wrench" aria-hidden="true"></span>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a class="rt_block" data-term="${hit.reqid}" data-name="${hit.reqname}">Block List Requester</a></li>
          <li><a class="rt_block" data-term="${hit.groupid}" data-name="${hit.title}">Block List HIT</a></li>
          <li><a class="rt_include" data-term="${hit.reqid}" data-name="${hit.reqname}">Include List Requester</a></li>
          <li><a class="rt_include" data-term="${hit.groupid}" data-name="${hit.title}">Include List HIT</a></li>
        </ul>
      </div>`
    ;
    return html;
  },
  
  hitExportHTML (hit) {
    let enabled = 0;
    if (this.settings.irc) enabled ++;
    if (this.settings.forum) enabled ++;
    if (this.settings.forum_th) enabled ++;
    if (this.settings.forum_mtc) enabled ++;
  
    let html = ``;
      
    if (enabled === 1) {
      html = 
        `<button type="button" class="btn btn-primary btn-xs export_hit" 
          ${this.settings.irc ? `data-type="irc"` : ``}
          ${this.settings.forum ? `data-type="forum"` : ``}
          ${this.settings.forum_th ? `data-type="forum_th"` : ``}
          ${this.settings.forum_mtc ? `data-type="forum_mtc"` : ``}
        data-key="${hit.groupid}">Export</button>`
      ;
    }
      
    if (enabled > 1) {
      html =
        `<div class="btn-group btn-group-xs">` +
        `<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` +
        `Export <span class="caret"></span>` +
        `</button>` +
        `<ul class="dropdown-menu">` +
        (this.settings.irc ? `<li><a class="export-hit" data-type="irc" data-key="${hit.groupid}">IRC</a></li>` : ``) +
        (this.settings.forum ? `<li><a class="export-hit" data-type="forum" data-key="${hit.groupid}">Forum</a></li>` : ``) +
        (this.settings.forum_th ? `<li><a class="export-hit" data-type="forum_th" data-key="${hit.groupid}">TH Direct</a></li>` : ``) +
        (this.settings.forum_mtc ? `<li><a class="export-hit" data-type="forum_mtc" data-key="${hit.groupid}">MTC Direct</a></li>` : ``) +
        `</ul>` +
        `</div>`
      ;
    }
    return html;
  },
  
  hitTurkopticonHTML (hit) {
    const to1 = turkopticon.ratings[hit.reqid].to1;
    const to2 = turkopticon.ratings[hit.reqid].to2;
    const use = false;
    
    const rating = to1 || to2 ? this.settings.to.to1.use ? to1 ? to1.attrs.pay : `N/A` : to2 ? to2.recent.reward[1] > 0 ? `$${(tools.hourly(to2.recent.reward)).toFixed(2)}/hr` : `--/hr` : `N/A` : `New`;

    const html =
      `<a class="to-hover" href="https://turkopticon.${use ? `ucsd.edu/` : `info/requesters/`}${hit.reqid}" target="_blank">${rating}</a>
        <mts-to-reviews>
          <mts-table class="mts-attr-table">
          <mts-tr style="color: #FFFFFF; background-color: #222222;">
            <mts-th>TO 1</mts-th><mts-th></mts-th>
            <mts-th>TO 2</mts-th><mts-th>Last 90 Days</mts-th><mts-th>All Time</mts-th>
          </mts-tr>
            <mts-tr>
            <mts-td>Pay:</mts-td>
            <mts-td>${to1 ? `${to1.attrs.pay} / 5` : `null`}</mts-td>

            <mts-td>Pay Rate:</mts-td>
            <mts-td>${to2 ? to2.recent.reward[1] > 0 ? `$${(tools.hourly(to2.recent.reward)).toFixed(2)}/hr` : `--/hr` : `null`}</mts-td>
            <mts-td>${to2 ? to2.all.reward[1] > 0 ? `$${(tools.hourly(to2.all.reward)).toFixed(2)}/hr` : `--/hr` : `null`}</mts-td>
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
            <mts-td>${to2 ? to2.recent.comm[1] > 0 ? `${tools.percent(to2.recent.comm)}% of ${to2.recent.comm[1]}` : `-- of 0` : `null`}</mts-td>
            <mts-td>${to2 ? to2.all.comm[1] > 0 ? `${tools.percent(to2.all.comm)}% of ${to2.all.comm[1]}` : `-- of 0` : `null`}</mts-td>
          </mts-tr>
          <mts-tr>
            <mts-td>Fair:</mts-td>
            <mts-td>${to1 ? `${to1.attrs.fair} / 5` : `null`}</mts-td>

            <mts-td>Recommend:</mts-td>
            <mts-td>${to2 ? to2.recent.recommend[1] > 0 ? `${tools.percent(to2.recent.recommend)}% of ${to2.recent.recommend[1]}` : `-- of 0` : `null`}</mts-td>
            <mts-td>${to2 ? to2.all.recommend[1] > 0 ? `${tools.percent(to2.all.recommend)}% of ${to2.all.recommend[1]}` : `-- of 0` : `null`}</mts-td>
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
        </mts-table>
      </mts-to-reviews>`
    ;
    return html;
  },
  
  drawHITs (keys) {
    let foundHTML = ``, loggedHTML = ``, hits_hidden = 0, logged = false;
  
    for (let i = 0; i < keys.length; i ++) { 
      const hit = finder.hits[keys[i]];
    
      let classes = ``, log = true;
    
      const html = finder.hitHTML(hit);
      foundHTML += html;    
    }
    document.getElementById(`found_tbody`).innerHTML = foundHTML;
  }
};

const turkopticon = {
  ratings: {},
  
  parseTO1 (result) {    
    for (let id in result) {
      turkopticon.ratings[id].to1 = result[id];
    }
  },
  
  parseTO2 (result) {    
    const array = result.data;
    
    for (let i = 0; i < array.length; i ++) {
      const id = array[i].id;
      turkopticon.ratings[id].to2 = array[i].attributes.aggregates;
    }
  },
  
  getTO (result) {
    return new Promise(function (resolve, reject) {
      let resolves = 0;
      
      function done () {
        resolves ++;
        if (resolves === 2) {
          resolve(result.keys);
        }
      }
    
      for (let i = 0; i < result.ids.length; i ++) {
        if (!turkopticon.ratings[result.ids[i]]) {
          turkopticon.ratings[result.ids[i]] = {};
        }
      }
      
      tools.xhr({
        method: `GET`,
        url: `https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=${result.ids}`,
        responseType: `json`
      })
      .then(turkopticon.parseTO1)
      .then(function () {
        done();
      })
      .catch(function (error) {
        console.log(`to1 error:`, error);
        done();
      });
    
      tools.xhr({
        method: `GET`,
        url: `https://api.turkopticon.info/requesters?rids=${result.ids}&fields[requesters]=rid,aggregates`,
        responseType: `json`
      })
      .then(turkopticon.parseTO2)
      .then(function () {
        done();
      })
      .catch(function (error) {
        console.log(`to2 error:`, error);
        done();
      });
    });
  }
};

const listeners = {
  onMessage (request, sender, sendResponse) {
    switch (request.type) {
      case `hitCatcherDocument`:
        finder.scrape(`hc`, request.message);
        break;
    }
  }
};

const tools = {
  xhr (obj) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(obj.method, obj.url);
      xhr.timeout = obj.timeout ? obj.timeout : 5000;
      xhr.responseType = obj.responseType ? obj.responseType : `text`;
      
      if (obj.headers) {
        for (let key in obj.headers) {
          xhr.setRequestHeader(key, obj.headers[key]);
        }
      }
      
      let formData = obj.formData ? obj.formData : null;
      if (formData && typeof formData === `object`) {
        formData = Object.keys(formData)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`)
          .join('&');
      }
      
      xhr.send(formData);
      
      xhr.onload = function () {
        if (this.status === 200) resolve(this.response);
        else reject(`${this.status} - ${this.statusText}`);
      };
      xhr.onerror = function () {
        reject(`${this.status} - ${this.statusText}`);
      };
      xhr.ontimeout = function () {
        reject(`${this.status} - ${this.statusText}`);
      };
    });
  },
  
  hourly (nums) {
    return nums[0] / nums[1] * 3600;
  },
  
  percent (nums) {
    return Math.round(nums[0] / nums[1] * 100);
  }
};

chrome.runtime.onMessage.addListener(listeners.onMessage);
