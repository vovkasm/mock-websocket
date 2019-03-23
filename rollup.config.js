import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [resolve({ jsnext: true }), typescript({ tsconfig: './tsconfig.dist.json' }), commonjs()],
  output: [
    {
      file: 'dist/mock-websocket.cjs.js',
      sourcemap: 'inline',
      format: 'cjs',
    },
    {
      file: 'dist/mock-websocket.js',
      sourcemap: 'inline',
      format: 'umd',
      name: 'MockWebSocket',
    },
    {
      file: 'dist/mock-websocket.amd.js',
      sourcemap: 'inline',
      format: 'amd',
    },
    {
      file: 'dist/mock-websocket.es.js',
      sourcemap: 'inline',
      format: 'es',
    },
  ]
};
