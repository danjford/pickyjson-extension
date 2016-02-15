const bodyContent = () => {

  const body = document.querySelector('body'),
    text = body.textContent || body.innerText;

  // Get the body text and send it to background.js which will check if it is JSON
  chrome.runtime.sendMessage(text);

  return text;

}

// Format the path so that Ractive understands it
const formatSelected = (path) => {
  return path.replace(/[\"]/g, '')
    .replace(/[\[\]]/g, '.')
    .replace(/\.{2}/g, '.')
    .replace(/^\./, '')
    .replace(/\.$/, '')
}

// Format the JSON path so that it is valid for JS
const unformatSelected = (path) => {
  let keypath = ''
  const splitPath = path.split('.')

  for (let i = 0, ii = splitPath.length; i < ii; i++) {
    keypath += (splitPath[i].match(/(\d|\W)/g) ? '["' + splitPath[i] + '"]' : splitPath[i]) + '.'
  }

  return keypath.replace(/\.\[/g, '[')
    .replace(/\]\.\[/g, '][') // replace full stops where two brackets are next to eachother
    .replace(/\.$/, '') // Gets rid of trailing full stop
}

// https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/
const whichAnimation = () => {
  var t,
    el = document.createElement("fakeelement");

  var animations = {
    "animation"      : "animationend",
    "OAnimation"     : "oAnimationEnd",
    "MozAnimation"   : "animationend",
    "WebkitAnimation": "webkitAnimationEnd"
  }

  for (t in animations){
    if (el.style[t] !== undefined){
      return animations[t];
    }
  }

}


// Defaults
let config = {
  theme: 'hljs',
  format: true,
  input: true
}

chrome.storage.sync.get((items) => {
  let counter = 0 ;

  // A low level 'extend' is all we need
  for ( var key in items ) {

    // If config option exists, overrwite it
    if ( config[key] ) {
      config[key] = items[key];
      counter++;
    }

    // Cancel once all config options have been checked
    if ( counter === Object.keys(config).length ) return;
  }

});

function prepareExtension() {

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

    const body = bodyContent();

    try {

      const parsedBody = JSON.parse(body); // Checks if the body is JSON
      const path = chrome.extension.getURL('css'); // Gets the link to the css
      let highlighted = {};
      let input = {};

      // HTML to inject into page
      const inputHTML = `<div class="grab">
          <input id="picked" type="text" class="input" placeholder="Click something or type a selector" value="{{path}}" on-keyup="highlight:{{path}}"/>
          <div class="dropdown">
            <button class="btn-clipboard" data-clipboard-target="#picked">Copy Path</button>
            <button class="btn-clipboard" data-clipboard-text="{{hidden}}" on-click="copyValue:{{path}}">Copy Value</button>
          </div>
        </div>`;
      const mainHTML = `<div id="json"></div>`;

      // Format the JSON body
      if ( config.format ) {

        // Append styles the head
        document.head.innerHTML += `
          <link rel="stylesheet" type="text/css" href="${path}/picky-highlight.css">
          <link rel="stylesheet" type="text/css" href="${path}/style.css">
        `;

        // Decide which HTML to append
        if (config.input) {
          document.body.innerHTML = `${inputHTML}${mainHTML}`;
        } else {
          document.body.innerHTML = `${mainHTML}`;
        }

        // Add the theme name to the body
        document.querySelector('body').className = config.theme;

        // Highlight the JSON
        highlighted = new Highlight({
          el: '#json',
          data: parsedBody,
          debug: false,
          localStorage: false
        });

        // Set the theme in the template
        highlighted.set('theme', config.theme);

        highlighted.set((localStorage.getItem('highlighted') ? JSON.parse(localStorage.getItem('highlighted')) : {}));

        highlighted.observe('* collapsed', (newVal, old) => {

          if ( newVal ) {
            let highlightData = highlighted.get();
            delete highlightData.data;
            localStorage.setItem('highlighted', JSON.stringify(highlightData));
          }

        });

      }

      // Add the input to the body
      if ( config.input && config.format ) {

        // Show the input
        document.querySelector('.grab').className += ' show';

        // Ractive the input
        input = new Ractive({
          el: '.grab',
          template: document.querySelector('.grab').innerHTML,
          data: (localStorage.getItem('input') ? JSON.parse(localStorage.getItem('input')) : {}),
          onrender: () => {
            const clipboard = new Clipboard('.btn-clipboard') // Stop crying Firefox!
            clipboard.on('success', (e) => {
              e.trigger.className += ' active';
            });
          }
        });

        // Observe the input and store in localStorage
        input.observe('*', (newVal, old) => {

          if ( newVal && old !== newVal ) {
            localStorage.setItem('input', JSON.stringify(input.get()));
          }

        });

      }

      // Events for the two Ractive Objects
      if ( config.input && config.format ) {

        // Triggered by a click event, gets us the clicked path name
        highlighted.on('showPath', (oldVal, newVal) => {
          if (newVal) input.set('path', unformatSelected(newVal.replace(/^data./, '')));
        });

        // Keup event from the grab.handlebars input, highlights the typed value
        input.on('highlight', function (el, value) {
          highlighted.set('isSelected', 'data.' + formatSelected(value).replace(/^\./, ''));
        });

        input.on('copyValue', function (el, value) {
          input.set('hidden', JSON.stringify(highlighted.get('data.' + formatSelected(value).replace(/^\./, '') || {})));
        });

        const clipButtons = document.getElementsByClassName('btn-clipboard'),
          animation = whichAnimation();

        // For each button, add the event listener to remove the class
        [].forEach.call(clipButtons, function(node) {
          node.addEventListener(animation, function() {
            setTimeout(() => {
              this.classList.remove('active');
            }, 400);
          });
        });

      }

    } catch (err) { }

  }
}

document.addEventListener('DOMContentLoaded', prepareExtension);

// Receive message from background to see if there is JSON on tab change
chrome.runtime.onMessage.addListener(() => {
  bodyContent();
});