# AGENTS 指南（AI Coding）

本文档定义本仓库中 AI 代理的技能映射与文档使用方式。

## 1. `.agents/skills` 技能映射说明

### 1.1 技能总览

| 技能 | 适用场景 | 核心输入文件 | 关键参考目录 |
|---|---|---|---|
| `pnpm` | 依赖安装、版本升级、workspace/catalogs/overrides/patches 管理、CI 安装策略 | `package.json`、`pnpm-workspace.yaml`、`.npmrc` | `.agents/skills/pnpm/references/` |
| `vite` | `vite.config.ts` 配置、插件链、构建与预览、SSR/库构建相关问题 | `vite.config.ts`、`package.json` scripts | `.agents/skills/vite/references/` |
| `vue` | Vue SFC 开发、`<script setup lang="ts">`、Composition API、宏与响应式模式 | `src/**/*.vue`、`src/composables/**/*.ts` | `.agents/skills/vue/references/` |
| `unocss` | 原子化样式、`uno.config.ts`、shortcuts/presets/icons/attributify 配置与调优 | `uno.config.ts`、`src/**/*.vue` | `.agents/skills/unocss/references/` |

### 1.2 任务到技能的路由规则

| 任务类型 | 首选技能 | 组合技能（按顺序） |
|---|---|---|
| 安装/升级依赖，修复 lockfile 或 workspace 依赖问题 | `pnpm` | `pnpm -> vite/vue/unocss`（按改动面补充） |
| 调整开发服务器、构建、别名、插件顺序 | `vite` | `vite -> pnpm` |
| 新增页面/组件/composable，处理响应式与宏 | `vue` | `vue -> unocss -> vite` |
| 样式系统改造、快捷类、图标预设、主题 token | `unocss` | `unocss -> vue -> vite` |
| CI 中安装/构建失败排查 | `pnpm` | `pnpm -> vite` |

### 1.3 各技能默认读取优先级

1. `pnpm`
- 先读：`pnpm-workspace.yaml`、`package.json`、`.npmrc`
- 再按需读：`.agents/skills/pnpm/references/*.md`

2. `vite`
- 先读：`vite.config.ts`、`package.json` scripts
- 再按需读：`.agents/skills/vite/references/*.md`

3. `vue`
- 先读：`src/main.ts`、`src/App.vue`、`src/pages/**/*.vue`、`src/composables/**/*.ts`
- 再按需读：`.agents/skills/vue/references/*.md`

4. `unocss`
- 先读：`uno.config.ts`、`src/styles/main.css`、使用原子类的 Vue 文件
- 再按需读：`.agents/skills/unocss/references/*.md`

### 1.4 协作约束

- 依赖与版本问题优先用 `pnpm` 规则处理，不混用 `npm`/`yarn` 命令。
- 样式问题先确认 `uno.config.ts` 中已启用的 preset/shortcut，再写 class。
- Vue 代码默认采用 `<script setup lang="ts">` + Composition API。
- 任何构建链变更（Vite/UnoCSS/自动导入）都需同步检查 `package.json` scripts 是否仍可执行。

## 2. `docs/` 文档说明

### 2.1 文档索引

| 文档 | 用途 | 何时必读 |
|---|---|---|
| `docs/STACK.md` | 记录技术栈、运行时、依赖、配置与平台要求 | 改依赖、升级版本、调整构建环境前 |
| `docs/ARCHITECTURE.md` | 记录系统分层、数据流、入口点、架构约束与反模式 | 改架构、加模块、改路由与状态流前 |
| `docs/STRUCTURE.md` | 记录目录职责、关键文件位置、命名规范、代码放置规则 | 新增文件/目录、重构目录结构前 |
| `docs/CONVENTIONS.md` | 记录编码约定（命名、导入顺序、注释、模块导出等） | 提交代码前、批量重构前 |

### 2.2 使用顺序建议

1. 功能开发：`STRUCTURE.md -> CONVENTIONS.md -> ARCHITECTURE.md`
2. 工程改造：`STACK.md -> ARCHITECTURE.md -> STRUCTURE.md`
3. 缺陷排查：`ARCHITECTURE.md -> STACK.md -> CONVENTIONS.md`

### 2.3 与技能的对应关系

| 技能 | 强关联文档 |
|---|---|
| `pnpm` | `docs/STACK.md` |
| `vite` | `docs/STACK.md`、`docs/ARCHITECTURE.md` |
| `vue` | `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/STRUCTURE.md` |
| `unocss` | `docs/STACK.md`、`docs/CONVENTIONS.md` |

### 2.4 维护规则

- 新增/调整技能时，必须同步更新本文件第 1 节映射表。
- `docs/` 有新增文档时，必须同步更新本文件第 2.1 节索引与第 2.3 节对应关系。
- 若实际代码与 `docs/` 描述冲突，以代码为准并优先回写文档。
