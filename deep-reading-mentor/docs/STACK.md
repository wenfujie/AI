# 技术栈

**分析日期：** 2026-05-25

## 语言

**主语言：**
- TypeScript（ES2020 目标）- 应用逻辑位于 `src/main.ts`、`src/composables/*.ts`
- Vue SFC（`<script setup lang="ts">`）- 页面与组件位于 `src/pages/*.vue`、`src/components/*.vue`

**次语言：**
- CSS - 全局样式位于 `src/styles/main.css`
- HTML - 模板入口位于 `index.html`

## 运行时

**环境：**
- Node.js 22（本地开发约束：`.nvmrc`）
- Node.js 23（部署构建环境：`netlify.toml`）

**包管理器：**
- pnpm 10.30.3（`package.json` 的 `packageManager` 字段）
- 锁文件：存在（`pnpm-lock.yaml`）

## 框架与核心工具

**核心：**
- Vue 3（`pnpm-workspace.yaml` `catalogs.frontend.vue`）- UI 渲染与组件系统
- Vue Router 5 + 文件路由（`vite.config.ts` 中 `vue-router/vite`）- 路由自动生成
- VueUse（`@vueuse/core`）- 组合式状态（如 `src/composables/dark.ts`）

**构建与工程：**
- Vite 7（`vite.config.ts`）- 开发服务器与打包
- UnoCSS（`uno.config.ts`）- 原子化样式与快捷类
- unplugin-auto-import / unplugin-vue-components（`vite.config.ts`）- 自动导入与组件按需注册
- vue-tsc（`package.json` `typecheck`）- 类型检查

**质量保障：**
- ESLint（`eslint.config.js` + `@antfu/eslint-config`）
- lint-staged + simple-git-hooks（`package.json`）- 提交前自动修复

## 关键依赖

**关键业务依赖：**
- `vue` - 根实例创建与组件渲染（`src/main.ts`）
- `vue-router` - 路由历史与页面切换（`src/main.ts`、`src/pages/README.md`）
- `@vueuse/core` - 暗黑模式状态管理（`src/composables/dark.ts`）

**基础设施依赖：**
- `unocss` - 样式生成（`vite.config.ts`、`uno.config.ts`）
- `@vitejs/plugin-vue` - Vue SFC 编译（`vite.config.ts`）
- `typescript` - 类型系统（`tsconfig.json`）

## 配置体系

**环境配置：**
- 未检测到 `.env*` 文件；当前仓库主要依赖静态配置文件
- 路径别名 `~/` 映射到 `src/`（`tsconfig.json`、`vite.config.ts`）

**构建配置：**
- `vite.config.ts`：插件链、别名、Vitest 运行环境
- `uno.config.ts`：预设、字体、快捷类
- `netlify.toml`：CI 构建命令、发布目录、SPA 重写

## 平台要求

**开发：**
- Node.js + pnpm
- 浏览器环境（`tsconfig.json` `lib: DOM`）

**生产：**
- 静态站点部署（`netlify.toml` `publish = "dist"`）

---

*技术栈分析：2026-05-25*
