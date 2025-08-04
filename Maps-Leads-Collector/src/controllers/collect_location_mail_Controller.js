import { createBrowserInstance } from '../services/createBrowserInstance.js';
import { createStealthContext } from '../services/createStealthContext.js';
import { shallowEmailCrawl } from '../services/crawlSite.js';
import { humandelay_emmitter } from '../utils/humandelay_emmitter.js';
import { errorCatchingLayer } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';

// script that run a search session in google map and collect all site's url related to each location appeared
export const scrapMainPage = errorCatchingLayer(async (req, res, next) => {

  let result;
  let context;
  let page;
  let browser = await createBrowserInstance();
  const { site } = req.body;
  console.log("°req.body°", req.body);

  try {
    // require teh search keyword
    if (!Boolean(site)) {
      throw new AppError("the website url is required", 400);
    }

    // GO THE GOOGLE MAP AND SEARCH A LOCATION KEYWORD
    const stealth = await createStealthContext(browser);
    context = stealth.context;
    page = stealth.page;

    // NAVIGATE IN TO THE GIVEN URL AND RETRIEVE EMAILS FROM IT
    result = await shallowEmailCrawl(browser, page, site)
    await humandelay_emmitter(page);

    return res.status(200).json({status: "success", url: site, emails: result });

  } catch (error) {
    next(error);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
})
