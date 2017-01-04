DARK_THEME();

chrome.storage.onChanged.addListener( function (changes) {
  for (let change in changes) {
    if (change === `user`) {
      DARK_THEME();
    }
  }
});

function CSS_WRITE (data) {
  const css = document.createElement(`style`);
  css.className = `dark`;
  css.innerHTML = data;
  document.documentElement.insertBefore(css, null);
}

function DARK_THEME () {
  chrome.storage.local.get(`user`, function (data) {
    const user = data.user || {dark: true};
  
    if (user.dark) {
      if (document.URL.match(/^https:\/\/www.mturk.com\/mturk\/((?!hit_scraper|finder_).)*$/)) {
        CSS_WRITE(css_all);
      }
      if (document.URL.match(/https:\/\/www.mturk.com\/mturk\/(dashboard|status)/)) {
        CSS_WRITE(css_dash);
      }
      if (document.URL.match(/^https:\/\/www.mturk.com\/mturk\/((?!hit_scraper|dashboard|transferearnings|last_hits_previewed|finder).)*$/)) {
        CSS_WRITE(css_1);
      }
      if (document.URL.match(/https:\/\/www.mturk.com\/mturk\/(transferearnings|requesttransferearnings)/)) {
        CSS_WRITE(css_2);
      }
      if (document.URL.match(/https:\/\/www.mturk.com\/mturk\/(findquals|sortquals|pendingquals|searchbar\?selectedSearchType=quals|sortsearchbar\?searchSpec=QualTypeSearch|requestqualification|takequalificationtest)/)) {
        CSS_WRITE(css_3);
      }
      if (document.URL.match(/https:\/\/www.mturk.com\/mturk\/youraccount/)) {
        CSS_WRITE(css_4);
      }
      if (document.URL.match(/https:\/\/www.mturk.com\/mturk\/contact/)) {
        CSS_WRITE(css_5);
      } 
    }
    else {
      for (let element of document.querySelectorAll(`.dark`)) {
        document.documentElement.removeChild(element);
      }
    }
  });
}

const css_all = `
html > body {
  color            : #FFFFFF;
  background-color : #0b0c0f;    
}

#subtabs_and_searchbar {
  border           : #FFFFFF 1px solid !important;
  background-color : #16181d           !important;
  background-image : none              !important;
}

#hit-wrapper * {
  color : #000000;
}

#hit-wrapper a:link {
  color : blue;
}

#hit-wrapper a:visited {
  color : purple;
}


#whyHITReport,
#reportHITForm {
  color            : #FFFFFF !important;
  background-color : #16181d !important;
}

.ratings {
  color            : #FFFFFF !important;
  background-color : #16181d !important;
  border-style: solid;
  border-width: 1px;
  border-color: #FFFFFF;
}

.footer_separator {
  background-color : #16181d !important;
}

.footer_text {
  color: #FFFFFF !important;
}

.tooltip {
  color            : #336699 !important;
  background-color : #16181d !important;
  border-color     : #FFFFFF !important;
}

select,
option {
  color            : #FFFFFF !important;
  background-color : #16181d !important;
}

.ya_list,
.MsoNormal,
.MsoNormal > * {
  color: #FFFFFF !important;
}

.externalSubmit * {
  color: #000000 !important;
}

:not(.capsule_field_title) > a:link:not(.capsulelink):not(.subnavclass):not(.header_links):not(.nonboldsubnavclass):not(.tablinks) {
  color : #146EB4 !important;
}

:not(.capsule_field_title) > a:visited:not(.capsulelink):not(.subnavclass):not(.header_links):not(.nonboldsubnavclass):not(.tablinks) {
  color : #96177b !important;
}

:not(.capsule_field_title) > a:hover:not(.capsulelink):not(.subnavclass):not(.header_links):not(.nonboldsubnavclass):not(.tablinks) {
  color : #0c446f !important;
}

a.subnavclass, a.nonboldsubnavclass, a.header_links {
  color: #336699 !important;
}

/* Navigation "Your Account" Active */
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/nav_youraccount_active.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 114px !important;
  padding-top  : 32px !important;
  background   : url(${chrome.runtime.getURL(`media/nav_youraccount_active.png`)}) no-repeat !important;
}

/* Navigation "Your Account" Inactive */
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/nav_youraccount_inactive.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 114px !important;
  padding-top  : 32px !important;
  background   : url(${chrome.runtime.getURL(`media/nav_youraccount_inactive.png`)}) no-repeat !important;
}

/* Navigation "HITs" Active */
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/nav_hits_active_teal.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 89px !important;
  padding-top  : 32px !important;
  background   : url(${chrome.runtime.getURL(`media/nav_hits_active.png`)}) no-repeat !important;
}


/* Navigation "HITs" Inactive */
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/nav_hits_inactive.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 89px !important;
  padding-top  : 32px !important;
  background   : url(${chrome.runtime.getURL(`media/nav_hits_inactive.png`)}) no-repeat !important;
}

/* Navigation "Qualifications" Active */
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/nav_quals_active.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 114px !important;
  padding-top  : 32px !important;
  background   : url(${chrome.runtime.getURL(`media/nav_quals_active.png`)}) no-repeat !important;
}

/* Navigation "Qualifications" Inactive */
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/nav_quals_inactive.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 114px !important;
  padding-top  : 32px !important;
  background   : url(${chrome.runtime.getURL(`media/nav_quals_inactive.png`)}) no-repeat !important;
}

img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/logoAI3.gif"] {
  height       : 0;
  width        : 0;
  border       : 0;
  padding-left : 255px !important;
  padding-top  : 41px !important;
  background   : url(${chrome.runtime.getURL(`media/blank.gif`)}) no-repeat !important;
}

[type="image"] {
  border: none !important;
  background-color: transparent !important;
}

img[src="/media/left_dbl_arrow.gif"],
img[src="/media/left_arrow.gif"],
img[src="/media/right_dbl_arrow.gif"],
img[src="/media/right_arrow.gif"],
img[src="/media/more.gif"],
img[src="/media/less.gif"],
img[src="/media/lb_left_corner_blue.gif"],
img[src="/media/lb_right_corner_blue.gif"],
img[src="/media/top_left_corner.gif"],
img[src="/media/bottom_left_corner.gif"],
img[src="/media/top_right_corner.gif"],
img[src="/media/bottom_right_corner.gif"],
img[src="https://images-na.ssl-images-amazon.com/images/G/01/webservices/mechanical-turk/an_amazon_company-medium.gif"] {
  display : none;
}
`;

const css_dash = `
.container-content,
td[bgcolor="#7fb4cf"],
body > table:not([border="0"]) > tbody > tr > td {
  background-color : #0b0c0f !important;
  background-image : none !important;
}

body > table > tbody > tr {
  border-color     : #FFFFFF;
  border-width     : 1px;
  border-style     : solid;   
}

tr.grayHead,
tr.metrics-table-header-row {
  background-color : #16181d;
}

tr.grayHead ~ tr.odd:nth-child(odd),
tr.grayHead ~ tr.even:nth-child(odd),
tr.metrics-table-header-row ~ tr.odd:nth-child(odd),
tr.metrics-table-header-row ~ tr.even:nth-child(odd) {
  background-color: #16181d;
}

tr.grayHead ~ tr.even:nth-child(even),
tr.grayHead ~ tr.odd:nth-child(even),
tr.metrics-table-header-row ~ tr.odd:nth-child(even),
tr.metrics-table-header-row ~ tr.even:nth-child(even) {
  background-color : #21242c;
}

tr.odd > td,
tr.even > td,
div.odd > td,
div.even > td,
table[style="padding-top: 10px"] > tbody > tr td {
  color : #FFFFFF ;   
}

span#lnk_show_earnings_details,
span#lnk_hide_earnings_details {
  color : #9BAED2 !important;
}
`;
  
const css_1 = `
iframe {
  background-color : #BDBDBD !important;
  border-color     : #FFFFFF !important;
  border-radius    : 0px     !important;
  border-style     : solid   !important;
  border-width     : 1px     !important;
}

/* Strip Styling From HIT Capsules */
#subtabs_and_searchbar:first-of-type + table td,  
#sortresults_form:first-of-type + table td,                                                               /* HIT capsules on HIT showing pages */
div[style="width: auto; margin-top: 5px; margin-left: 10px; margin-right: 10px; margin-bottom: 5px;"] td  /* HIT capsules with a HIT displayed */
{
  background-color : transparent ;
  border           : 0           !important;
}

/* Qualified HIT capsules inside borders */
td[style="border-radius:30px 0 0 0;border: 1px solid #336699;border-right: 0;border-bottom: 0;background: #CCDDE9;"], /* Top Left      */
td[style="border: 1px solid #336699;border-right: 0;border-bottom: 0;border-left: 0; background: #CCDDE9;"],          /* Top           */
td[style="border-radius:0 30px 0 0;border: 1px solid #336699;border-left: 0;border-bottom: 0;background: #CCDDE9;"],  /* Top Right     */
td[style="border: 1px solid #336699;border-right: 0;border-bottom: 0;border-top: 0; background: #F0F6F9;"],           /* Left          */
td[style="border: 1px solid #336699;border-left: 0;border-bottom: 0;border-top: 0; background: #F0F6F9;"],            /* Right         */
td[style="border-radius: 0 0 0 30px;border: 1px solid #336699;border-right: 0;border-top: 0;background: #F0F6F9;"],   /* Bottom Left   */
td[align="center"][valign="top"][bgcolor="#F0F6F9"][height="9"][width="100%"],                                        /* Bottom        */
td[style="border: 1px solid #336699;border-right: 0;border-left: 0;border-top: 0; background: #F0F6F9;"],             /* Bottom Bottom */
td[style="border-radius: 0 0 30px 0;border: 1px solid #336699;border-left: 0;border-top: 0;background: #F0F6F9;"]     /* Bottom Right  */
{
  background-color : #16181d !important;
  border           : 0           !important;
}

/* Non-Qualified HIT capsule borders */
td[style="border-radius:30px 0 0 0;border: 1px solid #336699;border-right: 0;border-bottom: 0;background: #CCCCCC;"], /* Top Left      */
td[style="border: 1px solid #336699;border-right: 0;border-bottom: 0;border-left: 0; background: #CCCCCC;"],          /* Top           */
td[style="border-radius:0 30px 0 0;border: 1px solid #336699;border-left: 0;border-bottom: 0;background: #CCCCCC;"],  /* Top Right     */
td[style="border: 1px solid #336699;border-right: 0;border-bottom: 0;border-top: 0; background: #F1F3EB;"],           /* Left          */
td[style="border: 1px solid #336699;border-left: 0;border-bottom: 0;border-top: 0; background: #F1F3EB;"],            /* Right         */
td[style="border-radius: 0 0 0 30px;border: 1px solid #336699;border-right: 0;border-top: 0;background: #F1F3EB;"],   /* Bottom Left   */
td[align="center"][valign="top"][bgcolor="#F1F3EB"][height="9"][width="100%"],                                        /* Bottom        */
td[style="border: 1px solid #336699;border-right: 0;border-left: 0;border-top: 0; background: #F1F3EB;"],             /* Bottom Bottom */
td[style="border-radius: 0 0 30px 0;border: 1px solid #336699;border-left: 0;border-top: 0;background: #F1F3EB;"]     /* Bottom Right  */
{
  background-color : #16181d !important;
  border           : 0       !important;
}

/* Non-Qualified HIT capsule backgrounds */
td[style="border: 1px solid #336699;border-right: 0;border-bottom: 0;border-top: 0; background: #F1F3EB;"],
td[bgcolor="#F1F3EB"],
td[bgcolor="#CCCCCC"] {
  background-color : #16181d !important;
}


/* Add Styling From HIT Capsules */
#sortresults_form:first-of-type + table > tbody > tr > td,                                                           /* HIT capsules on HIT showing pages */
div[style="width: auto; margin-top: 5px; margin-left: 10px; margin-right: 10px; margin-bottom: 5px;"] > div > table  /* HIT capsules with a HIT displayed */
{
  background-color : #16181d !important;
  border-color     : #FFFFFF !important;
  border-radius    : 0px     !important;
  border-style     : solid   !important;
  border-width     : 1px     !important;
}


td.capsule_field_text,
.capsulelink_bold,
a[name="autoAcceptCheckboxWrapper"],
td[align="center"][nowrap]  {
  color : #FFFFFF !important;
}

span[style="font-size: 11px; margin:0 10px; width: 80px; white-space:nowrap;float:left;"], 
span.capsule_black_text, 
span[style="padding: 0 2em"], 
span.capsulelink,
td[style="vertical-align: bottom; text-align: right; padding-left: 10px; padding-right: 25px;"],
div[style="display: table-cell; white-space: normal;"],
td.capsule_field_title:first-of-type + td[width="100%"] {
  color : #FFFFFF !important;
}

a.capsulelink {
  color : #FFFFFF !important;
}
`;

const css_2 = `
table:nth-of-type(3) > tbody > tr > td {
  color            : #FFFFFF !important;
  background-color : #0b0c0f !important;
}

table > tbody > tr[height="25"] td,
table > tbody > tr[height="25px"] td {
  background-color : #16181d !important;
  border-color     : #FFFFFF !important;
  border-radius    : 0px     !important;
  border-style     : solid   !important;
  border-width     : 1px     !important;
}

tr.odd {
  background-color : #16181d !important;
}

tr.even {
  background-color : #21242c !important;
}

tr.odd > td,
tr.even > td {
  color : #FFFFFF !important;   
}

tr.grayHead {
  background-color : #16181d !important;
}

td.greybox {
  background-image : none    !important;  
}

td[width="10"] {
  display : none !important;
}
`;
  
const css_3 = `
/* Table just underneath the navigation table */
#subtabs_and_searchbar:first-of-type + table td,
#subtabs_and_searchbar:first-of-type + div > table td,
#subtabs_and_searchbar:first-of-type + table,
#subtabs_and_searchbar:first-of-type + div,
#expirationMessageWrapper:first-of-type + div > table td {
  color            : #FFFFFF !important;
  background-color : #16181d !important;
}

/* Table just underneath the navigation table */
#subtabs_and_searchbar:first-of-type + table > tbody > tr > td,
#subtabs_and_searchbar:first-of-type + div,
#expirationMessageWrapper:first-of-type + div > table {
  border-color  : #FFFFFF !important;
  border-radius : 0px     !important;
  border-style  : solid   !important;
  border-width  : 1px     !important;
}

/* Information Capsules */
#sortresults_form:first-of-type + table td,
#subtabs_and_searchbar:first-of-type + table + table + table  td {
  background-color : #16181d !important;
}

/* Information Capsules */
#subtabs_and_searchbar:first-of-type + table + table + table > tbody > tr > td > table,
#subtabs_and_searchbar:first-of-type + table + table + table > tbody {
  border-color  : #FFFFFF !important;
  border-radius : 0px     !important;
  border-style  : solid   !important;
  border-width  : 1px     !important;
}

#subtabs_and_searchbar:first-of-type + div > table td#author,
#subtabs_and_searchbar:first-of-type + div > table td#retake_date,
#subtabs_and_searchbar:first-of-type + div > table td#qualification_score,
#expirationMessageWrapper:first-of-type + div > table td#author,
#expirationMessageWrapper:first-of-type + div > table td#retake_date,
#expirationMessageWrapper:first-of-type + div > table td#qualification_score {
  color : #336699 !important;
}
`;

const css_4 = `
#subtabs_and_searchbar:first-of-type + table  > tbody > tr:nth-child(4) {
  background-color: #0b0c0f !important;
}

#subtabs_and_searchbar:first-of-type + table  > tbody tr:nth-child(4) > td {
  border-color  : #FFFFFF !important;
  border-radius : 0px     !important;
  border-style  : solid   !important;
  border-width  : 1px     !important;
}

font.almostblack_text_big_bold {
  color : #FFFFFF;   
}

td.greyBox {
  background-image : none;
}
`;

const css_5 = `
.black_text {
  color : #FFFFFF !important;   
}

#subtabs_and_searchbar:first-of-type + table td {
  color : #FFFFFF !important;
}

.contactusfaq {
  border-color  : #FFFFFF !important;
  border-radius : 0px     !important;
  border-style  : solid   !important;
  border-width  : 1px     !important;
}

.contactusfaq > tbody > tr {
  color            : #FFFFFF !important;
  background-color : #0D0D0D !important;
}

.contactus {
  background-color : #16181d !important;
}

.email {
  background-color : #21242c !important;
  border-color     : #FFFFFF !important;
  border-radius    : 0px     !important;
  border-style     : solid   !important;
  border-width     : 1px     !important;
}

.contactus input[type="submit"][value="Submit"] {
  display: inline-block;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  border-radius: 0.214rem;
  background-color: #DC8C1B;
  background-image: linear-gradient(to bottom, #f7dfa5 0%, #f0c14b 100%);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF7DFA5', endColorstr='#FFF0C14B', GradientType=0);
  border: 1px solid;
  border-color: #a88734 #9c7e31 #846a29;
  margin-right: 3px;
}
`;
