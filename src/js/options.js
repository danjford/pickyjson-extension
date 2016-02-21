const custom = {
  key: '#795da3',
  string: '#df5000',
  other: '#800000',
  selected: '#ffff80',
  hover: '#ffffbf',
  background: '#ffffff',
  seperator: '#000000'
};

const options = new Ractive({
  el: 'main',
  template: '#options',
  append: true,
  data: { theme: 'hljs', format: true, input: true, customTheme: false, custom: custom, expanded: false } //defaults
});

const removeClasses = ( className ) => {

  const nodes = document.querySelectorAll(`.${className}`);

  [].forEach.call(nodes, ( node ) => {
    node.classList.remove( className );
  });

};

const addChildren = ( node, className ) => {

  const parent = node.parentElement,
    children = node.parentElement.children;

  [].forEach.call(children, ( node ) => {
    node.classList.add( className );
  });

};

options.observe('theme', ( newVal ) => {

  options.set('customTheme', newVal === 'custom');

});

options.on('select', ( el ) => {

  removeClasses('is-selected');
  addChildren(el.node, 'is-selected');

});

options.on('minimise', () => {

  options.toggle('minimised');

});

options.on('saveOptions', () => {

  let saveOptions = options.get();

  console.log(saveOptions);

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