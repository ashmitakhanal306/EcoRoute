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
    } else {
      bytes.push(code & 0xFF);
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

console.log(decodeWin1252('ðŸš›'));
console.log(decodeWin1252('âš¡'));
console.log(decodeWin1252('ðŸ”¥'));
console.log(decodeWin1252('ðŸ“\x8D')); // Note \x8D might be tricky, it's a control char in Windows-1252?
