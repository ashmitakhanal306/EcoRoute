const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

const validJs = `
// Initialize Chart.js
setTimeout(() => {
  const chartEl = document.getElementById('zoneChart');
  if (chartEl) {
    const ctx = chartEl.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['North', 'South', 'East', 'West', 'Central'],
        datasets: [{
          label: 'Collected (Tons)',
          data: [12, 19, 8, 15, 22],
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
        }
      }
    });
  }
}, 500);

if (document.getElementById('adminExitBtn')) {
  document.getElementById('adminExitBtn').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
  const exitBtn = document.getElementById('adminExitBtn');
  exitBtn.addEventListener('mouseenter', () => { exitBtn.style.color = '#fff'; exitBtn.style.background = 'rgba(255,255,255,0.1)'; });
  exitBtn.addEventListener('mouseleave', () => { exitBtn.style.color = '#94a3b8'; exitBtn.style.background = 'rgba(255,255,255,0.05)'; });
}
`;

content = content.replace("showToast('Command Center Online'", validJs + "\n\nshowToast('Command Center Online'");

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Fixed JS injection pt 2');
