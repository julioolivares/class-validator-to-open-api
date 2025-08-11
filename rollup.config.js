import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { glob } from 'glob'

const isDev = process.env.ROLLUP_WATCH === 'true'
const isTest = process.env.BUILD_TARGET === 'test'

let config

if (isTest) {
  // Test build configuration
  const testFiles = glob.sync('src/**/*.test.ts')

  config = testFiles.map(file => ({
    input: file,
    output: {
      file: file.replace('src/', 'dist/').replace('.ts', '.js'),
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
      }),
    ],
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
        format: 'es',
        sourcemap: isDev,
      },
      plugins: [
        nodeResolve(),
        typescript({
          tsconfig: './tsconfig.json',
          declaration: true,
          declarationDir: 'dist',
          declarationMap: isDev,
          sourceMap: isDev,
          rootDir: 'src',
        }),
      ],
      external: ['typescript', 'class-validator'],
    },
    // CommonJS build
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: isDev,
      },
      plugins: [
        nodeResolve(),
        typescript({
          tsconfig: './tsconfig.json',
          declaration: false,
          declarationMap: false,
          sourceMap: isDev,
        }),
      ],
      external: ['typescript', 'class-validator'],
    },
  ]
}

export default config
