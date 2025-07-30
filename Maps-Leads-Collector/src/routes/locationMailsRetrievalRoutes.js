import express from 'express';
import { scrapMainPage } from '../controllers/collect_location_mail_Controller.js'

const router = express.Router();

  /**
   *
   * @apiDescription Performs automated email extraction from the specified website using shallow crawling.
   *
   * @apiBody {string} requestBody.site The target website URL to crawl (must include http/https)
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "urls": ["https://target.edu", "https://target.edu/contact"],
   *   "emails": ["contact@target.edu", "admin@department.target.edu"]
   * }
   **/
router.post('/get-mails', scrapMainPage);

export default router;
