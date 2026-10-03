const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

const replacements = [
  { bad: /ðŸŒ¡ï¸ /g, good: '&#127777;&#65039;' }, // Thermometer
  { bad: /ðŸ”®/g, good: '&#128262;' }, // Crystal ball
  { bad: /COMPUTINGâ€¦/g, good: 'COMPUTING...' },
  { bad: /Loadingâ€¦/g, good: 'Loading...' },
  { bad: /Authenticating Command Centerâ€¦/g, good: 'Authenticating Command Center...' },
  { bad: /ðŸ”¥/g, good: '&#128293;' }, // Fire
  { bad: /ðŸš›/g, good: '&#128667;' }, // Truck
  { bad: /ðŸ—ºï¸ /g, good: '&#128506;&#65039;' }, // Map
  { bad: /ðŸ“ˆ/g, good: '&#128200;' }, // Chart increasing
  { bad: /ðŸ›¡ï¸ /g, good: '&#128737;&#65039;' }, // Shield
  { bad: /ðŸš¨/g, good: '&#128680;' }, // Siren
  { bad: /ðŸ“‹/g, good: '&#128203;' }, // Clipboard
  { bad: /ðŸ’¡/g, good: '&#128161;' }, // Lightbulb
  { bad: /â€¢/g, good: '&bull;' }, // Bullet
  { bad: /â€”/g, good: '&mdash;' }, // Em dash
  { bad: /â€¦/g, good: '...' }, // Ellipsis
  { bad: /ðŸ§‘â€ /g, good: '&#129489;&zwj;' }, // Person
  { bad: /ðŸ’»/g, good: '&#128187;' }, // Laptop
  { bad: /ðŸ“Œ/g, good: '&#128204;' }, // Pushpin
  { bad: /ðŸ§ª/g, good: '&#129514;' }, // Test tube
  { bad: /ðŸ”Ž/g, good: '&#128262;' }, // Magnifying glass
  { bad: /âš ï¸ /g, good: '&#9888;&#65039;' }, // Warning
  { bad: /ðŸŒ¿/g, good: '&#127807;' }, // Herb
  { bad: /ðŸ“ /g, good: '&#128205;' }, // Round pushpin
  { bad: /ðŸ—‘ï¸ /g, good: '&#128465;&#65039;' }, // Wastebasket
  { bad: /ðŸšœ/g, good: '&#128668;' }, // Tractor (or similar)
  { bad: /âœ…/g, good: '&#9989;' }, // Check mark
  { bad: /âŒ›/g, good: '&#8987;' }, // Hourglass
  { bad: /ðŸ‘€/g, good: '&#128064;' }, // Eyes
  { bad: /ðŸ§©/g, good: '&#129513;' }, // Puzzle
  { bad: /âœ¨/g, good: '&#10024;' }, // Sparkles
];

let replaced = 0;
for (const r of replacements) {
  const matches = content.match(r.bad);
  if (matches) {
    replaced += matches.length;
    content = content.replace(r.bad, r.good);
  }
}

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log(`Made ${replaced} emoji encoding replacements in admin/index.html`);
