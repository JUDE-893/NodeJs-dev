import { test, expect } from '@playwright/test';
const { chromium } = require('playwright');

// Launch browser with stealth configurations
export async function createBrowserInstance() {
    let browser;
    await test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: false, // Visible browser for debugging
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
  });

    return browser
}
