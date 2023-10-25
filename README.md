# Vue 3 + Typescript + Vite

This template should help get you started developing with Vue 3 and Typescript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Build for Development

We're using Vite (which uses Rollup under the hood) to build for development.

```
npm i
npm run dev
```

## Build for Production

The same Vite package can help us build for a production deployment.

```
npm i
npm run build
```

We can even preview the built files with a local server, also powered by Vite, but you can only use it after you've built the production files with the above command.

```
npm run serve
```

The built files are placed into the `dist` folder, so to deploy the website, just copy the contents to the server such that `index.html` is in the website root.

We can create a more automated deployment mechanism later with the help of Bitbucket Pipelines.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's `.vue` type support plugin by running `Volar: Switch TS Plugin on/off` from VSCode command palette.


## HTML/CSS-Framework

The project is build on top of [Tailwind CSS v3](https://tailwindcss.com/docs/installation).
