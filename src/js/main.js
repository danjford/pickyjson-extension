const bodyContent = () => {

  const body = document.querySelector('body'),
    text = body.textContent || body.innerText;

  // Get the body text and send it to background.js which will check if it is JSON
  chrome.runtime.sendMessage(text);

  return text;

}

// If we're on pickyJSON.com get from storage and put into the page.
if ( window.location.href.indexOf('http://pickyjson.com/') > -1 ) {

    chrome.storage.local.get('pickyJSONMain', function(result) {

      if ( result && result.pickyJSONMain ) {

        const textarea = document.querySelector('textarea');
        const evt = document.createEvent('HTMLEvents');

        // Set the textarea to the data from the store
        textarea.value = JSON.stringify( JSON.parse(result.pickyJSONMain), null, '\t');

        // Fire the change event in the textarea for pickyjson.com to trigger formatting
        evt.initEvent('change', true, true);
        textarea.dispatchEvent(evt);

        // Remove the data from chrome.storage as it's no longer necessary
        chrome.storage.local.remove('pickyJSONMain');

      }
    });

} else {

  bodyContent();

}

// Receive message from background to see if there is JSON on tab change
chrome.runtime.onMessage.addListener(() => {
  bodyContent();
});