const settings = {
  mts: {},
  load: function (obj) {
    settings.mts = obj;
  },
  save: function () {
    // Today's Projected Earnings Settings
    settings.mts.goal = (+document.getElementById(`goal`).value).toFixed(2);
    
    // General Settings
    settings.mts.workspace = document.getElementById(`workspace`).checked;
    settings.mts.preReloader = document.getElementById(`pre-reloader`).checked;
    settings.mts.hcBeta = document.getElementById(`hc-beta`).checked;
    
    // HIT Export Settings
    settings.mts.hitExport.irc = document.getElementById(`irc`).checked;
    settings.mts.hitExport.forum = document.getElementById(`forum`).checked;
    settings.mts.hitExport.thDirect = document.getElementById(`th-direct`).checked;
    settings.mts.hitExport.mtcDirect = document.getElementById(`mtc-direct`).checked;
    
    // TO 1 Settings
    settings.mts.to.to1.use = document.getElementById(`to1-use`).checked;
    settings.mts.to.to1.high = (+document.getElementById(`to1-high`).value).toFixed(2);
    settings.mts.to.to1.good = (+document.getElementById(`to1-good`).value).toFixed(2);
    settings.mts.to.to1.average = (+document.getElementById(`to1-average`).value).toFixed(2);
    settings.mts.to.to1.low = (+document.getElementById(`to1-low`).value).toFixed(2);
    
    // TO 2 Settings
    settings.mts.to.to2.use = document.getElementById(`to2-use`).checked;
    settings.mts.to.to2.high = (+document.getElementById(`to2-high`).value).toFixed(2);
    settings.mts.to.to2.good = (+document.getElementById(`to2-good`).value).toFixed(2);
    settings.mts.to.to2.average = (+document.getElementById(`to2-average`).value).toFixed(2);
    settings.mts.to.to2.low = (+document.getElementById(`to2-low`).value).toFixed(2);
    
    // Theme
    
    chrome.storage.local.set({
      settings: settings.mts
    });
  },
  update: function () {
    // Today's Projected Earnings Settings
    document.getElementById(`goal`).value = settings.mts.goal;
    
    // General Settings
    document.getElementById(`workspace`).checked = settings.mts.workspace;
    document.getElementById(`pre-reloader`).checked = settings.mts.preReloader;
    document.getElementById(`hc-beta`).checked = settings.mts.hcBeta;
    
    // HIT Export Settings
    document.getElementById(`irc`).checked = settings.mts.hitExport.irc;
    document.getElementById(`forum`).checked = settings.mts.hitExport.forum;
    document.getElementById(`th-direct`).checked = settings.mts.hitExport.thDirect;
    document.getElementById(`mtc-direct`).checked = settings.mts.hitExport.mtcDirect;
    
    // TO 1 Settings
    document.getElementById(`to1-use`).checked = settings.mts.to.to1.use;
    document.getElementById(`to1-high`).value = settings.mts.to.to1.high;
    document.getElementById(`to1-good`).value = settings.mts.to.to1.good;
    document.getElementById(`to1-average`).value = settings.mts.to.to1.average;
    document.getElementById(`to1-low`).value = settings.mts.to.to1.low;
    
    // TO 2 Settings
    document.getElementById(`to2-use`).checked = settings.mts.to.to2.use;
    document.getElementById(`to2-high`).value = settings.mts.to.to2.high;
    document.getElementById(`to2-good`).value = settings.mts.to.to2.good;
    document.getElementById(`to2-average`).value = settings.mts.to.to2.average;
    document.getElementById(`to2-low`).value = settings.mts.to.to2.low;
    
    // Theme
  }
}

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