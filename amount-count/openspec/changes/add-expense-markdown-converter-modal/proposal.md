## Why

花销统计页当前只能在页面内查看与编辑数据，无法快速复用到文档或沟通场景。增加一键转换 Markdown 表格并复制能力，可以显著提升记录复用效率并减少手工整理成本。

## What Changes

- 在“新增一行”按钮旁新增“markdown表格转换”按钮。
- 新增通用弹窗组件，供当前及后续页面复用。
- 点击“markdown表格转换”按钮后，弹出包含 `textarea`、复制按钮、关闭按钮的弹窗。
- 弹窗打开时，自动将当前花销表格内容转换为 Markdown 表格语法并回填到 `textarea`。
- 点击复制按钮时，将 `textarea` 当前内容复制到系统剪切板。
- 点击关闭按钮时，关闭弹窗并将 `textarea` 内容重置为空。

## Capabilities

### New Capabilities
- `markdown-table-conversion-modal`: 在花销统计页中提供表格到 Markdown 代码转换、弹窗展示、复制到剪切板与关闭重置能力。
- `reusable-modal-component`: 提供可复用的通用弹窗组件能力，支持标题、内容插槽与关闭控制。

### Modified Capabilities
- `expense-statistics-page`: 在现有花销统计页基础上增加“markdown表格转换”入口与转换联动行为。

## Impact

- Affected code: 前端页面组件（花销统计页）、通用弹窗组件、Markdown 转换与复制逻辑。
- APIs: 无新增后端 API 依赖。
- Dependencies: 预计无需新增依赖，优先使用原生剪切板 API 与现有框架能力。
