const bad = 'ðŸš›';
const buf = Buffer.from(bad, 'utf8'); // Wait, the bad string is UTF-8.
console.log(buf);
