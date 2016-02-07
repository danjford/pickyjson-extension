var fs = require('fs'),
  json = require('../package.json');


fs.readFile('./src/manifest.json', 'utf-8', (err, data) => {

  if (err) throw err;

  if (data) {

    data = data.replace('${version}', json.version);

    fs.writeFile('./dist/manifest.json', data, (err) => {

      if (err) throw err;

    });

  }

});