const fs = require('fs');

const cp1252 = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f
};

function decodeWin1252(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    if (cp1252[char] !== undefined) {
      bytes.push(cp1252[char]);
    } else if (code <= 0xFF) {
      bytes.push(code);
    } else {
      return null; // Contains non-Win1252 char (like an actual emoji or real em-dash)
    }
  }
  
  // Try to decode as UTF-8
  const buf = Buffer.from(bytes);
  const decoded = buf.toString('utf8');
  
  // If it contains the replacement character (U+FFFD), it was not valid UTF-8
  if (decoded.includes('\uFFFD') || decoded === str) {
    return null;
  }
  return decoded;
}

const files = ['citizen/index.html', 'driver/index.html', 'admin/index.html'];

for (const file of files) {
  let content = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/' + file, 'utf8');
  const mojiRegex = /[^\x00-\x7F]+/g;
  const matches = content.match(mojiRegex);
  if (!matches) continue;
  
  const unique = [...new Set(matches)];
  let changed = false;
  
  for (const m of unique) {
    const decoded = decodeWin1252(m);
    if (decoded) {
      console.log(`File: ${file} | Replacing: ${m} -> ${decoded}`);
      // Replace all occurrences
      content = content.split(m).join(decoded);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/' + file, content, 'utf8');
  }
}
console.log("Done");
