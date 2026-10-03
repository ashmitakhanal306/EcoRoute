const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

// 1. Make sidebar scrollable so the footer isn't lost on small laptops
if (!content.includes('overflow-y: auto; overflow-x: hidden;')) {
  content = content.replace(
    /justify-content: space-between;\n\s*z-index: 100;/g,
    'justify-content: space-between;\n      overflow-y: auto; overflow-x: hidden;\n      z-index: 100;'
  );
}

// 2. Add an explicit Back arrow at the top of the sidebar
const exitHtml = `
      <div class="brand-header" style="display:flex; align-items:center; gap:8px;">
        <button id="adminExitBtn" title="Exit to Main Page" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#94a3b8; cursor:pointer; padding: 6px; display:flex; align-items:center; justify-content:center; transition: background 0.2s, color 0.2s;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
`;
if (!content.includes('adminExitBtn')) {
  content = content.replace(
    '<div class="brand-header">',
    exitHtml
  );
}

// 3. Bind the exit button
const exitJs = `
if (document.getElementById('adminExitBtn')) {
  document.getElementById('adminExitBtn').addEventListener('click', () => {
    // Standard logout path from shared/auth.js is imported
    if (typeof logout === 'function') {
      logout();
    } else {
      window.location.href = '../index.html';
    }
  });
  
  // Also add a hover effect programmatically just in case
  const exitBtn = document.getElementById('adminExitBtn');
  exitBtn.addEventListener('mouseenter', () => { exitBtn.style.color = '#fff'; exitBtn.style.background = 'rgba(255,255,255,0.1)'; });
  exitBtn.addEventListener('mouseleave', () => { exitBtn.style.color = '#94a3b8'; exitBtn.style.background = 'rgba(255,255,255,0.05)'; });
}
`;

if (!content.includes('adminExitBtn')) {
  content = content.replace(
    '/* ======================================================',
    exitJs + '\n/* ======================================================'
  );
}

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Added Back Button to Admin');
