import type { CodeToTokensOptions, GrammarState, HighlighterCore, HighlighterGeneric, ThemedToken } from '@shikijs/core'

export type ShikiStreamTokenizerOptions = CodeToTokensOptions<string, string> & {
  highlighter: HighlighterCore | HighlighterGeneric<any, any>
}

export class ShikiStreamTokenizer {
  public readonly options: ShikiStreamTokenizerOptions

  public tokensStable: ThemedToken[] = []
  public tokensBuffer: ThemedToken[] = []
  public codeBuffer: string = ''
  public grammarState: GrammarState | undefined

  constructor(
    options: ShikiStreamTokenizerOptions,
  ) {
    this.options = options
  }

  /**
   * Append a chunk of code to the buffer.
   * Highlight line by line and return the tokens for the given chunk.
   */
  enqueue(chunk: string): { recall: number, stable: ThemedToken[], buffer: ThemedToken[] } {
    const chunkLines = (this.codeBuffer + chunk).split('\n')

    const stable: ThemedToken[] = []
    let buffer: ThemedToken[] = []
    const recall = this.tokensBuffer.length

    chunkLines.forEach((line, i) => {
      const isLastLine = i === chunkLines.length - 1

      const result = this.options.highlighter.codeToTokens(line, {
        ...this.options,
        grammarState: this.grammarState,
      })
      const tokens = result.tokens[0] // only one line
      if (!isLastLine)
        tokens.push({ content: '\n', offset: 0 })

      if (!isLastLine) {
        this.grammarState = result.grammarState
        stable.push(...tokens)
      }
      else {
        buffer = tokens
        this.codeBuffer = line
      }
    })

    this.tokensStable.push(...stable)
    this.tokensBuffer = buffer

    return {
      recall,
      stable,
      buffer,
    }
  }

  close(): { tokens: ThemedToken[] } {
    const buffer = this.tokensBuffer
    this.tokensBuffer = []
    this.codeBuffer = ''
    this.grammarState = undefined
    return {
      tokens: buffer,
    }
  }

  clear(): void {
    this.tokensStable = []
    this.tokensBuffer = []
    this.codeBuffer = ''
    this.grammarState = undefined
  }

  clone(): ShikiStreamTokenizer {
    const clone = new ShikiStreamTokenizer(
      this.options,
    )
    clone.codeBuffer = this.codeBuffer
    clone.tokensBuffer = this.tokensBuffer
    clone.tokensStable = this.tokensStable
    clone.grammarState = this.grammarState
    return clone
  }
}

export interface RecallToken {
  recall: number
}

export type CodeToTokenTransformStreamOptions = ShikiStreamTokenizerOptions & {
  /**
   * Whether to allow recall tokens to be emitted.
   *
   * A recall token is a token that indicates the number of tokens to be removed from the end.
   *
   * @default false
   */
  allowRecalls?: boolean
}

export class CodeToTokenTransformStream extends TransformStream<string, ThemedToken | RecallToken> {
  readonly tokenizer: ShikiStreamTokenizer
  readonly options: CodeToTokenTransformStreamOptions

  constructor(
    options: CodeToTokenTransformStreamOptions,
  ) {
    const tokenizer = new ShikiStreamTokenizer(options)
    const {
      allowRecalls = false,
    } = options

    super({
      async transform(chunk, controller) {
        const { stable, buffer, recall } = tokenizer.enqueue(chunk)
        if (allowRecalls && recall > 0) {
          controller.enqueue({ recall } as any)
        }
        for (const token of stable) {
          controller.enqueue(token)
        }
        if (allowRecalls) {
          for (const token of buffer) {
            controller.enqueue(token)
          }
        }
      },
      async flush(controller) {
        const { tokens } = tokenizer.close()
        // if allow recalls, the tokens should already be sent
        if (!allowRecalls) {
          for (const token of tokens) {
            controller.enqueue(token)
          }
        }
      },
    })

    this.tokenizer = tokenizer
    this.options = options
  }
}
