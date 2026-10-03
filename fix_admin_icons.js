const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

// Fix the nav icons individually
content = content.replace(
  /<a href="#" class="nav-item active">\s*<span class="nav-icon">&#128506;&#65039;<\/span>\s*Command Map\s*<\/a>/,
  '<a href="#" class="nav-item active">\n            <span class="nav-icon">&#128506;&#65039;</span>\n            Command Map\n          </a>'
);
content = content.replace(
  /<a href="#" class="nav-item">\s*<span class="nav-icon">&#128506;&#65039;<\/span>\s*Predictions\s*<span class="nav-badge">AI<\/span>\s*<\/a>/,
  '<a href="#" class="nav-item">\n            <span class="nav-icon">&#128200;</span>\n            Predictions\n            <span class="nav-badge">AI</span>\n          </a>'
);
content = content.replace(
  /<a href="#" class="nav-item">\s*<span class="nav-icon">&#128506;&#65039;<\/span>\s*Chronic Zones\s*<span class="nav-badge alert">4<\/span>\s*<\/a>/,
  '<a href="#" class="nav-item">\n            <span class="nav-icon">&#128293;</span>\n            Chronic Zones\n            <span class="nav-badge alert">4</span>\n          </a>'
);
content = content.replace(
  /<a href="#" class="nav-item">\s*<span class="nav-icon">&#128506;&#65039;<\/span>\s*Fleet\s*<\/a>/,
  '<a href="#" class="nav-item">\n            <span class="nav-icon">&#128667;</span>\n            Fleet\n          </a>'
);
content = content.replace(
  /<button class="demo-btn" id="demoModeBtn" type="button">\s*<span class="nav-icon">&#128506;&#65039;<\/span>\s*Demo Controls\s*<span class="nav-badge green" style="font-family:monospace;font-size:0.65rem;">\^ D<\/span>\s*<\/button>/,
  '<button class="demo-btn" id="demoModeBtn" type="button">\n            <span class="nav-icon">&#9889;</span>\n            Demo Controls\n            <span class="nav-badge green" style="font-family:monospace;font-size:0.65rem;">^ D</span>\n          </button>'
);

// Fix the efficiency icons which were also stripped or corrupted:
content = content.replace(
  /<span class="eff-icon"><\/span>\s*<span class="eff-value" id="effTrucks">/,
  '<span class="eff-icon">&#128667;</span>\n                  <span class="eff-value" id="effTrucks">'
);
content = content.replace(
  /<span class="eff-icon"><\/span>\s*<span class="eff-label">FUEL SAVED \(L\/DAY\)<\/span>/,
  '<span class="eff-icon">&#9981;</span>\n                  <span class="eff-label">FUEL SAVED (L/DAY)</span>'
);
content = content.replace(
  /<span class="eff-icon"><\/span>\s*<span class="eff-label">TIME SAVED<\/span>/,
  '<span class="eff-icon">&#8987;</span>\n                  <span class="eff-label">TIME SAVED</span>'
);
content = content.replace(
  /<span class="eff-icon"><\/span>\s*<span class="eff-label">CO&sub2; Avoided \(kg\)<\/span>/,
  '<span class="eff-icon">&#127774;</span>\n                  <span class="eff-label">CO&sub2; Avoided (kg)</span>'
);

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Fixed nav icons');
