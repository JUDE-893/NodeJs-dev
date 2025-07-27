import { humandelay_emmitter } from '../utils/humandelay_emmitter'

// SCROLL TO THE VERY BOTTOM TO LOAD ALL LOCATIONS
async function scrollTest(page) {
  // Scroll to load all results
  const containerSelector = 'div[role="feed"]';
  let previousHeight = 0;
  let currentHeight = await page.$eval(containerSelector, el => el.scrollHeight);
  let scrollAttempts = 0;
  const maxScrollAttempts = 20; // Prevent infinite loops

  while (scrollAttempts < maxScrollAttempts && currentHeight > previousHeight) {
    // Scroll container to bottom
    await page.$eval(containerSelector, container => {
      container.scrollTop = container.scrollHeight;
    });

    // Wait for new content to load
    await page.waitForTimeout(2000 + Math.random() * 1000); // Randomized delay

    // Update height measurements
    previousHeight = currentHeight;
    currentHeight = await page.$eval(containerSelector, el => el.scrollHeight);
    scrollAttempts++;

    console.log(`Scroll attempt ${scrollAttempts}, height: ${currentHeight}`);
  }
};

// GO THE GOOGLE MAP AND SEARCH A LOCATION KEYWORD
async function searchTest(page) {

  // brows
  await page.goto('https://consent.google.com/m?continue=https://www.google.com/maps/&gl=NL&m=0&pc=m&uxe=eomtm&cm=2&hl=fr&src=1');

  const currentUrl = page.url();
  // check for potentiel permission page redirect
  if (/https:\/\/consent\.google\.com\/.+/.test(currentUrl) && false ) {
    console.log(true);

    // await page.getByRole('button', { name: 'Langue : Français' }).click();
    // await page.getByRole('menuitem', { name: 'English', exact: true }).click();
    // await page.getByRole('button', { name: 'Language: English' }).click();
    // await page.getByRole('main').click();
    // await page.getByRole('button', { name: 'Reject all' }).click();
    // await page.goto('https://www.google.com/maps/@52.3599872,4.8791552,12z?entry=ttu&g_ep=EgoyMDI1MDcyMi4wIKXMDSoASAFQAw%3D%3D');
  }

  await await page.locator('#searchboxinput').click();
  await await page.locator('#searchboxinput').fill('');
  await await page.locator('#searchboxinput').press('CapsLock');
  await await page.locator('#searchboxinput').fill('hospital in berlin');
  await page.locator('#searchboxinput').click();
  await await page.locator('#searchbox-searchbutton').click();

  // -------------------------------------
  // await page.getByRole('combobox', { name: 'Rechercher dans Google Maps' }).click();
  // await page.getByRole('combobox', { name: 'Rechercher dans Google Maps' }).fill('');
  // await page.getByRole('combobox', { name: 'Rechercher dans Google Maps' }).press('CapsLock');
  // await page.getByRole('combobox', { name: 'Rechercher dans Google Maps' }).fill('hospital in berlin');
  // await page.locator('#searchboxinput').click();
  // await page.getByRole('button', { name: 'Rechercher' }).click();
  // -------------------------------
}

// COLLECT SITE URL FROM DIFFERENT LOCATION DISPLAYED ON PAGE
async function collectTest(page) {

  // Wait for website links to appear using multi-language selector
  try {
    // Universal selector that works across languages
    await page.waitForSelector(
      'a[data-value*="Site Web"], ' +
      'a[data-value*="Website"], ' +
      'a[data-value*="Webseite"], ' +  // German
      'a[data-value*="Sitio web"], ' + // Spanish
      'a[data-value*="ウェブサイト"], ' + // Japanese
      'a[aria-label*="site web"], ' +
      'a[aria-label*="website"]',
      { timeout: 20000 }
    );
  } catch (error) {
    console.warn('Specific website links not found, proceeding with fallback');
  }

  // Extract links with robust multi-strategy approach
  const hrefs = await page.$$eval('a', anchors => {
    return anchors
      .filter(a => {
        const attrs = [
          a.getAttribute('data-value') || '',
          a.getAttribute('aria-label') || '',
          a.textContent || ''
        ].join(' ').toLowerCase();

        // Match multiple language patterns
        return /(site\s*web|website|webseite|sitio\s*web|ウェブサイト)/i.test(attrs);
      })
      .map(a => a.href);
  });
  console.log("hrefs",[...new Set(hrefs)]);

  // await browser.close();
}
