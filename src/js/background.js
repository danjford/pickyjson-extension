// On right click, show the option Copy to PickyJSON
chrome.contextMenus.create({
  title: 'Copy to PickyJSON',
  contexts:['selection'],
  onclick: function(info){

    chrome.storage.local.set({
      'pickyJSONMain': info.selectionText
    }, function() {
      chrome.tabs.create({ url: 'http://pickyjson.com/' });
    });

  }
});

// Recieves a message from main.js, checking if the page contains JSON.
let data = '';
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  try {

    data = JSON.parse(request);

    chrome.browserAction.setIcon({
      path: {
        19: '/img/icon.png', // Needs to be switched to a notification image
      },
      tabId: sender.tab.id
    });

  } catch (err) { /* Don't have to do anything */}

});


// On click of the button, if there is data, go to the next page
chrome.browserAction.onClicked.addListener(() => {

  if ( data ) {

    chrome.storage.local.set({
      'pickyJSONMain': data
    }, function() {
      chrome.tabs.create({ url: 'http://pickyjson.com/' });
    });

  }

});