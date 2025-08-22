import typescript from '@rollup/plugin-typescript'
import { glob } from 'glob'

const isDev = process.env.ROLLUP_WATCH === 'true'
const isTest = process.env.BUILD_TARGET === 'test'

let config
const external = [
  'typescript',
  'class-validator',
  'path',
  'node:test',
  'node:assert',
]
const plugins = {
  commonJs: [typescript({ rootDir: 'src', outDir: 'dist' })],
  esm: [typescript({ rootDir: 'src', outDir: 'dist' })],
}

if (isTest) {
  config = [
    // CommonJS build
    {
      input: 'src/__test__/index.ts',
      output: {
        file: 'dist/test.js',
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: true,
      },
      plugins: plugins.commonJs,
      external,
    },
  ]
} else {
  // Production build configuration
  config = [
    // ESM build
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: isDev,
        inlineDynamicImports: true,
      },
      plugins: plugins.esm,
      external,
    },
    // CommonJS build
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.js',
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: isDev,
      },
      plugins: plugins.commonJs,
      external,
    },

    // Run build
    {
      input: 'src/run.ts',
      output: {
        file: 'dist/run.js',
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: isDev,
      },
      plugins: plugins.commonJs,
      external,
    },
  ]
}

export default config
