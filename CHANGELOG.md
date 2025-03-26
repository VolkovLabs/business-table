# Change Log

All notable changes to the Business Table Panel plugin are documented in this changelog.

## 2.5.0 (In Progress)

### Features & Enhancements

- Added export format options (#290)
- Introduced file download cell type (#291)

## 2.4.0 (2025-03-10)

### Features & Enhancements

- Added file upload editor (#270)
- Enabled row background color from hidden fields (#273)
- Introduced date format editor (#275)

## 2.3.0 (2025-02-26)

### Features & Enhancements

- Improved highlighted row behavior (#250)
- Updated alignment icons in panel options (#261)
- Added column tooltip option (#260)
- Enhanced cell text contrast for data links (#253)
- Upgraded to Grafana 11.5 with dependency updates (#262, #265)
- Updated release workflow to include attestation (#262)
- Added custom scrollbar from Grafana UI (#251)

## 2.2.0 (2025-02-10)

### Features & Enhancements

- Updated gauge values for Grafana 10.3.0 (#241)
- Fixed unexpected errors in "Data Links" dashboard (#241)
- Added row highlighting with background and auto-scroll (#243)

## 2.1.0 (2025-02-04)

### Features & Enhancements

- Added Excel download settings (#227, #233)
- Updated data links to prevent dashboard reload (#232)
- Introduced JSON cell type with inspector (#224)
- Added action column configuration (#231)
- Added gauge cell type (#238)

## 2.0.0 (2025-01-07)

### Features & Enhancements

- Improved column text word wrapping (#195)
- Updated code editor packages (#194)
- Added boolean value normalization (#198)
- Added row count display within groups (#199)
- Added error messages for data source requests (#213)
- Upgraded to Grafana 11.4 with dependency updates (#214)

## 1.9.0 (2024-12-01)

### Features & Enhancements

- Added image cell type (#177)
- Enhanced autosize code editor (#179)
- Set default pagination size (#181)
- Introduced preformatted cell type (#180)
- Improved table cell borders (#183)
- Added row add/delete functionality (#184)

## 1.8.0 (2024-11-21)

### Features & Enhancements

- Updated sort state persistence on dashboard refresh (#163)
- Added variable support in data sources for editable and nested objects (#167)
- Improved group expand/collapse behavior (#161)
- Added custom value support for editable select fields (#165)
- Fixed group expansion for empty cells (#169)
- Added type checking for text areas (#172)
- Fixed text area initial value error during editing (#176)

## 1.7.0 (2024-11-16)

### Features & Enhancements

- Enhanced `useNestedObjects` hook to show request errors and empty values (#158)
- Added sanitized HTML and Markdown column types (#154)
- Adjusted row heights on group collapse (#159)
- Updated filter options for exact matches (#160)
- Changed data source references to use IDs (#156)
- Added option to hide table header (#157)

## 1.6.0 (2024-10-29)

### Features & Enhancements

- Improved dashboard refresh and runtime variable handling (#129)
- Added variable replacement in file names (#131) and column headers (#134)
- Introduced textarea column editor type (#133)
- Upgraded to Grafana 11.3 with dependency updates (#137)
- Added colored text and background for aggregated rows (#136)
- Enhanced data source request error handling (#140)
- Added column header customization (#141)
- Improved text wrapping (#143)

## 1.5.0 (2024-10-08)

### Features & Enhancements

- Enhanced autosize code editor toolbar (#99)
- Added HTML content sanitization (#110)
- Included hidden column data in payload (#112)

### Bug Fixes

- Fixed newline escaping in content edits (#111)

## 1.4.0 (2024-10-02)

### Features & Enhancements

- Added standard options support for aggregated cells (#79)
- Introduced nested objects cell type (#80)
- Updated end-to-end tests (#81)
- Moved pagination options to a separate category (#87)
- Improved nested object display (first/last object) (#92)
- Fixed row data handling for accessor keys with dots (#90)
- Added YouTube tutorial link (#93)
- Enhanced column show/hide functionality (#94)
- Fixed query pagination errors with client-side filtering (#95)
- Updated end-to-end tests for panel editing in dashboard scene (#96)

## 1.3.0 (2024-09-20)

### Breaking Changes

- Requires Grafana 10.3 or Grafana 11

### Features & Enhancements

- Added permission-based data editing (#40, #76)
- Introduced query-based edit permissions (#47)
- Added client-side and query-based pagination (#50)
- Enabled column pinning (#53, #65)
- Added CSV download functionality (#61)
- Improved page size button layout to prevent overflow (#62)
- Added table state reset on tab change (#67)
- Enhanced table editor UI/UX (#66)
- Improved sorting options (#69)
- Added data links support (#75)

## 1.2.0 (2024-09-05)

### Features & Enhancements

- Added colored background column type (#33)
- Introduced column width and text wrap options (#34)
- Added table footer (#36)
- Upgraded to Grafana 11.2.0 (#37)

### Bug Fixes

- Fixed issue with adding new tables (#39)

## 1.1.0 (2024-08-22)

### Features & Enhancements

- Signed as a Grafana Community plugin (#23)
- Added column filtering (#21)
- Renamed "groups" to "tables" (#27)
- Updated options to show aggregation when columns are grouped (#28)
- Added tab sorting option (#29)
- Upgraded to Grafana 11.1.4 (#31)

## 1.0.0 (2024-08-04)

### Features & Enhancements

- Initial release based on Grafana 11.1.0
- Added basic column editor (#1)
- Introduced groups and tabs (#17)
