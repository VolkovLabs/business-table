# Changelog

All notable changes to the **Business Table Panel** plugin for Grafana are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.0] - Unreleased

### ✨ Added

- Added handlebars for nested objects. ([#382](https://github.com/VolkovLabs/business-table/pull/382))

## [3.3.0] - 2025-08-18

### ✨ Added

- Improve error handling for Update requests. ([#376](https://github.com/VolkovLabs/business-table/pull/376))
- Added an option to switch Manager UI between table in group and columns. ([#379](https://github.com/VolkovLabs/business-table/pull/379))

## [3.2.0] - 2025-08-07

We're excited to announce the release of version 3.2.0 of the Business Table plugin. This update introduces new features to enhance user experience and functionality, along with important fixes and improvements to existing features.

### ✨ Added

- **Row Highlight on Hover**: Added an option to highlight table rows when hovering over them for improved visibility. ([#365](https://github.com/VolkovLabs/business-table/pull/365))
- **Integer Boolean Cell Type**: Introduced support for integer-based Boolean cell values (0-1) to accommodate diverse data formats. ([#366](https://github.com/VolkovLabs/business-table/pull/366))
- **Nested Objects in Export**: Enhanced table export functionality to include nested objects for more comprehensive data handling. ([#374](https://github.com/VolkovLabs/business-table/pull/374))

### 🔄 Changed

- **Pinned Header Background**: Corrected the background color issue for pinned headers to ensure consistent styling. ([#363](https://github.com/VolkovLabs/business-table/pull/363))
- **ESLint Configuration**: Updated ESLint settings to align with the latest coding standards and improve code quality. ([#367](https://github.com/VolkovLabs/business-table/pull/367))
- **Filter and Sorting Icons**: Combined Filter and Sorting icons into a unified display when the Manager is active for a cleaner UI. ([#375](https://github.com/VolkovLabs/business-table/pull/375))

## [3.1.0] - 2025-07-11

### ✨ Added

- **Filter Mode Options Description**: Introduced detailed descriptions for filter mode options to help users better understand and utilize filtering capabilities. ([#353](https://github.com/VolkovLabs/business-table/pull/353))
- **Custom Icon Selection for Column Manager**: Added the ability to choose between native and custom icons in the column manager, providing greater flexibility in table customization. ([#360](https://github.com/VolkovLabs/business-table/pull/360))

### 🔄 Changed

- **Enhanced Export Functionality**: Updated the export feature to streamline the process, making it more intuitive and user-friendly for exporting table data. ([#358](https://github.com/VolkovLabs/business-table/pull/358))

## [3.0.0] - 2025-06-30

This release introduces new features, important compatibility updates, and several enhancements to improve your experience.

### ⚠️ Breaking Changes

- **Grafana Compatibility**: This version requires Grafana 11 or Grafana 12. Please ensure your Grafana instance is updated to a compatible version before upgrading.

### ✨ Added

- **Striped Rows**: Added the option to enable striped rows for better readability of table data. ([#347](https://github.com/VolkovLabs/business-table/pull/347))
- **No Data Message**: Introduced support for a customizable "No Data" message using standard options. ([#348](https://github.com/VolkovLabs/business-table/pull/348))
- **File Name Option**: Added a new option to specify file names for File type cells. ([#349](https://github.com/VolkovLabs/business-table/pull/349))

### 🔄 Changed

- **Grafana 12.0 Support**: Upgraded the plugin to support Grafana 12.0 with updated dependencies for improved performance and compatibility. ([#344](https://github.com/VolkovLabs/business-table/pull/344))
- **Live Filter Fix**: Resolved an issue with the cleanup action in the 'live' filter for smoother filtering operations. ([#346](https://github.com/VolkovLabs/business-table/pull/346))
- **User Preferences Update**: Updated the `userPreferences` key to include Panel and Dashboard IDs for more precise user settings management. ([#351](https://github.com/VolkovLabs/business-table/pull/351))

## [2.7.0] - 2025-06-24

### Added

- **Variable Replacement**: Added support for replacing variables with group names. ([#313](https://github.com/VolkovLabs/business-table/pull/313))
- **Google Sheets Export**: Introduced functionality to export table data directly to Google Sheets. ([#319](https://github.com/VolkovLabs/business-table/pull/319))
- **Default Filter Value**: Enabled setting a default filter value in Client mode for improved usability. ([#341](https://github.com/VolkovLabs/business-table/pull/341))

### Changed

- **Testing Dependencies**: Updated dependencies for end-to-end (E2E) testing to ensure reliability. ([#308](https://github.com/VolkovLabs/business-table/pull/308))
- **Sorting Behavior**: Enhanced sorting functionality in the UI manager and table header cells for a smoother experience. ([#314](https://github.com/VolkovLabs/business-table/pull/314))
- **User Preferences**: Allowed saving of user preferences without requiring the UI manager. ([#340](https://github.com/VolkovLabs/business-table/pull/340))
- **Background Row Fix**: Applied a fix to improve rendering of background rows. ([#343](https://github.com/VolkovLabs/business-table/pull/343))

## [2.6.0] - 2025-04-22

### Added

- Sorting based on user preferences in the UI ([#302](https://github.com/VolkovLabs/business-table/issues/302))
- Enhanced image preview and downloadable cell updates ([#306](https://github.com/VolkovLabs/business-table/issues/306))

### Changed

- Upgraded to Grafana 11.6 with updated dependencies ([#307](https://github.com/VolkovLabs/business-table/issues/307))

## [2.5.0] - 2025-03-30

### Added

- Export format options for data downloads ([#290](https://github.com/VolkovLabs/business-table/issues/290))
- New file download cell type ([#291](https://github.com/VolkovLabs/business-table/issues/291))
- User preferences and UI manager for customization ([#283](https://github.com/VolkovLabs/business-table/issues/283))

### Changed

- Enhanced support for downloading data in XLS and CSV formats ([#294](https://github.com/VolkovLabs/business-table/issues/294))

## [2.4.0] - 2025-03-10

### Added

- File upload editor for easier data handling ([#270](https://github.com/VolkovLabs/business-table/issues/270))
- Row background color support using hidden fields ([#273](https://github.com/VolkovLabs/business-table/issues/273))
- Date format editor for customizable date display ([#275](https://github.com/VolkovLabs/business-table/issues/275))

## [2.3.0] - 2025-02-26

### Added

- Column tooltip option for better user guidance ([#260](https://github.com/VolkovLabs/business-table/issues/260))
- Custom scrollbar integration from Grafana UI ([#251](https://github.com/VolkovLabs/business-table/issues/251))

### Changed

- Improved behavior of highlighted rows ([#250](https://github.com/VolkovLabs/business-table/issues/250))
- Updated alignment icons in panel options for clarity ([#261](https://github.com/VolkovLabs/business-table/issues/261))
- Enhanced cell text contrast for data links ([#253](https://github.com/VolkovLabs/business-table/issues/253))
- Upgraded to Grafana 11.5 with dependency updates ([#262](https://github.com/VolkovLabs/business-table/issues/262), [#265](https://github.com/VolkovLabs/business-table/issues/265))
- Updated release workflow to include attestation for security ([#262](https://github.com/VolkovLabs/business-table/issues/262))

## [2.2.0] - 2025-02-10

### Added

- Row highlighting with background color and auto-scroll functionality ([#243](https://github.com/VolkovLabs/business-table/issues/243))

### Changed

- Updated gauge values for compatibility with Grafana 10.3.0 ([#241](https://github.com/VolkovLabs/business-table/issues/241))

### Fixed

- Resolved unexpected errors in the "Data Links" dashboard ([#241](https://github.com/VolkovLabs/business-table/issues/241))

## [2.1.0] - 2025-02-04

### Added

- Excel download settings for customized exports ([#227](https://github.com/VolkovLabs/business-table/issues/227), [#233](https://github.com/VolkovLabs/business-table/issues/233))
- JSON cell type with inspector for detailed views ([#224](https://github.com/VolkovLabs/business-table/issues/224))
- Action column configuration for interactive elements ([#231](https://github.com/VolkovLabs/business-table/issues/231))
- Gauge cell type for visual data representation ([#238](https://github.com/VolkovLabs/business-table/issues/238))

### Changed

- Updated data links to prevent unnecessary dashboard reloads ([#232](https://github.com/VolkovLabs/business-table/issues/232))

## [2.0.0] - 2025-01-07

### Added

- Boolean value normalization for consistent data handling ([#198](https://github.com/VolkovLabs/business-table/issues/198))
- Row count display within grouped data ([#199](https://github.com/VolkovLabs/business-table/issues/199))
- Error messages for data source requests to improve debugging ([#213](https://github.com/VolkovLabs/business-table/issues/213))

### Changed

- Improved column text word wrapping for better readability ([#195](https://github.com/VolkovLabs/business-table/issues/195))
- Updated code editor packages for enhanced performance ([#194](https://github.com/VolkovLabs/business-table/issues/194))
- Upgraded to Grafana 11.4 with dependency updates ([#214](https://github.com/VolkovLabs/business-table/issues/214))

## [1.9.0] - 2024-12-01

### Added

- Image cell type for visual data representation ([#177](https://github.com/VolkovLabs/business-table/issues/177))
- Autosize code editor enhancements for better usability ([#179](https://github.com/VolkovLabs/business-table/issues/179))
- Default pagination size for improved data navigation ([#181](https://github.com/VolkovLabs/business-table/issues/181))
- Preformatted cell type for structured text display ([#180](https://github.com/VolkovLabs/business-table/issues/180))
- Row add/delete functionality for dynamic data management ([#184](https://github.com/VolkovLabs/business-table/issues/184))

### Changed

- Improved table cell borders for a cleaner look ([#183](https://github.com/VolkovLabs/business-table/issues/183))

## [1.8.0] - 2024-11-21

### Added

- Variable support in data sources for editable and nested objects ([#167](https://github.com/VolkovLabs/business-table/issues/167))
- Custom value support for editable select fields ([#165](https://github.com/VolkovLabs/business-table/issues/165))
- Type checking for text areas to ensure data integrity ([#172](https://github.com/VolkovLabs/business-table/issues/172))

### Changed

- Updated sort state persistence on dashboard refresh for consistency ([#163](https://github.com/VolkovLabs/business-table/issues/163))
- Improved group expand/collapse behavior for better UX ([#161](https://github.com/VolkovLabs/business-table/issues/161))

### Fixed

- Resolved group expansion issues for empty cells ([#169](https://github.com/VolkovLabs/business-table/issues/169))
- Fixed text area initial value error during editing ([#176](https://github.com/VolkovLabs/business-table/issues/176))

## [1.7.0] - 2024-11-16

### Added

- Sanitized HTML and Markdown column types for secure rendering ([#154](https://github.com/VolkovLabs/business-table/issues/154))
- Option to hide table header for a minimalistic view ([#157](https://github.com/VolkovLabs/business-table/issues/157))

### Changed

- Enhanced `useNestedObjects` hook to display request errors and handle empty values ([#158](https://github.com/VolkovLabs/business-table/issues/158))
- Adjusted row heights on group collapse for better spacing ([#159](https://github.com/VolkovLabs/business-table/issues/159))
- Updated filter options to support exact matches ([#160](https://github.com/VolkovLabs/business-table/issues/160))
- Changed data source references to use IDs for reliability ([#156](https://github.com/VolkovLabs/business-table/issues/156))

## [1.6.0] - 2024-10-29

### Added

- Variable replacement in file names ([#131](https://github.com/VolkovLabs/business-table/issues/131)) and column headers ([#134](https://github.com/VolkovLabs/business-table/issues/134))
- Textarea column editor type for multi-line input ([#133](https://github.com/VolkovLabs/business-table/issues/133))
- Colored text and background for aggregated rows ([#136](https://github.com/VolkovLabs/business-table/issues/136))
- Column header customization for personalized views ([#141](https://github.com/VolkovLabs/business-table/issues/141))

### Changed

- Improved dashboard refresh and runtime variable handling ([#129](https://github.com/VolkovLabs/business-table/issues/129))
- Upgraded to Grafana 11.3 with dependency updates ([#137](https://github.com/VolkovLabs/business-table/issues/137))
- Enhanced data source request error handling for robustness ([#140](https://github.com/VolkovLabs/business-table/issues/140))
- Improved text wrapping for better readability ([#143](https://github.com/VolkovLabs/business-table/issues/143))

## [1.5.0] - 2024-10-08

### Added

- HTML content sanitization for security ([#110](https://github.com/VolkovLabs/business-table/issues/110))
- Hidden column data included in payload for processing ([#112](https://github.com/VolkovLabs/business-table/issues/112))

### Changed

- Enhanced autosize code editor toolbar for better usability ([#99](https://github.com/VolkovLabs/business-table/issues/99))

### Fixed

- Fixed newline escaping in content edits for accurate rendering ([#111](https://github.com/VolkovLabs/business-table/issues/111))

## [1.4.0] - 2024-10-02

### Added

- Standard options support for aggregated cells ([#79](https://github.com/VolkovLabs/business-table/issues/79))
- Nested objects cell type for complex data structures ([#80](https://github.com/VolkovLabs/business-table/issues/80))
- YouTube tutorial link for user guidance ([#93](https://github.com/VolkovLabs/business-table/issues/93))
- Column show/hide functionality for customizable views ([#94](https://github.com/VolkovLabs/business-table/issues/94))

### Changed

- Updated end-to-end tests for reliability ([#81](https://github.com/VolkovLabs/business-table/issues/81))
- Moved pagination options to a separate category for clarity ([#87](https://github.com/VolkovLabs/business-table/issues/87))
- Improved nested object display to show first/last object ([#92](https://github.com/VolkovLabs/business-table/issues/92))
- Updated end-to-end tests for panel editing in dashboard scene ([#96](https://github.com/VolkovLabs/business-table/issues/96))

### Fixed

- Fixed row data handling for accessor keys with dots ([#90](https://github.com/VolkovLabs/business-table/issues/90))
- Fixed query pagination errors with client-side filtering ([#95](https://github.com/VolkovLabs/business-table/issues/95))

## [1.3.0] - 2024-09-20

### Breaking Changes

- Requires Grafana 10.3 or Grafana 11 for compatibility.

### Added

- Permission-based data editing for secure access control ([#40](https://github.com/VolkovLabs/business-table/issues/40), [#76](https://github.com/VolkovLabs/business-table/issues/76))
- Query-based edit permissions for granular control ([#47](https://github.com/VolkovLabs/business-table/issues/47))
- Client-side and query-based pagination for flexible data handling ([#50](https://github.com/VolkovLabs/business-table/issues/50))
- Column pinning for improved data visibility ([#53](https://github.com/VolkovLabs/business-table/issues/53), [#65](https://github.com/VolkovLabs/business-table/issues/65))
- CSV download functionality for data export ([#61](https://github.com/VolkovLabs/business-table/issues/61))
- Data links support for interactive navigation ([#75](https://github.com/VolkovLabs/business-table/issues/75))

### Changed

- Improved page size button layout to prevent overflow ([#62](https://github.com/VolkovLabs/business-table/issues/62))
- Added table state reset on tab change for consistency ([#67](https://github.com/VolkovLabs/business-table/issues/67))
- Enhanced table editor UI/UX for better usability ([#66](https://github.com/VolkovLabs/business-table/issues/66))
- Improved sorting options for user convenience ([#69](https://github.com/VolkovLabs/business-table/issues/69))

## [1.2.0] - 2024-09-05

### Added

- Colored background column type for visual distinction ([#33](https://github.com/VolkovLabs/business-table/issues/33))
- Column width and text wrap options for customization ([#34](https://github.com/VolkovLabs/business-table/issues/34))
- Table footer for summary information ([#36](https://github.com/VolkovLabs/business-table/issues/36))

### Changed

- Upgraded to Grafana 11.2.0 for compatibility ([#37](https://github.com/VolkovLabs/business-table/issues/37))

### Fixed

- Fixed issue with adding new tables for seamless operation ([#39](https://github.com/VolkovLabs/business-table/issues/39))

## [1.1.0] - 2024-08-22

### Added

- Column filtering for refined data views ([#21](https://github.com/VolkovLabs/business-table/issues/21))
- Tab sorting option for organized navigation ([#29](https://github.com/VolkovLabs/business-table/issues/29))

### Changed

- Signed as a Grafana Community plugin for authenticity ([#23](https://github.com/VolkovLabs/business-table/issues/23))
- Renamed "groups" to "tables" for clarity ([#27](https://github.com/VolkovLabs/business-table/issues/27))
- Updated options to show aggregation when columns are grouped ([#28](https://github.com/VolkovLabs/business-table/issues/28))
- Upgraded to Grafana 11.1.4 for compatibility ([#31](https://github.com/VolkovLabs/business-table/issues/31))

## [1.0.0] - 2024-08-04

### Added

- Initial release based on Grafana 11.1.0.
- Basic column editor for data customization ([#1](https://github.com/VolkovLabs/business-table/issues/1))
- Groups and tabs functionality for organized data display ([#17](https://github.com/VolkovLabs/business-table/issues/17))
