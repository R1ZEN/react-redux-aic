import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';

const isProduction = process.env.NODE_ENV === 'production';

const destBase = `dist/${pkg.name}`;
const destExtension = `${isProduction ? '.min' : ''}.js`;

const extensions = ['.js', '.ts', '.tsx'];

export default {
  input: 'src/index.ts',
  output: [
    { file: `${destBase}${destExtension}`, format: 'cjs' },
    { file: `${destBase}.es${destExtension}`, format: 'es' },
  ],
  external: Object.keys(pkg.peerDependencies).concat(['react-dom/server']),
  plugins: [
    resolve({ extensions }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      include: ['src/**/*'],
    }),
    isProduction && terser(),
    isProduction && filesize(),
  ].filter(Boolean),
};
