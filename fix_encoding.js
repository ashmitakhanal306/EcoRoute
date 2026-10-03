const fs = require('fs');
const path = require('path');

const files = [
  'citizen/index.html',
  'driver/index.html',
  'admin/index.html'
];

const replacements = [
  { search: /EcoRoute [^\s]* Citizen/g, replace: 'EcoRoute &mdash; Citizen' },
  { search: /EcoRoute [^\s]* Driver/g, replace: 'EcoRoute &mdash; Driver' },
  { search: /EcoRoute [^\s]* Admin/g, replace: 'EcoRoute &mdash; Admin' },
  { search: /Dashboard [^\s]* report/g, replace: 'Dashboard &mdash; report' },
  { search: /Dashboard [^\s]* navigate/g, replace: 'Dashboard &mdash; navigate' },
  { search: /Dashboard [^\s]* manage/g, replace: 'Dashboard &mdash; manage' },
  { search: /AÂ°N/g, replace: '&deg;N' },
  { search: /AÂ°E/g, replace: '&deg;E' },
  { search: /Detecting[^\w\s]*/g, replace: 'Detecting...' },
  { search: /'âœ¨'/g, replace: "'&#10024;'" },
  { search: /'âš¡'/g, replace: "'&#9889;'" },
  { search: />âš¡</g, replace: '>&#9889;<' },
  { search: />âœ¨</g, replace: '>&#10024;<' },
  { search: /ðŸ”´/g, replace: '&#128308;' },
  { search: /ðŸ”µ/g, replace: '&#128309;' },
  { search: /ðŸŸ¢/g, replace: '&#128994;' },
  { search: /âš«ï¸ /g, replace: '&#9899;' },
  { search: /â ³/g, replace: '&#8203;&#9203;' },
  { search: /ðŸ“ˆ/g, replace: '&#128200;' },
  { search: /ðŸ”¨/g, replace: '&#128296;' },
  { search: /ðŸ”‹/g, replace: '&#128267;' },
  { search: /ðŸ  /g, replace: '&#127823;' },
  { search: /ðŸ‘¶/g, replace: '&#128118;' },
  { search: /â€”/g, replace: '&mdash;' },
  // Generic garbled strings from the error log:
  { search: /\?"/g, replace: '&mdash;' },
  { search: /"\?"/g, replace: '' },
  { search: /dY\?\?/g, replace: '&#128994;' },
  { search: /dY"\?/g, replace: '&#128309;' },
  { search: /s,\?/g, replace: '&#128308;' },
  { search: /dYc1/g, replace: '&#9899;' },
  { search: /\?3/g, replace: '&#8203;&#9203;' },
  { search: /o"/g, replace: '&#10024;' },
  { search: /s/g, replace: '&#9889;' },
  { search: /-\?/g, replace: '&#128200;' }
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed encoding issues in: ' + file);
  } else {
    console.log('No garbled text found in: ' + file);
  }
}
