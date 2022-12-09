import esbuild from 'esbuild';
import { SERVE_DIR, SERVE_PORT, APP_ENTRYPOINT } from './config.mjs';

esbuild
    .serve(
        {
            port: SERVE_PORT,
            servedir: SERVE_DIR,
            onRequest: ({ method, path, status, timeInMS }) => {
                console.log(`[${method}] ${path} ${status} (${timeInMS}ms)`);
            },
        },
        {
            entryPoints: [APP_ENTRYPOINT],
            entryNames: '[ext]/[name]',
            bundle: true,
            minify: true,
            treeShaking: true,
            format: 'esm',
            outdir: SERVE_DIR,
            sourcemap: true,
        }
    )
    .then(() => console.log(`Serving at http://localhost:${SERVE_PORT}`));
