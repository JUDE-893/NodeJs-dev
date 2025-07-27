
// Configure stealth and safety settings
export const createStealthContext = async (browser) => {
  // Randomize viewport dimensions
  const viewports = [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1920, height: 1080 }
  ];

  // Rotating user agents
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
  ];

  // Create context with stealth options
  const context = await browser.newContext({
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    viewport: viewports[Math.floor(Math.random() * viewports.length)],
    locale: 'en-US,en;q=0.9',
    timezoneId: 'America/New_York',
    // Reduce fingerprinting
    deviceScaleFactor: Math.random() > 0.5 ? 1 : 2,
    isMobile: false,
    hasTouch: false
  });

  const page = await context.newPage();

  // Anti-bot evasion scripts
  await page.addInitScript(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Spoof plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3],
    });

    // Spoof languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Mock permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  // Randomize mouse movements
  await page.addInitScript(() => {
    window.addEventListener('mousemove', (e) => {
      const noiseX = Math.random() * 2 - 1;
      const noiseY = Math.random() * 2 - 1;
      e.clientX += noiseX;
      e.clientY += noiseY;
    }, true);
  });

  // Set random referer
  const referers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://duckduckgo.com/',
    'https://www.reddit.com/'
  ];
  await page.setExtraHTTPHeaders({
    'Referer': referers[Math.floor(Math.random() * referers.length)],
    'Accept-Language': 'en-US,en;q=0.9'
  });
  
  return { context, page };
};

// // Usage example
// (async () => {
//   const browser = await chromium.launch({
//     headless: false, // Easier to debug
//     args: [
//       '--disable-blink-features=AutomationControlled',
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-web-security',
//       '--disable-features=IsolateOrigins,site-per-process'
//     ]
//   });
//
//   try {
//     const { context, page } = await createStealthContext(browser);
//
//     // Set random referer
//     const referers = [
//       'https://www.google.com/',
//       'https://www.bing.com/',
//       'https://duckduckgo.com/',
//       'https://www.reddit.com/'
//     ];
//     await page.setExtraHTTPHeaders({
//       'Referer': referers[Math.floor(Math.random() * referers.length)],
//       'Accept-Language': 'en-US,en;q=0.9'
//     });
//
//     // Enable request interception to block unnecessary resources
//     await page.route('**/*', (route) => {
//       const blockedResources = [
//         'image', 'stylesheet', 'font', 'media'
//       ];
//       if (blockedResources.includes(route.request().resourceType())) {
//         route.abort();
//       } else {
//         route.continue();
//       }
//     });
// //
// //     // Your scraping logic here
// //     await page.goto('https://www.example.com', {
// //       waitUntil: 'domcontentloaded',
// //       timeout: 30000
// //     });
// //
// //     // Random delay before closing
// //     await page.waitForTimeout(2000 + Math.random() * 5000);
// //     await context.close();
// //   } finally {
// //     await browser.close();
// //   }
// // })();
