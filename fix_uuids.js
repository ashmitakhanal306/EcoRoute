const fs = require('fs');
const file = 'c:/Users/HP/OneDrive/Documents/SIH2/sql/seed.sql';
let content = fs.readFileSync(file, 'utf8');

// Replace invalid hex UUID prefixes
content = content.replace(/'h0000001-/g, "'10000001-");
content = content.replace(/'r0000001-/g, "'20000001-");
content = content.replace(/'t0000001-/g, "'30000001-");
content = content.replace(/'v0000001-/g, "'40000001-");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed invalid UUIDs in seed.sql');
