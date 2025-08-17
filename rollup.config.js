import typescript from '@rollup/plugin-typescript'
import { glob } from 'glob'

const isDev = process.env.ROLLUP_WATCH === 'true'
const isTest = process.env.BUILD_TARGET === 'test'

let config
const external = ['typescript', 'class-validator', 'path']

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
    plugins: [
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
        format: 'esm',
        sourcemap: isDev,
      },
      plugins: [
        typescript({
          tsconfig: './tsconfig.json',
          declaration: true,
          declarationDir: 'dist',
          declarationMap: isDev,
          sourceMap: isDev,
          rootDir: 'src',
          exclude: ['**/*.test.ts', '**/__test__/**/*'],
        }),
      ],
      external,
    },
    // CommonJS build
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: isDev,
      },
      plugins: [
        typescript({
          tsconfig: './tsconfig.json',
          declaration: false,
          declarationMap: false,
          sourceMap: isDev,
          exclude: ['**/*.test.ts', '**/__test__/**/*'],
        }),
      ],
      external,
    },
  ]
}

export default config
