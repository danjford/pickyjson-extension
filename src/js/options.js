const options = new Ractive({
  el: 'main',
  template: '#options',
  append: true,
  data: { theme: 'hljs', format: true, input: true } //defaults
})

options.on('saveOptions', () => {

  let saveOptions = options.get();

  options.set('saving', true);

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