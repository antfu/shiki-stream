import type { ThemedToken } from 'shiki'
import { createHighlighter } from 'shiki'
import { expect, it } from 'vitest'
import { CodeToTokenTransformStream } from '../src'
import { generateRandomTextStream, tokensToHtml } from './utils'

const fixture = `
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>

<style>
button {
  color: red;
}
</style>
`

it('stream transformer', async () => {
  const highlighter = await createHighlighter({
    langs: ['vue'],
    themes: ['vitesse-dark', 'vitesse-light'],
  })

  const inputStream = generateRandomTextStream(fixture)
  const tokensStream = inputStream
    .pipeThrough(new CodeToTokenTransformStream(
      {
        highlighter,
        lang: 'vue',
        themes: {
          dark: 'vitesse-dark',
          light: 'vitesse-light',
        },
      },
    ))

  const tokens: ThemedToken[] = []
  for await (const token of tokensStream) {
    if ('recall' in token)
      tokens.splice(-token.recall, token.recall)
    else
      tokens.push(token)
  }
  const html = tokensToHtml(tokens)
  await expect(html)
    .toMatchFileSnapshot('output/stream-1.html')
})
