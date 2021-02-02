import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/datavizlib.ts',
  output: [
    {
      file: './dist/datavizlib.esm.js',
      format: 'es',
    },
    {
      file: './dist/datavizlib.umd.js',
      format: 'umd',
      name: 'datavizlib',
    },
  ],
  plugins: [typescript()],
};