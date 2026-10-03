const fs = require('fs');
const path = require('path');

const files = [
  'citizen/index.html',
  'driver/index.html',
  'admin/index.html'
];

const cssToAdd = `
    .topbar-back-btn { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; color: #64748b; margin-right: 2px; margin-left: -4px; border-radius: 6px; transition: background .15s, color .15s; }
    .topbar-back-btn:hover { background: #f1f5f9; color: #0f172a; }
    .topbar-back-btn svg { width: 20px; height: 20px; }
`;

const htmlToReplace = `<div class="topbar-logo">
      <button id="headerBackBtn" class="topbar-back-btn" title="Exit to Main Page" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="topbar-logo-icon">`;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // 1. Add CSS just before </style>
  if (!content.includes('.topbar-back-btn')) {
    content = content.replace('</style>', cssToAdd + '  </style>');
  }
  
  // 2. Add HTML Button
  if (!content.includes('headerBackBtn')) {
    content = content.replace(
      '<div class="topbar-logo">\n      <div class="topbar-logo-icon">',
      htmlToReplace
    );
    // some files might have \r\n
    content = content.replace(
      '<div class="topbar-logo">\r\n      <div class="topbar-logo-icon">',
      htmlToReplace
    );
  }
  
  // 3. Add JS listener
  if (!content.includes("document.getElementById('headerBackBtn')")) {
    // Find where logout is already bound and add it there
    content = content.replace(
      "document.getElementById('logoutBtn').addEventListener('click', () => logout());",
      "document.getElementById('logoutBtn').addEventListener('click', () => logout());\nif (document.getElementById('headerBackBtn')) document.getElementById('headerBackBtn').addEventListener('click', () => logout());"
    );
    
    // In admin/index.html, it's called `headerLogoutBtn`
    content = content.replace(
      "document.getElementById('headerLogoutBtn').addEventListener('click', () => logout());",
      "document.getElementById('headerLogoutBtn').addEventListener('click', () => logout());\nif (document.getElementById('headerBackBtn')) document.getElementById('headerBackBtn').addEventListener('click', () => logout());"
    );
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Added Back Button to: ' + file);
  }
}
