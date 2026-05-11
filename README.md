# Max Home Dashboard Strategy

A TypeScript Home Assistant dashboard strategy that creates a polished, room-first dashboard with native Lovelace cards.

The strategy creates:

- a Dashboard overview with floor-grouped room navigation and category summaries
- a Shopping category that embeds the Ktor shopping-list Lovelace card
- optional custom category views that can be extended from strategy YAML
- hidden room subviews for each Home Assistant area
- grouped room cards for lights, climate, security, media, sensors, and other entities
- default filtering for Home Assistant configuration and diagnostic entities
- Home Assistant 2026.5 community dashboard metadata through `window.customStrategies`

## Strategy Config

Basic dashboard:

```yaml
strategy:
  type: custom:max-home-dashboard
```

Full example:

```yaml
strategy:
  type: custom:max-home-dashboard
  title: Max Home
  shopping:
    enabled: true
    title: Shopping
    addon_slug: ktor_app
    show_completed: true
  entity_filter:
    hide_entity_categories:
      - config
      - diagnostic
  categories:
    - id: custom-category
      title: Custom Category
      icon: mdi:star-outline
      cards:
        - type: markdown
          content: "Custom cards go here"
```

The top navigation contains only Dashboard, Shopping, and custom categories. Rooms and generated entity categories such as Beleuchtung, Raumklima, Sicherheit, and Mediaplayer are subviews opened from the Dashboard buttons.

### Entity Filtering

By default, the strategy hides entity registry entries in Home Assistant's configuration and diagnostic categories:

```yaml
strategy:
  type: custom:max-home-dashboard
  entity_filter:
    hide_entity_categories:
      - config
      - diagnostic
```

Show those entities again by setting an empty list:

```yaml
strategy:
  type: custom:max-home-dashboard
  entity_filter:
    hide_entity_categories: []
```

### Shopping Category

The Shopping category is enabled by default and uses the Ktor shopping-list card:

```yaml
type: custom:ktor-shopping-list-card
title: Shopping List
addon_slug: ktor_app
show_completed: true
```

Install the card separately from the KtorFramework repository through HACS as a dashboard resource:

```yaml
resources:
  - url: /hacsfiles/KtorFramework/KtorFramework.js
    type: module
```

Disable the built-in Shopping category:

```yaml
strategy:
  type: custom:max-home-dashboard
  shopping:
    enabled: false
```

For custom deployments, provide a backend URL instead of the add-on slug:

```yaml
strategy:
  type: custom:max-home-dashboard
  shopping:
    backend_url: /api/hassio_ingress/CURRENT_GENERATED_INGRESS_PATH/
```

### Custom Categories

Add future categories with the `categories` list. The `id` becomes the path unless `path` is provided, and `cards` are passed through as Lovelace card configs.

```yaml
strategy:
  type: custom:max-home-dashboard
  categories:
    - id: energy
      title: Energy
      icon: mdi:lightning-bolt-outline
      cards:
        - type: energy-usage-graph
```

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
