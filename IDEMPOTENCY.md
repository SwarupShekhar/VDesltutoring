# Idempotency System

## Overview

The idempotency system protects against:
- Double clicks
- Network retries
- Mobile client resubmissions

This is invisible to UX but critical for operational reliability.

## How It Works

1. Clients include an `Idempotency-Key` header with POST requests
2. Server checks if key was used before for the same operation
3. If yes, returns cached response
4. If no, processes request and caches response

## Supported Operations

All critical financial/transactional operations support idempotency:
- Session booking (`session.book`)
- Session cancellation (`session.cancel`)
- Session completion (`session.complete`)
- Package purchase (`package.purchase`)
- Credit adjustment (`admin.adjust_credits`)

## Client Usage

Include the `Idempotency-Key` header with any POST request:

```javascript
fetch('/api/sessions/book', {
  method: 'POST',
  headers: {
    'Idempotency-Key': 'unique-key-per-operation',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    // ... request data
  })
})
```

## Key Requirements

- Keys must be 8-128 characters
- Alphanumeric, hyphens, and underscores only
- Unique per operation type
- Automatically expire after 24 hours

## Error Handling

- `400`: Invalid key format
- `409`: Key already used for different request