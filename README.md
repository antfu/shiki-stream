# shiki-stream

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Streaming highlighting with Shiki. Useful for highlighting text streams like LLM outputs.

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
    theme: 'nord'
  }))

// Consume the token stream
for await (const token of tokensStream) {
  console.log(token)
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
