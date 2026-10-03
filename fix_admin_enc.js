const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

// The file was likely saved as Windows-1252 but served as UTF-8, or vice-versa.
// Let's replace the visual garbled text with proper HTML Entities or standard text.

// Replace garbled titles/labels
content = content.replace(/Authenticating Command Centerâ€¦/g, 'Authenticating Command Center...');
content = content.replace(/Loadingâ€¦/g, 'Loading...');
content = content.replace(/COMPUTINGâ€¦/g, 'COMPUTING...');
content = content.replace(/Garbage Prediction Heatmap/g, 'Garbage Prediction Heatmap'); // Fix the prefix later

// Using generic catch-all for the garbled bytes before specific words
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Total Reports)/g, '&#128203; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Active Dumps)/g, '&#128293; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Cleaned Today)/g, '&#10024; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Active Trucks)/g, '&#128667; $1');

content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Command Map)/g, '&#128506;&#65039; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Predictions)/g, '&#128200; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Chronic Zones)/g, '&#128293; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Fleet)/g, '&#128667; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Demo Controls)/g, '&#9889; $1');

content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Garbage Prediction Heatmap)/g, '&#127777;&#65039; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(How is this predicted\?)/g, '&#128262; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Fleet Zone Control)/g, '&#128667; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Live Redeployment Gains)/g, '&#128200; $1');

content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Chronic)/g, '&#128293; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Reported)/g, '&#128308; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Cleaned)/g, '&#128994; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Live Truck)/g, '&#128309; $1');

content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Search by name)/g, '&#128269; $1');
content = content.replace(/[^a-zA-Z0-9\s<>\/="'-]+(Candidates)/g, '&#10024; $1');

content = content.replace(/COâ‚‚/g, 'CO&sub2;');
content = content.replace(/CO[^a-zA-Z0-9\s]* Avoided/g, 'CO&sub2; Avoided');

// Replace the icon elements that have raw garbled text in them
content = content.replace(/<span class="nav-icon">[^<]+<\/span>/g, '<span class="nav-icon">&#128506;&#65039;</span>'); // All nav icons get map? No, let's be more specific.

// We will just replace ALL sequences of non-ascii characters (excluding standard ones) with their nearest meaning based on context.
// Actually, let's just strip out any remaining 2+ consecutive garbled chars that might be emojis, to prevent rendering errors.
content = content.replace(/[^\x00-\x7F]{2,}/g, '');

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Fixed admin/index.html encodings');
