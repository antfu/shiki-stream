# shiki-stream

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs.

[Live Demo](https://shiki-stream.netlify.app/)

> [!IMPORTANT]
> API Unstable. Pin your version on use.

## Usage

```ts
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki'
import { CodeToTokenTransformStream } from 'shiki-stream'

// Initialize the Shiki highlighter somewhere in your app
const highlighter = await createHighlighter({
  langs: [/* ... */],
  themes: [/* ... */],
  engine: createJavaScriptRegexEngine()
})

// The ReadableStream<string> you want to highlight
const textStream = getTextStreamFromSomewhere()

// Pipe the text stream through the token stream
const tokensStream = textStream
  .pipeThrough(new CodeToTokenTransformStream({
    highlighter,
    lang: 'javascript',
    theme: 'nord',
    allowRecalls: true, // see explanation below
  }))
```

#### `allowRecalls`

Due fact that the highlighting might be changed based on the context of the code, the themed tokens might be changed as the stream goes on. Because the streams are one-directional, we introduce a special "recall" token to notify the receiver to discard the last tokens that has changed.

By default, `CodeToTokenTransformStream` only returns stable tokens, no recalls. This also means the tokens are outputted less fine-grained, usually line-by-line.

For stream consumers that can handle recalls (e.g. our Vue / React components), you can set `allowRecalls: true` to get more fine-grained tokens.

Typically, recalls should be handled like:

```ts
const receivedTokens: ThemedToken[] = []

tokensStream.pipeTo(new WritableStream({
  async write(token) {
    if ('recall' in token) {
      // discard the last `token.recall` tokens
      receivedTokens.length -= token.recall
    }
    else {
      receivedTokens.push(token)
    }
  }
}))
```

### Consume the Token Stream

#### Manually

```ts
tokensStream.pipeTo(new WritableStream({
  async write(token) {
    console.log(token)
  }
}))
```

Or in Node.js

```ts
for await (const token of tokensStream) {
  console.log(token)
}
```

#### Vue

```vue
<script setup lang="ts">
import { ShikiStreamRenderer } from 'shiki-stream/vue'

// get the token stream
</script>

<template>
  <ShikiStreamRenderer :stream="tokensStream" />
</template>
```

#### React

```tsx
import { ShikiStreamRenderer } from 'shiki-stream/react'

export function MyComponent() {
  // get the token stream
  return <ShikiStreamRenderer stream={tokensStream} />
}
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/shiki-stream?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/shiki-stream
[npm-downloads-src]: https://img.shields.io/npm/dm/shiki-stream?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/shiki-stream
[bundle-src]: https://img.shields.io/bundlephobia/minzip/shiki-stream?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=shiki-stream
[license-src]: https://img.shields.io/github/license/antfu/shiki-stream.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/shiki-stream/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/shiki-stream
