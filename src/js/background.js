// On right click, show the option Copy to PickyJSON
chrome.contextMenus.create({
  title: 'Copy to PickyJSON',
  contexts:['selection'],
  onclick: function(info, sender){

    chrome.storage.local.set({
      'pickyJSONMain': info.selectionText
    }, function() {
      chrome.tabs.create({ url: 'http://pickyjson.com/' });
    });

  }
});

// Recieves a message from main.js, checking if the page contains JSON.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  try {

    chrome.browserAction.setBadgeBackgroundColor({color: '#1FCE6D', tabId: sender.tab.id});
    chrome.browserAction.setBadgeText({text: ' ', tabId: sender.tab.id});

    localStorage.setItem(sender.tab.id, request);
    chrome.storage.local.set(object);

  } catch (err) { /* Don't have to do anything */}

});


// On click of the badge, if there is data, go to the next page
chrome.browserAction.onClicked.addListener((tab) => {

  if ( localStorage[tab.id] ) {

    chrome.storage.local.set({
      'pickyJSONMain': localStorage.getItem(tab.id)
    }, function() {
      localStorage.removeItem( tab.id );
      chrome.tabs.create({ url: 'http://pickyjson.com/' });
    });

  }

});