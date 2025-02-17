import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vue',
  ],
  declaration: 'node16',
  clean: true,
  rollup: {
    inlineDependencies: [
      '@antfu/utils',
    ],
  },
})
