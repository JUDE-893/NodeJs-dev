import { chromium } from 'playwright'; // Only import what you need

// Launch browser with stealth configurations
export async function createBrowserInstance() {
    return await chromium.launch({
        // executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        headless: false, // Visible browser for debugging
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-dev-shm-usage'  // # Critical for Docker
        ],
        timeout: 15000  // Added timeout
    });
}
