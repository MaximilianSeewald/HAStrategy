# Max Home Dashboard Strategy

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
dist/HAStrategy.js
```

## Install In Home Assistant

The easiest install path is through HACS as a custom dashboard repository. This lets Home Assistant download and update the strategy without manually copying files into `/config/www`.

### HACS Custom Repository

Click this button to open the repository in HACS:

[![Open your Home Assistant instance and open this repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=MaximilianSeewald&repository=HAStrategy&category=dashboard)

Or add it manually:

1. Open HACS in Home Assistant.
2. Open the three-dot menu and choose **Custom repositories**.
3. Add this repository URL:

```text
https://github.com/MaximilianSeewald/HAStrategy
```

4. Select **Dashboard** as the repository type.
5. Download **Max Home Dashboard Strategy** from HACS.
6. Add the dashboard resource if HACS did not add it automatically:

```yaml
resources:
  - url: /hacsfiles/HAStrategy/HAStrategy.js
    type: module
```

7. Create a dashboard that uses the strategy:

```yaml
strategy:
  type: custom:max-home-dashboard
```

On Home Assistant 2026.5 or newer, the strategy also registers itself for the new dashboard dialog under Community dashboards after the resource is loaded.

### Development Install

For local development, run `npm.cmd run build` and serve `dist/HAStrategy.js` through your preferred Home Assistant development setup. HACS is still the recommended install method for a normal Home Assistant instance.

## Project Layout

```text
src/
  home-assistant.ts  Local Home Assistant and Lovelace types
  strategy.ts        Dashboard and view strategy implementation
  index.ts           Browser entrypoint
```
