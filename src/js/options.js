const options = new Ractive({
  el: 'main',
  template: '#options',
  append: true
})

options.on('saveOptions', () => {

  let saveOptions = options.get();

  options.set('saving', true);

  console.log(saveOptions);

  chrome.storage.sync.set(saveOptions, () => {
    setTimeout(() => {
      options.set('saving', false);
    }, 500);
  });

});

chrome.storage.sync.get(function(items) {
  items.saving = false;
  options.set(items);
});