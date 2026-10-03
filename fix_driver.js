const fs = require('fs');
let dContent = fs.readFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', 'utf8');
const oldText = '        <div class="gps-status-dot" title="GPS Tracking Active"></div>\r\n      </div>\r\n    </div>';
const newText = '        <div class="gps-status-dot" title="GPS Tracking Active"></div>\r\n      </a>\r\n    </div>';
if (dContent.includes(oldText)) {
  dContent = dContent.replace(oldText, newText);
  fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', dContent, 'utf8');
  console.log('Fixed driver anchor (CRLF)');
} else {
  const oldTextLF = '        <div class="gps-status-dot" title="GPS Tracking Active"></div>\n      </div>\n    </div>';
  const newTextLF = '        <div class="gps-status-dot" title="GPS Tracking Active"></div>\n      </a>\n    </div>';
  if (dContent.includes(oldTextLF)) {
    dContent = dContent.replace(oldTextLF, newTextLF);
    fs.writeFileSync('c:/Users/HP/OneDrive/Documents/SIH2/driver/index.html', dContent, 'utf8');
    console.log('Fixed driver anchor (LF)');
  } else {
    console.log('Not found');
  }
}
