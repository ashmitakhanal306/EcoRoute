const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

// Fix overflow-y
content = content.replace(
  /justify-content: space-between;\n\s*z-index: 100;/,
  'justify-content: space-between;\n      overflow-y: auto; overflow-x: hidden;\n      z-index: 100;'
);

// Add the JS for the exit button
const exitJs = `
if (document.getElementById('adminExitBtn')) {
  document.getElementById('adminExitBtn').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
  
  const exitBtn = document.getElementById('adminExitBtn');
  if (exitBtn) {
    exitBtn.addEventListener('mouseenter', () => { exitBtn.style.color = '#fff'; exitBtn.style.background = 'rgba(255,255,255,0.1)'; });
    exitBtn.addEventListener('mouseleave', () => { exitBtn.style.color = '#94a3b8'; exitBtn.style.background = 'rgba(255,255,255,0.05)'; });
  }
}
`;

if (!content.includes('window.location.href = \'../index.html\';')) {
  content = content.replace(
    '/* ======================================================',
    exitJs + '\n/* ======================================================'
  );
}

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Fixed JS and CSS');
