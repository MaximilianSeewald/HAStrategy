# Home Assistant Dashboard Strategy

A TypeScript starter project for building a custom Home Assistant dashboard strategy.

The initial strategy creates:

- an overview view
- one view per Home Assistant area
- an entities card in each area view for visible entities assigned to that area
- Home Assistant 2026.5 community dashboard metadata through `window.customStrategies`

## Development

Install dependencies:

```powershell
npm.cmd install
```

Run a production build:

```powershell
npm.cmd run build
```

Watch and rebuild while editing:

```powershell
npm.cmd run dev
```

The distributable file is written to:

```text
dist/ha-dashboard-strategy.js
```

## Use In Home Assistant

1. Copy `dist/ha-dashboard-strategy.js` into your Home Assistant `/config/www/` folder.
2. Add it as a dashboard resource:

```yaml
resources:
  - url: /local/ha-dashboard-strategy.js
    type: module
```

3. Create a dashboard that uses the strategy:

```yaml
strategy:
  type: custom:max-home-dashboard
```

On Home Assistant 2026.5 or newer, the strategy also registers itself for the new dashboard dialog under Community dashboards after the resource is loaded.

## Project Layout

```text
src/
  home-assistant.ts  Local Home Assistant and Lovelace types
  strategy.ts        Dashboard and view strategy implementation
  index.ts           Browser entrypoint
```
