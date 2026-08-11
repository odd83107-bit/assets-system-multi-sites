const express = require('express');
const { createApartment, getApartments, getApartment, updateApartment, deleteApartment, setApartmentStatus } = require('./db');
const { fillForm } = require('./index');
const { getMappedFields } = require('./configManager');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getApartments());
});

router.post('/', (req, res) => {
  const id = createApartment(req.body);
  res.status(201).json({ id });
});

router.get('/:id', (req, res) => {
  const apt = getApartment(req.params.id);
  if (!apt) return res.status(404).json({ error: 'Not found' });
  res.json(apt);
});

router.put('/:id', (req, res) => {
  if (updateApartment(req.params.id, req.body)) {
    res.json({ id: Number(req.params.id) });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', (req, res) => {
  if (deleteApartment(req.params.id)) {
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

router.post('/:id/publish', async (req, res) => {
  const { targetUrl, platform, config = {} } = req.body;
  const apartment = getApartment(req.params.id);

  if (!apartment) {
    return res.status(404).json({ error: 'Apartment not found' });
  }
  if (!targetUrl || !platform) {
    return res.status(400).json({ error: 'Missing targetUrl or platform' });
  }

  const rawData = {
    address: `${apartment.street_address}, ${apartment.city}`,
    rooms: apartment.rooms,
    floor: apartment.floor,
    total_floors: apartment.total_floors,
    price: apartment.price,
    description: apartment.description,
    photos: apartment.photos
  };

  const { fields, submit } = getMappedFields(platform, rawData);
  const { submitSelector, ...rest } = config;
  const options = { ...rest, submit };

  try {
    const finalUrl = await fillForm(targetUrl, fields, options);
    setApartmentStatus(apartment.id, 'published');
    res.json({ success: true, message: 'Published', finalUrl });
  } catch (err) {
    setApartmentStatus(apartment.id, 'failed');
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
