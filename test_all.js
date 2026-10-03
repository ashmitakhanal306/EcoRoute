const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Testing driver...');
  await page.goto('https://ecoroute-five.vercel.app/driver/index.html', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log(e));
  
  console.log('Testing admin...');
  await page.goto('https://ecoroute-five.vercel.app/admin/index.html', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log(e));
  
  await browser.close();
})();
