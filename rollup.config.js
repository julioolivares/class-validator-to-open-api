import typescript from '@rollup/plugin-typescript'
import { glob } from 'glob'

const isDev = process.env.ROLLUP_WATCH === 'true'
const isTest = process.env.BUILD_TARGET === 'test'

let config
const external = ['typescript', 'class-validator', 'path']
const plugins = {
  commonJs: [typescript()],
  esm: [typescript()],
}

if (isTest) {
  // Test build configuration
  const testFiles = glob.sync('src/**/*.test.ts')

  config = testFiles.map(file => ({
    input: file,
    output: {
      file: file.replace('src/', 'dist/').replace('.ts', '.js'),
      format: 'esm',
      sourcemap: true,
    },
    plugins: plugins.esm,
    external: ['node:test', 'node:assert', 'typescript', 'class-validator'],
  }))
} else {
  // Production build configuration
  config = [
    // ESM build
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      plugins: plugins.esm,
      external,
    },
    // CommonJS build
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.cjs',
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: true,
      },
      plugins: plugins.commonJs,
      external,
    },
  ]
}

export default config
