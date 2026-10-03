const fs = require('fs');
let content = fs.readFileSync('driver/index.html', 'utf8');

const shiftHtml = `
      <div class="topbar-right">
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; background:#1e293b; padding:4px 10px; border-radius:999px; border:1px solid #334155;">
          <span id="shiftStatus" style="color:#94a3b8; font-size:.7rem; font-weight:800; text-transform:uppercase;">Off Shift</span>
          <div style="position:relative; width:32px; height:18px; background:#475569; border-radius:999px; transition:background .3s;" id="shiftTrack">
            <div style="position:absolute; top:2px; left:2px; width:14px; height:14px; background:#fff; border-radius:50%; transition:transform .3s;" id="shiftThumb"></div>
          </div>
        </label>
      </div>
`;

if (!content.includes('shiftStatus')) {
  // In driver/index.html, topbar currently might not have a .topbar-right, let's inject it before </header>
  content = content.replace(
    '</header>',
    shiftHtml + '\n  </header>'
  );

  const js = `
let isOnShift = false;
document.getElementById('shiftTrack').parentElement.addEventListener('click', (e) => {
  e.preventDefault();
  isOnShift = !isOnShift;
  document.getElementById('shiftStatus').textContent = isOnShift ? 'On Shift' : 'Off Shift';
  document.getElementById('shiftStatus').style.color = isOnShift ? '#86efac' : '#94a3b8';
  document.getElementById('shiftTrack').style.background = isOnShift ? '#16a34a' : '#475569';
  document.getElementById('shiftThumb').style.transform = isOnShift ? 'translateX(14px)' : 'translateX(0)';
});
  `;
  content = content.replace(
    '/* ======================================================',
    js + '\n/* ======================================================'
  );
  fs.writeFileSync('driver/index.html', content, 'utf8');
  console.log('Added Shift Toggle to Driver');
}
