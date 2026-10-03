const fs = require('fs');
let content = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/index.html', 'utf8');

const regex = /\/\* Auto-redirect if session already exists \*\/\s*\n\s*\(async \(\) => \{\s*\n\s*try \{\s*\n\s*const profile = await getCurrentProfile\(\);\s*\n\s*if \(profile\) redirectByRole\(profile.role\);\s*\n\s*\} catch \(_\) \{[^\}]*\}\s*\n\s*\}\)\(\);/g;

const replacement = `/* Auto-redirect if session already exists */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('noredirect') !== '1') {
  (async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile) redirectByRole(profile.role);
    } catch (_) { /* no session - stay */ }
  })();
}`;

content = content.replace(regex, replacement);
fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/index.html', content, 'utf8');
console.log('Fixed index.html auto-redirect');
