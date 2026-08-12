const express = require('express');
const cors = require('cors');
const { fillForm } = require('./index');
const { getMappedFields } = require('./configManager');
const apartmentsRouter = require('./apartments');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_ATTEMPTS = 3;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/apartments', apartmentsRouter);

app.post('/publish', async (req, res) => {
  const { targetUrl, platform, formData, config = {} } = req.body;

  if (!targetUrl || !formData) {
    return res.status(400).json({ success: false, error: 'Missing targetUrl or formData' });
  }

  let fields;
  let submit;
  if (platform) {
    const mapped = getMappedFields(platform, formData);
    fields = mapped.fields;
    submit = mapped.submit;
  } else {
    fields = formData;
    submit = config.submitSelector;
  }

  const { submitSelector, ...rest } = config;
  const options = { ...rest, submit };
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const finalUrl = await fillForm(targetUrl, fields, options);
      console.log(`Publish succeeded: ${finalUrl}`);
      return res.status(200).json({
        success: true,
        message: 'Form filled successfully',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      lastError = err;
      console.error(`Publish attempt ${attempt} failed: ${err.message}`);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  res.status(502).json({ success: false, error: lastError.message, attempts: MAX_ATTEMPTS });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
