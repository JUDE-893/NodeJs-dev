
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}\b/gi;

// More precise obfuscation patterns
const patterns = {
  at: /(\b\w+(?:[-.]\w+)*\s*(?:\[at\]|\(at\)|at)\s*\w+(?:[-.]\w+)*\s*(?:\[dot\]|\(dot\)|dot)\s*\w{2,}\b)/gi,
  brackets: /(\b\w+(?:[-.]\w+)*\s*@\s*\w+(?:[-.]\w+)*\s*\.\s*\w{2,}\b)/gi,
  image: 'img[src*="email"]'
};


// More targeted obfuscation decoding
const decodeObfuscated = text => text
  // Only replace specific obfuscation markers
  .replace(/(\[at\]|\(at\)|\s+at\s+)/gi, '@')
  .replace(/(\[dot\]|\(dot\)|\s+dot\s+)/gi, '.')
  // Remove brackets only around @ and .
  .replace(/[\[\]\(\)](?=\s*[@.])|(?<=[@.]\s*)[\[\]\(\)]/g, '')
  // Remove spaces only around @ and .
  .replace(/\s*@\s*/g, '@')
  .replace(/\s*\.\s*/g, '.')
  .trim();

// Enhanced false positive patterns
const falsePositivePatterns = [
  /\.(css|js|png|jpg|jpeg|webp|pdf|min|random|href|toString)$/i,
  /@[^.]+\.[a-z]{1,3}\.[a-z]{2,}/i,
  /[^a-z0-9]@[a-z]{1,3}\./i,
  /@localhost/i,
  /@\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
  /^www\./i,
  /@[a-z]\./i,
  /[^@]+\.[a-z]{3,}$/i  // New: detects domain-like strings without @
];

/**
 * Checks if an email is likely a false positive
 * @param {string} email - Email address to validate
 * @returns {boolean} True if likely false positive
 */
function isFalsePositive(email) {
  // Skip validation if no @ symbol
  if (!email.includes('@')) return true;

  // Check against known false positive patterns
  if (falsePositivePatterns.some(pattern => pattern.test(email))) {
    return true;
  }

  // Validate domain structure
  const domainPart = email.split('@')[1] || '';
  const domainParts = domainPart.split('.');
  const tld = domainParts.pop() || '';

  // Reject if any domain segment is single-letter
  if (domainParts.some(segment => segment.length < 2)) {
    return true;
  }

  // TLD must be 2-24 characters and contain only letters
  return tld.length < 2 ||
         tld.length > 24 ||
         !/^[a-z]+$/.test(tld);
}

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
 * - Implements advanced false positive filtering
 **/
export async function extractEmails(page) {
    // 1. Standard Email Extraction
    const standardEmails = new Set();

    // Method 1: mailto links
    const mailtoEmails = await page.$$eval('a[href^="mailto:"]', links =>
      links.map(link => {
        const email = link.href.split('mailto:')[1]?.split('?')[0] || '';
        return email.trim().toLowerCase();
      })
    );
    mailtoEmails.forEach(e => standardEmails.add(e));

    // Method 2: Regex scanning of visible text
    const visibleText = await page.evaluate(() =>
      document.body.innerText.replace(/\s+/g, ' ')
    );
    const textEmails = (visibleText.match(emailRegex) || []).map(e => e.toLowerCase());
    textEmails.forEach(e => standardEmails.add(e));

    // 2. Obfuscated Email Handling
    const obfuscatedEmails = new Set();

    // Find and decode pattern matches
    const pageContent = await page.content();
    for (const [type, pattern] of Object.entries(patterns)) {
      if (type !== 'image') {
        const matches = pageContent.match(pattern) || [];
        matches.forEach(match => {
          console.log("match",match);
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

    // 4. Combine all sources and apply advanced filtering
    const allEmails = [
      ...standardEmails,
      ...obfuscatedEmails,
      ...imageEmails
    ];

    return allEmails.filter(email => {
      // Final validation pipeline
      return emailRegex.test(email) &&
             email.length <= 254 &&
             !isFalsePositive(email);
    });
}
