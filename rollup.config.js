import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  sourceMap: 'inline',
  plugins: [buble(), resolve({ jsnext: true, main: true }), commonjs()],
  targets: [
    { dest: 'dist/mock-websocket.cjs.js', format: 'cjs' },
    { dest: 'dist/mock-websocket.js', format: 'umd', name: 'MockWebSocket' },
    { dest: 'dist/mock-websocket.amd.js', format: 'amd' },
    { dest: 'dist/mock-websocket.es.js', format: 'es' }
  ]
};
