const fs = require('fs');

function checkSyntax(file) {
  let content = fs.readFileSync(file, 'utf8');
  const scriptMatch = content.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    let js = scriptMatch[1].replace(/import\s+.*?from\s+['"].*?['"];?/gs, '');
    try {
      new Function(js);
      console.log(`${file}: Syntax OK`);
    } catch(e) {
      console.log(`${file} Syntax Error: ${e.message}`);
    }
  }
}

checkSyntax('admin/index.html');
checkSyntax('driver/index.html');
