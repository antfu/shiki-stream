import type { ThemedToken } from '@shikijs/types'
import type { PropType } from 'vue'
import type { RecallToken } from '..'
import { objectId } from '@antfu/utils'
import { defineComponent, h, reactive, renderList, watch } from 'vue'

export const ShikiStreamRenderer = defineComponent({
  name: 'ShikiStreamRenderer',
  props: {
    stream: {
      type: Object as PropType<ReadableStream<ThemedToken | RecallToken>>,
      required: true,
    },
  },
  setup(props) {
    const tokens = reactive<ThemedToken[]>([])

    watch(
      props.stream,
      () => {
        tokens.length = 0
        props.stream.pipeTo(new WritableStream({
          write(token) {
            if ('recall' in token)
              tokens.splice(-token.recall, token.recall)
            else
              tokens.push(token)
          },
        }))
      },
      { immediate: true },
    )

    return () => h(
      'pre',
      { class: 'shiki shiki-stream' },
      h(
        'code',
        renderList(tokens, token => h('span', { key: objectId(token), style: token.htmlStyle }, token.content)),
      ),
    )
  },
})
