const fs = require('fs');
let aContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/admin/index.html', 'utf8');
aContent = aContent.replace(
  "window.location.href = '../index.html';",
  "window.location.href = '../index.html?noredirect=1';"
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/admin/index.html', aContent, 'utf8');
console.log('Fixed adminExitBtn');
