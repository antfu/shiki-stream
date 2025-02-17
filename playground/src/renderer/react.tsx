import type { JSX } from 'react'
import type { Root } from 'react-dom/client'
/* eslint-disable no-console */
import type { RendererFactory, RendererFactoryResult } from './types'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { shallowReactive, watch } from 'vue'
import { ShikiStreamRenderer } from '../../../src/react'

export const createRendererReact: RendererFactory = (options): RendererFactoryResult => {
  let app: Root | undefined

  const props = shallowReactive<any>({
    onStreamStart: options.onStart,
    onStreamEnd: options.onEnd,
  })

  function App(): JSX.Element {
    // TODO: make React not render twice
    const [count, setCounter] = React.useState(0)

    React.useEffect(() => {
      watch(props, () => {
        // Force React to re-render
        setCounter(c => c + 1)
      })
    }, [])

    console.log('React rendering', count)

    return <ShikiStreamRenderer {...props} className={props.class} />
  }

  return {
    mount: (element, payload) => {
      Object.assign(props, payload)
      app = ReactDOM.createRoot(element)
      app.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      )

      console.log('React renderer mounted')
    },

    update: (payload) => {
      Object.assign(props, payload)
    },

    dispose: () => {
      app?.unmount()
      app = undefined
    },
  }
}
