<script setup lang="ts">
import type { ThemedToken } from '@shikijs/core'
import type { RecallToken } from '../../../src'
import { createHighlighterCore } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { onMounted, shallowRef } from 'vue'
import { CodeToTokenTransformStream } from '../../../src'
import { ShikiStreamRenderer } from '../../../src/vue'
import { generateRandomTextStream } from '../../../test/utils'
import input from './App.vue?raw'

const highlighter = await createHighlighterCore({
  langs: [
    import('@shikijs/langs/vue'),
  ],
  themes: [
    import('@shikijs/themes/vitesse-dark'),
    import('@shikijs/themes/vitesse-light'),
  ],
  engine: createJavaScriptRegexEngine(),
})

const stream = shallowRef<ReadableStream<ThemedToken | RecallToken>>()

async function typewriter() {
  const text = generateRandomTextStream(input)
  const tokens = text.pipeThrough(
    new CodeToTokenTransformStream({
      highlighter,
      lang: 'vue',
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      allowRecalls: true,
    }),
  )
  stream.value = tokens
}

onMounted(() => {
  typewriter()
})
</script>

<template>
  <div>
    <button @click="typewriter">
      Restart
    </button>
    <ShikiStreamRenderer v-if="stream" :stream="stream" />
  </div>
</template>
