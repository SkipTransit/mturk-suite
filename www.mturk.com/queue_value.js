const queueValue = {
  execute: function () {
    console.log(`queueValue.execute()`);
    
    const total = [...document.getElementsByClassName(`reward`)]
    .map(element => +element.textContent.replace(/[^0-9.]/g, ``))
    .reduce((a, b) => a + b, 0);
    
    document.getElementsByClassName(`title_orange_text_bold`)[0].textContent =
      `Queue Value: $${total.toFixed(2)}`
    ;
  }
};

if (document.querySelector(`a[class="nonboldsubnavclass"][href*="myhits"]`) && document.getElementsByClassName(`title_orange_text_bold`)[0]) {
  queueValue.execute();
}
