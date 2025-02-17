import type { ThemedToken } from '@shikijs/types'
import type { JSX } from 'react'
import type { RecallToken } from '..'
import { objectId } from '@antfu/utils'
import { createElement as h, useEffect, useState } from 'react'

export function ShikiStreamRenderer({ stream }: { stream: ReadableStream<ThemedToken | RecallToken> }): JSX.Element {
  const [tokens, setTokens] = useState<ThemedToken[]>([])

  useEffect(() => {
    stream.pipeTo(new WritableStream({
      write(token) {
        if ('recall' in token)
          setTokens(tokens => tokens.slice(0, -token.recall))
        else
          setTokens(tokens => [...tokens, token])
      },
    }))
  }, [stream])

  return h(
    'pre',
    { className: 'shiki shiki-stream' },
    h(
      'code',
      {},
      tokens.map(token => h('span', { key: objectId(token), style: token.htmlStyle }, token.content)),
    ),
  )
}
