const fs = require('fs');

async function testSyntax() {
  const files = ['admin/index.html', 'driver/index.html'];
  for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const scriptMatch = content.match(/<script type="module">([\s\S]*?)<\/script>/);
    if (scriptMatch) {
        let js = scriptMatch[1].replace(/import\s+.*?from\s+['"].*?['"];?/gs, '');
        
        // Temporarily wrap in async IIFE to support top level await in Function
        js = `(async () => {\n${js}\n})()`;

        try {
          new Function(js);
          console.log(file + ': Syntax OK');
        } catch(e) {
          console.log(file + ' Syntax Error: ' + e.message);
        }
    }
  }
}
testSyntax();
