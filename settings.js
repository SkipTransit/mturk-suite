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
  SETTINGS.goal = document.getElementById(`goal`).value;
    
  // General Settings
  SETTINGS.workspace = document.getElementById(`workspace`).checked;
  SETTINGS.pre_reloader = document.getElementById(`pre_reloader`).checked;
  SETTINGS.hc_beta = document.getElementById(`hc_beta`).checked;
    
  // HIT Export Settings
  SETTINGS.hit_export.irc = document.getElementById(`irc`).checked;
  SETTINGS.hit_export.forum = document.getElementById(`forum`).checked;
  SETTINGS.hit_export.forum_th = document.getElementById(`forum_th`).checked;
  SETTINGS.hit_export.forum_mtc = document.getElementById(`forum_mtc`).checked;
    
  // Theme
  
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
  document.getElementById(`goal`).value = (+SETTINGS.goal).toFixed(2);
    
  // General Settings
  document.getElementById(`workspace`).checked = SETTINGS.workspace;
  document.getElementById(`pre_reloader`).checked = SETTINGS.pre_reloader;
  document.getElementById(`hc_beta`).checked = SETTINGS.hc_beta;
      
  // HIT Export Settings
  document.getElementById(`irc`).checked = SETTINGS.hit_export.irc;
  document.getElementById(`forum`).checked = SETTINGS.hit_export.forum;
  document.getElementById(`forum_th`).checked = SETTINGS.hit_export.forum_th;
  document.getElementById(`forum_mtc`).checked = SETTINGS.hit_export.forum_mtc;
      
  // Theme
}

document.addEventListener(`DOMContentLoaded`, function () {
  chrome.storage.onChanged.addListener( function (changes) {
    if (changes.settings) LOAD_SETTINGS(changes.settings.newValue);
  });
  
  chrome.storage.local.get(`settings`, function (result) {
    LOAD_SETTINGS(result.settings ? result.settings : null);
  });
  
  $(`input`).on(`change`, SAVE_SETTINGS);
  $(document.querySelectorAll(`[data-toggle="tooltip"]`)).tooltip(); 
});
