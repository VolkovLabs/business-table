# Changelog

All notable changes to the **Business Table Panel** plugin for Grafana are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - Unreleased

### Added

- Replace variables to Group names (#313)

### Changes

- Updated E2E dependencies (#308)

## [2.6.0] - 2025-04-22

### Added

- Sorting by user preferences in the UI ([#302](https://github.com/VolkovLabs/business-table/issues/302))
- Image preview and downloadable cell updates ([#306](https://github.com/VolkovLabs/business-table/issues/306))

### Changed

- Upgraded to Grafana 11.6 with dependency updates ([#307](https://github.com/VolkovLabs/business-table/issues/307))

## [2.5.0] - 2025-03-30

### Added

- Export format options ([#290](https://github.com/VolkovLabs/business-table/issues/290))
- File download cell type ([#291](https://github.com/VolkovLabs/business-table/issues/291))
- User preferences and UI manager ([#283](https://github.com/VolkovLabs/business-table/issues/283))

### Changed

- Updated download data support for XLS and CSV formats ([#294](https://github.com/VolkovLabs/business-table/issues/294))

## [2.4.0] - 2025-03-10

### Added

- File upload editor ([#270](https://github.com/VolkovLabs/business-table/issues/270))
- Row background color support from hidden fields ([#273](https://github.com/VolkovLabs/business-table/issues/273))
- Date format editor ([#275](https://github.com/VolkovLabs/business-table/issues/275))

## [2.3.0] - 2025-02-26

### Added

- Column tooltip option ([#260](https://github.com/VolkovLabs/business-table/issues/260))
- Custom scrollbar from Grafana UI ([#251](https://github.com/VolkovLabs/business-table/issues/251))

### Changed

- Improved highlighted row behavior ([#250](https://github.com/VolkovLabs/business-table/issues/250))
- Updated alignment icons in panel options ([#261](https://github.com/VolkovLabs/business-table/issues/261))
- Enhanced cell text contrast for data links ([#253](https://github.com/VolkovLabs/business-table/issues/253))
- Upgraded to Grafana 11.5 with dependency updates ([#262](https://github.com/VolkovLabs/business-table/issues/262), [#265](https://github.com/VolkovLabs/business-table/issues/265))
- Updated release workflow to include attestation ([#262](https://github.com/VolkovLabs/business-table/issues/262))

## [2.2.0] - 2025-02-10

### Added

- Row highlighting with background and auto-scroll ([#243](https://github.com/VolkovLabs/business-table/issues/243))

### Changed

- Updated gauge values for Grafana 10.3.0 ([#241](https://github.com/VolkovLabs/business-table/issues/241))

### Fixed

- Resolved unexpected errors in "Data Links" dashboard ([#241](https://github.com/VolkovLabs/business-table/issues/241))

## [2.1.0] - 2025-02-04

### Added

- Excel download settings ([#227](https://github.com/VolkovLabs/business-table/issues/227), [#233](https://github.com/VolkovLabs/business-table/issues/233))
- JSON cell type with inspector ([#224](https://github.com/VolkovLabs/business-table/issues/224))
- Action column configuration ([#231](https://github.com/VolkovLabs/business-table/issues/231))
- Gauge cell type ([#238](https://github.com/VolkovLabs/business-table/issues/238))

### Changed

- Updated data links to prevent dashboard reload ([#232](https://github.com/VolkovLabs/business-table/issues/232))

## [2.0.0] - 2025-01-07

### Added

- Boolean value normalization ([#198](https://github.com/VolkovLabs/business-table/issues/198))
- Row count display within groups ([#199](https://github.com/VolkovLabs/business-table/issues/199))
- Error messages for data source requests ([#213](https://github.com/VolkovLabs/business-table/issues/213))

### Changed

- Improved column text word wrapping ([#195](https://github.com/VolkovLabs/business-table/issues/195))
- Updated code editor packages ([#194](https://github.com/VolkovLabs/business-table/issues/194))
- Upgraded to Grafana 11.4 with dependency updates ([#214](https://github.com/VolkovLabs/business-table/issues/214))

## [1.9.0] - 2024-12-01

### Added

- Image cell type ([#177](https://github.com/VolkovLabs/business-table/issues/177))
- Autosize code editor enhancements ([#179](https://github.com/VolkovLabs/business-table/issues/179))
- Default pagination size ([#181](https://github.com/VolkovLabs/business-table/issues/181))
- Preformatted cell type ([#180](https://github.com/VolkovLabs/business-table/issues/180))
- Row add/delete functionality ([#184](https://github.com/VolkovLabs/business-table/issues/184))

### Changed

- Improved table cell borders ([#183](https://github.com/VolkovLabs/business-table/issues/183))

## [1.8.0] - 2024-11-21

### Added

- Variable support in data sources for editable and nested objects ([#167](https://github.com/VolkovLabs/business-table/issues/167))
- Custom value support for editable select fields ([#165](https://github.com/VolkovLabs/business-table/issues/165))
- Type checking for text areas ([#172](https://github.com/VolkovLabs/business-table/issues/172))

### Changed

- Updated sort state persistence on dashboard refresh ([#163](https://github.com/VolkovLabs/business-table/issues/163))
- Improved group expand/collapse behavior ([#161](https://github.com/VolkovLabs/business-table/issues/161))

### Fixed

- Resolved group expansion issues for empty cells ([#169](https://github.com/VolkovLabs/business-table/issues/169))
- Fixed text area initial value error during editing ([#176](https://github.com/VolkovLabs/business-table/issues/176))

## [1.7.0] - 2024-11-16

### Added

- Sanitized HTML and Markdown column types ([#154](https://github.com/VolkovLabs/business-table/issues/154))
- Option to hide table header ([#157](https://github.com/VolkovLabs/business-table/issues/157))

### Changed

- Enhanced `useNestedObjects` hook to show request errors and empty values ([#158](https://github.com/VolkovLabs/business-table/issues/158))
- Adjusted row heights on group collapse ([#159](https://github.com/VolkovLabs/business-table/issues/159))
- Updated filter options for exact matches ([#160](https://github.com/VolkovLabs/business-table/issues/160))
- Changed data source references to use IDs ([#156](https://github.com/VolkovLabs/business-table/issues/156))

## [1.6.0] - 2024-10-29

### Added

- Variable replacement in file names ([#131](https://github.com/VolkovLabs/business-table/issues/131)) and column headers ([#134](https://github.com/VolkovLabs/business-table/issues/134))
- Textarea column editor type ([#133](https://github.com/VolkovLabs/business-table/issues/133))
- Colored text and background for aggregated rows ([#136](https://github.com/VolkovLabs/business-table/issues/136))
- Column header customization ([#141](https://github.com/VolkovLabs/business-table/issues/141))

### Changed

- Improved dashboard refresh and runtime variable handling ([#129](https://github.com/VolkovLabs/business-table/issues/129))
- Upgraded to Grafana 11.3 with dependency updates ([#137](https://github.com/VolkovLabs/business-table/issues/137))
- Enhanced data source request error handling ([#140](https://github.com/VolkovLabs/business-table/issues/140))
- Improved text wrapping ([#143](https://github.com/VolkovLabs/business-table/issues/143))

## [1.5.0] - 2024-10-08

### Added

- HTML content sanitization ([#110](https://github.com/VolkovLabs/business-table/issues/110))
- Hidden column data in payload ([#112](https://github.com/VolkovLabs/business-table/issues/112))

### Changed

- Enhanced autosize code editor toolbar ([#99](https://github.com/VolkovLabs/business-table/issues/99))

### Fixed

- Fixed newline escaping in content edits ([#111](https://github.com/VolkovLabs/business-table/issues/111))

## [1.4.0] - 2024-10-02

### Added

- Standard options support for aggregated cells ([#79](https://github.com/VolkovLabs/business-table/issues/79))
- Nested objects cell type ([#80](https://github.com/VolkovLabs/business-table/issues/80))
- YouTube tutorial link ([#93](https://github.com/VolkovLabs/business-table/issues/93))
- Column show/hide functionality ([#94](https://github.com/VolkovLabs/business-table/issues/94))

### Changed

- Updated end-to-end tests ([#81](https://github.com/VolkovLabs/business-table/issues/81))
- Moved pagination options to a separate category ([#87](https://github.com/VolkovLabs/business-table/issues/87))
- Improved nested object display (first/last object) ([#92](https://github.com/VolkovLabs/business-table/issues/92))
- Updated end-to-end tests for panel editing in dashboard scene ([#96](https://github.com/VolkovLabs/business-table/issues/96))

### Fixed

- Fixed row data handling for accessor keys with dots ([#90](https://github.com/VolkovLabs/business-table/issues/90))
- Fixed query pagination errors with client-side filtering ([#95](https://github.com/VolkovLabs/business-table/issues/95))

## [1.3.0] - 2024-09-20

### Breaking Changes

- Requires Grafana 10.3 or Grafana 11

### Added

- Permission-based data editing ([#40](https://github.com/VolkovLabs/business-table/issues/40), [#76](https://github.com/VolkovLabs/business-table/issues/76))
- Query-based edit permissions ([#47](https://github.com/VolkovLabs/business-table/issues/47))
- Client-side and query-based pagination ([#50](https://github.com/VolkovLabs/business-table/issues/50))
- Column pinning ([#53](https://github.com/VolkovLabs/business-table/issues/53), [#65](https://github.com/VolkovLabs/business-table/issues/65))
- CSV download functionality ([#61](https://github.com/VolkovLabs/business-table/issues/61))
- Data links support ([#75](https://github.com/VolkovLabs/business-table/issues/75))

### Changed

- Improved page size button layout to prevent overflow ([#62](https://github.com/VolkovLabs/business-table/issues/62))
- Added table state reset on tab change ([#67](https://github.com/VolkovLabs/business-table/issues/67))
- Enhanced table editor UI/UX ([#66](https://github.com/VolkovLabs/business-table/issues/66))
- Improved sorting options ([#69](https://github.com/VolkovLabs/business-table/issues/69))

## [1.2.0] - 2024-09-05

### Added

- Colored background column type ([#33](https://github.com/VolkovLabs/business-table/issues/33))
- Column width and text wrap options ([#34](https://github.com/VolkovLabs/business-table/issues/34))
- Table footer ([#36](https://github.com/VolkovLabs/business-table/issues/36))

### Changed

- Upgraded to Grafana 11.2.0 ([#37](https://github.com/VolkovLabs/business-table/issues/37))

### Fixed

- Fixed issue with adding new tables ([#39](https://github.com/VolkovLabs/business-table/issues/39))

## [1.1.0] - 2024-08-22

### Added

- Column filtering ([#21](https://github.com/VolkovLabs/business-table/issues/21))
- Tab sorting option ([#29](https://github.com/VolkovLabs/business-table/issues/29))

### Changed

- Signed as a Grafana Community plugin ([#23](https://github.com/VolkovLabs/business-table/issues/23))
- Renamed "groups" to "tables" ([#27](https://github.com/VolkovLabs/business-table/issues/27))
- Updated options to show aggregation when columns are grouped ([#28](https://github.com/VolkovLabs/business-table/issues/28))
- Upgraded to Grafana 11.1.4 ([#31](https://github.com/VolkovLabs/business-table/issues/31))

## [1.0.0] - 2024-08-04

### Added

- Initial release based on Grafana 11.1.0
- Basic column editor ([#1](https://github.com/VolkovLabs/business-table/issues/1))
- Groups and tabs functionality ([#17](https://github.com/VolkovLabs/business-table/issues/17))
