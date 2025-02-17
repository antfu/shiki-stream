import type { ThemedToken } from '@shikijs/types'
import type { JSX } from 'react'
import type { RecallToken } from '..'
import { objectId } from '@antfu/utils'
import { getTokenStyleObject } from '@shikijs/core'
import { createElement as h, useEffect, useState } from 'react'

export function ShikiStreamRenderer(
  {
    stream,
    onStreamStart,
    onStreamEnd,
  }: {
    stream: ReadableStream<ThemedToken | RecallToken>
    onStreamStart?: () => void
    onStreamEnd?: () => void
  },
): JSX.Element {
  const [tokens, setTokens] = useState<ThemedToken[]>([])

  useEffect(() => {
    if (tokens.length)
      setTokens([])
    let started = false
    stream.pipeTo(new WritableStream({
      write(token) {
        if (!started) {
          started = true
          onStreamStart?.()
        }
        if ('recall' in token)
          setTokens(tokens => tokens.slice(0, -token.recall))
        else
          setTokens(tokens => [...tokens, token])
      },
      close: () => onStreamEnd?.(),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream])

  return h(
    'pre',
    { className: 'shiki shiki-stream' },
    h(
      'code',
      {},
      tokens.map(token => h('span', { key: objectId(token), style: token.htmlStyle || getTokenStyleObject(token) }, token.content)),
    ),
  )
}
