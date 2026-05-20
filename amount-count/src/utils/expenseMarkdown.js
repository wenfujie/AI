function sanitizeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim()
}

export function convertExpenseRowsToMarkdownTable(rows) {
  const header = '| 花销项 | 花销金额 |'
  const separator = '| --- | --- |'
  const bodyLines = rows.map((row) => {
    const expenseItem = sanitizeCell(row?.expenseItem)
    const expenseAmount = sanitizeCell(row?.expenseAmount)
    return `| ${expenseItem} | ${expenseAmount} |`
  })

  return [header, separator, ...bodyLines].join('\n')
}
