const { chromium } = require('playwright');

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;

async function fillForm(url, fields, options = {}) {
  const headless = options.headless !== undefined ? options.headless : (process.env.HEADLESS !== 'false');
  const userAgent = options.userAgent || process.env.USER_AGENT || DEFAULT_USER_AGENT;
  const proxyUrl = options.proxyUrl || process.env.PROXY_URL;

  const launchOptions = { headless };
  if (proxyUrl) {
    launchOptions.proxy = { server: proxyUrl };
  }

  const browser = await chromium.launch(launchOptions);
  try {
    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: options.timeout || 30000 });

    for (const [selector, value] of Object.entries(fields || {})) {
      const target = page.locator(selector).first();
      if (Array.isArray(value) || isImagePath(value)) {
        const paths = Array.isArray(value) ? value : [value];
        await target.setInputFiles(paths);
      } else {
        await target.fill(String(value));
      }
    }

    if (options.submit) {
      await page.locator(options.submit).first().click();
      await page.waitForTimeout(options.waitAfterSubmit || 5000);
    }

    return page.url();
  } finally {
    await browser.close();
  }
}

function isImagePath(value) {
  return typeof value === 'string' && (IMAGE_EXTENSIONS.test(value) || value.startsWith('data:image'));
}

module.exports = { fillForm };
