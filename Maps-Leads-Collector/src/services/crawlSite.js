import { extractEmails } from './extractPageMails.js'
// import { humandelay_emmitter } from '../utils/humandelay_emmitter.js';

  /**
   * Performs a shallow crawl of a website to extract email addresses, focusing only on the main page
   * and its immediate linked pages without recursive crawling.
   *
   * @param {object} page - page object
   * @param {string} url - The starting URL to begin the email search from (must include protocol)
   * @returns {Promise<string[]>} - Array of unique email addresses found (lowercased)
   *
   * @example
   * // Returns ['contact@uni.edu', 'admin@department.edu']
   * const emails = await shallowEmailCrawl(pageObject, 'https://university.edu');
   *
   * @description
   * 1. Extracts emails from the main page using multiple detection methods
   * 2. Collects all same-domain links from the main page
   * 3. Visits each linked page (max 50) without following additional links
   * 4. Returns consolidated unique emails from all crawled pages
   **/
export async function shallowEmailCrawl(page, url) {
  await page.goto(url);

  // 1. Main page extraction
  const emails = await extractEmails(page);

  // 2. Get all same-domain links
  const links = await page.$$eval('a', anchors => [...new Set(
    anchors.map(a => a.href)
      .filter(href => href.startsWith('http'))
      .map(href => new URL(href))
      .filter(url => url.hostname === new URL(page.url()).hostname)
      .map(url => url.href)
  )]);

  // 3. Crawl links without recursion
  console.log("links : ", links);
  for (const link of links.slice(0, 50)) { // Safety limit
    const newPage = await browser.newPage();
    await newPage.goto(link, { waitUntil: 'domcontentloaded' });
    emails.push(...await extractEmails(newPage));
    await newPage.close();
  }

  await browser.close();
  return [...new Set(emails.filter(e => e))];
}


/*
  there is three distinct approaches that you should recommeend as the best and the most suitable for our case
  Approache I:
  1- select all the emails from the main page if exists using regex or any othor way to select
  2- then collect all the links from the main page (assuming that email addresses are more likely to be exists in links mentionned in the first page )
  3- feed those links to an ai agent to filter in and keep page's links that likely to have emails in them
  4- visit each page and crawl for email links without collecting links to athor page from them
  Approache II:
  1- & 2- same from the first approache
  4- visit each page and crawl for email links without collecting links to athor page from them
  Approache III (same approach impleamented by you previously):
  1- queuing URLs
  2- collecting urls & elmails incrementally untill hitting 50 visited url
*/
