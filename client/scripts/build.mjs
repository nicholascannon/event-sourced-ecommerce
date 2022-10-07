import * as fs from 'fs';
import esbuild from 'esbuild';
import { minify } from 'html-minifier';

const INDEX_HTML_PATH = './src/index.html';
const APP_ENTRYPOINT = './src/index.tsx';
const OUTPUT_DIR = './dist';
const NON_RELATIVE_OUTPUT_DIR = OUTPUT_DIR.replace('./', ''); // ./dist -> dist
// You need to add this script tag to your index.html
// It's also used to serve the app locally (see serve.mjs).
const INDEX_HTML_SCRIPT_TAG = '<script src="js/index.js"></script>';

const { metafile } = esbuild.buildSync({
    entryPoints: [APP_ENTRYPOINT],
    entryNames: '[ext]/[name]-[hash]',
    bundle: true,
    minify: true,
    treeShaking: true,
    splitting: true,
    format: 'esm',
    outdir: OUTPUT_DIR,
    metafile: true,
});

const buildOutputs = Object.keys(metafile.outputs);

// Map JavaScript outputs to HTML tags
// dist/js/index-XJ5WVEHB.js -> <script src="js/index-XJ5WVEHB.js"></script>
const scriptTags = buildOutputs
    .filter((output) => output.endsWith('.js'))
    .map((output) => `<script src="${output.replace(NON_RELATIVE_OUTPUT_DIR + '/', '')}"></script>`);

// Inject built JavaScript tags into index.html
const indexContent = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
const finalIndexContent = indexContent.replace(INDEX_HTML_SCRIPT_TAG, scriptTags.join());

const minifiedHtml = minify(finalIndexContent, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
});

fs.writeFileSync(`${OUTPUT_DIR}/index.html`, minifiedHtml);
console.log('Done!');
