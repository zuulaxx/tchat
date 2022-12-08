# The zuulaxx's tchat

The zuulaxx's tchat

# Install

`npm i` or `pnpm i`.

# Start

`npm start` or `pnpm start`.

# Start for development

`npm run dev` or `pnpm dev`.

## __Html ingection impossibles__

```js
    if (allowMessage) {
      msg.content = sanitizeHtml(marked.parseInline(msg.content), {
        disallowedTagsMode: 'escape',
      }).trim();
      msg.timestamp = timestamp;
      io.emit('chat message', msg);
    }
```
