# API Docs

Base URL: `https://assets-system-multi-sites-production.up.railway.app`

## Endpoints

### `GET /health`
Returns: `{ "status": "ok" }`

### `GET /apartments`
Returns a list of all stored apartments.

### `POST /apartments`
Creates a new apartment listing.

Request body:
```json
{
  "street_address": "1 Herzl St",
  "city": "Tel Aviv",
  "rooms": 3,
  "floor": 2,
  "total_floors": 5,
  "price": 5000,
  "description": "3-room apartment",
  "photos": ["photo1.jpg", "photo2.jpg"],
  "platforms": ["yad2", "madlan"]
}
```

Response: `{ "id": 1 }` (201)

### `GET /apartments/:id`
Returns an apartment by ID.

### `PUT /apartments/:id`
Updates an apartment (same body as `POST`).

### `DELETE /apartments/:id`
Deletes an apartment.

### `POST /apartments/:id/publish`
Publishes an existing apartment to a target platform.

Request body:
```json
{
  "targetUrl": "https://yad2.co.il/realestate/submit",
  "platform": "yad2",
  "config": { "headless": true, "waitAfterSubmit": 5000 }
}
```

Response on success: `{ "success": true, "message": "Published", "finalUrl": "..." }` (200)
Response on external platform failure: `502`

### `POST /publish`
Direct form-fill without saving to the database.

Request body:
```json
{
  "targetUrl": "https://example.com/form",
  "platform": "yad2",
  "formData": { ... },
  "config": { "submitSelector": "button[type='submit']" }
}
```

Response on success: `{ "success": true, "message": "...", "timestamp": "..." }` (200)
Response on external platform failure: `502`

## Status Codes

- `200` OK
- `201` Created
- `400` Bad Request
- `404` Not Found
- `502` External platform/publish failure
