document.addEventListener('DOMContentLoaded', () => {
  global();
});

const global = () => {
  chrome.storage.local.get('tpe', (data) => {
    const tpe = data.tpe || 0;

    $('#subtabs_and_searchbar').prepend(
      `<b style="position: absolute; right: 8px; margin-top: -15px; color: #CC6600;">` +
      `Today's Projected Earnings: ` +
      `<span id="tpe" style="color: #008000; cursor: pointer;">$${tpe.toFixed(2)}<span>` +
      `</b>`
    );
  });

  chrome.storage.onChanged.addListener( (changes) => {
    for (let key in changes) {
      if (key === 'tpe') {
        $('#tpe').text(`$${changes[key].newValue.toFixed(2)}`);
      }
    }
  });
};
