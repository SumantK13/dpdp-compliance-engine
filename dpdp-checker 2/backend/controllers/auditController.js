// const axios = require('axios');
// const cheerio = require('cheerio');
// const { extractData, runChecks, calculateOverall } = require('../services/dpdpAnalyzer');
// const Audit = require('../models/Audit');

// // Rotate User-Agents to avoid simple bot blocks
// const USER_AGENTS = [
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
// ];

// const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// /**
//  * Fetch a URL with retry on failure, trying http fallback and www prefix variations
//  */
// async function fetchWithRetry(urlStr, timeout = 20000) {
//   const variations = [urlStr];

//   // Add www / non-www variants
//   try {
//     const u = new URL(urlStr);
//     if (!u.hostname.startsWith('www.')) {
//       variations.push(`${u.protocol}//www.${u.hostname}${u.pathname}${u.search}`);
//     } else {
//       variations.push(`${u.protocol}//${u.hostname.replace(/^www\./, '')}${u.pathname}${u.search}`);
//     }
//     // Also try http if https fails
//     if (u.protocol === 'https:') {
//       variations.push(`http://${u.hostname}${u.pathname}${u.search}`);
//     }
//   } catch { /* ignore */ }

//   let lastErr;
//   for (const url of variations) {
//     try {
//       const resp = await axios.get(url, {
//         timeout,
//         maxRedirects: 10,
//         maxContentLength: 8 * 1024 * 1024,
//         headers: {
//           'User-Agent': randomUA(),
//           'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//           'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
//           'Accept-Encoding': 'gzip, deflate, br',
//           'Cache-Control': 'no-cache',
//           'Pragma': 'no-cache',
//           'Upgrade-Insecure-Requests': '1',
//           'Sec-Fetch-Dest': 'document',
//           'Sec-Fetch-Mode': 'navigate',
//           'Sec-Fetch-Site': 'none',
//         },
//         validateStatus: (s) => s < 500,
//       });

//       if (resp.data && typeof resp.data === 'string' && resp.data.length > 100) {
//         return { html: resp.data, headers: resp.headers, finalUrl: url };
//       }
//     } catch (e) {
//       lastErr = e;
//     }
//   }
//   throw lastErr || new Error('All fetch variations failed');
// }

// /**
//  * Attempt to fetch privacy-related sub-pages
//  */
// async function fetchPrivacyPages(origin) {
//   const paths = [
//     '/privacy-policy', '/privacy', '/data-protection', '/privacypolicy',
//     '/legal/privacy', '/legal/privacy-policy', '/policies/privacy',
//     '/about/privacy', '/help/privacy', '/terms/privacy'
//   ];

//   let combined = '';
//   let found = 0;

//   for (const path of paths) {
//     if (found >= 2) break; // max 2 sub-pages
//     try {
//       const resp = await axios.get(`${origin}${path}`, {
//         timeout: 10000,
//         maxRedirects: 5,
//         headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
//         validateStatus: (s) => s === 200,
//       });
//       if (resp.data && typeof resp.data === 'string' && resp.data.length > 200) {
//         const $p = cheerio.load(resp.data);
//         $p('script, style, noscript').remove();
//         const text = $p('body').text().replace(/\s+/g, ' ').trim();
//         if (text.length > 100) {
//           combined += ' ' + text;
//           found++;
//         }
//       }
//     } catch { /* ignore individual failures */ }
//   }

//   return combined;
// }

// /**
//  * POST /api/audit
//  * Body: { url: string }
//  */
// async function runAudit(req, res) {
//   const { url } = req.body;

//   if (!url || typeof url !== 'string') {
//     return res.status(400).json({ error: 'URL is required' });
//   }

//   // Normalize URL
//   let targetUrl;
//   try {
//     const normalized = /^https?:\/\//i.test(url) ? url : `https://${url.trim()}`;
//     targetUrl = new URL(normalized);
//   } catch {
//     return res.status(400).json({ error: 'Invalid URL. Please enter a valid website address, e.g. example.com' });
//   }

//   // Block private/local addresses (SSRF prevention)
//   const hostname = targetUrl.hostname.toLowerCase();
//   if (
//     hostname === 'localhost' ||
//     hostname === '127.0.0.1' ||
//     /^10\./.test(hostname) ||
//     /^192\.168\./.test(hostname) ||
//     /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
//     /^169\.254\./.test(hostname) ||
//     /^::1$/.test(hostname) ||
//     /^fd[0-9a-f]{2}:/i.test(hostname)
//   ) {
//     return res.status(400).json({ error: 'Private/local URLs are not allowed' });
//   }

//   try {
//     console.log(`[Audit] Starting scan for: ${targetUrl.href}`);

//     // --- Step 1: Fetch main page ---
//     let html = '', responseHeaders = {}, fetchedUrl = targetUrl.href;
//     try {
//       const result = await fetchWithRetry(targetUrl.href);
//       html = result.html;
//       responseHeaders = result.headers;
//       fetchedUrl = result.finalUrl;
//       console.log(`[Audit] Fetched main page (${html.length} bytes)`);
//     } catch (fetchErr) {
//       console.warn(`[Audit] Main page fetch failed: ${fetchErr.message}`);
//       // Don't give up yet — we can still analyze based on domain heuristics
//       // Return a partial result with low confidence instead of hard failing
//       html = `<html><head><title>${targetUrl.hostname}</title></head><body></body></html>`;
//       responseHeaders = {};
//     }

//     if (typeof html !== 'string') html = String(html);

//     // --- Step 2: Extract data from main page ---
//     const extractedData = extractData(html, fetchedUrl, responseHeaders);

//     // --- Step 3: Fetch privacy sub-pages ---
//     try {
//       const privacyText = await fetchPrivacyPages(targetUrl.origin);
//       if (privacyText) {
//         extractedData.text += ' ' + privacyText;
//         extractedData.html += ' ' + privacyText;
//         console.log(`[Audit] Merged privacy page text (${privacyText.length} chars)`);
//       }
//     } catch { /* non-fatal */ }

//     // --- Step 4: Run DPDP checks ---
//     const checks = runChecks(extractedData);
//     const { overallScore, overallStatus, summary } = calculateOverall(checks);

//     const auditResult = {
//       url: targetUrl.href,
//       domain: extractedData.domain,
//       pageTitle: extractedData.pageTitle,
//       scanDate: new Date(),
//       overallScore,
//       overallStatus,
//       checks,
//       summary,
//     };

//     // --- Step 5: Persist to MongoDB (non-blocking, optional) ---
//     try {
//       const saved = new Audit(auditResult);
//       await saved.save();
//       auditResult._id = saved._id;
//     } catch (dbErr) {
//       console.warn('[Audit] MongoDB save skipped:', dbErr.message);
//     }

//     console.log(`[Audit] Done. Score: ${overallScore} (${overallStatus})`);
//     return res.json({ success: true, audit: auditResult });

//   } catch (err) {
//     console.error('[Audit] Fatal error:', err.message);
//     return res.status(500).json({
//       error: 'Audit failed. The website may be blocking requests or unreachable.',
//       details: err.message,
//       suggestion: 'Try a different URL or ensure the website is publicly accessible.'
//     });
//   }
// }

// module.exports = { runAudit };

// const axios = require('axios');
// const cheerio = require('cheerio');
// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// puppeteer.use(StealthPlugin());

// const { extractData, runChecks, calculateOverall } = require('../services/dpdpAnalyzer');
// const Audit = require('../models/Audit');

// // ---------------- USER AGENTS ----------------
// const USER_AGENTS = [
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0 Safari/537.36',
//   'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0 Safari/537.36'
// ];

// const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// // ---------------- BROWSER REUSE ----------------
// let browser;

// async function getBrowser() {
//   if (!browser) {
//     browser = await puppeteer.launch({
//       headless: "new",
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-blink-features=AutomationControlled',
//         '--disable-dev-shm-usage',
//         '--disable-gpu',
//         '--window-size=1920,1080'
//       ]
//     });
//   }
//   return browser;
// }

// // ---------------- PUPPETEER FETCH (FINAL FIXED) ----------------
// async function fetchWithPuppeteer(url) {
//   const browser = await getBrowser();
//   const page = await browser.newPage();

//   try {
//     await page.setUserAgent(randomUA());

//     await page.evaluateOnNewDocument(() => {
//       Object.defineProperty(navigator, 'webdriver', {
//         get: () => false,
//       });
//     });

//     // 🔥 KEY FIX: don't wait for full load
//     await page.goto(url, {
//       waitUntil: 'domcontentloaded',
//       timeout: 30000
//     }).catch(() => {
//       console.log('[Puppeteer] goto timeout — continuing');
//     });

//     // allow JS to render
//     await new Promise(res => setTimeout(res, 5000));

//     // trigger lazy loading
//     await page.evaluate(() => {
//       window.scrollBy(0, window.innerHeight);
//     });

//     const html = await page.content();
//     const finalUrl = page.url();

//     console.log('[Puppeteer] HTML length:', html.length);

//     return { html, headers: {}, finalUrl };

//   } catch (err) {
//     console.log('[Puppeteer] Error:', err.message);

//     return {
//       html: '',
//       headers: {},
//       finalUrl: url
//     };

//   } finally {
//     await page.close();
//   }
// }

// // ---------------- AXIOS FETCH ----------------
// async function fetchWithAxios(url) {
//   const resp = await axios.get(url, {
//     timeout: 15000,
//     headers: {
//       'User-Agent': randomUA(),
//       'Accept': 'text/html'
//     },
//     validateStatus: s => s < 500
//   });

//   return {
//     html: resp.data,
//     headers: resp.headers,
//     finalUrl: url
//   };
// }

// // ---------------- DETECTORS ----------------
// function isBlocked(html) {
//   return (
//     html.includes('cf-browser-verification') ||
//     html.includes('Checking your browser') ||
//     html.includes('Enable JavaScript') ||
//     html.length < 1200
//   );
// }

// function isJsHeavy(html) {
//   return html.length < 6000 || !html.includes('<p');
// }

// // ---------------- SMART FETCH ----------------
// async function smartFetch(url) {
//   try {
//     let result = await fetchWithAxios(url);

//     if (isBlocked(result.html) || isJsHeavy(result.html)) {
//       console.log('[Fetch] Switching to Puppeteer');
//       result = await fetchWithPuppeteer(url);
//     }

//     return result;

//   } catch {
//     console.log('[Fetch] Axios failed → Puppeteer');
//     return await fetchWithPuppeteer(url);
//   }
// }

// // ---------------- PRIVACY PAGE DETECTION ----------------
// async function fetchPrivacyPages(html, baseUrl) {
//   const $ = cheerio.load(html);
//   const links = $('a[href]').map((i, el) => $(el).attr('href')).get();

//   const privacyLinks = links
//     .filter(l => l && /privacy|policy|data/i.test(l))
//     .slice(0, 3);

//   let combined = '';

//   for (const link of privacyLinks) {
//     try {
//       const fullUrl = link.startsWith('http') ? link : `${baseUrl}${link}`;
//       const result = await smartFetch(fullUrl);

//       const $p = cheerio.load(result.html);
//       $p('script, style').remove();

//       const text = $p('body').text().replace(/\s+/g, ' ').trim();

//       if (text.length > 100) {
//         combined += ' ' + text;
//       }

//     } catch {}
//   }

//   return combined;
// }

// // ---------------- MAIN CONTROLLER ----------------
// async function runAudit(req, res) {
//   const { url } = req.body;

//   if (!url) return res.status(400).json({ error: 'URL required' });

//   let targetUrl;

//   try {
//     targetUrl = new URL(/^https?:\/\//.test(url) ? url : `https://${url}`);
//   } catch {
//     return res.status(400).json({ error: 'Invalid URL' });
//   }

//   try {
//     console.log('[Audit] Start:', targetUrl.href);

//     const { html, headers, finalUrl } = await smartFetch(targetUrl.href);

//     // 🚨 BLOCKED CASE HANDLE
//     if (!html || html.length < 1000) {
//       return res.json({
//         success: false,
//         message: 'Website blocked automated scanning',
//         manualRequired: true
//       });
//     }

//     const extractedData = extractData(html, finalUrl, headers);

//     const privacyText = await fetchPrivacyPages(html, targetUrl.origin);
//     extractedData.text += ' ' + privacyText;
//     extractedData.html += ' ' + privacyText;

//     const checks = runChecks(extractedData);
//     const { overallScore, overallStatus, summary } = calculateOverall(checks);

//     const auditResult = {
//       url: targetUrl.href,
//       domain: extractedData.domain,
//       pageTitle: extractedData.pageTitle,
//       scanDate: new Date(),
//       overallScore,
//       overallStatus,
//       checks,
//       summary,
//       pageText: extractedData.text.slice(0, 50000),
//     };

//     try {
//       const saved = new Audit(auditResult);
//       await saved.save();
//       auditResult._id = saved._id;
//     } catch {}

//     console.log('[Audit] Done:', overallScore);

//     return res.json({ success: true, audit: auditResult });

//   } catch (err) {
//     console.error('[Audit] Error:', err.message);

//     return res.status(500).json({
//       error: 'Audit failed',
//       details: err.message
//     });
//   }
// }

// module.exports = { runAudit };

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const dns = require('dns').promises;

puppeteer.use(StealthPlugin());

const { extractData, runChecks, calculateOverall } = require('../services/dpdpAnalyzer');
const Audit = require('../models/Audit');

// ---------------- USER AGENTS ----------------
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0 Safari/537.36'
];

const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ---------------- URL VALIDATION ----------------
async function validateUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  let url = inputUrl.trim();

  // add https if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  const hostname = parsed.hostname;

  // must contain dot
  if (!hostname.includes('.')) {
    return { valid: false, error: 'Invalid domain name' };
  }

  // block local/private IPs
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    return { valid: false, error: 'Local or private URLs not allowed' };
  }

  // only http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP/HTTPS URLs allowed' };
  }

  // 🔥 DNS check (MOST IMPORTANT)
  try {
    await dns.lookup(hostname);
  } catch {
    return { valid: false, error: 'Domain does not exist' };
  }

  return { valid: true, url: parsed.href };
}

// ---------------- BROWSER REUSE ----------------
let browser;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
  }
  return browser;
}

// ---------------- PUPPETEER FETCH ----------------
async function fetchWithPuppeteer(url) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(randomUA());

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    }).catch(() => console.log('[Puppeteer] timeout — continuing'));

    await new Promise(res => setTimeout(res, 5000));

    const html = await page.content();
    const finalUrl = page.url();

    console.log('[Puppeteer] HTML length:', html.length);

    return { html, headers: {}, finalUrl };

  } catch (err) {
    console.log('[Puppeteer] Error:', err.message);
    return { html: '', headers: {}, finalUrl: url };
  } finally {
    await page.close();
  }
}

// ---------------- AXIOS FETCH ----------------
async function fetchWithAxios(url) {
  const resp = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'text/html'
    },
    validateStatus: s => s < 500
  });

  return {
    html: resp.data,
    headers: resp.headers,
    finalUrl: url
  };
}

// ---------------- DETECTORS ----------------
function isBlocked(html) {
  return (
    html.includes('cf-browser-verification') ||
    html.includes('Checking your browser') ||
    html.includes('Enable JavaScript') ||
    html.length < 1200
  );
}

function isJsHeavy(html) {
  return html.length < 6000 || !html.includes('<p');
}

// ---------------- SMART FETCH ----------------
async function smartFetch(url) {
  try {
    let result = await fetchWithAxios(url);

    if (isBlocked(result.html) || isJsHeavy(result.html)) {
      console.log('[Fetch] Switching to Puppeteer');
      result = await fetchWithPuppeteer(url);
    }

    return result;

  } catch {
    console.log('[Fetch] Axios failed → Puppeteer');
    return await fetchWithPuppeteer(url);
  }
}

// ---------------- PRIVACY PAGE DETECTION ----------------
async function fetchPrivacyPages(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = $('a[href]').map((i, el) => $(el).attr('href')).get();

  const privacyLinks = links
    .filter(l => l && /privacy|policy|data/i.test(l))
    .slice(0, 3);

  let combined = '';

  for (const link of privacyLinks) {
    try {
      const fullUrl = link.startsWith('http') ? link : `${baseUrl}${link}`;
      const result = await smartFetch(fullUrl);

      const $p = cheerio.load(result.html);
      $p('script, style').remove();

      const text = $p('body').text().replace(/\s+/g, ' ').trim();

      if (text.length > 100) {
        combined += ' ' + text;
      }

    } catch {}
  }

  return combined;
}

// ---------------- MAIN CONTROLLER ----------------
async function runAudit(req, res) {
  const { url } = req.body;

  // 🔥 VALIDATION (ASYNC)
  const { valid, url: cleanUrl, error } = await validateUrl(url);

  if (!valid) {
    return res.status(400).json({ error });
  }

  const targetUrl = new URL(cleanUrl);

  try {
    console.log('[Audit] Start:', targetUrl.href);

    const { html, headers, finalUrl } = await smartFetch(targetUrl.href);

    if (!html || html.length < 1000) {
      return res.json({
        success: false,
        message: 'Website blocked automated scanning',
        manualRequired: true
      });
    }

    const extractedData = extractData(html, finalUrl, headers);

    const privacyText = await fetchPrivacyPages(html, targetUrl.origin);
    extractedData.text += ' ' + privacyText;
    extractedData.html += ' ' + privacyText;

    const checks = runChecks(extractedData);
    const { overallScore, overallStatus, summary } = calculateOverall(checks);

    const auditResult = {
      url: targetUrl.href,
      domain: extractedData.domain,
      pageTitle: extractedData.pageTitle,
      scanDate: new Date(),
      overallScore,
      overallStatus,
      checks,
      summary,
      pageText: extractedData.text.slice(0, 50000),
    };

    try {
      const saved = new Audit(auditResult);
      await saved.save();
      auditResult._id = saved._id;
    } catch {}

    console.log('[Audit] Done:', overallScore);

    return res.json({ success: true, audit: auditResult });

  } catch (err) {
    console.error('[Audit] Error:', err.message);

    return res.status(500).json({
      error: 'Audit failed',
      details: err.message
    });
  }
}

module.exports = { runAudit };