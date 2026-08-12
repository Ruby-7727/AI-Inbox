# API routes

- `POST /api/analyze` accepts a PNG, JPG, or WEBP screenshot up to 10 MB.
- It validates the file, converts it to an in-memory Base64 data URL, and calls Zhipu AI `glm-4.5v` through Chat Completions.
- JSON mode plus runtime contract validation constrain the result to the AI Inbox analysis contract.
- It does not persist the image or execute suggested actions.
