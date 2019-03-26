# Edunym

``POST /outgoing/?tool_url={TOOL_URL}``

with ``id_token`` of a LTI Message as a body parameter and Edunym will:
 1. Rewrite the ``sub`` property with a tool-dependent pseudonym
 2. (Replace all urls ``URL`` within the Message with ``{EDUNYM_HOST}/ingoing/platform_url={URL}``)
 3. Resign the message with the platforms`s public key
 4. Send the LTI message to ``{TOOL_URL}``
 
``POST /tool``

Creates a tool for rewriting URLs and receiving its messages

Parameters: ``clientId`` and ``publicKey``

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

## Technical details

This app in general works as a proxy. But it needs to break the security standard when messages from the tool to platform are intercepted. They can't be resigned with the tool's private key. It uses the platform's private key for this last mile security. The platform must set its own public key as the tool's public key. When intercepting the incoming message the proxy verifies the signature to ensure authenticity.