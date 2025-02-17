import type { ThemedToken } from '@shikijs/types'
import type { PropType } from 'vue'
import type { RecallToken } from '..'
import { objectId } from '@antfu/utils'
import { getTokenStyleObject } from '@shikijs/core'
import { defineComponent, h, reactive, renderList, watch } from 'vue'

export const ShikiStreamRenderer = defineComponent({
  name: 'ShikiStreamRenderer',
  props: {
    stream: {
      type: Object as PropType<ReadableStream<ThemedToken | RecallToken>>,
      required: true,
    },
  },
  emits: ['stream-start', 'stream-end'],
  setup(props, { emit }) {
    const tokens = reactive<ThemedToken[]>([])

    watch(
      () => props.stream,
      () => {
        tokens.length = 0
        let started = false
        props.stream.pipeTo(new WritableStream({
          write(token) {
            if (!started) {
              started = true
              emit('stream-start')
            }
            if ('recall' in token)
              tokens.length -= token.recall
            else
              tokens.push(token)
          },
          close: () => emit('stream-end'),
        }))
      },
      { immediate: true },
    )

    return () => h(
      'pre',
      { class: 'shiki shiki-stream' },
      h(
        'code',
        renderList(tokens, token => h('span', { key: objectId(token), style: token.htmlStyle || getTokenStyleObject(token) }, token.content)),
      ),
    )
  },
})
