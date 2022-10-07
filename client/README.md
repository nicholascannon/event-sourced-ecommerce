# Event Sourced Ecommerce Client

This client is built with React and ues [ESBuild](https://esbuild.github.io/) for build tooling.

To build the client run:

```sh
npm run build
```

To run the client locally (which reflects saved changes on reload) run:

```sh
npm start
```

## How does the build tooling work?

ESBuild is used to bundle the React application.
This is done in the `./scripts/build.mjs` file, along with injecting the built JavaScript into your `index.html` and minifying it.

You should rarely need to adjust the `build.mjs` and `serve.mjs` scripts.
Instead you can adjust configuration in the `./scripts/config.mjs` file.
