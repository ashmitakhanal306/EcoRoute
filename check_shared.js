const fs = require('fs');

async function testSyntax() {
  const files = ['shared/auth.js', 'shared/supabaseClient.js', 'driver/route.js'];
  for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let js = content.replace(/import\s+.*?from\s+['"].*?['"];?/gs, '').replace(/export\s+/g, '');
    try {
      new Function(js);
      console.log(file + ': Syntax OK');
    } catch(e) {
      console.log(file + ' Syntax Error: ' + e.message);
    }
  }
}
testSyntax();
