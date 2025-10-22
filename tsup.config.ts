import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  target: 'node18',
  platform: 'node',
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  shims: true,
  dts: false,
  noExternal: [],
})

