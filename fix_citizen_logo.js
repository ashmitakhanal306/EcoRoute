const fs = require('fs');
let content = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/citizen/index.html', 'utf8');
content = content.replace(
  '<div class="topbar-logo">',
  '<a href="../index.html?noredirect=1" class="topbar-logo" style="text-decoration:none;">'
).replace(
  '<span class="topbar-name">EcoRoute</span>\n    </div>',
  '<span class="topbar-name">EcoRoute</span>\n    </a>'
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/citizen/index.html', content, 'utf8');
console.log('Fixed citizen logo');
