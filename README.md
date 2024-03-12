# Template to create a new Grafana panel plugin

![Dashboard](https://github.com/VolkovLabs/volkovlabs-abc-panel/raw/main/src/img/dashboard.png)

![Grafana 10](https://img.shields.io/badge/Grafana-10.1-orange)
![CI](https://github.com/volkovlabs/volkovlabs-abc-panel/workflows/CI/badge.svg)
![E2E](https://github.com/volkovlabs/volkovlabs-abc-panel/workflows/E2E/badge.svg)
[![codecov](https://codecov.io/gh/VolkovLabs/volkovlabs-abc-panel/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/volkovlabs-abc-panel)
[![CodeQL](https://github.com/VolkovLabs/volkovlabs-abc-panel/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VolkovLabs/volkovlabs-abc-panel/actions/workflows/codeql-analysis.yml)

## Introduction

The Abc panel is a template we created to streamline our development process and gladly share it with the Grafana community.

To make the creation process efficient, starting with a well-constructed template is always easier.

Generate a template with [https://github.com/VolkovLabs/volkovlabs-abc-panel/generate](https://github.com/VolkovLabs/volkovlabs-abc-panel/generate).

## Requirements

- Version 3.X requires Grafana 9 or Grafana 10.
- Version 2.X requires Grafana 8.5 or Grafana 9.
- Version 1.X requires Grafana 8.

## Getting Started

1. Install packages

```bash
npm install
```

2. Build the plugin

```bash
npm run build
```

3. Sign the plugins if required

```bash
export GRAFANA_ACCESS_POLICY_TOKEN=token==
npm run sign
```

4. Start the Docker container

```bash
npm run start
```

## Highlights

- Use `docker-compose` to start the development environment with provisioned data source and dashboard.
- Provides unit and E2E test configuration.
- Based on the latest version of Grafana and Grafana Tools.
- Includes GitHub Actions for CI, E2E and Release.
- Includes Static Data Source to emulate any data.

## Tutorial

Follow along and have your first-panel plugin built and provisioned. We created this three-part series as an easy-to-follow tutorial.

[![Build a panel plugin, part 1 | Grafana Crash Course for Developers](https://raw.githubusercontent.com/volkovlabs/volkovlabs-abc-panel/main/img/part1.png)](https://youtu.be/KnaPBKoXuEw)


## Support

- Subscribe to our [YouTube Channel](https://www.youtube.com/@volkovlabs) and leave your comments.
- Premium support for the development plugins is available via [GitHub Sponsor](https://github.com/sponsors/VolkovLabs).

## License

Apache License Version 2.0, see [LICENSE](https://github.com/volkovlabs/volkovlabs-abc-panel/blob/main/LICENSE).
