const settings = {
  mts: {},
  
  load (obj) {
    console.log(`settings.load()`);
    
    if (obj) {
      this.mts = obj;
    }
  },
  
  save () {
    console.log(`settings.save()`);
        
    // Today's Projected Earnings Settings
    this.mts.goal = (+document.getElementById(`goal`).value).toFixed(2);
    
    // General Settings
    this.mts.acceptNext = document.getElementById(`accept-next`).checked;
    this.mts.workspace = document.getElementById(`workspace`).checked;
    this.mts.preReloader = document.getElementById(`pre-reloader`).checked;
    this.mts.theme = document.getElementById(`theme`).checked;
    this.mts.hcBeta = document.getElementById(`hc-beta`).checked;
    
    // HIT Export Settings
    this.mts.hitExport.irc = document.getElementById(`irc`).checked;
    this.mts.hitExport.forum = document.getElementById(`forum`).checked;
    this.mts.hitExport.thDirect = document.getElementById(`th-direct`).checked;
    this.mts.hitExport.mtcDirect = document.getElementById(`mtc-direct`).checked;
    
    // TO 1 Settings
    this.mts.to.to1.use = document.getElementById(`to1-use`).checked;
    this.mts.to.to1.high = (+document.getElementById(`to1-high`).value).toFixed(2);
    this.mts.to.to1.good = (+document.getElementById(`to1-good`).value).toFixed(2);
    this.mts.to.to1.average = (+document.getElementById(`to1-average`).value).toFixed(2);
    this.mts.to.to1.low = (+document.getElementById(`to1-low`).value).toFixed(2);
    
    // TO 2 Settings
    this.mts.to.to2.use = document.getElementById(`to2-use`).checked;
    this.mts.to.to2.high = (+document.getElementById(`to2-high`).value).toFixed(2);
    this.mts.to.to2.good = (+document.getElementById(`to2-good`).value).toFixed(2);
    this.mts.to.to2.average = (+document.getElementById(`to2-average`).value).toFixed(2);
    this.mts.to.to2.low = (+document.getElementById(`to2-low`).value).toFixed(2);
        
    chrome.storage.local.set({
      settings: this.mts
    });
  },
  
  update () {
    console.log(`settings.update()`);
    
    // Today's Projected Earnings Settings
    document.getElementById(`goal`).value = this.mts.goal;
    
    // General Settings
    document.getElementById(`accept-next`).checked = this.mts.acceptNext;
    document.getElementById(`workspace`).checked = this.mts.workspace;
    document.getElementById(`pre-reloader`).checked = this.mts.preReloader;
    document.getElementById(`theme`).checked = this.mts.theme;
    document.getElementById(`hc-beta`).checked = this.mts.hcBeta;
    
    // HIT Export Settings
    document.getElementById(`irc`).checked = this.mts.hitExport.irc;
    document.getElementById(`forum`).checked = this.mts.hitExport.forum;
    document.getElementById(`th-direct`).checked = this.mts.hitExport.thDirect;
    document.getElementById(`mtc-direct`).checked = this.mts.hitExport.mtcDirect;
    
    // TO 1 Settings
    document.getElementById(`to1-use`).checked = this.mts.to.to1.use;
    document.getElementById(`to1-high`).value = this.mts.to.to1.high;
    document.getElementById(`to1-good`).value = this.mts.to.to1.good;
    document.getElementById(`to1-average`).value = this.mts.to.to1.average;
    document.getElementById(`to1-low`).value = this.mts.to.to1.low;
    
    // TO 2 Settings
    document.getElementById(`to2-use`).checked = this.mts.to.to2.use;
    document.getElementById(`to2-high`).value = this.mts.to.to2.high;
    document.getElementById(`to2-good`).value = this.mts.to.to2.good;
    document.getElementById(`to2-average`).value = this.mts.to.to2.average;
    document.getElementById(`to2-low`).value = this.mts.to.to2.low;
  }
};

const reset = {
  settings () {
    console.log(`reset.settings()`);
    
    bootbox.confirm({
      message: `This will reset your settings. Are you sure?`,
      buttons: {
        confirm: {
          className: `btn-sm btn-success`
        },
        cancel: {
          className: `btn-sm btn-danger`
        }
      },
      animate: false,
      callback: function (result) {
        if (result) {
          chrome.runtime.sendMessage({
            type: `resetSettings`,
          });
        }
      }
    });
  },
  
  turkopticon () {
    console.log(`reset.turkopticon()`);
    
    bootbox.confirm({
      message: `This will reset the turkopticon database and reload Mturk Suite. Are you sure? `,
      buttons: {
        confirm: {
          className: `btn-sm btn-success`
        },
        cancel: {
          className: `btn-sm btn-danger`
        }
      },
      animate: false,
      callback: function (result) {
        if (result) {
          chrome.runtime.sendMessage({
            type: `resetTurkopticon`,
          });
        }
      }
    });
  }
};

document.addEventListener(`DOMContentLoaded`, function () {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) {
      settings.load(changes.settings.newValue);
      settings.update();
    }
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    settings.load(result.settings);
    settings.update();
  });
  
  $(document.querySelectorAll(`[data-toggle="tooltip"]`)).tooltip(); 
});

document.addEventListener(`change`, function (event) {
  settings.save();
});

document.addEventListener(`click`, function (event) {
  const element = event.target;
  
  if (element.matches(`#reset-settings`)) {
    reset.settings();
  }
  
  if (element.matches(`#reset-turkopticon`)) {
    reset.turkopticon();
  }
});
