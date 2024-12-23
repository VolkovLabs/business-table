# Change Log

## 2.0.0 (IN PROGRESS)

### Features / Enhancements

- Updated wrap column text by word (#195)
- Updated packages for Code Editor (#194)
- Added normalize for boolean type (#198)

## 1.9.0 (2024-12-01)

### Features / Enhancements

- Added Image cell type (#177)
- Updated Autosize Code Editor (#179)
- Added default pagination size (#181)
- Added preformatted cell type (#180)
- Updated table cells border (#183)
- Added functionality to add and delete row (#184)

## 1.8.0 (2024-11-21)

### Features / Enhancements

- Updated sort state on dashboard refresh (#163)
- Added support variables in data sources for editable and nested objects (#167)
- Updated group expand and collapse behavior (#161)
- Added custom value to editable select field (#165)
- Updated group expanding for empty cells (#169)
- Added type check for text area (#172)
- Updated behavior for edit process (error with TextArea initial value) (#176)

## 1.7.0 (2024-11-16)

### Features / Enhancements

- Updated useNestedObjects hook to display request errors and empty values (#158)
- Added Sanitized HTML and Markdown column type (#154)
- Updated rows heights when group collapse (#159)
- Updated filter options to match exactly (#160)
- Updated data source name to id (#156)
- Added option to hide table header (#157)

## 1.6.0 (2024-10-29)

### Features / Enhancements

- Updated refresh and useRuntimeVariables for dashboard scene (#129)
- Added replaceVariables to file name (#131)
- Added Textarea column editor type (#133)
- Added replaceVariables to column header (#134)
- Updated to Grafana 11.3. and dependencies (#137)
- Added colored Text and colored Background for aggregated rows (#136)
- Added Handling Data Source Request Errors (#140)
- Added customization for column header (#141)
- Updated text wrap (#143)

## 1.5.0 (2024-10-08)

### Features / Enhancements

- Updated Autosize Code Editor toolbar (#99)
- Added sanitizing html content (#110)
- Added data for hidden columns to payload (#112)

### Bugfixes

- Fixed escaping new lines for content edit (#111)

## 1.4.0 (2024-10-02)

### Features / Enhancements

- Updated aggregated cell to support Standard Options (#79)
- Added nested objects cell type (#80)
- Updated e2e tests (#81)
- Moved pagination options to separate category (#87)
- Updated nested objects to show first or last object in the table (#92)
- Updated row data for accessor key with dots (#90)
- Added YouTube tutorial (#93)
- Updated to show/hide columns (#94)
- Added query pagination error with enabled client column filtering (#95)
- Updated e2e to support panel edit in dashboard scene (#96)

## 1.3.0 (2024-09-20)

### Breaking changes

- Requires Grafana 10.3 and Grafana 11

### Features / Enhancements

- Added edit data with based permission check (#40, #76)
- Added edit permission based on query (#47)
- Added client and query pagination (#50)
- Added functionality to pin columns (#53, #65)
- Added download table data as CSV (#61)
- Updated Page size button to prevent overflow (#62)
- Added reset table state on tab change (#67)
- Updated Table Editor to improve UI/UX (#66)
- Updated Sorting options (#69)
- Added DataLinks support (#75)

## 1.2.0 (2024-09-05)

### Features / Enhancements

- Added Colored Background Column type (#33)
- Added column width and wrap (#34)
- Added table Footer (#36)
- Updated to Grafana 11.2.0 (#37)

### Bugfixes

- Fixed adding new tables (#39)

## 1.1.0 (2024-08-22)

### Features / Enhancements

- Signed as Community plugin (#23)
- Added Column Filtering (#21)
- Renamed groups to tables (#27)
- Updated options to show aggregation if at least one column is grouped (#28)
- Added tabs sorting option (#29)
- Updated to Grafana 11.1.4 (#31)

## 1.0.0 (2024-08-04)

### Features / Enhancements

- Initial release based on Grafana 11.1.0
- Added basic columns editor (#1)
- Added groups and tabs (#17)
