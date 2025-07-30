import express from 'express';
import { collectSiteUrl } from '../controllers/collect_SiteUrl_Controller.js'

const router = express.Router();

/*
*  this endpoint search for a specific keyword in google maps and retuen all business' and locations' website urls
*  <?s=search-keyword> e.g : hotels in Miami
*  return json {status: success | fails, ?urls:[], ?errors: []}
*/
router.get('/get-webSites', collectSiteUrl);

export default router;
