const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const heroCss = `
    .landing-layout {
      position: relative; z-index: 10; width: 100%; max-width: 1100px;
      display: flex; flex-direction: column; align-items: center; gap: 40px;
    }
    @media (min-width: 900px) {
      .landing-layout { flex-direction: row; justify-content: space-between; align-items: stretch; gap: 80px; }
      .login-wrapper { flex-shrink: 0; }
    }
    .hero-section {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      color: #fff; animation: fadeInUp .55s var(--ease-out) both;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px; background: rgba(34,197,94,.15);
      border: 1px solid rgba(34,197,94,.3); color: #86efac; padding: 6px 14px;
      border-radius: 999px; font-size: .75rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: .08em; width: fit-content; margin-bottom: 24px;
    }
    .hero-title { font-size: 3.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.03em; }
    .hero-title span { background: linear-gradient(135deg, #4ade80, #16a34a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-desc { font-size: 1.1rem; color: rgba(255,255,255,.7); line-height: 1.6; max-width: 500px; margin-bottom: 40px; }
    .hero-features { display: flex; flex-direction: column; gap: 16px; }
    .hf-item { display: flex; align-items: flex-start; gap: 14px; }
    .hf-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .hf-text { display: flex; flex-direction: column; gap: 4px; }
    .hf-title { font-weight: 800; font-size: .95rem; color: #fff; }
    .hf-sub { font-size: .8rem; color: rgba(255,255,255,.5); }
`;

if (!content.includes('landing-layout')) {
  content = content.replace('</style>', heroCss + '\n  </style>');
  
  const heroHtml = `
  <div class="landing-layout">
    <div class="hero-section">
      <div class="hero-badge">SIH 2026 Submission</div>
      <h1 class="hero-title">Smarter Routing.<br><span>Cleaner Cities.</span></h1>
      <p class="hero-desc">EcoRoute bridges citizens, municipal drivers, and city administrators into a synchronized, closed-loop telemetry and routing ecosystem.</p>
      <div class="hero-features">
        <div class="hf-item">
          <div class="hf-icon">&#x1F4F8;</div>
          <div class="hf-text">
            <div class="hf-title">Citizen Reporting</div>
            <div class="hf-sub">Gamified Trust Scores & AI segregation guidance.</div>
          </div>
        </div>
        <div class="hf-item">
          <div class="hf-icon">&#x1F69B;</div>
          <div class="hf-text">
            <div class="hf-title">Predictive Fleet Dispatch</div>
            <div class="hf-sub">Nearest-neighbor TSP routing avoids empty bins.</div>
          </div>
        </div>
        <div class="hf-item">
          <div class="hf-icon">&#x1F3DB;&#xFE0F;</div>
          <div class="hf-text">
            <div class="hf-title">Admin Command Center</div>
            <div class="hf-sub">Real-time heatmaps & chronic dump zone tracking.</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  content = content.replace('<div class="login-wrapper">', heroHtml + '\n    <div class="login-wrapper">');
  content = content.replace(
    '<script type="module" src="./js/login.js"></script>\n</body>',
    '</div>\n  <script type="module" src="./js/login.js"></script>\n</body>'
  );
  
  // Also fix the demo emails from cleangreen.in to ecoroute.in
  content = content.replaceAll('@cleangreen.in', '@ecoroute.in');
  
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Added Hero Section to Landing Page');
}
