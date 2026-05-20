## ADDED Requirements

### Requirement: Markdown Conversion Trigger
The system SHALL provide a `markdown表格转换` button adjacent to the `新增一行` button on the expense statistics page.

#### Scenario: Open markdown conversion modal
- **WHEN** the user clicks the `markdown表格转换` button
- **THEN** the system opens a conversion modal

### Requirement: Default Markdown Backfill
The system SHALL convert the current expense table data into Markdown table syntax and backfill the generated content into the modal textarea when the modal is opened.

#### Scenario: Backfill markdown table text on open
- **WHEN** the conversion modal is opened
- **THEN** the textarea is prefilled with markdown table code generated from the current table rows

### Requirement: Copy Markdown Content
The system SHALL copy the current textarea content to the system clipboard when the user clicks the copy button.

#### Scenario: Copy textarea content
- **WHEN** the user clicks the `复制` button in the modal
- **THEN** the system writes the textarea content into the clipboard

### Requirement: Reset Content on Close
The system SHALL close the modal and clear the textarea content when the user clicks the close button.

#### Scenario: Close modal and clear content
- **WHEN** the user clicks the `关闭` button in the modal
- **THEN** the modal is closed and the textarea content is reset to an empty string
