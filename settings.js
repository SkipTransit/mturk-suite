const settings = {
  obj: {
    goal: 20.00,
    acceptNext: true,
    workspace: true,
    preReloader: true,
    hcBeta: true,
    hitExport: {
      irc: true,
      forum: true,
      thDirect: true,
      mtcDirect: true
    },
    to: {
      to1: {
        use: true,
        high: 4.00,
        good: 3.00,
        average: 2.00,
        low: 0.01
      },
      to2: {
        use: false,
        high: 12.00,
        good: 9.00,
        average: 6.00,
        low: 0.01
      }
    },
    theme: false
  },
  load: function (obj) {
    if (obj) {
      // Today's Projected Earnings Settings
      if (obj.hasOwnProperty(`goal`)) settings.obj.goal = obj.goal;
      
      // General Settings
      if (obj.hasOwnProperty(`acceptNext`)) settings.obj.acceptNext = obj.acceptNext;
      if (obj.hasOwnProperty(`workspace`)) settings.obj.workspace = obj.workspace;
      if (obj.hasOwnProperty(`preReloader`)) settings.obj.preReloader = obj.preReloader;
      if (obj.hasOwnProperty(`hcBeta`)) settings.obj.hcBeta = obj.hcBeta;
      
      // TO Settings
      if (obj.hasOwnProperty(`to`)) {
        
        // TO 1 Settings
        if (obj.to.hasOwnProperty(`to1`)) {
          if (obj.to.to1.hasOwnProperty(`use`)) settings.obj.to.to1.use = obj.to.to1.use;
          if (obj.to.to1.hasOwnProperty(`high`)) settings.obj.to.to1.high = obj.to.to1.high;
          if (obj.to.to1.hasOwnProperty(`good`)) settings.obj.to.to1.good = obj.to.to1.good;
          if (obj.to.to1.hasOwnProperty(`average`)) settings.obj.to.to1.average = obj.to.to1.average;
          if (obj.to.to1.hasOwnProperty(`low`)) settings.obj.to.to1.low = obj.to.to1.low;
        }
        
        // TO 2 Settings
        if (obj.to.hasOwnProperty(`to2`)) {
          if (obj.to.to2.hasOwnProperty(`use`)) settings.obj.to.to2.use = obj.to.to2.use;
          if (obj.to.to2.hasOwnProperty(`high`)) settings.obj.to.to2.high = obj.to.to2.high;
          if (obj.to.to2.hasOwnProperty(`good`)) settings.obj.to.to2.good = obj.to.to2.good;
          if (obj.to.to2.hasOwnProperty(`average`)) settings.obj.to.to2.average = obj.to.to2.average;
          if (obj.to.to2.hasOwnProperty(`low`)) settings.obj.to.to2.low = obj.to.to2.low;
        }
      }
      
      // HIT Export Settings
      if (obj.hasOwnProperty(`hitExport`)) {
        if (obj.hitExport.hasOwnProperty(`irc`)) settings.obj.hitExport.irc = obj.hitExport.irc;
        if (obj.hitExport.hasOwnProperty(`forum`)) settings.obj.hitExport.forum = obj.hitExport.forum;
        if (obj.hitExport.hasOwnProperty(`thDirect`)) settings.obj.hitExport.thDirect = obj.hitExport.thDirect;
        if (obj.hitExport.hasOwnProperty(`mtcDirect`)) settings.obj.hitExport.mtcDirect = obj.hitExport.mtcDirect;
      }
      
      // Theme
      if (settings.hasOwnProperty(`theme`)) settings.obj.theme = settings.theme;
    }
    
    // Today's Projected Earnings Settings
    document.getElementById(`goal`).value = settings.obj.goal;
    
    // General Settings
    document.getElementById(`workspace`).checked = settings.obj.workspace;
    document.getElementById(`pre-reloader`).checked = settings.obj.preReloader;
    document.getElementById(`hc-beta`).checked = settings.obj.hcBeta;
    
    // HIT Export Settings
    document.getElementById(`irc`).checked = settings.obj.hitExport.irc;
    document.getElementById(`forum`).checked = settings.obj.hitExport.forum;
    document.getElementById(`th-direct`).checked = settings.obj.hitExport.thDirect;
    document.getElementById(`mtc-direct`).checked = settings.obj.hitExport.mtcDirect;
    
    // TO 1 Settings
    document.getElementById(`to1-use`).checked = settings.obj.to.to1.use;
    document.getElementById(`to1-high`).value = settings.obj.to.to1.high;
    document.getElementById(`to1-good`).value = settings.obj.to.to1.good;
    document.getElementById(`to1-average`).value = settings.obj.to.to1.average;
    document.getElementById(`to1-low`).value = settings.obj.to.to1.low;
    
    // TO 2 Settings
    document.getElementById(`to2-use`).checked = settings.obj.to.to2.use;
    document.getElementById(`to2-high`).value = settings.obj.to.to2.high;
    document.getElementById(`to2-good`).value = settings.obj.to.to2.good;
    document.getElementById(`to2-average`).value = settings.obj.to.to2.average;
    document.getElementById(`to2-low`).value = settings.obj.to.to2.low;
    
    // Theme
  },
  save: function () {
    // Today's Projected Earnings Settings
    settings.obj.goal = (+document.getElementById(`goal`).value).toFixed(2);
    
    // General Settings
    settings.obj.workspace = document.getElementById(`workspace`).checked;
    settings.obj.preReloader = document.getElementById(`pre-reloader`).checked;
    settings.obj.hcBeta = document.getElementById(`hc-beta`).checked;
    
    // HIT Export Settings
    settings.obj.hitExport.irc = document.getElementById(`irc`).checked;
    settings.obj.hitExport.forum = document.getElementById(`forum`).checked;
    settings.obj.hitExport.thDirect = document.getElementById(`th-direct`).checked;
    settings.obj.hitExport.mtcDirect = document.getElementById(`mtc-direct`).checked;
    
    // TO 1 Settings
    settings.obj.to.to1.use = document.getElementById(`to1-use`).checked;
    settings.obj.to.to1.high = (+document.getElementById(`to1-high`).value).toFixed(2);
    settings.obj.to.to1.good = (+document.getElementById(`to1-good`).value).toFixed(2);
    settings.obj.to.to1.average = (+document.getElementById(`to1-average`).value).toFixed(2);
    settings.obj.to.to1.low = (+document.getElementById(`to1-low`).value).toFixed(2);
    
    // TO 2 Settings
    settings.obj.to.to2.use = document.getElementById(`to2-use`).checked;
    settings.obj.to.to2.high = (+document.getElementById(`to2-high`).value).toFixed(2);
    settings.obj.to.to2.good = (+document.getElementById(`to2-good`).value).toFixed(2);
    settings.obj.to.to2.average = (+document.getElementById(`to2-average`).value).toFixed(2);
    settings.obj.to.to2.low = (+document.getElementById(`to2-low`).value).toFixed(2);
    
    // Theme
    
    chrome.storage.local.set({
      settings: settings.obj
    });
  }
}

document.addEventListener(`DOMContentLoaded`, function () {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) {
      settings.load(changes.settings.newValue);
    }
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    settings.load(result.settings ? result.settings : null);
  });
  
  $(document.querySelectorAll(`[data-toggle="tooltip"]`)).tooltip(); 
});

document.addEventListener(`change`, function (event) {
  settings.save();
});