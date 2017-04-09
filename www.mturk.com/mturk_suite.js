const doc = document;
const qs = (sel) => doc.querySelector(sel);
const qsa = (sel) => doc.querySelectorAll(sel);

const mts = {
  tpe: null,
  settings: null,
};

const acceptLinks = {
  run () {
    if (!doc.querySelector(`a[href^="/mturk/preview?groupId="]`)) return;
    
    for (let elem of doc.querySelectorAll(`a[href^="/mturk/preview?groupId="]`)) {
      elem.insertAdjacentHTML(
        `beforebegin`,
        `<a href="${elem.href.replace(`preview?`, `previewandaccept?`)}" target="_blank" style="padding-right: 5px;">Accept</a>`
      );
    }
  }
};

const acceptNext = {
  go: true,
  
  run () {
    if (!doc.getElementsByName(`autoAcceptEnabled`)[0]) {
      this.go = false;
      return;
    }
    
    if (mts.settings.acceptNext) {
      doc.getElementsByName(`autoAcceptEnabled`)[0].checked = true;
    }
  },
  
  update () {
    if (!this.go) return;
    
    doc.getElementsByName(`autoAcceptEnabled`)[0].checked = mts.settings.acceptNext ? true : false;
  }
};

const captchaCleared = {
  run () {
    if (doc.getElementsByName(`isAccepted`)[0] && !doc.getElementsByName(`userCaptchaResponse`)[0]) {
      chrome.runtime.sendMessage({
        type: `captchaCleared`,
        message: `www`
      });
    }
  }
};

const hitCapsule = {
  run () {
    if (!doc.getElementsByName(`isAccepted`)[0]) return;
    
    const rName = doc.getElementsByClassName(`capsule_field_text`)[0].textContent;
    const rId =
      doc.getElementsByName(`requesterId`)[0] ?
      doc.getElementsByName(`requesterId`)[0].value :
      doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
      doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
      null
    ;
  
    const aa = doc.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value;
    const dd = Math.floor(aa / 86400);
    const hh = Math.floor(aa / 3600 % 24);
    const mm = Math.floor(aa / 60 % 60);

    const aa_time =   
      (dd > 0 ? `${dd} day${dd > 1 ? `s` : ``} ` : ``) +
      (hh > 0 ? `${hh} hour${hh > 1 ? `s` : ``} ` : ``) +
      (mm > 0 ? `${mm} minute${mm > 1 ? `s` : ``} ` : ``)
    ;

    doc.getElementsByClassName(`capsule_field_text`)[0].parentElement.insertAdjacentHTML(
      `beforeend`,
      `<td>
        <img src="/media/spacer.gif" width="25" height="1" border="0">
      </td>
      <td align="right" valign="top" nowrap="" class="capsule_field_title">AA:&nbsp;&nbsp;</td>
      <td align="left" valign="top" nowrap="" class="capsule_field_text">${aa_time.length ? aa_time : `0 seconds`}</td>`
    );
  
    doc.getElementsByClassName(`capsule_field_text`)[0].innerHTML =
      `<a href="/mturk/searchbar?selectedSearchType=hitgroups&${rId ? `requesterId=${rId}` : `searchWords=${rName.trim().replace(/ /g, `+`)}`}" target="_blank">${rName}</a>`
    ;
  }
};

const hitCatcherButtons = {
  go: true, hits: {},
  
  run () {
    if (!doc.querySelector(`a[href="/mturk/beginsignout"]`) || !doc.querySelector(`a[href^="/mturk/preview?groupId="]`) && !doc.URL.match(/groupId=(.*)/)) {
      this.go = false;
      return;
    }
    
    chrome.runtime.sendMessage({ 
      type: `hitCatcherPing`
    });
  },
  
  draw () {
    if (!this.go) return;
    
    if (doc.querySelector(`a[href^="/mturk/preview?groupId="]`)) {
      this.drawOnHits();
    }
    if (doc.URL.match(/groupId=(.*)/)) {
      this.drawOnHeader();
    }
  },
    
  html (key) {
    const html =
      `<button data-key="${key} type="button" class="hitCatcherButtonPanda MTS-export" style="margin-right: 0px;"">Panda</button>
      <button data-key="${key} type="button" class="hitCatcherButtonOnce MTS-export"">Once</button>`
    ;
    return html;
  },
  
  drawOnHits () {
    if (doc.getElementsByClassName(`hitCatcherButtonPanda`)[0]) return;
        
    for (let hit of doc.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
      const key = hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1];
    
      this.hits[key] = {
        nickname: null,
        once: false, 
        sound: true,
        requesterName: 
          hit.getElementsByClassName(`requesterIdentity`)[0].textContent.trim(),
        requesterId:
          hit.querySelector(`[href*="requesterId="]`).getAttribute(`href`).match(/requesterId=(.*)/)[1],      
        title:
          hit.getElementsByClassName(`capsulelink`)[0].textContent.trim(),
        hitSetId: 
          hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1],
        reward:
          hit.getElementsByClassName(`capsule_field_text`)[3].textContent.trim(),
        assignmentDuration:
          hit.getElementsByClassName(`capsule_field_text`)[2].textContent.trim(),
        hitRequirements: 
          hit.querySelector(`td[style="padding-right: 2em; white-space: nowrap;"]`) ?
          [...hit.querySelectorAll(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(elem => `${elem.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
          `None;`,
        hitAutoAppDelay:
          null
      };
    
      if (hit.getElementsByClassName(`MTS-exports`)[0]) {
        hit.getElementsByClassName(`MTS-exports`)[0].insertAdjacentHTML(
          `afterend`,
          this.html(key)
        );
      }
      else {
        hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(
          `beforebegin`,
          this.html(key)
        );
      }
    }
  },
  
  drawOnHeader () {
    if (doc.getElementsByClassName(`hitCatcherButtonPanda`)[0]) return;
    
    const key = doc.URL.match(/roupId=(.*)/)[1];
    
    this.hits[key] = {
      nickname: null,
      once: false, 
      sound: true,
      requesterName: null,
      requesterId: null,      
      title: null,
      hitSetId: doc.URL.match(/roupId=(.*)/)[1],
      reward: null,
      assignmentDuration: null,
      hitRequirements: null,
      hitAutoAppDelay: null
    };
    
    if (doc.getElementById(`theTime`)) {
      doc.getElementById(`theTime`).parentElement.insertAdjacentHTML(
        `beforeend`,
        this.html(key)
      );
    }
    else if (doc.getElementById(`alertBox`)) {
      doc.getElementById(`alertBox`).insertAdjacentHTML(
        `beforeend`,
        this.html(key)
      );
    }
  },
  
  sendOnceWatcher (obj) {    
    obj.once = true;
      
    chrome.runtime.sendMessage({
      type: `hitCatcherAddWatcher`,
      message: obj
    });
  },
  
  sendPandaWatcher (obj) {          
    chrome.runtime.sendMessage({ 
      type: `hitCatcherAddWatcher`,
      message: obj
    });
  }
};

const hitExport = {
  go: true, enabled: 0, hits: {}, info: {},
  
  run () {
    if (!doc.querySelector(`a[href*="roupId="]`) && !doc.getElementsByName(`groupId`)[0] || doc.getElementsByName(`groupId`)[0] && doc.getElementsByName(`groupId`)[0].value === ``) {
      this.go = false;
      return;
    }
    
    this.enabled = 0;
    for (let key in mts.settings.hitExport) {
      if (mts.settings.hitExport[key]) {
        this.enabled ++;
      }
    }
    
    if (doc.querySelector(`a[href*="roupId="]`)) {
      this.drawOnHits();
    }
    if (doc.getElementsByName(`groupId`)[0] && doc.getElementsByName(`groupId`)[0].value !== ``) {
      this.drawOnCapsule();
    }
  },
  
  update () {
    if (!this.go) return;
    
    this.enabled = 0;
    for (let key in mts.settings.hitExport) {
      if (mts.settings.hitExport[key]) {
        this.enabled ++;
      }
    }
    
    if (doc.querySelector(`a[href*="roupId="]`)) {
      this.drawOnHits();
    }
    if (doc.getElementsByName(`groupId`)[0] && doc.getElementsByName(`groupId`)[0].value !== ``) {
      this.drawOnCapsule();
    }
  },
  
  html (key) {
    let html = ``;
      
    if (this.enabled === 1) {
      html = 
        `<button class="MTS-export MTS-export_hit" type="button"` +
        (mts.settings.hitExport.irc ? `data-type="irc"` : ``) +
        (mts.settings.hitExport.forum ? `data-type="forum"` : ``) +
        (mts.settings.hitExport.thDirect ? `data-type="th-direct` : ``) +
        (mts.settings.hitExport.mtcDirect ? `data-type="mtc-direct"` : ``) +
        `data-key="${key}">Export</button>`
      ;
    }
      
    if (this.enabled > 1) {
      html = 
        `<div class="MTS-dropdown">` +
        `<button class="MTS-dropdown-btn MTS-export" type="button">Export<span style="font-size: 75%;">▼</span></button>` +
        `<div class="MTS-dropdown-content">` +
        (mts.settings.hitExport.irc ? `<a class="MTS-export-hit" data-type="irc" data-key="${key}">IRC</a>` : ``) +
        (mts.settings.hitExport.forum ? `<a class="MTS-export-hit" data-type="forum" data-key="${key}">Forum</a>` : ``) +
        (mts.settings.hitExport.thDirect ? `<a class="MTS-export-hit" data-type="th-direct" data-key="${key}">TH Direct</a>` : ``) +
        (mts.settings.hitExport.mtcDirect ? `<a class="MTS-export-hit" data-type="mtc-direct" data-key="${key}">MTC Direct</a>` : ``) +
        `</div>` +
        `</div>`
      ;
    }
    return html;
  },
  
  drawOnHits () {
    for (let hit of doc.querySelectorAll(`table[cellpadding="0"][cellspacing="5"][border="0"] > tbody > tr`)) {
      const key = hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1];

      this.hits[key] = {
        reqname: 
          hit.getElementsByClassName(`requesterIdentity`)[0].textContent.trim(),
        reqid:
          hit.querySelector(`[href*="requesterId="]`).getAttribute(`href`).match(/requesterId=(.*)/)[1],      
        title:
          hit.getElementsByClassName(`capsulelink`)[0].textContent.trim(),
        desc:
          hit.getElementsByClassName(`capsule_field_text`)[5].textContent.trim(),
        time:
          hit.getElementsByClassName(`capsule_field_text`)[2].textContent.trim(),
        reward:
          hit.getElementsByClassName(`capsule_field_text`)[3].textContent.trim(),
        avail:
          hit.getElementsByClassName(`capsule_field_text`)[4].textContent.trim(),
        groupid:
          hit.querySelector(`[href*="roupId="]`).getAttribute(`href`).match(/roupId=(.*)/)[1],
        quals: 
          hit.querySelector(`td[style="padding-right: 2em; white-space: nowrap;"]`) ?
          [...hit.querySelectorAll(`td[style="padding-right: 2em; white-space: nowrap;"]`)].map(element => `${element.textContent.trim().replace(/\s+/g, ` `)};`).join(` `) :
          `None;`
      };
      
      if (hit.querySelector(`mts-exports`)) {
        hit.querySelector(`mts-exports`).innerHTML = this.html(key);
      }
      else {
        hit.getElementsByClassName(`capsulelink`)[0].insertAdjacentHTML(
          `beforebegin`,
          `<mts-exports>${this.html(key)}</mts-exports>`
        );
      }
    }
  },
  
  drawOnCapsule () {
    const key = doc.getElementsByName(`groupId`)[0].value;
  
    const aa = doc.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value;
    const dd = Math.floor(aa / 86400);
    const hh = Math.floor(aa / 3600 % 24);
    const mm = Math.floor(aa / 60 % 60);

    const aa_time =   
      (dd > 0 ? `${dd} day${dd > 1 ? `s` : ``} ` : ``) +
      (hh > 0 ? `${hh} hour${hh > 1 ? `s` : ``} ` : ``) +
      (mm > 0 ? `${mm} minute${mm > 1 ? `s` : ``} ` : ``)
    ;

    this.hits[key] = {
      reqname:
        doc.getElementsByClassName(`capsule_field_text`)[0].textContent.trim(),
      reqid:
        doc.getElementsByName(`requesterId`)[0] ?
        doc.getElementsByName(`requesterId`)[0].value :
        doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
        doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
        null,
      title:
        doc.getElementsByClassName(`capsulelink_bold`)[0].textContent.trim(),
      aa:
        aa !== 0 ? aa_time : `0 seconds`,
      time:
        doc.getElementsByClassName(`capsule_field_text`)[3].textContent.trim(),
      reward:
        doc.getElementsByClassName(`reward`)[1].textContent.trim(),
      avail:
        doc.getElementsByClassName(`capsule_field_text`)[2].textContent.trim(),
      groupid:
        doc.getElementsByName(`groupId`)[0].value,
      quals:
        `${doc.getElementsByClassName(`capsule_field_text`)[5].textContent.trim()};`
    };
      
    if (doc.querySelector(`mts-exports`)) {
      doc.querySelector(`mts-exports`).innerHTML = this.html(key);
    }
    else {
      doc.getElementsByClassName(`capsulelink_bold`)[0].insertAdjacentHTML(`beforebegin`, `<mts-exports>${this.html(key)}</mts-exports>`);
    }
  },
  
  irc (links) {
    const hit = this.hits[this.info.key];
    const to1 = turkopticon.ratings[hit.reqid].to1, to2 = turkopticon.ratings[hit.reqid].to2;
    
    const to1Template =
      to1 ?
      `Pay=${to1.attrs.pay} ` +
      `Fast=${to1.attrs.fast} ` +
      `Comm=${to1.attrs.comm} ` +
      `Fair=${to1.attrs.fair} ` +
      `Reviews=${to1.reviews} ` +
      `TOS=${to1.tos_flags} ` +
      `${links.to1}` :
      `N/A ${links.to1}`
    ;
    
    const to2Template = 
      to2 ?
      `Rate=${to2.recent.reward[1] > 0 ? `$${(tools.hourly(to2.recent.reward)).toFixed(2)}/hr` : `--/hr`} ` +
      `Rej=${to2.recent.rejected[0]} ` +
      `TOS=${to2.recent.tos[0]} ` +
      `${links.to2}` :
      `N/A ${links.to2}`
    ;
    
    const exportTemplate = [
      `Req: ${hit.reqname} ${links.req}`,
      `Title: ${hit.title} ${links.preview}`,
      `Time: ${hit.time}`,
      `Avail: ${hit.avail}`,
      `Reward: ${hit.reward}`,
      `TO 1: ${to1Template}`,
      `TO 2: ${to2Template}`,
      `PANDA: ${links.panda}`
    ];
  
    tools.copyToClip(`${hit.quals.match(/Masters (.+ granted|Exists)/) ? `MASTERS • ` : ``}${exportTemplate.join(` • `)}`);
  },
  
  bbcode () {
    const hit = this.hits[this.info.key];
    const to1 = turkopticon.ratings[hit.reqid].to1, to2 = turkopticon.ratings[hit.reqid].to2;
    
    function to1Rating (rating) {
      if (rating > 3.99) return `[color=#00cc00]${rating}[/color]`;
      if (rating > 2.99) return `[color=#cccc00]${rating}[/color]`;
      if (rating > 1.99) return `[color=#cc6600]${rating}[/color]`;
      if (rating > 0.00) return `[color=#cc0000]${rating}[/color]`;
      return `${rating}`;
    }
    
    function to2Rating (rating) {
      if (rating[1] > 0) {
        const percent = tools.percent(rating);
        
        if (percent > 79) return `[color=#00cc00]${percent}%[/color] of ${rating[1]}`;
        if (percent > 59) return `[color=#cccc00]${percent}%[/color] of ${rating[1]}`;
        if (percent > 39) return `[color=#cc6600]${percent}%[/color] of ${rating[1]}`;
        return `[color=#cc0000]${percent}%[/color] of ${rating[1]}`;
      }
      return `-- of 0`;
    }
    
    const to1Template =
      to1 ?
      `[b][Pay: ${to1Rating(to1.attrs.pay)}][/b] ` +
      `[b][Fast: ${to1Rating(to1.attrs.fast)}][/b] ` +
      `[b][Comm: ${to1Rating(to1.attrs.comm)}][/b] ` +
      `[b][Fair: ${to1Rating(to1.attrs.fair)}][/b] ` +
      `[b][Reviews: ${to1.reviews}][/b] ` +
      `[b][ToS: [color=${to1.tos_flags === 0 ? `#00cc00` : `#cc0000`}]${to1.tos_flags}[/color]][/b]` :
      `Not Available`
    ;
    
    const to2Template = 
      to2 ?
      `[b][Rate: ${to2.recent.reward[1] > 0 ? `$${(tools.hourly(to2.recent.reward)).toFixed(2)}/hr` : `--/hr`}][/b] ` +
      `[b][Pen: ${to2.recent.pending > 0 ? `${(to2.recent.pending / 86400).toFixed(2)} days` : `-- days`}][/b] ` +
      `[b][Res: ${to2Rating(to2.recent.comm)}][/b] ` +
      `[b][Rec: ${to2Rating(to2.recent.recommend)}][/b] ` +
      `[b][Rej: [color=${to2.recent.rejected[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.rejected[0]}[/color]][/b] ` +
      `[b][ToS: [color=${to2.recent.tos[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.tos[0]}[/color]][/b] ` +
      `[b][Brk: [color=${to2.recent.broken[0] === 0 ? `#00cc00` : `#cc0000`}]${to2.recent.broken[0]}[/color]][/b]` :
      `Not Available`
    ;
  
    const exportTemplate = [
      `[table][tr][td][b]Title:[/b] [url=https://www.mturk.com/mturk/preview?groupId=${hit.groupid}]${hit.title}[/url] | [url=https://www.mturk.com/mturk/previewandaccept?groupId=${hit.groupid}]PANDA[/url]`,
      `[b]Worker:[/b] [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/]Preview[/url] | [url=https://worker.mturk.com/projects/${hit.groupid}/tasks/accept_random]Accept[/url] | [url=https://worker.mturk.com/requesters/${hit.reqid}/projects]Requester[/url]`,
      `[b]Requester:[/b] [url=https://www.mturk.com/mturk/searchbar?requesterId=${hit.reqid}]${hit.reqname}[/url] [${hit.reqid}] ([url=https://www.mturk.com/mturk/contact?requesterId=${hit.reqid}]Contact[/url])`,
      `[b][url=https://turkopticon.ucsd.edu/${hit.reqid}]TO 1[/url]:[/b] ${to1Template}`,
      `[b][url=https://turkopticon.info/requesters/${hit.reqid}]TO 2[/url]:[/b] ${to2Template}`,
      `[b]${hit.desc ? `Description:[/b] ${hit.desc}` : `Auto Approval:[/b] ${hit.aa}`}`,
      `[b]Time:[/b] ${hit.time}`,
      `[b]HITs Available:[/b] ${hit.avail}`,
      `[b]Reward:[/b] [color=green][b] ${hit.reward}[/b][/color]`,
      `[b]Qualifications:[/b] ${hit.quals.replace(/Masters has been granted/, `[color=red]Masters has been granted[/color]`).replace(/Masters Exists/, `[color=red]Masters Exists[/color]`)}[/td][/tr]`,
      `[tr][td][center][size=2]HIT exported from [url=http://mturksuite.com/]Mturk Suite[/url] v${chrome.runtime.getManifest().version}[/size][/center][/td][/tr]`,
      `[/table]`
    ];
    
    switch (this.info.type) {
      case `forum`:
        exportTemplate.splice(10, 1);
        tools.copyToClip(exportTemplate.join(`\n`));
        break;
      case `th-direct`:
        this.thDirect(`<p>${exportTemplate.join(`</p><p>`)}</p>`);
        break;
      case `mtc-direct`:
        this.mtcDirect(`<p>${exportTemplate.join(`</p><p>`)}</p>`);
        break;
    }
  },
  
  thDirect (message) {
    const confirm = prompt(
      `Do you want to post this HIT to TurkerHub.com?\n\n` +
      `Want to add a comment about your HIT? Fill out the box below.\n\n` +
      `To send the HIT, click "Ok" or hit "Enter"`,
      ``
    );
  
    if (confirm !== null) {
      chrome.runtime.sendMessage({
        type: `hitExportThDirect`,
        message: `${message}<p>${confirm}</p>`
      });
    }
  },
  
  mtcDirect (message) {
    const confirm = prompt(
      `Do you want to post this HIT to MturkCrowd.com?\n\n` +
      `Want to add a comment about your HIT? Fill out the box below.\n\n` +
      `To send the HIT, click "Ok" or hit "Enter"`,
      ``
    );
    
    if (confirm !== null) {
      chrome.runtime.sendMessage({
        type: `hitExportMtcDirect`,
        message: `${message}<p>${confirm}</p>`
      });
    }
  }
};

const loggedIn = {
  run () {
    if (!doc.querySelector(`a[href="/mturk/beginsignout"]`)) return;
    
    chrome.runtime.sendMessage({ 
      type: `loggedIn`,
      message: `www`
    });
  }
};

const preReloader = {
  go: true,
  
  run () {
    if (!doc.getElementsByClassName(`error_title`)[0] || !doc.getElementsByClassName(`error_title`)[0].innerHTML.match(`You have exceeded the maximum allowed page request rate for this website.`)) {
      this.go = false;
      return;
    }

    if (mts.settings.preReloader) {
      setTimeout( function () {
        window.location.reload();
      }, 1000);
    }
  },
  
  update () {
    if (!this.go) return;

    if (mts.settings.preReloader) {
      setTimeout( function () {
        window.location.reload();
      }, 1000);
    }
  }
};

const queueValue = {
  run () {
    if (!doc.querySelector(`a[class="nonboldsubnavclass"][href*="myhits"]`)) return;
        
    const total = [...doc.getElementsByClassName(`reward`)]
    .map(elem => +elem.textContent.replace(/[^0-9.]/g, ``))
    .reduce((a, b) => a + b, 0);
    
    doc.getElementsByClassName(`title_orange_text_bold`)[0].textContent =
      `Queue Value: $${total.toFixed(2)}`
    ;
  }
};

const sendHit = {
  run () {
    if (!doc.getElementsByName(`isAccepted`)[0]) return;
    
    const hit = {
      reqname: 
        doc.getElementsByName(`prevRequester`)[0].value,
      reqid: 
        doc.getElementsByName(`requesterId`)[0] ?
        doc.getElementsByName(`requesterId`)[0].value :
        doc.getElementsByName(`prevRequester`)[0].value,
      title: 
        doc.getElementsByClassName(`capsulelink_bold`)[0].textContent.trim(),
      reward: 
        doc.getElementsByName(`prevReward`)[0].value.replace(/USD/, `$`),
      autoapp: 
        doc.getElementsByName(`hitAutoAppDelayInSeconds`)[0].value,
      hitid: 
        doc.querySelector(`[class="popup-header"] > [name="hitId"]`).value,
      assignid: 
        doc.querySelector(`[class="popup-header"] > [name="assignmentId"]`).value,
      status: 
        doc.querySelector(`[class="popup-header"] > [name="isAccepted"]`).value === `true` ? 
        `Accepted` : 
        `Previewed`,
      source: 
        doc.getElementsByTagName(`iframe`)[0] ?
        doc.getElementsByTagName(`iframe`)[0].src :
        null,
      date:
        tools.mturkDate(doc.getElementById(`theTime`).textContent),
      viewed:
        new Date().getTime(),
      submitted:
        null
    };
    
    chrome.runtime.sendMessage({
      msg: `sendhit`,
      data: hit
    });
  }
};

const todaysProjectedEarnings = {
  go: true,
  
  run () {
    if (!doc.querySelector(`a[href="/mturk/beginsignout"]`)) {
      this.go = false;
      return;
    }
    
    doc.getElementById(`subtabs_and_searchbar`).insertAdjacentHTML(
      `afterbegin`,
      `<mts-tpe>
        <mts-tpe-bar>
          <mts-tpe-progress style="width: ${+mts.tpe.tpe / +mts.tpe.goal * 100}%;" />
        </mts-tpe-bar>
        <mts-tpe-projected>
          <mts-tpe-earnings>$${(+mts.tpe.tpe).toFixed(2)}</mts-tpe-earnings>
          /
          <mts-tpe-goal>${(+mts.tpe.goal).toFixed(2)}</mts-tpe-goal>
        </mts-tpe-projected>
      </mts-tpe>`
    );
  },
  
  update () {
    if (!this.go) return;
    
    const progress = doc.querySelector(`mts-tpe-progress`);
    const earnings = doc.querySelector(`mts-tpe-earnings`);
    const goal = doc.querySelector(`mts-tpe-goal`);

    if (progress) progress.style.width = `${+mts.tpe.tpe / +mts.tpe.goal * 100}%`;
    if (earnings) earnings.textContent = `$${(+mts.tpe.tpe).toFixed(2)}`;
    if (goal) goal.textContent = (+mts.tpe.goal).toFixed(2);
  }
};

const turkopticon = {
  ratings: null,
  
  run () {
    if (!doc.querySelector(`a[href*="requesterId="]`)) {
      return;
    }
    
    const ids = [];
    
    for (let elem of doc.querySelectorAll(`a[href*="requesterId="]`)) {
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
    for (let elem of doc.getElementsByClassName(`requesterIdentity`)) {
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
    
    if (doc.getElementsByName(`requesterId`)[0] || doc.querySelector(`a[href^="/mturk/return?"]`) && doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)) {
      const reqId =
        doc.getElementsByName(`requesterId`)[0] ?
        doc.getElementsByName(`requesterId`)[0].value :
        doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/) ?
        doc.querySelector(`a[href^="/mturk/return?"]`).href.match(/requesterId=(\w+)/)[1] :
        null;
    
      doc.getElementsByClassName(`capsule_field_text`)[0].insertAdjacentHTML(
        `beforebegin`,
        this.element(reqId)
      );
    }
  },
  
  element (id) {
    const to = this.ratings[id];
        
    function colors (pay, rate) {
      if (pay >= rate.high) return `rgba(0, 255, 0, 0.65)`;
      if (pay >= rate.good) return `rgba(255, 255, 0, 0.65)`;
      if (pay >= rate.average) return `rgba(255, 140, 0, 0.65)`;
      if (pay >= rate.low) return `rgba(255, 0, 0, 0.65)`;
      return `rgba(160, 160, 160, 0.65)`;
    }
    
    const to1Pay = to.to1 ? to.to1.attrs.pay : null;
    const to1Color = colors(to1Pay, mts.settings.to.to1);
            
    const to2Pay = to.to2 ? to.to2.recent.reward[1] > 0 ? tools.hourly(to.to2.recent.reward) : 0 : null;
    const to2Color = colors(to2Pay, mts.settings.to.to2);
    
    const style = 
      mts.settings.to.to1.use && mts.settings.to.to2.use ?
      `style="background: linear-gradient(90deg, ${to1Color} 50%, ${to2Color} 50%);"` :
      `style="background: ${mts.settings.to.to1.use ? to1Color : mts.settings.to.to2.use ? to2Color : `rgba(160, 160, 160, 0.65)`}"`
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
  }
};

const unqualledContact = {
  run () {
    if (!doc.getElementsByClassName(`capsuletarget`)[0]) return;
    
    for (let elem of doc.getElementsByClassName(`capsuletarget`)) {
      if (elem.querySelector(`a[href^="/mturk/contact?"]`)) continue;
    
      const rId = elem.closest(`table`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1];
      const rName = elem.closest(`table`).getElementsByClassName(`requesterIdentity`)[0].textContent;
      const title = elem.closest(`table`).getElementsByClassName(`capsulelink`)[0].textContent;
    
      elem.getElementsByTagName(`table`)[1].getElementsByTagName(`tr`)[0].children[1].insertAdjacentHTML(
        `beforeend`,
        `<a href="contact?&requesterId=${rId}&requesterName=${rName.replace(/ /g, `+`)}&subject=Regarding HIT Titled: ${title.trim().replace(/ /g, `+`)}">Contact the Requester of this HIT</a>`
      );
    }
  }
};

const workspace = {
  go: true,
  
  run () {
    if (!doc.getElementsByName(`isAccepted`)[0] || doc.getElementsByName(`isAccepted`)[0].value !== `true`) {
      this.go = false;
      return;
    }
    
    const iframe = doc.getElementsByTagName(`iframe`)[0];
    const wrapper = doc.getElementById(`hit-wrapper`);
    
    if (mts.settings.workspace) {
      if (iframe) {
        iframe.style.height = `100vh`;
        iframe.focus();
        iframe.scrollIntoView();
      }
      else if (wrapper) {
        wrapper.scrollIntoView();
      }
    }
    else if (iframe) {
      iframe.style.height = `500px`;
    }
  },
  
  update () {
    if (!this.go) return;
    
    const iframe = doc.getElementsByTagName(`iframe`)[0];
    const wrapper = doc.getElementById(`hit-wrapper`);
    
    if (mts.settings.workspace) {
      if (iframe) {
        iframe.style.height = `100vh`;
        iframe.focus();
        iframe.scrollIntoView();
      }
      else if (wrapper) {
        wrapper.scrollIntoView();
      }
    }
    else if (iframe) {
      iframe.style.height = `500px`;
    }
  }
};

const tools = {
  run (type) {
    let functions;
    
    switch (type) {
      case `tpe`:
        functions = [todaysProjectedEarnings];
        break;
      case `settings`:
        functions = [acceptNext, hitExport, preReloader, workspace];
        break;  
    }
    
    for (let func of functions) {
      func.run();
    }
  },
  
  update (type) {
    let functions;
    
    switch (type) {
      case `tpe`:
        functions = [todaysProjectedEarnings];
        break;
      case `settings`:
        functions = [acceptNext, hitExport, preReloader, workspace];
        break;  
    }
    
    for (let func of functions) {
      func.update();
    }
  },
  
  onClick () {
    const elem = event.target;
    
    if (elem.closest(`mts-tpe`)) {
      window.open(chrome.runtime.getURL(`/todays_hits_menu.html`));
    }
    
    if (elem.matches(`.hitCatcherButtonOnce`)) {
      const obj = hitCatcherButtons.hits[elem.dataset.key];
      hitCatcherButtons.sendOnceWatcher(obj);
    }
    
    if (elem.matches(`.hitCatcherButtonPanda`)) {
      const obj = hitCatcherButtons.hits[elem.dataset.key];
      hitCatcherButtons.sendPandaWatcher(obj);
    }
    
    const dropdowns = doc.getElementsByClassName(`MTS-dropdown-content`);
    for (let i = 0; i < dropdowns.length; i ++) {
      dropdowns[i].style.display = `none`;
    }
  
    if (elem.matches(`.MTS-dropdown-btn`)) {
      elem.nextElementSibling.style.display = `block`;
    }
    
    if (elem.matches(`.MTS-export-hit`)) {
      hitExport.info.key = elem.dataset.key;
      hitExport.info.type = elem.dataset.type;
      
      if (hitExport.info.type.match(/irc/)) {
        chrome.runtime.sendMessage({
          type: `ircHitExport`,
          message: {
            reqid: hitExport.hits[hitExport.info.key].reqid,
            groupid: hitExport.hits[hitExport.info.key].groupid
          }
        });
      }
      else {
        hitExport.bbcode();
      }
    }
  },
  
  onMessage (request) {
    switch (request.type) {
      case `hitCatcherPing`:
        if (request.message === true) {
          hitCatcherButtons.draw();
        }
        break;
      case `hitExportIrc`:
        hitExport.irc(request.message);
        break;
      case `alert`:
        tools.alert(request.message);
        break;
      case `turkopticon`:
        turkopticon.ratings = request.message;
        turkopticon.draw();
        break;
    }
  },
  
  storageLocalGet (result) {
    if (result.tpe) {
      mts.tpe = result.tpe;
      tools.run(`tpe`);
    }
    
    if (result.settings) {
      mts.settings = result.settings;
      tools.run(`settings`);
    }
  },
  
  storageOnChanged (changes) {
    if (changes.tpe) {
      const newVal = changes.tpe.newValue;
      const oldVal = changes.tpe.oldValue;
      
      mts.tpe = {
        tpe: newVal.tpe ? newVal.tpe : oldVal.tpe,
        goal: newVal.goal ? newVal.goal : oldVal.goal
      };
      
      tools.update(`tpe`);
    }
    
    if (changes.settings) {
      mts.settings = changes.settings.newValue;
      tools.update(`settings`);
    }
  },
  
  log (message) {
    console.log(`Mturk Suite - ${message}`);
  },
  
  alert (message) {
    alert(`Mturk Suite\n\n${message}`);
  },
  
  hourly (nums) {
    return nums[0] / nums[1] * 3600;
  },
  
  percent (nums) {
    return Math.round(nums[0] / nums[1] * 100);
  },
  
  mturkDate (time) {
    function dst () {
      const today = new Date();
      const year = today.getFullYear();
      let start = new Date(`March 14, ${year} 02:00:00`);
      let end = new Date(`November 07, ${year} 02:00:00`);
      let day = start.getDay();
      start.setDate(14 - day);
      day = end.getDay();
      end.setDate(7 - day);
      return (today >= start && today < end) ? true : false;
    }
    
    const split = time.split(/:| /);
    const dd = split.length === 4 ? +(split[0]) : 0;
    const hh = split.length === 4 ? +(split[1]) : +(split[0]);
    const mm = split.length === 4 ? +(split[2]) : +(split[1]);
    const ss = split.length === 4 ? +(split[3]) : +(split[2]);
    const ms = (dd * 86400 + hh * 3600 + mm * 60 + ss) * 1000;
    const when = Date.now() - ms;
    
    const given = new Date(when);
    const utc = given.getTime() + (given.getTimezoneOffset() * 60000);
    const offset = dst() === true ? `-7` : `-8`;
    const amz = new Date(utc + (3600000 * offset));
    const day = (amz.getDate()) < 10 ? `0` + (amz.getDate()).toString() : (amz.getDate()).toString();
    const month = (amz.getMonth() + 1) < 10 ? `0` + (amz.getMonth() + 1).toString() : (amz.getMonth() + 1).toString();
    const year = (amz.getFullYear()).toString();
    const date = month + day + year;
    
    return date;
  },
  
  copyToClip (message) {
    doc.body.insertAdjacentHTML(`afterbegin`, `<textarea id="clipboard" style="opacity: 0;">${message}</textarea>`);
    doc.getElementById(`clipboard`).select();
  
    const copy = doc.execCommand(`copy`);
    this.alert(copy ? `HIT export has been copied to your clipboard.` : message);

    doc.body.removeChild(doc.getElementById(`clipboard`));
  },
};

for (let func of [acceptLinks, captchaCleared, hitCapsule, hitCatcherButtons, loggedIn, turkopticon, queueValue, sendHit, unqualledContact]) {
  func.run();
}

chrome.runtime.onMessage.addListener(tools.onMessage);
chrome.storage.local.get(`tpe`, tools.storageLocalGet);
chrome.storage.local.get(`settings`, tools.storageLocalGet);
chrome.storage.onChanged.addListener(tools.storageOnChanged);

document.addEventListener(`click`, tools.onClick);
