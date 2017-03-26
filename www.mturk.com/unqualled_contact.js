const unqualledContact = {
  execute: function () {
    console.log(`unqualledContact.execute()`);
    
    for (let element of document.getElementsByClassName(`capsuletarget`)) {
      if (!element.querySelector(`a[href^="/mturk/contact?"]`)) {
        const reqid = element.closest(`table`).querySelector(`a[href*="requesterId="]`).href.match(/requesterId=(\w+)/)[1];
        const reqname = element.closest(`table`).getElementsByClassName(`requesterIdentity`)[0].textContent;
        const title = element.closest(`table`).getElementsByClassName(`capsulelink`)[0].textContent;
    
        element.getElementsByTagName(`table`)[1].getElementsByTagName(`tr`)[0].children[1].insertAdjacentHTML(
          `beforeend`,
          `<a href="contact?&requesterId=${reqid}&requesterName=${reqname.replace(/ /g, `+`)}&subject=Regarding HIT Titled: ${title.trim().replace(/ /g, `+`)}">Contact the Requester of this HIT</a>`
        );
      }
    }
  }
};

if (document.getElementsByClassName(`capsuletarget`)[0]) {
  unqualledContact.execute();
}
