const fs = require('fs');
const path = require('path');

const files = [
  'citizen/index.html',
  'driver/index.html',
  'admin/index.html'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Title / Meta
  content = content.replace(/EcoRoute [^ ]+ Citizen/g, 'EcoRoute &mdash; Citizen');
  content = content.replace(/EcoRoute [^ ]+ Driver/g, 'EcoRoute &mdash; Driver');
  content = content.replace(/EcoRoute [^ ]+ Admin/g, 'EcoRoute &mdash; Admin');
  content = content.replace(/Dashboard [^ ]+ report/g, 'Dashboard &mdash; report');
  content = content.replace(/Dashboard [^ ]+ navigate/g, 'Dashboard &mdash; navigate');
  content = content.replace(/Dashboard [^ ]+ manage/g, 'Dashboard &mdash; manage');
  
  // Emojis / Characters
  content = content.replace(/AÂ°N/g, '&deg;N');
  content = content.replace(/AÂ°E/g, '&deg;E');
  content = content.replace(/Detecting[^a-zA-Z0-9']+/g, 'Detecting...');
  
  // Specific garbled strings seen in citizen/index.html logs:
  content = content.replace(/'âœ¨'/g, "'&#10024;'");
  content = content.replace(/'âš¡'/g, "'&#9889;'");
  content = content.replace(/>âœ¨</g, ">&#10024;<");
  content = content.replace(/>âš¡</g, ">&#9889;<");
  content = content.replace(/ðŸ”´/g, "&#128308;");
  content = content.replace(/ðŸ”µ/g, "&#128309;");
  content = content.replace(/ðŸŸ¢/g, "&#128994;");
  content = content.replace(/âš«ï¸ /g, "&#9899;");
  content = content.replace(/â ³/g, "&#8203;&#9203;");
  content = content.replace(/ðŸ“ˆ/g, "&#128200;");
  content = content.replace(/ðŸ”¨/g, "&#128296;");
  content = content.replace(/ðŸ”‹/g, "&#128267;");
  content = content.replace(/ðŸ  /g, "&#127823;");
  content = content.replace(/ðŸ‘¶/g, "&#128118;");
  content = content.replace(/â€”/g, "&mdash;");
  
  // Fallbacks for the extremely garbled characters in the error log:
  content = content.replace(/statusText = '[^a-zA-Z0-9]* Pending';/g, "statusText = '&#8203;&#9203; Pending';");
  content = content.replace(/statusText = '[^a-zA-Z0-9]* Verified';/g, "statusText = '&#10024; Verified';");
  content = content.replace(/showToast\('([^a-zA-Z0-9]*) Demo data/g, "showToast('&#10024; Demo data");
  content = content.replace(/showToast\(\([^a-zA-Z0-9]*) Trust Score/g, "showToast(\&#128200; Trust Score");
  content = content.replace(/showToast\(\([^a-zA-Z0-9]*) Dump cleaned/g, "showToast(\&#10024; Dump cleaned");
  content = content.replace(/showToast\('([^a-zA-Z0-9]*) Switched/g, function(match, p1) {
    if (match.includes("AI")) return "showToast('&#10024; Switched";
    return "showToast('&#9889; Switched";
  });
  content = content.replace(/trustTierIconEl\.textContent = '[^a-zA-Z0-9]*';/g, "trustTierIconEl.textContent = '&#10024;';");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed encoding in: ' + file);
  }
}
