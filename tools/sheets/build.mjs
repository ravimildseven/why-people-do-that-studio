// usage: node build.mjs <entry.tsx> <outdir>
import {createRequire} from 'module';
import path from 'path';
import {execFileSync} from 'child_process';
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');
const [entry, outdir] = process.argv.slice(2);
const out = path.join(outdir, path.basename(entry, '.tsx') + '.cjs');
await esbuild.build({
  entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', outfile: out,
jsx: 'transform', logLevel: 'warning',
});
execFileSync('node', [out, outdir], {stdio: 'inherit'});
