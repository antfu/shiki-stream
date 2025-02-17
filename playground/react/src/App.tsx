import type { ThemedToken } from '@shikijs/core'
import type { JSX } from 'react'
import type { RecallToken } from '../../../src'
import { createHighlighterCore } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { useEffect, useState } from 'react'
import { CodeToTokenTransformStream } from '../../../src'
import { ShikiStreamRenderer } from '../../../src/react'
import { generateRandomTextStream } from '../../../test/utils'
import input from './App.tsx?raw'

// eslint-disable-next-line antfu/no-top-level-await
const highlighter = await createHighlighterCore({
  langs: [
    import('@shikijs/langs/tsx'),
  ],
  themes: [
    import('@shikijs/themes/vitesse-dark'),
    import('@shikijs/themes/vitesse-light'),
  ],
  engine: createJavaScriptRegexEngine(),
})

function App(): JSX.Element {
  const [stream, setStream] = useState<ReadableStream<ThemedToken | RecallToken>>()

  async function typewriter(): Promise<void> {
    const text = generateRandomTextStream(input)
    const tokens = text.pipeThrough(
      new CodeToTokenTransformStream({
        highlighter,
        lang: 'tsx',
        themes: {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
        allowRecalls: true,
      }),
    )
    setStream(tokens)
  }

  useEffect(() => {
    typewriter()
  }, [])

  if (!stream)
    return <></>
  return <ShikiStreamRenderer stream={stream} />
}

export default App
