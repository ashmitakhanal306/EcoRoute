const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replaceAll('@ecoroute.in', '@cleangreen.in');

fs.writeFileSync('index.html', content, 'utf8');
console.log('Reverted emails to cleangreen.in');
