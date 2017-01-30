function DASHBOARD () {  
  const hit_status = document.getElementById(`user_activities.date_column_header.tooltip`).parentElement.nextElementSibling.children;
  const hit_totals = document.getElementById(`hit_totals.desc_dolumn_header.tooltop.1`).parentElement.parentElement.children;
  
  const dash = {
    id: document.getElementsByClassName(`orange_text_right`)[0].textContent.split(`ID: `)[1],
    date: hit_status[0].children[0].href.split(`encodedDate=`)[1],

    earn_hits: +(document.getElementById(`approved_hits_earnings_amount`).textContent.replace(/[^0-9.]/g, ``)),
    earn_bonus: +(document.getElementById(`bonus_earnings_amount`).textContent.replace(/[^0-9.]/g, ``)),
    earn_total: +(document.getElementById(`total_earnings_amount`).textContent.replace(/[^0-9.]/g, ``)),
    earn_trans: +(document.getElementById(`transfer_earnings`).textContent.replace(/[^0-9.]/g, ``)),
    
    today_sub: +(hit_status[1].textContent),
    today_app: +(hit_status[2].textContent),
    today_rej: +(hit_status[3].textContent),
    today_pen: +(hit_status[4].textContent),

    total_sub: +(hit_totals[1].children[1].textContent),
    total_app: +(hit_totals[2].children[1].textContent),
    total_rej: +(hit_totals[3].children[1].textContent),
    total_pen: +(hit_totals[4].children[1].textContent),
  };
    
  chrome.storage.local.get(`dashboard`, function (data) {
    const loaded_dash = data.dashboard || {id: null, date: null, earn_hits: 0, earn_bonus: 0, earn_total: 0, earn_trans: 0, total_sub: 0, total_app: 0, total_rej: 0, total_pen: 0, today_sub: 0, today_app: 0, today_rej: 0, today_pen: 0};  
   
    if (dash.date !== loaded_dash.date) {
      loaded_dash.today_sub = 0;
      loaded_dash.today_app = 0;
      loaded_dash.today_rej = 0;
      loaded_dash.today_pen = 0;
    }
    
    if (dash.earn_hits !== loaded_dash.earn_hits) {
      document.getElementById(`approved_hits_earnings_amount`).previousElementSibling.insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">+$${(dash.earn_hits - loaded_dash.earn_hits).toFixed(2)}</span>`
      );
    }

    if (dash.earn_bonus !== loaded_dash.earn_bonus) {
      document.getElementById(`bonus_earnings_amount`).previousElementSibling.insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">+$${(dash.earn_bonus - loaded_dash.earn_bonus).toFixed(2)}</span>`
      );
    }

    if (dash.earn_total !== loaded_dash.earn_total) {
      document.getElementById(`total_earnings_amount`).previousElementSibling.insertAdjacentHTML(`beforeend`,
        `<span style="float:right;">+$${(dash.earn_total- loaded_dash.earn_total).toFixed(2)}</span>`
      );
    }

    if (dash.earn_trans < loaded_dash.earn_trans) {
      document.getElementById(`transfer_earnings`).previousElementSibling.insertAdjacentHTML(`beforeend`,
        `<span style="float:right;">-$${(loaded_dash.earn_trans - dash.earn_trans).toFixed(2)}</span>`
      );
    }

    if (dash.earn_trans > loaded_dash.earn_trans) {
      document.getElementById(`transfer_earnings`).previousElementSibling.insertAdjacentHTML(`beforeend`,
        `<span style="float:right;">+$${(dash.earn_trans - loaded_dash.earn_trans).toFixed(2)}</span>`
      );
    }
    
    if (dash.today_sub !== loaded_dash.today_sub) {
      hit_status[1].insertAdjacentHTML(`beforeend`,
        `<span style="float: left;">+${(dash.today_sub - loaded_dash.today_sub)}</span>`
      );
    }

    if (dash.today_app !== loaded_dash.today_app) {
      hit_status[2].insertAdjacentHTML(`beforeend`,
        `<span style="float: left;">+${(dash.today_app - loaded_dash.today_app)}</span>`
      );
    }

    if (dash.today_rej !== loaded_dash.today_rej) {
      hit_status[3].insertAdjacentHTML(`beforeend`,
        `<span style="float: left;">+${(dash.today_rej - loaded_dash.today_rej)}</span>`
      );
    }

    if (dash.today_pen < loaded_dash.today_pen) {
      hit_status[4].insertAdjacentHTML(`beforeend`,
        `<span style="float: left;">-${(loaded_dash.today_pen - dash.today_pen)}</span>`
      );
    }

    if (dash.today_pen > loaded_dash.today_pen) {
      hit_status[4].insertAdjacentHTML(`beforeend`,
        `<span style="float: left;">+${(dash.today_pen - loaded_dash.today_pen)}</span>`
      );
    }

    if (dash.total_sub !== loaded_dash.total_sub) {
      hit_totals[1].children[0].insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">+${(dash.total_sub - loaded_dash.total_sub)}</span>`
      );
    }

    if (dash.total_app !== loaded_dash.total_app) {
      hit_totals[2].children[0].insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">+${(dash.total_app - loaded_dash.total_app)}</span>`
      );
    }

    if (dash.total_rej !== loaded_dash.total_rej) {
      hit_totals[3].children[0].insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">+${(dash.total_rej - loaded_dash.total_rej)}</span>`
      );
    }

    if (dash.total_pen < loaded_dash.total_pen) {
      hit_totals[4].children[0].insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">-${(loaded_dash.total_pen - dash.total_pen)}</span>`
      );
    }

    if (dash.total_pen > loaded_dash.total_pen) {
      hit_totals[4].children[0].insertAdjacentHTML(`beforeend`,
        `<span style="float: right;">+${(dash.total_pen - loaded_dash.total_pen)}</span>`
      );
    }
      
    chrome.runtime.sendMessage({msg: `dashboard`, data: dash});
  });
  
  hit_totals[4].children[0].insertAdjacentHTML(`beforeend`,
    `<span style="color: orange;" title=""> (${Math.floor((dash.total_rej - 0.01 * dash.total_sub) / -0.99)} ≥ 99%)</span>` + 
    `<span style="color: red;"> (${Math.floor((dash.total_rej - 0.05 * dash.total_sub) / -0.95)} ≥ 95%)</span>`
  );
    
  hit_totals[4].children[2].innerHTML =
    `<div style="color: green;">${((dash.total_sub - dash.total_rej) / dash.total_sub * 100).toFixed(4)}%</div>` +
    `<div style="color: red;">${(dash.total_app / (dash.total_app + dash.total_rej + dash.total_pen) * 100).toFixed(4)}%</div>`
  ;

  hit_totals[2].children[2].textContent =
    `${(dash.total_app / (dash.total_app + dash.total_rej) * 100).toFixed(4)}%`
  ;
    
  hit_totals[3].children[2].textContent =
    `${(dash.total_rej / (dash.total_app + dash.total_rej) * 100).toFixed(4)}%`
  ;
  
  if (document.getElementById(`table_yearly_earnings`)) {
    const yearly_earnings = [...document.getElementById(`table_yearly_earnings`).getElementsByClassName(`reward`)].map(element => +element.textContent.replace(/[^0-9.]/g, ``)).reduce((a, b) => a + b, 0);
    document.getElementById(`table_yearly_earnings`).getElementsByClassName(`metrics-table-header-row`)[0].insertAdjacentHTML(`afterend`, 
      `<tr class="odd">` +
        `<td class="metrics-table-first-value">${+(document.getElementById(`table_yearly_earnings`).getElementsByClassName(`metrics-table-first-value`)[0].textContent) + 1}</td>` +
        `<td><span class="reward">$${((dash.earn_total - yearly_earnings)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></td>` +
      `</tr>`                                                                                                                      
    );
  }
}

if (document.getElementById(`total_earnings_amount`)) {
  DASHBOARD();
}
