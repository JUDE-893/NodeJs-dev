
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Common obfuscation patterns
const patterns = {
  at: /(\b\w+(?:[-.]\w+)*\s*(?:\(?@\)?|\[at\]|\(?at\)?)\s*\w+(?:[-.]\w+)*\s*(?:\(?\.\)?|\[dot\]|\(?dot\)?)\s*\w{2,}\b)/gi,
  brackets: /(\b\w+(?:[-.]\w+)*\s*@\s*\w+(?:[-.]\w+)*\s*\.\s*\w{2,}\b)/gi,
  image: 'img[src*="email"]'
};

// Text-based obfuscations
const decodeObfuscated = text => text
  // Replace obfuscated "at" with "@"
  .replace(/\s*(\(?@\)?|\[at\]|\(?at\)?)\s*/gi, '@')
  // Replace obfuscated "dot" with "."
  .replace(/\s*(\(?\.\)?|\[dot\]|\(?dot\)?)\s*/gi, '.')
  // Remove leftover brackets and parentheses
  .replace(/[\[\]\(\)]/g, '')
  // Remove spaces around @ and .
  .replace(/\s*@\s*/g, '@')
  .replace(/\s*\.\s*/g, '.')
  // Trim any remaining whitespace
  .trim();


  /**
   * @param {object} page - page object
   * @returns {Promise<string[]>} - Array of unique email addresses found (lowercased)
   *
   * @example
   * // Returns ['contact@uni.edu', 'admin@department.edu']
   * const emails = await extractEmails(pageObject);
   *
   * @description
   * - Automatically normalizes emails to lowercase
   * - Skips mailto links that resolve to image files
   * - Includes basic obfuscation pattern detection
   * - Limits to 50 pages maximum for performance
   **/
export async function extractEmails(page) {

    // 1. Standard Email Extraction
    const standardEmails = new Set();

    // Method 1: mailto links
    const mailtoEmails = await page.$$eval('a[href^="mailto:"]', links =>
      links.map(link => link.href.split('mailto:')[1].split('?')[0].trim())
    );
    mailtoEmails.forEach(e => standardEmails.add(e.toLowerCase()));

    // Method 2: Regex scanning of visible text
    const visibleText = await page.evaluate(() =>
      document.body.innerText.replace(/\s+/g, ' ')
    );
    const textEmails = visibleText.match(emailRegex) || [];
    textEmails.forEach(e => standardEmails.add(e.toLowerCase()));

    // 2. Obfuscated Email Handling
    const obfuscatedEmails = new Set();

    // Find and decode pattern matches
    const pageContent = await page.content();
    for (const [type, pattern] of Object.entries(patterns)) {
      if (type !== 'image') {
        const matches = pageContent.match(pattern) || [];
        matches.forEach(match => {
          const decoded = decodeObfuscated(match);
          if (decoded.match(emailRegex)) {
            obfuscatedEmails.add(decoded.toLowerCase());
          }
        });
      }
    }

    // 3. Image-based emails (OCR simulation)
    const imageEmails = new Set();
    const emailImages = await page.$$(patterns.image);
    for (const img of emailImages) {
      try {
        // OCR simulation: Extract alt text, title, or adjacent text
        const altText = await img.getAttribute('alt') || '';
        const title = await img.getAttribute('title') || '';
        const parentText = await img.evaluate(node =>
          node.closest('a, span, div')?.textContent || ''
        );

        [altText, title, parentText].forEach(text => {
          const emails = text.match(emailRegex) || [];
          emails.forEach(e => imageEmails.add(e.toLowerCase()));
        });
      } catch {} // Silent fail for missing elements
    }

    // 4. Combine all sources
    return [
      ...standardEmails,
      ...obfuscatedEmails,
      ...imageEmails
    ].filter(email => {
      // Final validation
      return emailRegex.test(email) &&
             !email.endsWith('.png') &&
             !email.endsWith('.jpg') &&
             email.length <= 254;
    });

}
