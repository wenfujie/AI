# 编码约定

**分析日期：** 2026-05-25

## 命名模式

**文件：**
- Vue 组件使用 PascalCase（示例：`src/components/TheFooter.vue`）
- 页面文件遵循路由语义（示例：`src/pages/index.vue`、`src/pages/[...all].vue`）
- composable 文件使用语义小写（示例：`src/composables/dark.ts`）

**函数：**
- 组合式状态函数使用 `useXxx` 风格（示例来源：`useDark`、`useToggle` 的使用方式见 `src/composables/dark.ts`）

**变量：**
- 常量与实例变量使用 camelCase（示例：`app`、`router` 见 `src/main.ts`）

**类型：**
- 路由类型通过自动生成声明维护（`src/typed-router.d.ts`）

## 代码风格

**格式化：**
- 统一由 ESLint + formatter 处理（`eslint.config.js`）
- 提交前通过 lint-staged 自动执行 `eslint --fix`（`package.json`）

**Lint：**
- 采用 `@antfu/eslint-config` 预设，并启用 `unocss` 与 `formatters`（`eslint.config.js`）

## 导入组织

**顺序：**
1. 第三方库（如 `vue`、`vue-router`）
2. 本地模块（如 `./App.vue`、`./styles/main.css`）
3. 侧效导入（如 `uno.css`）

**路径别名：**
- `~/` 指向 `src/`（`tsconfig.json`、`vite.config.ts`）

## 错误处理

**模式：**
- 当前业务逻辑轻量，未建立统一错误处理层
- 建议新增异步逻辑时统一在 composable 或 service 层封装错误转换

## 日志

**框架：**
- 未检测到专用日志 SDK，默认为浏览器控制台或构建日志

**模式：**
- 当前代码未见显式日志调用，属于“最小实现”状态

## 注释

**何时注释：**
- 复杂配置通过链接说明（如 `vite.config.ts` 的插件注释）
- 生成文件通过头部注释声明“不要手改”（`src/typed-router.d.ts`）

**JSDoc/TSDoc：**
- 当前业务代码中使用较少，类型约束主要依赖 TypeScript 推断

## 函数设计

**体量：**
- 单文件逻辑短小，推荐保持“单一职责+可组合”

**参数：**
- 页面组件倾向无参；状态逻辑通过 composable 返回值暴露

**返回值：**
- composable 导出响应式状态或切换函数（`src/composables/dark.ts`）

## 模块设计

**导出方式：**
- 目录内通过 barrel 导出（`src/composables/index.ts`）
- 单一组件默认导出（`.vue` SFC 默认模式）

**Barrel 文件：**
- 已使用于 composables，新增共享逻辑时沿用该方式

---

*规范分析：2026-05-25*
