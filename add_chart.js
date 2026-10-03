const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

// Add Chart.js to head
if (!content.includes('chart.js')) {
  content = content.replace(
    '<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>',
    '<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>'
  );
}

// Add Canvas to Panel 2 (Right Sidebar)
const chartHtml = `
          <!-- ── SECTION: ANALYTICS ── -->
          <div class="insight-card" style="margin-top: 10px;">
            <div class="ic-header">
              <span>&#128202; Waste Collection by Zone</span>
            </div>
            <div style="height: 180px; width: 100%; margin-top: 8px;">
              <canvas id="zoneChart"></canvas>
            </div>
          </div>
`;
if (!content.includes('zoneChart')) {
  content = content.replace(
    '<!-- ── SECTION 1: PREDICTION HEATMAP ── -->',
    chartHtml + '\n          <!-- ── SECTION 1: PREDICTION HEATMAP ── -->'
  );
}

// Add JS to render the chart
const chartJs = `
// Initialize Chart.js
const ctx = document.getElementById('zoneChart').getContext('2d');
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
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
    }
  }
});
`;
if (!content.includes('new Chart(ctx')) {
  content = content.replace(
    '/* ======================================================',
    chartJs + '\n/* ======================================================'
  );
}

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Added Chart to Admin');
