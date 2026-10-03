const fs = require('fs');

// Driver
let dContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', 'utf8');
dContent = dContent.replace(
  '<div class="hud-brand">',
  '<a href="../index.html?noredirect=1" class="hud-brand" style="text-decoration:none; display:flex; align-items:center; gap:8px;">'
).replace(
  '<div class="gps-status-dot" title="GPS Tracking Active"></div>\n      </div>',
  '<div class="gps-status-dot" title="GPS Tracking Active"></div>\n      </a>'
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', dContent, 'utf8');

// Admin
let aContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/admin/index.html', 'utf8');
aContent = aContent.replace(
  '<div class="top-brand">',
  '<a href="../index.html?noredirect=1" class="top-brand" style="text-decoration:none;">'
).replace(
  '<span class="brand-badge">Admin</span>\n    </div>',
  '<span class="brand-badge">Admin</span>\n    </a>'
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/admin/index.html', aContent, 'utf8');

// Citizen
let cContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/citizen/index.html', 'utf8');
cContent = cContent.replace(
  '<div class="nav-brand">\n      <span class="nav-logo">🌿</span> EcoRoute\n    </div>',
  '<a href="../index.html?noredirect=1" class="nav-brand" style="text-decoration:none; display:flex; align-items:center; gap:8px;">\n      <span class="nav-logo">🌿</span> EcoRoute\n    </a>'
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/citizen/index.html', cContent, 'utf8');

console.log('Fixed logos');
