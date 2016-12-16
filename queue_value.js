document.addEventListener('DOMContentLoaded', () => {
  if ($('a[href*="myhits"][class="nonboldsubnavclass"]').length) {
    QUEUE_VALUE();
  }
});

const QUEUE_VALUE = () => {
  let total = 0;
  for (let element of $('.reward')) {
    total += Number($(element).text().replace(/[^0-9.]/g, ''));
  }
  $('.title_orange_text_bold').text(`Queue Value: $${total.toFixed(2)}`);
};
