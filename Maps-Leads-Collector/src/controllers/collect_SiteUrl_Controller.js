import { createBrowserInstance } from '../services/createBrowserInstance.js'
import { createStealthContext } from '../services/createStealthContext.js'
import { searchTest, scrollTest, collectTest } from '../services/siteUrl_Retrievers.js'
import { humandelay_emmitter } from '../utils/humandelay_emmitter.js'
import { errorCatchingLayer } from '../utils/helpers.js'
import AppError from '../utils/AppError.js';

// script that run a search session in google map and collect all site's url related to each location appeared
export const collectSiteUrl = errorCatchingLayer(async (req, res, next) => {

  let result;
  let context;
  let page;
  let browser = await createBrowserInstance();
  const { s } = req.query



  try {
    // require teh search keyword
    if (!Boolean(s)) {
      throw new AppError("the search keyword is required", 400);
    }

    // GO THE GOOGLE MAP AND SEARCH A LOCATION KEYWORD
    const stealth = await createStealthContext(browser);
    context = stealth.context;
    page = stealth.page;

    await searchTest(page, s);


    // SCROLL TO THE VERY BOTTOM TO LOAD ALL LOCATIONS
    await humandelay_emmitter(page);

    // Scroll to load all results
    await scrollTest(page);

    // COLLECT SITE URL FROM DIFFERENT LOCATION DISPLAYED ON PAGE
    result = await collectTest(page);
    return res.status(200).json({status: "success", urls: result});

  } catch (error) {
    next(error);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
})
