# Edunym

POST /outgoing/?tool_url={TOOL_URL}

with ``id_token`` of a LTI Message as a body parameter and Edunym will:
 1. Rewrite the ``sub`` property with a tool-dependent pseudonym
 2. (Replace all urls ``URL`` within the Message with ``{EDUNYM_HOST}/ingoing/platform_url={URL}``)
 3. Resign the Message with the corresponding tool`s public key

## Setup

1. Run ``yarn install``
2. Create a mongodb Database
3. Set environment variables ``DB_NAME``, ``DB_USER``, ``DB_PW``
4. Copy ``config.example.js`` to ``config.js`` and insert the platform information and the tool's public keys

## Start

Run ``yarn start``

## Develop

Run ``yarn run dev``

## Test

Run ``yarn run test``
