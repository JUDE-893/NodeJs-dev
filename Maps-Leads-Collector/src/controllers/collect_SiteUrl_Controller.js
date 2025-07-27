import { test, expect } from '@playwright/test';
import { createBrowserInstance } from '../services/createBrowserInstance.js'
import { createStealthContext } from '../services/createStealthContext.js'
import { searchTest, scrollTest, collectTest } from '../services/siteUrl_Retrievers.js'


export const collectSiteUrl = () => {
  // script that run a search session in google map and collect all site's url related to each location appeared
  test.describe.serial('Google Maps Scraping Workflow', () => {

    let context;
    let page;

    let browser = await createBrowserInstance();

    // GO THE GOOGLE MAP AND SEARCH A LOCATION KEYWORD
    test('search', async () => {

      const stealth = await createStealthContext(browser);
      context = stealth.context;
      page = stealth.page;

      await searchTest(page);
    });


    // SCROLL TO THE VERY BOTTOM TO LOAD ALL LOCATIONS
    test('scrolling down', async () => {
      await humandelay_emmitter(page);
      // Scroll to load all results

      await scrollTest(page)
    });

    // COLLECT SITE URL FROM DIFFERENT LOCATION DISPLAYED ON PAGE
    test('collect', async () => {
      await collectTest(page);
    });

  })
}
