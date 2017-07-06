# Absolute path converter

This library converts absolute JavaScript module paths to relative.

## Installation
yarn: `yarn add --dev absolute-path-converter`

npm: `npm install --save-dev absolute-path-converter`

## Build pipeline integration

Just run `abspath` after any script that you use to build your app. For example:

```
"build": "tsc && abspath"
```

The example script first compiles - in this case TypeScript - source files containing internal imports (i.e. modules outside node_modules) with absolute paths. As TypeScript does not transform import paths, we need to transform the internal import paths from absolute to relative in order for Node to be able to execute our app.

There are many ways to transform the paths, and the most suitable method depends on the project. For frontend projects, I recommend using Babel and/or Webpack for the path transformation. This project targets mainly TypeScript projects for backend, where there is usually no need for heavyweight tools such as Babel and Webpack.
