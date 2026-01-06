/* eslint-disable no-console */

/* @jsxImportSource solid-js */
import type { JSX } from 'solid-js'
import type { RendererFactoryOptions, RendererFactoryResult, RendererUpdatePayload } from './types'
import { createEffect, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { render } from 'solid-js/web'
import { ShikiStreamRenderer } from '../../../src/solid'

let lastRendererCleanup: (() => void) | undefined

export function createRendererSolid(options: RendererFactoryOptions & RendererUpdatePayload): RendererFactoryResult {
  const [props, setProps] = createStore({
    stream: options.stream ?? null,
    onStreamStart: options.onStart,
    onStreamEnd: options.onEnd,
    class: '',
  })

  let dispose: ReturnType<typeof render> | undefined
  const cleanup = (): void => {
    dispose?.()
    dispose = undefined
    if (lastRendererCleanup === cleanup)
      lastRendererCleanup = undefined
  }

  function App(): JSX.Element {
    const [count, setCount] = createSignal(0)

    createEffect(() => {
      const timerId = setInterval(() => setCount(count => count + 1), 1_000)
      return () => clearInterval(timerId)
    })

    return (
      <ShikiStreamRenderer
        stream={props.stream}
        onStreamStart={() => {
          console.log('onStreamStart', count())
          props.onStreamStart?.()
        }}
        onStreamEnd={() => {
          console.log('onStreamEnd', count())
          props.onStreamEnd?.()
        }}
        class={props.class}
      />
    )
  }

  return {
    mount: (element, payload) => {
      lastRendererCleanup?.()
      setProps(payload as any)
      dispose = render(() => <App />, element)
      lastRendererCleanup = cleanup
      console.log('Solid renderer mounted')
    },
    update: (payload) => {
      setProps(payload as any)
    },
    dispose: () => {
      cleanup()
    },
  }
}
