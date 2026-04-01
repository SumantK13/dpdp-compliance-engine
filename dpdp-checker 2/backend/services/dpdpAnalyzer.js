// /**
//  * DPDP Act 2023 Compliance Analyzer
//  * Checks websites against India's Digital Personal Data Protection Act, 2023
//  */

// const DPDP_CHECKS = [

//   {
//     id: 'consent_mechanism',
//     law: 'Section 6 - Consent',
//     section: 'Valid Consent Mechanism',
//     description: 'Website must obtain free, specific, informed, unconditional and unambiguous consent',
//     check: (data) => {
//       const { html, text } = data;
//       const signals = {
//         hasCookieBanner: /cookie\s*(consent|notice|banner|policy|accept|reject)/i.test(html),
//         hasConsentForm: /consent\s*form|i\s*agree|i\s*accept/i.test(html),
//         hasCheckbox: /<input[^>]*type\s*=\s*["']checkbox["'][^>]*>/i.test(html),
//         hasRejectOption: /reject\s*(all|cookies)?|decline|do\s*not\s*accept/i.test(html),
//         hasGranularOptions: /manage\s*(preferences|settings|cookies)|customize\s*cookies/i.test(html),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 4) return { status: 'pass', score };
//       if (passCount >= 2) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Add a cookie consent banner with three clear options: "Accept All", "Reject All", and "Manage Preferences". Example banner text: "We use cookies to improve your experience. [Accept All] [Reject All] [Manage Preferences]". Use a free library like cookieconsent.js or Osano. Store the user's choice in localStorage and check it on every page load before firing any tracking scripts. Under DPDP Act §6, consent must be freely given — pre-ticked boxes or hiding the Reject button are not valid consent.`
//   },

//   {
//     id: 'privacy_notice',
//     law: 'Section 5 - Notice',
//     section: 'Privacy Notice / Policy',
//     description: 'Data fiduciary must provide notice before or at the time of collecting personal data',
//     check: (data) => {
//       const { html, links, text } = data;
//       const signals = {
//         hasPrivacyPolicy: links.some(l => /privacy.?policy|privacy.?notice|data.?protection/i.test(l)),
//         hasPrivacyLink: /privacy\s*policy|privacy\s*notice/i.test(html),
//         mentionsDataTypes: /personal\s*data|sensitive\s*data|information\s*we\s*collect/i.test(text),
//         mentionsPurpose: /purpose\s*of\s*collection|why\s*we\s*collect|use\s*of\s*data/i.test(text),
//         mentionsRetention: /data\s*retention|retention\s*period|how\s*long\s*we\s*keep/i.test(text),
//         hasLastUpdated: /last\s*updated|last\s*modified|effective\s*date/i.test(text),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 5) return { status: 'pass', score };
//       if (passCount >= 3) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Create a /privacy-policy page that covers all 6 required elements: (1) What data you collect — e.g. "name, email, phone number, device ID, location". (2) Why you collect it — e.g. "to process orders, send OTPs, detect fraud". (3) How long you keep it — e.g. "account data for 3 years after last login". (4) Who you share it with — e.g. "payment gateway Razorpay, logistics partner Delhivery, analytics tool Google Analytics". (5) Your users' rights — access, correction, erasure, grievance. (6) "Last Updated: DD/MM/YYYY" at the top. Add the privacy policy link in your website footer on every page.`
//   },

//   {
//     id: 'right_to_access',
//     law: 'Section 11 - Right of Access',
//     section: 'Right to Access Personal Data',
//     description: 'Data principal has right to obtain summary of personal data and processing activities',
//     check: (data) => {
//       const { html, text } = data;
//       const signals = {
//         mentionsAccessRight: /right\s*to\s*access|access\s*your\s*data|view\s*your\s*(personal\s*)?data/i.test(text),
//         hasDataRequest: /data\s*request|request\s*(your\s*)?data|download\s*(your\s*)?data/i.test(html),
//         hasMyDataSection: /my\s*data|your\s*data|account\s*data/i.test(html),
//         mentionsDSAR: /DSAR|data\s*subject\s*access\s*request|access\s*request/i.test(text),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 1) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Add a "My Data" section inside your user account settings page with: (1) A "Download My Data" button — this should trigger an email within 72 hours with a JSON or CSV export of everything stored about that user (profile, orders, addresses, activity logs). (2) A contact option at privacy@yourdomain.com for manual access requests. (3) State in your privacy policy: "You can request a copy of your personal data by emailing privacy@yourcompany.com. We will respond within 7 business days." Reference example: Zomato's account page has "Download your data" under Privacy Settings → Data & Privacy.`
//   },

//   {
//     id: 'right_to_erasure',
//     law: 'Section 12 - Right to Correction & Erasure',
//     section: 'Right to Correction and Erasure',
//     description: 'Data principal has right to correct inaccurate/misleading data and right to erasure',
//     check: (data) => {
//       const { html, text } = data;
//       const signals = {
//         mentionsErasure: /right\s*to\s*(erasure|deletion|be\s*forgotten)|delete\s*(your\s*)?account|erase\s*(my|your)\s*data/i.test(text),
//         hasDeleteOption: /delete\s*account|close\s*account|deactivate\s*account/i.test(html),
//         mentionsCorrection: /correct(ion)?\s*(of|your)\s*data|update\s*your\s*(personal\s*)?data/i.test(text),
//         hasEditProfile: /edit\s*profile|update\s*profile|manage\s*(your\s*)?account/i.test(html),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 1) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Add an "Delete My Account" button in account settings. Show a confirmation dialog: "Deleting your account will permanently remove your profile, saved addresses, and order history within 30 days. GST invoices will be retained for 7 years as required by law. [Cancel] [Delete Account]". After deletion, send a confirmation email. Also add an "Edit Profile" page where users can correct their name, phone, and address at any time. Document both rights in your privacy policy under a "Your Rights" section.`
//   },

//   {
//     id: 'grievance_redressal',
//     law: 'Section 13 - Grievance Redressal',
//     section: 'Grievance Officer & Redressal Mechanism',
//     description: 'Data fiduciary must have a grievance redressal mechanism and designate a contact person',
//     check: (data) => {
//       const { html, text } = data;
//       const signals = {
//         hasGrievanceOfficer: /grievance\s*officer|data\s*protection\s*officer|DPO|privacy\s*officer/i.test(text),
//         hasContactForPrivacy: /privacy\s*contact|contact\s*us.*privacy|data\s*protection\s*contact/i.test(html),
//         hasComplaintMechanism: /complaint|grievance|raise\s*a\s*(concern|complaint)/i.test(text),
//         hasEmailForPrivacy: /privacy@|dpo@|data(protection|privacy)@/i.test(html),
//         hasResponseTime: /respond\s*within|response\s*time|\d+\s*(business\s*)?days/i.test(text),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 4) return { status: 'pass', score };
//       if (passCount >= 2) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Appoint a Grievance Officer (can be an existing employee) and publish their details on your website. Required information: Full Name, Designation (e.g. "Data Protection Officer"), Email (e.g. grievance@yourcompany.com), Phone number, and Response timeline. Example footer or contact page text: "For data privacy complaints — Priya Sharma, Data Protection Officer, dpo@company.com, +91-98XXXXXXXX. We respond within 7 business days." This is a mandatory legal requirement under DPDP Act §13. Failure to appoint a Grievance Officer can result in penalties up to ₹10,000 per complaint.`
//   },

//   {
//     id: 'data_minimization',
//     law: 'Section 8(3) - Data Minimization',
//     section: 'Data Minimization & Purpose Limitation',
//     description: 'Collect only personal data necessary for the specified purpose',
//     check: (data) => {
//       const { html, text, forms } = data;
//       const signals = {
//         mentionsPurposeLimitation: /purpose\s*limitation|data\s*minimiz(ation|ation)|collect\s*only\s*what/i.test(text),
//         noExcessiveFields: forms.every(f => f.fields <= 10),
//         mentionsNecessity: /necessary\s*(personal\s*)?data|limited\s*to\s*what\s*is\s*necessary/i.test(text),
//         hasOptionalFields: /optional|required\s*field|\*\s*required/i.test(html),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 2) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Audit every form on your site. For each field ask: "Do we actually use this data, and when?" Remove fields you don't use. Mark optional fields clearly with "(optional)" text or grey placeholder. Example: If you only need email for login, don't collect phone number at signup — ask for it later only when placing a first order. Add a small tooltip icon next to each field explaining why it is needed, e.g. "📍 Address — used only to calculate delivery charges". In your privacy policy, add a table: Data Field | Purpose | Required? | Retention.`
//   },

//   {
//     id: 'childrens_data',
//     law: "Section 9 - Children's Data",
//     section: "Protection of Children's Data",
//     description: "Prohibition on processing children's data without verifiable parental consent; no behavioural targeting",
//     check: (data) => {
//       const { html, text } = data;
//       const isForChildren = /for\s*kids|children|age\s*13|under\s*18|students|school/i.test(text);
//       const signals = {
//         hasAgeVerification: /age\s*ver(ify|ification)|are\s*you\s*18|date\s*of\s*birth|age\s*gate/i.test(html),
//         hasParentalConsent: /parental\s*consent|parent\s*or\s*guardian|guardian\s*consent/i.test(text),
//         mentionsChildrenPolicy: /children.?s?\s*privacy|minor|COPPA|DPDP.*children/i.test(text),
//         noChildTargeting: !/targeted\s*ads?\s*for\s*children|child.?directed\s*advertising/i.test(text),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length, isForChildren };
//     },
//     evaluate: (result) => {
//       const { passCount, total, isForChildren } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (!isForChildren && passCount >= 2) return { status: 'pass', score: 80 };
//       if (isForChildren && passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 2) return { status: 'warn', score };
//       return { status: isForChildren ? 'fail' : 'warn', score };
//     },
//     recommendation: `Add an age gate on your signup page. Example: After entering email, show a step: "Are you 18 years or older? [Yes, I am 18+] [No]". If the user selects No, show: "Please ask a parent or guardian to create an account and add you as a family member." For platforms targeting students or children under 18: (1) Send a consent email to the parent's email address before activating the account. (2) Block behavioural ad targeting for under-18 users. (3) Do not collect location data from minors. (4) Add a section in your privacy policy titled "Children's Privacy" stating your age minimum and parental consent process.`
//   },

//   {
//     id: 'data_retention',
//     law: 'Section 8(7) - Data Retention',
//     section: 'Data Retention & Deletion Policy',
//     description: 'Personal data must be erased once purpose is served or consent is withdrawn',
//     check: (data) => {
//       const { text } = data;
//       const signals = {
//         mentionsRetentionPeriod: /retain\s*(data|information)\s*for|retention\s*period|keep\s*(data|information)\s*for/i.test(text),
//         mentionsDeletion: /delete\s*(data|account|personal|information)|erasure\s*of\s*data/i.test(text),
//         hasSpecificPeriod: /\d+\s*(days|months|years)\s*(after|of|from)/i.test(text),
//         mentionsWithdrawal: /withdraw\s*consent|revoke\s*consent|opt.?out/i.test(text),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 2) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Add a Retention Schedule table to your privacy policy. Example table:

//   | Data Type              | Retention Period                  | Reason                      |
//   | Account profile        | 3 years after account deletion    | Legal compliance             |
//   | Transaction records    | 7 years from transaction date     | GST Act requirement          |
//   | Support tickets        | 1 year after ticket closure       | Service quality improvement  |
//   | Marketing preferences  | Until user unsubscribes           | Consent-based                |
//   | App usage logs         | 90 days                           | Security & fraud detection   |

//   Then implement a monthly cron job in your backend that queries for records past their retention date and deletes or anonymises them automatically.`
//   },

//   {
//     id: 'data_security',
//     law: 'Section 8(5) - Data Security',
//     section: 'Security Safeguards',
//     description: 'Data fiduciary must protect personal data using reasonable security safeguards',
//     check: (data) => {
//       const { isHttps, headers, html, text } = data;
//       const signals = {
//         usesHttps: isHttps,
//         hasSecurityPolicy: /security\s*policy|information\s*security|data\s*security/i.test(text),
//         mentionsEncryption: /encrypt(ion|ed)|SSL|TLS|secure\s*socket/i.test(text),
//         hasHSTSHeader: !!(headers && headers['strict-transport-security']),
//         mentionsBreachNotification: /data\s*breach|breach\s*notification|security\s*incident/i.test(text),
//         noMixedContent: !/<img[^>]*src\s*=\s*["']http:\/\//i.test(html),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 5) return { status: 'pass', score };
//       if (passCount >= 3) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Security checklist to implement immediately: (1) Enable HTTPS — get a free SSL certificate from Let's Encrypt (certbot). (2) Add HSTS header in your server config: Strict-Transport-Security: max-age=31536000; includeSubDomains. (3) In your privacy policy add: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption." (4) Add a security contact: security@yourdomain.com. (5) Write a breach response plan — under DPDP Act §8, you must notify the Data Protection Board and affected users within 72 hours of discovering a breach. (6) Run your site through securityheaders.com and fix any missing headers.`
//   },

//   {
//     id: 'cross_border_transfer',
//     law: 'Section 16 - Cross-Border Transfer',
//     section: 'Cross-Border Data Transfers',
//     description: 'Transfer of personal data outside India must comply with government-notified conditions',
//     check: (data) => {
//       const { text, html } = data;
//       const signals = {
//         mentionsTransfer: /transfer\s*(of\s*)?data|cross.?border|international\s*transfer/i.test(text),
//         mentionsCountries: /countries\s*outside|outside\s*India|third\s*countries/i.test(text),
//         hasTransferSafeguards: /standard\s*contractual\s*clauses?|SCC|adequate\s*protection|binding\s*corporate\s*rules?/i.test(text),
//         mentionsIndiaLaw: /India|DPDP|Indian\s*law|Personal\s*Data\s*Protection/i.test(text),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 1) return { status: 'warn', score };
//       return { status: 'na', score: 50 };
//     },
//     recommendation: `If you use any of these services, you are transferring data outside India: AWS US/EU regions, Google Cloud US, Stripe, Mailchimp, Mixpanel, Intercom, Zendesk, HubSpot, Salesforce. Action required: (1) List all third-party services in your privacy policy with their country. Example: "We use Razorpay (India), AWS Mumbai ap-south-1 (India), Google Analytics (USA), Mailchimp (USA)." (2) For non-India services, add: "These transfers are protected by Standard Contractual Clauses." (3) Where possible, switch to India-region hosting — prefer AWS ap-south-1 (Mumbai) or Google Cloud asia-south1 to keep user data within India and simplify DPDP compliance.`
//   },

//   {
//     id: 'lawful_processing',
//     law: 'Section 4 - Lawful Processing',
//     section: 'Lawful Basis for Processing',
//     description: 'Personal data may only be processed for lawful purposes with consent or legitimate use',
//     check: (data) => {
//       const { text, html } = data;
//       const signals = {
//         mentionsLegalBasis: /legal\s*basis|lawful\s*basis|legitimate\s*(interest|purpose)/i.test(text),
//         listsPurposes: /purposes?\s*(of|for)\s*(processing|collection)|we\s*use\s*(your\s*)?data/i.test(text),
//         mentionsConsent: /with\s*your\s*consent|based\s*on\s*your\s*consent/i.test(text),
//         hasTermsOfService: /terms\s*(of\s*service|and\s*conditions)|ToS|user\s*agreement/i.test(html),
//       };
//       const passCount = Object.values(signals).filter(Boolean).length;
//       return { signals, passCount, total: Object.keys(signals).length };
//     },
//     evaluate: (result) => {
//       const { passCount, total } = result;
//       const score = Math.round((passCount / total) * 100);
//       if (passCount >= 3) return { status: 'pass', score };
//       if (passCount >= 2) return { status: 'warn', score };
//       return { status: 'fail', score };
//     },
//     recommendation: `Add a "Legal Basis for Processing" section to your privacy policy with a clear table. Example:

//   | Activity                        | Legal Basis              | Details                                      |
//   | Sending order confirmations     | Contract performance     | Necessary to fulfil your purchase            |
//   | Sending promotional emails      | Consent                  | You opted in; unsubscribe any time           |
//   | Fraud & abuse detection         | Legitimate interest       | Protecting platform security                 |
//   | Storing GST invoices            | Legal obligation          | Required by GST Act for 7 years              |
//   | Personalising recommendations   | Consent                  | Based on your browsing with your permission  |

//   For any consent-based processing, keep a server-side log of: user ID, consent timestamp, consent version, and IP address. This log is your proof of compliance if ever audited.`
//   }

// ];

// /**
//  * Extract structured data from fetched HTML
//  */
// function extractData(html, url, headers = {}) {
//   const cheerio = require('cheerio');
//   const $ = cheerio.load(html);

//   $('script, style, noscript').remove();
//   const text = $('body').text().replace(/\s+/g, ' ').trim();

//   const links = [];
//   $('a[href]').each((_, el) => {
//     const href = $(el).attr('href') || '';
//     links.push(href.toLowerCase());
//   });

//   const forms = [];
//   $('form').each((_, form) => {
//     const fields = $(form).find('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').length;
//     forms.push({ fields });
//   });

//   const cookies = html.includes('cookie') || html.includes('localStorage');
//   const parsedUrl = new URL(url);
//   const isHttps = parsedUrl.protocol === 'https:';

//   return {
//     html, text, links, forms, cookies, isHttps, headers,
//     pageTitle: $('title').text().trim() || parsedUrl.hostname,
//     domain: parsedUrl.hostname
//   };
// }

// /**
//  * Run all DPDP checks against extracted data
//  */
// function runChecks(extractedData) {
//   const results = [];

//   for (const checkDef of DPDP_CHECKS) {
//     try {
//       const raw = checkDef.check(extractedData);
//       const { status, score } = checkDef.evaluate(raw);

//       const evidence = [];
//       if (raw.signals) {
//         for (const [key, val] of Object.entries(raw.signals)) {
//           if (val === true) evidence.push(`✓ ${key.replace(/([A-Z])/g, ' $1').trim()}`);
//           else if (val === false) evidence.push(`✗ ${key.replace(/([A-Z])/g, ' $1').trim()}`);
//         }
//       }

//       results.push({
//         id: checkDef.id,
//         law: checkDef.law,
//         section: checkDef.section,
//         description: checkDef.description,
//         status,
//         score,
//         evidence,
//         recommendation: status !== 'pass' ? checkDef.recommendation : null,
//         details: `${raw.passCount ?? 0} of ${raw.total ?? 0} indicators found`
//       });
//     } catch (err) {
//       results.push({
//         id: checkDef.id,
//         law: checkDef.law,
//         section: checkDef.section,
//         status: 'na',
//         score: 0,
//         evidence: [],
//         details: 'Check could not be completed',
//         recommendation: null
//       });
//     }
//   }

//   return results;
// }

// /**
//  * Calculate overall compliance score
//  */
// function calculateOverall(checks) {
//   const scored = checks.filter(c => c.status !== 'na');
//   const totalScore = scored.reduce((acc, c) => acc + c.score, 0);
//   const overallScore = scored.length > 0 ? Math.round(totalScore / scored.length) : 0;

//   const summary = {
//     passed: checks.filter(c => c.status === 'pass').length,
//     failed: checks.filter(c => c.status === 'fail').length,
//     warnings: checks.filter(c => c.status === 'warn').length,
//     notApplicable: checks.filter(c => c.status === 'na').length
//   };

//   let overallStatus = 'non-compliant';
//   if (overallScore >= 70) overallStatus = 'compliant';
//   else if (overallScore >= 40) overallStatus = 'partial';

//   return { overallScore, overallStatus, summary };
// }

// module.exports = { extractData, runChecks, calculateOverall, DPDP_CHECKS };

const DPDP_CHECKS = [
  {
    id: 'consent_mechanism',
    law: 'Section 6 - Consent',
    section: 'Valid Consent Mechanism',
    description: 'Website must obtain free, specific, informed, unconditional and unambiguous consent',
    check: (data) => {
      const { html } = data;
      const signals = {
        hasCookieBanner: /cookie\s*(consent|notice|banner|policy|accept|reject)/i.test(html),
        hasConsentForm: /consent\s*form|i\s*agree|i\s*accept/i.test(html),
        hasCheckbox: /<input[^>]*type\s*=\s*["']checkbox["'][^>]*>/i.test(html),
        hasRejectOption: /reject\s*(all|cookies)?|decline|do\s*not\s*accept/i.test(html),
        hasGranularOptions: /manage\s*(preferences|settings|cookies)|customize\s*cookies/i.test(html),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 4) return { status: 'pass', score: 90 };
      if (passCount >= 3) return { status: 'warn', score: 60 };
      if (passCount >= 2) return { status: 'warn', score: 35 };
      return { status: 'fail', score: 10 };
    },
  },
  {
    id: 'privacy_notice',
    law: 'Section 5 - Notice',
    section: 'Privacy Notice / Policy',
    description: 'Data fiduciary must provide notice before or at the time of collecting personal data',
    check: (data) => {
      const { html, links, text } = data;
      const signals = {
        hasPrivacyPolicy: links.some(l => /privacy.?policy|privacy.?notice|data.?protection/i.test(l)),
        hasPrivacyLink: /privacy\s*policy|privacy\s*notice/i.test(html),
        mentionsDataTypes: /personal\s*data|sensitive\s*data|information\s*we\s*collect/i.test(text),
        mentionsPurpose: /purpose\s*of\s*collection|why\s*we\s*collect|use\s*of\s*data/i.test(text),
        mentionsRetention: /data\s*retention|retention\s*period|how\s*long\s*we\s*keep/i.test(text),
        hasLastUpdated: /last\s*updated|last\s*modified|effective\s*date/i.test(text),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 5) return { status: 'pass', score: 90 };
      if (passCount >= 4) return { status: 'warn', score: 65 };
      if (passCount >= 3) return { status: 'warn', score: 40 };
      return { status: 'fail', score: 15 };
    },
  },
  {
    id: 'right_to_access',
    law: 'Section 11 - Right of Access',
    section: 'Right to Access Personal Data',
    description: 'Data principal has right to obtain summary of personal data and processing activities',
    check: (data) => {
      const { html, text } = data;
      const signals = {
        mentionsAccessRight: /right\s*to\s*access|access\s*your\s*data|view\s*your\s*(personal\s*)?data/i.test(text),
        hasDataRequest: /data\s*request|request\s*(your\s*)?data|download\s*(your\s*)?data/i.test(html),
        hasMyDataSection: /my\s*data|your\s*data|account\s*data/i.test(html),
        mentionsDSAR: /DSAR|data\s*subject\s*access\s*request|access\s*request/i.test(text),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 3) return { status: 'pass', score: 85 };
      if (passCount >= 2) return { status: 'warn', score: 50 };
      if (passCount >= 1) return { status: 'warn', score: 25 };
      return { status: 'fail', score: 5 };
    },
  },
  {
    id: 'right_to_erasure',
    law: 'Section 12 - Right to Correction & Erasure',
    section: 'Right to Correction and Erasure',
    description: 'Data principal has right to correct inaccurate/misleading data and right to erasure',
    check: (data) => {
      const { html, text } = data;
      const signals = {
        mentionsErasure: /right\s*to\s*(erasure|deletion|be\s*forgotten)|delete\s*(your\s*)?account|erase\s*(my|your)\s*data/i.test(text),
        hasDeleteOption: /delete\s*account|close\s*account|deactivate\s*account/i.test(html),
        mentionsCorrection: /correct(ion)?\s*(of|your)\s*data|update\s*your\s*(personal\s*)?data/i.test(text),
        hasEditProfile: /edit\s*profile|update\s*profile|manage\s*(your\s*)?account/i.test(html),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 3) return { status: 'pass', score: 85 };
      if (passCount >= 2) return { status: 'warn', score: 50 };
      if (passCount >= 1) return { status: 'warn', score: 25 };
      return { status: 'fail', score: 5 };
    },
  },
  {
    id: 'grievance_redressal',
    law: 'Section 13 - Grievance Redressal',
    section: 'Grievance Officer & Redressal Mechanism',
    description: 'Data fiduciary must have a grievance redressal mechanism and designate a contact person',
    check: (data) => {
      const { html, text } = data;
      const signals = {
        hasGrievanceOfficer: /grievance\s*officer|data\s*protection\s*officer|DPO|privacy\s*officer/i.test(text),
        hasContactForPrivacy: /privacy\s*contact|contact\s*us.*privacy|data\s*protection\s*contact/i.test(html),
        hasComplaintMechanism: /complaint|grievance|raise\s*a\s*(concern|complaint)/i.test(text),
        hasEmailForPrivacy: /privacy@|dpo@|data(protection|privacy)@/i.test(html),
        hasResponseTime: /respond\s*within|response\s*time|\d+\s*(business\s*)?days/i.test(text),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 4) return { status: 'pass', score: 90 };
      if (passCount >= 3) return { status: 'warn', score: 60 };
      if (passCount >= 2) return { status: 'warn', score: 35 };
      return { status: 'fail', score: 10 };
    },
  },
  {
    id: 'data_minimization',
    law: 'Section 8(3) - Data Minimization',
    section: 'Data Minimization & Purpose Limitation',
    description: 'Collect only personal data necessary for the specified purpose',
    check: (data) => {
      const { html, text, forms } = data;
      const signals = {
        mentionsPurposeLimitation: /purpose\s*limitation|data\s*minimiz(ation|ation)|collect\s*only\s*what/i.test(text),
        noExcessiveFields: forms.length === 0 || forms.every(f => f.fields <= 10),
        mentionsNecessity: /necessary\s*(personal\s*)?data|limited\s*to\s*what\s*is\s*necessary/i.test(text),
        hasOptionalFields: /optional|required\s*field|\*\s*required/i.test(html),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 3) return { status: 'pass', score: 80 };
      if (passCount >= 2) return { status: 'warn', score: 50 };
      if (passCount >= 1) return { status: 'warn', score: 25 };
      return { status: 'fail', score: 10 };
    },
  },
  {
    id: 'childrens_data',
    law: "Section 9 - Children's Data",
    section: "Protection of Children's Data",
    description: "Prohibition on processing children's data without verifiable parental consent; no behavioural targeting",
    check: (data) => {
      const { html, text } = data;
      const isForChildren = /for\s*kids|children|age\s*13|under\s*18|students|school/i.test(text);
      const signals = {
        hasAgeVerification: /age\s*ver(ify|ification)|are\s*you\s*18|date\s*of\s*birth|age\s*gate/i.test(html),
        hasParentalConsent: /parental\s*consent|parent\s*or\s*guardian|guardian\s*consent/i.test(text),
        mentionsChildrenPolicy: /children.?s?\s*privacy|minor|COPPA|DPDP.*children/i.test(text),
        noChildTargeting: !/targeted\s*ads?\s*for\s*children|child.?directed\s*advertising/i.test(text),
        isForChildren,
      };
      const passCount = ['hasAgeVerification','hasParentalConsent','mentionsChildrenPolicy','noChildTargeting'].filter(k => signals[k]).length;
      return { signals, passCount, total: 4, isForChildren };
    },
    evaluate: (result) => {
      const { passCount, isForChildren } = result;
      if (!isForChildren) return { status: 'pass', score: 75 };
      if (passCount >= 3) return { status: 'pass', score: 85 };
      if (passCount >= 2) return { status: 'warn', score: 50 };
      return { status: 'fail', score: 10 };
    },
  },
  {
    id: 'data_retention',
    law: 'Section 8(7) - Data Retention',
    section: 'Data Retention & Deletion Policy',
    description: 'Personal data must be erased once purpose is served or consent is withdrawn',
    check: (data) => {
      const { text } = data;
      const signals = {
        mentionsRetentionPeriod: /retain\s*(data|information)\s*for|retention\s*period|keep\s*(data|information)\s*for/i.test(text),
        mentionsDeletion: /delete\s*(data|account|personal|information)|erasure\s*of\s*data/i.test(text),
        hasSpecificPeriod: /\d+\s*(days|months|years)\s*(after|of|from)/i.test(text),
        mentionsWithdrawal: /withdraw\s*consent|revoke\s*consent|opt.?out/i.test(text),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 3) return { status: 'pass', score: 85 };
      if (passCount >= 2) return { status: 'warn', score: 55 };
      if (passCount >= 1) return { status: 'warn', score: 25 };
      return { status: 'fail', score: 5 };
    },
  },
  {
    id: 'data_security',
    law: 'Section 8(5) - Data Security',
    section: 'Security Safeguards',
    description: 'Data fiduciary must protect personal data using reasonable security safeguards',
    check: (data) => {
      const { isHttps, headers, html, text } = data;
      const signals = {
        usesHttps: isHttps,
        hasSecurityPolicy: /security\s*policy|information\s*security|data\s*security/i.test(text),
        mentionsEncryption: /encrypt(ion|ed)|SSL|TLS|secure\s*socket/i.test(text),
        hasHSTSHeader: !!(headers && headers['strict-transport-security']),
        mentionsBreachNotification: /data\s*breach|breach\s*notification|security\s*incident/i.test(text),
        noMixedContent: !/<img[^>]*src\s*=\s*["']http:\/\//i.test(html),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 5) return { status: 'pass', score: 90 };
      if (passCount >= 4) return { status: 'warn', score: 65 };
      if (passCount >= 3) return { status: 'warn', score: 40 };
      return { status: 'fail', score: 15 };
    },
  },
  {
    id: 'cross_border_transfer',
    law: 'Section 16 - Cross-Border Transfer',
    section: 'Cross-Border Data Transfers',
    description: 'Transfer of personal data outside India must comply with government-notified conditions',
    check: (data) => {
      const { text } = data;
      const signals = {
        mentionsTransfer: /transfer\s*(of\s*)?data|cross.?border|international\s*transfer/i.test(text),
        mentionsCountries: /countries\s*outside|outside\s*India|third\s*countries/i.test(text),
        hasTransferSafeguards: /standard\s*contractual\s*clauses?|SCC|adequate\s*protection|binding\s*corporate\s*rules?/i.test(text),
        mentionsIndiaLaw: /India|DPDP|Indian\s*law|Personal\s*Data\s*Protection/i.test(text),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 3) return { status: 'pass', score: 80 };
      if (passCount >= 2) return { status: 'warn', score: 55 };
      if (passCount >= 1) return { status: 'warn', score: 30 };
      return { status: 'na', score: 50 };
    },
  },
  {
    id: 'lawful_processing',
    law: 'Section 4 - Lawful Processing',
    section: 'Lawful Basis for Processing',
    description: 'Personal data may only be processed for lawful purposes with consent or legitimate use',
    check: (data) => {
      const { text, html } = data;
      const signals = {
        mentionsLegalBasis: /legal\s*basis|lawful\s*basis|legitimate\s*(interest|purpose)/i.test(text),
        listsPurposes: /purposes?\s*(of|for)\s*(processing|collection)|we\s*use\s*(your\s*)?data/i.test(text),
        mentionsConsent: /with\s*your\s*consent|based\s*on\s*your\s*consent/i.test(text),
        hasTermsOfService: /terms\s*(of\s*service|and\s*conditions)|ToS|user\s*agreement/i.test(html),
      };
      const passCount = Object.values(signals).filter(Boolean).length;
      return { signals, passCount, total: Object.keys(signals).length };
    },
    evaluate: (result) => {
      const { passCount } = result;
      if (passCount >= 3) return { status: 'pass', score: 85 };
      if (passCount >= 2) return { status: 'warn', score: 55 };
      if (passCount >= 1) return { status: 'warn', score: 25 };
      return { status: 'fail', score: 5 };
    },
  },
];

function getRecommendation(id, signals, status) {
  if (status === 'pass') return null;
  switch (id) {
    case 'consent_mechanism': {
      if (!signals.hasCookieBanner)
        return `No cookie consent banner found at all. Add a banner that appears before setting any non-essential cookies with equal "Accept All" and "Reject All" buttons. Use cookieconsent.js for a quick implementation.`;
      if (signals.hasCookieBanner && !signals.hasRejectOption)
        return `Cookie banner detected but no Reject option found. Under DPDP Section 6(4), rejecting consent must be as easy as giving it. Add a clearly visible "Reject All" button next to "Accept All" — same size and color weight.`;
      if (!signals.hasGranularOptions)
        return `Consent banner exists but no granular controls. Add a "Manage Preferences" option so users can accept/reject each cookie category (necessary, analytics, marketing) separately.`;
      if (!signals.hasCheckbox)
        return `Add explicit checkboxes per consent category so users actively choose rather than passively accepting a blanket action.`;
      return `Consent mechanism partially in place. Ensure consent is stored per-user and re-checked on every page load before firing any tracking scripts.`;
    }
    case 'privacy_notice': {
      if (!signals.hasPrivacyPolicy && !signals.hasPrivacyLink)
        return `No privacy policy found anywhere. This is the most basic DPDP requirement. Create a /privacy-policy page immediately and link it in your website footer on every page.`;
      if (!signals.mentionsDataTypes)
        return `Privacy policy found but does not specify what personal data is collected. Add a section listing exact data types: name, email, phone number, location, device ID, browser data.`;
      if (!signals.mentionsPurpose)
        return `Privacy policy does not explain why data is collected. Add a Purpose section — e.g. "Email — used to send order confirmations. Phone — used only for delivery coordination."`;
      if (!signals.mentionsRetention)
        return `No data retention period found. Add specific timeframes — e.g. "Account data kept for 3 years after last login. Transaction records retained for 7 years per GST Act."`;
      if (!signals.hasLastUpdated)
        return `Privacy policy has no Last Updated date. Add one at the very top to show users and regulators that the policy is actively maintained.`;
      return `Privacy policy mostly complete. Review against all 6 DPDP Section 5 requirements: data types, purpose, retention, third-party sharing, user rights, and contact details.`;
    }
    case 'right_to_access': {
      if (!signals.mentionsAccessRight && !signals.hasDataRequest && !signals.hasMyDataSection)
        return `No data access mechanism found. Add a "Download My Data" button in account settings that sends users a copy of all their stored data within 72 hours. Also add to your privacy policy: "Email privacy@yourcompany.com to request your data."`;
      if (!signals.hasDataRequest)
        return `Right to access mentioned in policy but no actual download or request mechanism in the UI. Implement a self-serve "Download My Data" feature in account settings.`;
      if (!signals.hasMyDataSection)
        return `Add a dedicated "My Data" or "Privacy Settings" section in the user account dashboard where users can see and manage their personal data.`;
      return `Data access mechanism partially in place. Ensure users receive their data within 72 hours in a readable format like JSON or CSV.`;
    }
    case 'right_to_erasure': {
      if (!signals.hasDeleteOption && !signals.mentionsErasure)
        return `No account deletion option found. Add a "Delete My Account" button in settings. On confirmation: remove all PII within 30 days, send a confirmation email, and retain only legally required records like GST invoices.`;
      if (!signals.hasDeleteOption && signals.mentionsErasure)
        return `Erasure right mentioned in policy but no actual delete button in the UI. Implement a self-serve account deletion flow in account settings.`;
      if (signals.hasDeleteOption && !signals.mentionsCorrection && !signals.hasEditProfile)
        return `Delete account exists but no correction mechanism found. Add an "Edit Profile" page — DPDP Section 12 requires both the right to correct and the right to erase data.`;
      return `Erasure and correction mechanisms partially in place. Document both rights clearly in your privacy policy under a "Your Rights" section.`;
    }
    case 'grievance_redressal': {
      if (!signals.hasGrievanceOfficer && !signals.hasEmailForPrivacy && !signals.hasComplaintMechanism)
        return `No Grievance Officer or privacy contact found. This is mandatory under DPDP Section 13. Publish in your footer and privacy policy: Name, title (Data Protection Officer), email (e.g. grievance@yourcompany.com), phone, and response timeline.`;
      if (!signals.hasGrievanceOfficer && signals.hasEmailForPrivacy)
        return `Privacy email found but no named Grievance Officer. DPDP Section 13 requires a designated person. Add: "Grievance Officer: [Full Name], [Designation], [Email], [Phone]" to your privacy policy.`;
      if (!signals.hasEmailForPrivacy)
        return `Grievance officer mentioned but no dedicated privacy email found. Add a specific email like grievance@yourcompany.com that is actively monitored.`;
      if (!signals.hasResponseTime)
        return `Grievance contact exists but no response timeline stated. Add a commitment like "We respond to all data privacy complaints within 7 business days."`;
      return `Grievance mechanism partially in place. Ensure the officer's full name, designation, email, phone, and response time are all published and kept up to date.`;
    }
    case 'data_minimization': {
      if (!signals.mentionsPurposeLimitation && !signals.mentionsNecessity)
        return `No data minimization policy found. Audit every form on your site — remove unused fields. Add to your privacy policy: "We collect only the minimum personal data necessary for the stated purpose."`;
      if (!signals.noExcessiveFields)
        return `One or more forms collect more than 10 fields — likely more data than necessary. Review each form and remove fields that are not essential for the stated purpose.`;
      if (!signals.hasOptionalFields)
        return `Forms do not distinguish required vs optional fields. Mark optional fields clearly with "(optional)" — users should know what is mandatory and what is voluntary.`;
      return `Data minimization partially addressed. Add a data inventory table to your privacy policy: Data Field | Purpose | Required? | Retention Period.`;
    }
    case 'childrens_data': {
      if (signals.isForChildren && !signals.hasAgeVerification && !signals.hasParentalConsent)
        return `This site appears to serve users under 18 but has no age verification or parental consent. DPDP Section 9 strictly prohibits processing children's data without verifiable parental consent. Add an age gate at signup and a parental consent email flow.`;
      if (!signals.hasAgeVerification)
        return `No age verification found. Add an age confirmation step at signup — "Are you 18 or older? [Yes] [No]". If No: "Please ask a parent or guardian to create an account."`;
      if (!signals.mentionsChildrenPolicy)
        return `No children's data policy found. Add a "Children's Privacy" section stating your minimum age requirement and how parental consent is obtained and verified.`;
      return `Children's data protection partially in place. Ensure parental consent is verifiable and behavioural tracking is disabled for under-18 accounts.`;
    }
    case 'data_retention': {
      if (!signals.mentionsRetentionPeriod && !signals.mentionsDeletion)
        return `No data retention policy found. Add a Retention Schedule to your privacy policy: Account data (3 years), Transaction records (7 years per GST Act), Support tickets (1 year), Marketing preferences (until unsubscribe), App logs (90 days).`;
      if (!signals.hasSpecificPeriod)
        return `Retention is mentioned but no specific timeframes found. Vague statements like "we keep data as long as necessary" do not satisfy DPDP Section 8(7). Replace with specific periods like "account data retained for 3 years after last login."`;
      if (!signals.mentionsDeletion)
        return `Retention periods stated but no deletion process described. Add: "Data is automatically deleted or anonymised after the retention period expires."`;
      if (!signals.mentionsWithdrawal)
        return `No mention of what happens when a user withdraws consent or closes their account. Add: "When you delete your account, your personal data is erased within 30 days except where legally required."`;
      return `Retention policy partially in place. Implement a monthly automated deletion process that removes records past their retention date.`;
    }
    case 'data_security': {
      if (!signals.usesHttps)
        return `This site is NOT using HTTPS — a critical security failure. All personal data is transmitted unencrypted. Get a free SSL certificate from Let's Encrypt (letsencrypt.org) immediately. This is the most urgent fix.`;
      if (!signals.hasHSTSHeader)
        return `HTTPS is in use but HSTS header is missing. Add to your server config: Strict-Transport-Security: max-age=31536000; includeSubDomains. This forces browsers to always use HTTPS.`;
      if (!signals.mentionsEncryption)
        return `No encryption disclosure found. Add to privacy policy: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption."`;
      if (!signals.mentionsBreachNotification)
        return `No breach notification policy found. DPDP Section 8(5) requires notifying the Data Protection Board and affected users within 72 hours of a breach. Document your breach response plan.`;
      return `Security safeguards partially in place. Run your site through securityheaders.com to identify and fix missing HTTP security headers.`;
    }
    case 'cross_border_transfer': {
      if (!signals.mentionsTransfer && !signals.mentionsCountries)
        return `No cross-border transfer disclosure found. If you use AWS US, Google Cloud, Stripe, Mailchimp, or any non-India service, you are transferring data internationally. List all such services in your privacy policy with their country.`;
      if (signals.mentionsTransfer && !signals.hasTransferSafeguards)
        return `International transfers mentioned but no safeguards described. Add: "These transfers are protected by Standard Contractual Clauses (SCCs) ensuring equivalent protection outside India."`;
      if (!signals.mentionsIndiaLaw)
        return `Privacy policy does not reference DPDP Act. Add: "This privacy policy is governed by India's Digital Personal Data Protection Act, 2023."`;
      return `Cross-border transfer partially disclosed. Ensure every third-party service receiving personal data is listed with its country and applicable safeguard.`;
    }
    case 'lawful_processing': {
      if (!signals.mentionsLegalBasis && !signals.listsPurposes && !signals.mentionsConsent)
        return `No lawful basis for processing found. DPDP Section 4 requires every processing activity to have a legal basis. Add a Legal Basis table to your privacy policy: Activity | Legal Basis | Details.`;
      if (!signals.mentionsLegalBasis)
        return `Purposes listed but no formal legal basis stated. For each activity, specify the basis: Consent, Contract performance, Legal obligation, or Legitimate interest.`;
      if (!signals.mentionsConsent)
        return `Legal basis mentioned but consent not explicitly addressed. Add: "You can withdraw your consent at any time. Withdrawal does not affect the lawfulness of prior processing."`;
      if (!signals.hasTermsOfService)
        return `No Terms of Service found. Terms establish the contractual basis for data processing. Add a /terms page and link it alongside your privacy policy.`;
      return `Lawful processing partially documented. For consent-based activities, maintain a server-side log of: user ID, consent timestamp, version, and IP address as proof of compliance.`;
    }
    default:
      return null;
  }
}

function extractData(html, url, headers = {}) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const links = [];
  $('a[href]').each((_, el) => { links.push(($(el).attr('href') || '').toLowerCase()); });
  const forms = [];
  $('form').each((_, form) => {
    const fields = $(form).find('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').length;
    forms.push({ fields });
  });
  const parsedUrl = new URL(url);
  const rawTitle = $('title').text().replace(/\s+/g, ' ').trim();
  return {
    html, text, links, forms,
    cookies: html.includes('cookie') || html.includes('localStorage'),
    isHttps: parsedUrl.protocol === 'https:',
    headers,
    //pageTitle: $('title').text().trim() || parsedUrl.hostname,
    pageTitle: rawTitle.length > 60 ? rawTitle.slice(0, 60) + '...' : rawTitle || parsedUrl.hostname,
    domain: parsedUrl.hostname,
  };
}

function runChecks(extractedData) {
  const results = [];
  for (const checkDef of DPDP_CHECKS) {
    try {
      const raw = checkDef.check(extractedData);
      const { status, score } = checkDef.evaluate(raw);
      const evidence = [];
      if (raw.signals) {
        for (const [key, val] of Object.entries(raw.signals)) {
          if (key === 'isForChildren') continue;
          if (val === true) evidence.push(`✓ ${key.replace(/([A-Z])/g, ' $1').trim()}`);
          else if (val === false) evidence.push(`✗ ${key.replace(/([A-Z])/g, ' $1').trim()}`);
        }
      }
      results.push({
        id: checkDef.id,
        law: checkDef.law,
        section: checkDef.section,
        description: checkDef.description,
        status, score, evidence,
        recommendation: getRecommendation(checkDef.id, raw.signals || {}, status),
        details: `${raw.passCount ?? 0} of ${raw.total ?? 0} indicators found`,
      });
    } catch {
      results.push({
        id: checkDef.id, law: checkDef.law, section: checkDef.section,
        status: 'na', score: 0, evidence: [],
        details: 'Check could not be completed', recommendation: null,
      });
    }
  }
  return results;
}

function calculateOverall(checks) {
  const scored = checks.filter(c => c.status !== 'na');
  const overallScore = scored.length > 0 ? Math.round(scored.reduce((a, c) => a + c.score, 0) / scored.length) : 0;
  const summary = {
    passed: checks.filter(c => c.status === 'pass').length,
    failed: checks.filter(c => c.status === 'fail').length,
    warnings: checks.filter(c => c.status === 'warn').length,
    notApplicable: checks.filter(c => c.status === 'na').length,
  };
  let overallStatus = 'non-compliant';
  if (overallScore >= 70) overallStatus = 'compliant';
  else if (overallScore >= 40) overallStatus = 'partial';
  return { overallScore, overallStatus, summary };
}

module.exports = { extractData, runChecks, calculateOverall, DPDP_CHECKS };