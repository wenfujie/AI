<!-- refreshed: 2026-05-25 -->
# 架构

**分析日期：** 2026-05-25

## 系统概览

```text
┌──────────────────────────────────────────────────────────────┐
│                         浏览器前端层                          │
├──────────────────────┬──────────────────────┬────────────────┤
│   应用壳与挂载入口     │      页面路由层       │    组合式状态层   │
│   `src/main.ts`       │ `src/pages/*.vue`    │ `src/composables`│
└─────────────┬────────┴─────────────┬────────┴───────────────┘
              │                      │
              ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│                     构建与插件编排层                          │
│      `vite.config.ts` + `uno.config.ts` + 自动导入插件        │
└──────────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│                        静态部署输出层                          │
│             `netlify.toml` + `dist/` + `index.html`          │
└──────────────────────────────────────────────────────────────┘
```

## 组件职责

| 组件 | 职责 | 文件 |
|------|------|------|
| 应用入口 | 创建 Vue 应用、注册路由、挂载根节点 | `src/main.ts` |
| 根布局 | 承载页面内容与全局 footer | `src/App.vue` |
| 首页路由 | 站点首页内容 | `src/pages/index.vue` |
| 兜底路由 | 404 文案展示 | `src/pages/[...all].vue` |
| 主题状态 | 管理暗黑模式切换 | `src/composables/dark.ts` |

## 模式概览

**整体模式：** 单页应用（SPA）+ 文件路由 + 组合式 API

**关键特征：**
- 以 `src/pages` 文件名驱动路由结构（`src/pages/README.md`）
- 通过 `AutoImport` 与 `Components` 减少显式 import（`vite.config.ts`）
- UI 样式依赖 UnoCSS 原子类与预设字体（`uno.config.ts`）

## 分层说明

**表现层（View）：**
- 目的：页面展示与用户交互
- 位置：`src/pages`、`src/components`、`src/App.vue`
- 依赖：`vue`、`vue-router`

**状态与行为层（Composable）：**
- 目的：复用状态逻辑
- 位置：`src/composables`
- 依赖：`@vueuse/core`

**构建编排层（Build Pipeline）：**
- 目的：插件驱动的路由、样式、自动导入
- 位置：`vite.config.ts`、`uno.config.ts`

## 数据流

### 主请求路径

1. 浏览器加载 `index.html`，引入 `src/main.ts`（`index.html`）
2. `src/main.ts` 创建路由并注入 `routes`（`src/main.ts`）
3. 根组件 `src/App.vue` 通过 `<RouterView />` 渲染当前页面（`src/App.vue`）

### 主题切换路径

1. `src/components/TheFooter.vue` 点击按钮触发 `toggleDark()`（`src/components/TheFooter.vue`）
2. `src/composables/dark.ts` 调用 VueUse 维护主题状态（`src/composables/dark.ts`）
3. `html.dark` 样式由 `src/styles/main.css` 生效（`src/styles/main.css`）

## 关键抽象

**路由自动生成：**
- 用途：避免手写路由配置
- 样例：`src/typed-router.d.ts`（生成文件）与 `vue-router/auto-routes` 导入（`src/main.ts`）

**别名导入：**
- 用途：稳定跨目录引用
- 配置：`~/` -> `src/`（`tsconfig.json`、`vite.config.ts`）

## 入口点

**前端入口：**
- 位置：`src/main.ts`
- 触发：浏览器加载模块脚本
- 职责：应用初始化与挂载

**构建入口：**
- 位置：`package.json` `scripts.build`
- 触发：本地或 CI 执行 `pnpm run build`
- 职责：Vite 打包输出

## 架构约束

- **线程模型：** 浏览器单线程 UI 事件循环（无 Web Worker 使用痕迹）
- **全局状态：** 主题状态通过 `useDark()` 跨组件共享（`src/composables/dark.ts`）
- **循环依赖：** 未检测到明确循环导入
- **路由来源：** 仅从 `src/pages` 生成，新增页面必须遵循该目录约束

## 反模式

### 配置与脚本不一致

**现象：** CI 执行 `pnpm run test`，但 `package.json` 未定义 `test` 脚本。  
**风险：** 默认 CI 可能失败，影响合并节奏。  
**建议：** 在 `package.json` 增加 `test` 脚本或调整 `.github/workflows/test.yml`。

### 运行时版本分叉

**现象：** 本地 `.nvmrc` 为 Node 22，Netlify 构建配置为 Node 23。  
**风险：** 本地与线上行为差异导致“本地可用、线上失败”。  
**建议：** 统一 Node 版本策略并记录于 `README.md`。

## 错误处理

**策略：** 以框架默认行为为主，业务显式错误处理较少。

**模式：**
- 当前页面大多为静态模板，缺少异步请求错误流
- 404 由 `src/pages/[...all].vue` 提供兜底视图

## 横切关注点

**日志：** 未检测到统一日志层。  
**校验：** 未检测到表单/数据校验层。  
**认证：** 未接入认证模块。

---

*架构分析：2026-05-25*
