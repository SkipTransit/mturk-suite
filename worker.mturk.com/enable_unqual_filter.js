const enableUnqualFilter = {
  execute: function () {
    const filter = document.getElementById(`filters[qualified]`);
    filter.disabled = false;
    filter.nextSibling.classList.remove(`text-muted`);
    filter.nextSibling.nextSibling.nextSibling.remove();
    filter.parentElement.parentElement.classList.remove(`disabled`);
  }
};

if (document.getElementById(`filters[qualified]`)) {
  enableUnqualFilter.execute();
}
