const fs = require('fs');

function decodeMojibake(str) {
  // We need to map the characters back to their original Windows-1252 bytes.
  // Node's 'latin1' encoding maps 0-255 to U+0000-U+00FF.
  // But Windows-1252 has different mappings for 0x80-0x9F.
  // We'll create a mapping from the corrupted characters back to the correct bytes.
  
  // A simpler way: we can just use the windows-1252 decoder if we had iconv-lite.
  // Since we don't, we can manually map the common ones or let's try a regex dictionary replacement.
}

const content = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', 'utf8');
const mojiRegex = /[^\x00-\x7F]+/g;
const matches = content.match(mojiRegex);
if (matches) {
  const unique = [...new Set(matches)];
  console.log(unique);
}
