const fs = require('fs');
const path = require('path');

const SELECTORS_PATH = path.join(__dirname, 'config', 'selectors.json');

function loadSelectors() {
  const raw = fs.readFileSync(SELECTORS_PATH, 'utf8');
  return JSON.parse(raw);
}

function getMappedFields(platform, rawData) {
  const selectors = loadSelectors()[platform];
  if (!selectors) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  const fields = {};
  for (const [dataKey, selector] of Object.entries(selectors)) {
    if (dataKey === 'submit') continue;
    if (rawData[dataKey] !== undefined) {
      fields[selector] = rawData[dataKey];
    }
  }

  return { fields, submit: selectors.submit };
}

module.exports = { getMappedFields };
