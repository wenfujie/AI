## MODIFIED Requirements

### Requirement: Expense Table Structure
The system SHALL provide an expense statistics page containing exactly two input columns in the main table: expense item and expense amount. The page SHALL also provide row-level editing controls and action controls that include `新增一行` and `markdown表格转换` buttons.

#### Scenario: Render two-column table with action controls
- **WHEN** the user opens the expense statistics page
- **THEN** the system displays a table with one column for expense item input and one column for expense amount input
- **AND** the page displays both `新增一行` and `markdown表格转换` action buttons
