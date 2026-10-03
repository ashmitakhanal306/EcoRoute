const fs = require('fs');
let content = fs.readFileSync('citizen/index.html', 'utf8');

const langHtml = `
      <button id="langToggle" title="Toggle Language" style="background: none; border: 1.5px solid #cbd5e1; border-radius: 6px; cursor: pointer; padding: 2px 6px; font-size: .75rem; font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: center; margin-right: 5px;">A/अ</button>
`;

if (!content.includes('id="langToggle"')) {
  content = content.replace(
    '<div class="topbar-right">',
    '<div class="topbar-right">\n' + langHtml
  );
  
  const js = `
let isHindi = false;
document.getElementById('langToggle').addEventListener('click', () => {
  isHindi = !isHindi;
  document.getElementById('langToggle').style.background = isHindi ? '#16a34a' : 'none';
  document.getElementById('langToggle').style.color = isHindi ? '#fff' : '#475569';
  document.getElementById('langToggle').style.borderColor = isHindi ? '#16a34a' : '#cbd5e1';
  showToast(isHindi ? 'Language switched to Hindi (Demo)' : 'Language switched to English');
});
  `;
  content = content.replace(
    '/* ======================================================',
    js + '\n/* ======================================================'
  );
  fs.writeFileSync('citizen/index.html', content, 'utf8');
  console.log('Added Lang Toggle to Citizen');
}
