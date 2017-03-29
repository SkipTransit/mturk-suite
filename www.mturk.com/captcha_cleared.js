const captchaCleared = {
  execute () {    
    if (document.URL.match(`captcha=`) && document.URL.match(`userCaptchaResponse=`)) {
      chrome.runtime.sendMessage({ 
        type: `captchaCleared`
      });
    }
  }
};

if (document.getElementsByName(`isAccepted`)[0] && !document.getElementsByName(`userCaptchaResponse`)[0]) {
  captchaCleared.execute();
}
