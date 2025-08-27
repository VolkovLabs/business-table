# Business Table Panel for Grafana

![Table Screenshot](https://github.com/VolkovLabs/business-table/raw/main/src/img/dashboard.png)

[![Grafana](https://img.shields.io/badge/Grafana-12.0-orange)](https://grafana.com/)
[![CI](https://github.com/volkovlabs/business-table/workflows/CI/badge.svg)](https://github.com/volkovlabs/business-table/actions/workflows/ci.yml)
[![E2E](https://github.com/volkovlabs/business-table/workflows/E2E/badge.svg)](https://github.com/volkovlabs/business-table/actions/workflows/e2e.yml)
[![Codecov](https://codecov.io/gh/VolkovLabs/business-table/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/business-table)
[![CodeQL](https://github.com/VolkovLabs/business-table/actions/workflows/codeql.yml/badge.svg)](https://github.com/VolkovLabs/business-table/actions/workflows/codeql-analysis.yml)

## 📋 Introduction

The **Business Table Panel** is a powerful and flexible Grafana plugin designed to elevate data visualization in table format. Tailored for business analytics and reporting dashboards, it offers advanced features like tree views, custom cell rendering, data editing, and export capabilities.

📺 **Watch our overview video** to get started:

[![Business Table Panel for Grafana | Overview and Tutorial for Beginners](https://raw.githubusercontent.com/volkovlabs/business-table/main/img/overview.png)](https://youtu.be/kOjt9Bl3VQo)

## 📋 Requirements

- **Business Table Panel 3.x** requires **Grafana 11** or **Grafana 12**.
- **Business Table Panel 1.x, 2.x** requires **Grafana 10.3** or **Grafana 11**.

## 🚀 Installation

Choose one of the following methods to install the plugin:

### Grafana Plugins Catalog

Visit the official plugin page at [grafana.com/plugins/volkovlabs-table-panel](https://grafana.com/grafana/plugins/volkovlabs-table-panel/) and follow the provided instructions.

### Grafana CLI

Run the following command in your terminal:

```bash
grafana cli plugins install volkovlabs-table-panel
```

📺 **Need help with installation?** Watch our guide:

[![Install Business Suite Plugins in Cloud, OSS, Enterprise](https://raw.githubusercontent.com/volkovlabs/.github/main/started.png)](https://youtu.be/1qYzHfPXJF8)

## ✨ Key Features

- **Tree View**: Display hierarchical data with expandable and collapsible rows.
- **Tabbed Views**: Switch between multiple data frames within a single panel.
- **Dynamic Filtering**: Filter table data using dashboard variables.
- **Pagination**: Support for client-side and server-side pagination for large datasets.
- **Thresholds**: Apply Grafana’s threshold styling for visual data insights.
- **Custom Cell Types**: Render cells as JSON, Gauge, Image, HTML/Markdown, and more.
- **Data Editing**: Enable permission-based editing with query integration.
- **Export Options**: Download table data as CSV or Excel files.

## 🛠️ Business Suite for Grafana

The Business Table Panel is part of the **Business Suite**, a collection of open-source plugins by [Volkov Labs](https://volkovlabs.io/). These plugins address common business needs with user-friendly interfaces, comprehensive documentation, and supporting video tutorials.

[![Business Suite for Grafana](https://raw.githubusercontent.com/VolkovLabs/.github/main/business.png)](https://volkovlabs.io/plugins/)

## 📜 License

This project is licensed under the [Apache License 2.0](https://github.com/volkovlabs/business-table/blob/main/LICENSE).
