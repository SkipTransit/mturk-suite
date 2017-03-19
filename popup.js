const SETTINGS = {
  // Today's Projected Earnings Settings
  goal: 20.00,
  
  // General Settings
  accept_next: true,
  workspace: true,
  pre_reloader: true,
  
  // HIT Export Settings
  hit_export: { 
    irc: true,
    forum: true,
    forum_th: true,
    forum_mtc: true
  },
  
  // Theme
  theme: false
};

function SAVE_SETTINGS () {
  // Today's Projected Earnings Settings
    
  // General Settings
  SETTINGS.accept_next = document.getElementById(`accept_next`).checked;
    
  // HIT Export Settings
    
  // Theme
  SETTINGS.theme = document.getElementById(`theme`).checked;
  
  chrome.storage.local.set({
    settings: SETTINGS
  });
}

function LOAD_SETTINGS (settings) {    
  if (settings) {
    // Today's Projected Earnings Settings
    if (settings.hasOwnProperty(`goal`)) SETTINGS.goal = settings.goal;
      
    // General Settings
    if (settings.hasOwnProperty(`workspace`)) SETTINGS.workspace = settings.workspace;
    if (settings.hasOwnProperty(`pre_reloader`)) SETTINGS.pre_reloader = settings.pre_reloader;
    if (settings.hasOwnProperty(`accept_next`)) SETTINGS.accept_next = settings.accept_next;
    if (settings.hasOwnProperty(`hc_beta`)) SETTINGS.hc_beta = settings.hc_beta;
      
    // HIT Export Settings
    if (settings.hasOwnProperty(`hit_export`)) {
      if (settings.hit_export.hasOwnProperty(`irc`)) SETTINGS.hit_export.irc = settings.hit_export.irc;
      if (settings.hit_export.hasOwnProperty(`forum`)) SETTINGS.hit_export.forum = settings.hit_export.forum;
      if (settings.hit_export.hasOwnProperty(`forum_th`)) SETTINGS.hit_export.forum_th = settings.hit_export.forum_th;
      if (settings.hit_export.hasOwnProperty(`forum_mtc`)) SETTINGS.hit_export.forum_mtc = settings.hit_export.forum_mtc;
    }  
      
    // Theme
    if (settings.hasOwnProperty(`theme`)) SETTINGS.theme = settings.theme;
  }
  
  // Today's Projected Earnings Settings
    
  // General Settings
  document.getElementById(`accept_next`).checked = SETTINGS.accept_next;
  document.getElementById(`hc`).parentElement.parentElement.style.display = SETTINGS.hc_beta ? `` : `none`;

      
  // HIT Export Settings
      
  // Theme
  document.getElementById(`theme`).checked = SETTINGS.theme;
}

document.addEventListener(`DOMContentLoaded`, function () {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) LOAD_SETTINGS(changes.settings.newValue);
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    LOAD_SETTINGS(result.settings ? result.settings : null);
  });
  
  $(`input`).on(`change`, SAVE_SETTINGS);
  document.getElementById(`version`).textContent = `v${chrome.runtime.getManifest().version}`;
});
