const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    console.log('Testing driver...');
    await page.goto('https://ecoroute-five.vercel.app/driver/index.html', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('Testing admin...');
    await page.goto('https://ecoroute-five.vercel.app/admin/index.html', { waitUntil: 'networkidle0', timeout: 15000 });
    
    await browser.close();
    console.log('Tests complete');
  } catch (e) {
    console.log('Test Failed:', e.message);
  }
})();
