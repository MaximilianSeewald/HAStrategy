# Max Home Dashboard Strategy

A custom Home Assistant dashboard strategy that builds a room-first Lovelace dashboard from your Home Assistant areas, floors, devices, and entities.

## Install In Home Assistant

This dashboard includes a Shopping view that uses the shopping-list card and Home Assistant add-on from [KtorFramework](https://github.com/MaximilianSeewald/KtorFramework). Install the KtorFramework Home Assistant pieces first if you want the built-in Shopping view to work.

### 1. Install KtorFramework For Shopping

KtorFramework provides:

- the `Ktor App` Home Assistant add-on, with the default add-on slug `ktor_app`
- the `custom:ktor-shopping-list-card` Lovelace card
- the shopping-list backend used by the card

Add `https://github.com/MaximilianSeewald/KtorFramework` to Home Assistant as an add-on repository, install and start `Ktor App`, then add the same repository to HACS as a custom `Dashboard` repository and install the shopping-list card.

Confirm Home Assistant has the card resource:

```yaml
resources:
  - url: /hacsfiles/KtorFramework/KtorFramework.js
    type: module
```

### 2. Install This Dashboard Strategy

The recommended install path is HACS as a custom dashboard repository.

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
6. Confirm Home Assistant has the strategy resource:

```yaml
resources:
  - url: /hacsfiles/HAStrategy/HAStrategy.js
    type: module
```

### 3. Create A Dashboard

Create a new dashboard that uses the strategy:

```yaml
strategy:
  type: custom:max-home-dashboard
```

After the resource is loaded, the strategy also registers itself as **Max Home** in Home Assistant's community dashboard suggestions.

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

The generated dashboard contains:

- a Dashboard overview with rooms grouped by floor
- category summaries for lighting, climate, security, and media entities
- a Shopping view powered by KtorFramework
- hidden room subviews for each Home Assistant area
- optional custom category views from strategy YAML

### Shopping View

The Shopping view is enabled by default and renders this card:

```yaml
type: custom:ktor-shopping-list-card
title: Shopping List
addon_slug: ktor_app
show_completed: true
```

Disable it when KtorFramework is not installed:

```yaml
strategy:
  type: custom:max-home-dashboard
  shopping:
    enabled: false
```

For a custom deployment, provide a backend URL instead of the add-on slug:

```yaml
strategy:
  type: custom:max-home-dashboard
  shopping:
    backend_url: /api/hassio_ingress/CURRENT_GENERATED_INGRESS_PATH/
```

### Entity Filtering

By default, the strategy hides entity registry entries in Home Assistant's `config` and `diagnostic` categories:

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

### Custom Categories

Add additional views with the `categories` list. The `id` becomes the path unless `path` is provided, and `cards` are passed through as Lovelace card configs.

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

For local Home Assistant development, build the project and serve `dist/HAStrategy.js` through your preferred Home Assistant development setup. HACS is still the recommended install method for a normal Home Assistant instance.

## Project Layout

```text
src/
  home-assistant.ts  Local Home Assistant and Lovelace types
  strategy.ts        Dashboard and view strategy implementation
  index.ts           Browser entrypoint
```
