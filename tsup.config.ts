import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  target: 'node20',
  platform: 'node',
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  shims: true,
  dts: false,
  noExternal: [],
  ignoreWatch: ['src/ai-docs/**'],
})

