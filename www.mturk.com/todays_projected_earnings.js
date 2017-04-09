const todaysProjectedEarnings = {
  mts: {},
  
  init () {    
    document.getElementById(`subtabs_and_searchbar`).insertAdjacentHTML(
      `afterbegin`,
      `<mts-tpe>
        <mts-tpe-bar>
          <mts-tpe-progress style="width: ${+this.mts.tpe / +this.mts.goal * 100}%;" />
        </mts-tpe-bar>
        <mts-tpe-projected>
          <mts-tpe-earnings>$${(+this.mts.tpe).toFixed(2)}</mts-tpe-earnings>
          /
          <mts-tpe-goal>${(+this.mts.goal).toFixed(2)}</mts-tpe-goal>
        </mts-tpe-projected>
      </mts-tpe>`
    );
  },
  
  update () {    
    const progress = document.querySelector(`mts-tpe-progress`);
    const earnings = document.querySelector(`mts-tpe-earnings`);
    const goal = document.querySelector(`mts-tpe-goal`);

    if (progress) progress.style.width = `${+this.mts.tpe / +this.mts.goal * 100}%`;
    if (earnings) earnings.textContent = `$${(+this.mts.tpe).toFixed(2)}`;
    if (goal) goal.textContent = (+this.mts.goal).toFixed(2);
  },
  
  storageLocalGet (result) {
    todaysProjectedEarnings.mts = result.tpe;
    todaysProjectedEarnings.init();
  },
  
  storageOnChanged (changes) {
    if (changes.tpe) {
      const newVal = changes.tpe.newValue;
      const oldVal = changes.tpe.oldValue;
      
      todaysProjectedEarnings.mts = {
        tpe: newVal.tpe ? newVal.tpe : oldVal.tpe,
        goal: newVal.goal ? newVal.goal : oldVal.goal
      };
      
      todaysProjectedEarnings.update();
    }
  }
};

if (document.querySelector(`a[href="/mturk/beginsignout"]`)) {
  chrome.storage.local.get(`tpe`, todaysProjectedEarnings.storageLocalGet);
  chrome.storage.onChanged.addListener(todaysProjectedEarnings.storageOnChanged);
  
  document.addEventListener(`click`, function (event) {
    const element = event.target;
     
    if (element.closest(`mts-tpe`)) {
      window.open(chrome.runtime.getURL(`/todays_hits_menu.html`));
     }
  });
}
