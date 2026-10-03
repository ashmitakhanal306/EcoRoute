const fs = require('fs');

// Driver
let dContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', 'utf8');
dContent = dContent.replace(
  '<div class="gps-status-dot" title="GPS Tracking Active"></div>\n      </div>',
  '<div class="gps-status-dot" title="GPS Tracking Active"></div>\n      </a>'
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', dContent, 'utf8');

// Citizen
let cContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/citizen/index.html', 'utf8');
cContent = cContent.replace(
  '<span class="nav-logo">🌿</span> EcoRoute\n    </div>',
  '<span class="nav-logo">🌿</span> EcoRoute\n    </a>'
);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/citizen/index.html', cContent, 'utf8');
console.log('Fixed anchor tags');
