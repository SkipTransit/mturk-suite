const start_time = performance.now();


for (let element of document.querySelectorAll(`a[href^="/mturk/preview?groupId="]`)) {
  element.insertAdjacentHTML(`beforebegin`,
    `<a href="${element.href.replace(`preview?`, `previewandaccept?`)}" target="_blank" style="padding-right: 10px;">Accept</a>`
  );
}

const end_time = performance.now();
console.log(`accept_links.js took ${(end_time - start_time)} milliseconds to complete.`);
