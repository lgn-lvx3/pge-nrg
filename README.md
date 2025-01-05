# React + TypeScript + Vite

## handy commands
- `yarn create vite pge-nrg --template react-ts`
- `swa build`
- `swa login --resource-group pge-rg --app-name pge-nrg`
- `swa deploy --env production`

## handy links
- https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-web-framework?tabs=bash&pivots=react
- https://vite.dev/guide/
- https://azure.github.io/static-web-apps-cli/docs/cli/swa-start/
- https://learn.microsoft.com/en-us/azure/static-web-apps/add-authentication

## Scripts
Runs a script to create a row csv example from test-data.csv template
`awk 'BEGIN {srand(); print "Date,Usage(kWh)"} NR>1 {for(i=0;i<10000; i++) {year=2025+int(rand()*2); month=1+int(rand()*12); day=1+int(rand()*28); printf("%04d-%02d-%02d,%0.1f\n", year, month, day, rand()*100)}}' test-data.csv > example_10k.csv`

## Bulk CSV Upload
Template used is like this -
Date,Usage(kWh)
2025-03-01,25
2025-02-01,10
2025-03-10,2.5
2025-05-03,10.2
2025-02-01,3.2
2025-06-01,10.1
2025-03-01,25.6
2025-01-01,22
2026-01-01,22

I have the data in the public folder, so can test given example with this URL

`http://localhost:4280/api/energy/upload?url=http://localhost:5173/example_2500.csv`

`http://localhost:5173/example_2500.csv`
or
`http://<app_url>/example_2500.csv`

## SNS
Write a scheduled Azure Function (e.g., using a Timer trigger) to:
Fetch the latest energy usage data.
Compare it with stored thresholds.
Trigger Azure Event Grid notifications (email or SMS).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
