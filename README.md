# Edunym

``POST /outgoing/?tool_url={TOOL_URL}``

with ``id_token`` of a LTI Message as a body parameter and Edunym will:
 1. Rewrite the ``sub`` property with a tool-dependent pseudonym
 2. (Replace all urls ``URL`` within the Message with ``{EDUNYM_HOST}/ingoing/platform_url={URL}``)
 3. Resign the message with the platforms`s public key
 4. Send the LTI message to ``{TOOL_URL}``

## Setup

1. Run ``yarn install``
2. Create a mongodb Database
3. Copy ``config.example.js`` to ``config.js`` and update the information

## Start

Run ``yarn start``

## Develop

Run ``yarn run dev``

## Test

Run ``yarn run test``
