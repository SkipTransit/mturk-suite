document.addEventListener('DOMContentLoaded', () => {
  dashboard();
});

const dashboard = () => {
  const dash = {
    id : $('.orange_text_right:contains(Your Worker ID: )').text().split('ID: ')[1],
    date : $('a:contains(Today)').length ? $('a:contains(Today)').prop('href').split('encodedDate=')[1] : null,

    earn_hits  : Number($('#approved_hits_earnings_amount').text().replace(/[^0-9.]/g, '')) || 0,
    earn_bonus : Number($('#bonus_earnings_amount').text().replace(/[^0-9.]/g, '')) || 0,
    earn_total : Number($('#total_earnings_amount').text().replace(/[^0-9.]/g, '')) || 0,
    earn_trans : Number($('#transfer_earnings').text().replace(/[^0-9.]/g, '')) || 0,

    total_sub : Number($('.metrics-table-first-value:contains(HITs Submitted)').next().text()) || 0,
    total_app : Number($('.metrics-table-first-value:contains(... Approved)').next().text()) || 0,
    total_rej : Number($('.metrics-table-first-value:contains(... Rejected)').next().text()) || 0,
    total_pen : Number($('.metrics-table-first-value:contains(... Pending)').next().text()) || 0,

    today_sub : Number($('a:contains(Today)').parent().next().text()) || 0,
    today_app : Number($('a:contains(Today)').parent().next().next().text()) || 0,
    today_rej : Number($('a:contains(Today)').parent().next().next().next().text()) || 0,
    today_pen : Number($('a:contains(Today)').parent().next().next().next().next().text()) || 0
  };
  
  chrome.storage.local.get('dashboard', (data) => {
    const loaded_dash = data.dashboard || {id: null, date: null, earn_hits: 0, earn_bonus: 0, earn_total: 0, earn_trans: 0, total_sub: 0, total_app: 0, total_rej: 0, total_pen: 0, today_sub: 0, today_app: 0, today_rej: 0, today_pen: 0};  
   
    $('.metrics-table-first-value:contains(... Pending)').append(
      `<span style="color: orange;" title=""> (${((dash.total_rej - 0.01 * dash.total_sub) / -0.99 | 0)} ≥ 99%)</span>` + 
      `<span style="color: red;"> (${((dash.total_rej - 0.05 * dash.total_sub) / -0.95 | 0)} ≥ 95%)</span>`
    ).next().next().html(
      `<div style="color: green;">${((dash.total_sub - dash.total_rej) / dash.total_sub * 100).toFixed(4)}%</div>` +
      `<div style="color: red;">${(dash.total_app / (dash.total_app + dash.total_rej + dash.total_pen) * 100).toFixed(4)}%</div>`
    );

    $('.metrics-table-first-value:contains(... Approved)').next().next().text(
      (dash.total_app / (dash.total_app + dash.total_rej) * 100).toFixed(4) + '%'
    );
    
    $('.metrics-table-first-value:contains(... Rejected)').next().next().text(
      (dash.total_rej / (dash.total_app + dash.total_rej) * 100).toFixed(4) + '%'
    );

    if (dash.earn_hits !== loaded_dash.earn_hits) {
      $('#approved_hits_earnings_amount').prev().append(
        `<span style="float: right;">+$${(dash.earn_hits - loaded_dash.earn_hits).toFixed(2)}</span>`
      );
    }

    if (dash.earn_bonus !== loaded_dash.earn_bonus) {
      $('#bonus_earnings_amount').prev().append(
        `<span style="float: right;">+$${(dash.earn_bonus - loaded_dash.earn_bonus).toFixed(2)}</span>`
      );
    }

    if (dash.earn_total !== loaded_dash.earn_total) {
      $('#total_earnings_amount').prev().append(
        `<span style="float:right;">+$${(dash.earn_total- loaded_dash.earn_total).toFixed(2)}</span>`
      );
    }

    if (dash.earn_trans < loaded_dash.earn_trans) {
      $('#transfer_earnings').prev().append(
        `<span style="float:right;">-$${(loaded_dash.earn_trans - dash.earn_trans).toFixed(2)}</span>`
      );
    }

    if (dash.earn_trans > loaded_dash.earn_trans) {
      $("#transfer_earnings").prev().append(
        `<span style="float:right;">+$${(dash.earn_trans - loaded_dash.earn_trans).toFixed(2)}</span>`
      );
    }

    if (dash.total_sub !== loaded_dash.total_sub) {
      $('.metrics-table-first-value:contains(HITs Submitted)').append(
        `<span style="float: right;">+${(dash.total_sub - loaded_dash.total_sub)}</span>`
      );
    }

    if (dash.total_app !== loaded_dash.total_app) {
      $('.metrics-table-first-value:contains(... Approved)').append(
        `<span style="float: right;">+${(dash.total_app - loaded_dash.total_app)}</span>`
      );
    }

    if (dash.total_rej !== loaded_dash.total_rej) {
      $('.metrics-table-first-value:contains(... Rejected)').append(
        `<span style="float: right;">+${(dash.total_rej - loaded_dash.total_rej)}</span>`
      );
    }

    if (dash.total_pen < loaded_dash.total_pen) {
      $('.metrics-table-first-value:contains(... Pending)').append(
        `<span style="float: right;">-${(loaded_dash.total_pen - dash.total_pen)}</span>`
      );
    }

    if (dash.total_pen > loaded_dash.total_pen) {
      $('.metrics-table-first-value:contains(... Pending)').append(
        `<span style="float: right;">+${(dash.total_pen - loaded_dash.total_pen)}</span>`
      );
    }

    if (dash.today_sub !== loaded_dash.today_sub) {
      $('a:contains(Today)').parent().next().append(
        `<span style="float: left;">+${(dash.today_sub - loaded_dash.today_sub)}</span>`
      );
    }

    if (dash.today_app !== loaded_dash.today_app) {
      $('a:contains(Today)').parent().next().next().append(
        `<span style="float: left;">+${(dash.today_app - loaded_dash.today_app)}</span>`
      );
    }

    if (dash.today_rej !== loaded_dash.today_rej) {
      $('a:contains(Today)').parent().next().next().next().append(
        `<span style="float: left;">+${(dash.today_rej - loaded_dash.today_rej)}</span>`
      );
    }

    if (dash.today_pen < loaded_dash.today_pen) {
      $('a:contains(Today)').parent().next().next().next().next().append(
        `<span style="float: left;">-${(loaded_dash.today_pen - dash.today_pen)}</span>`
      );
    }

    if (dash.today_pen > loaded_dash.today_pen) {
      $('a:contains(Today)').parent().next().next().next().next().append(
        `<span style="float: left;">+${(dash.today_pen - loaded_dash.today_pen)}</span>`
      );
    }
  
    chrome.runtime.sendMessage({msg: 'dashboard', data: dash});
  });
};
