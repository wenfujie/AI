## ADDED Requirements

### Requirement: Expense Table Structure
The system SHALL provide an expense statistics page containing a table with exactly two columns: expense item and expense amount.

#### Scenario: Render two-column expense table
- **WHEN** the user opens the expense statistics page
- **THEN** the system displays a table with one column for expense item input and one column for expense amount input

### Requirement: Editable Inputs for Each Column
The system SHALL render each cell in both columns as an editable input field so users can enter and modify values directly in the table.

#### Scenario: Edit expense item and amount in row
- **WHEN** the user types in the expense item input or expense amount input for a row
- **THEN** the system updates the corresponding row value immediately

### Requirement: Amount Input Numeric Precision Validation
The system SHALL restrict expense amount inputs to numeric values with up to two decimal places.

#### Scenario: Accept valid two-decimal numeric input
- **WHEN** the user enters a numeric value such as `12`, `12.3`, or `12.34` in the amount input
- **THEN** the system accepts the value as valid input

#### Scenario: Reject invalid amount format
- **WHEN** the user enters non-numeric characters or a numeric value with more than two decimal places
- **THEN** the system prevents or rejects the invalid portion so the stored amount value remains compliant

### Requirement: Real-time Amount Summation
The system SHALL display `amount` below the table as the real-time sum of all expense amount column values.

#### Scenario: Recalculate total when amount input changes
- **WHEN** any expense amount input value is added, edited, or cleared
- **THEN** the system recalculates and updates `amount` immediately based on the current valid amount values
