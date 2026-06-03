// shiki-stream is a thin re-export of @shikijs/stream.
// This build emits one-line redirect modules per entry. No bundler needed.

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')

const NOTE = '// `shiki-stream` is now a thin re-export of `@shikijs/stream`.\n'
  + '// New code should import from `@shikijs/stream` directly.\n'

const ENTRIES = [
  { name: 'index', specifier: '@shikijs/stream' },
  { name: 'vue', specifier: '@shikijs/stream/vue' },
  { name: 'react', specifier: '@shikijs/stream/react' },
  { name: 'solid', specifier: '@shikijs/stream/solid' },
]

await rm(DIST, { recursive: true, force: true })
await mkdir(DIST, { recursive: true })

for (const { name, specifier } of ENTRIES) {
  const body = `${NOTE}export * from '${specifier}'\n`
  await writeFile(resolve(DIST, `${name}.mjs`), body)
  await writeFile(resolve(DIST, `${name}.d.mts`), body)
  console.log(`✔ dist/${name}.mjs + dist/${name}.d.mts`)
}
