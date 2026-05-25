# 代码库结构

**分析日期：** 2026-05-25

## 目录布局

```text
deep-reading-mentor/
├── src/                  # 应用源码（页面、组件、组合式逻辑、样式）
├── public/               # 静态资源
├── .github/workflows/    # CI 工作流定义
├── index.html            # 前端 HTML 入口
├── vite.config.ts        # 构建与插件编排
├── uno.config.ts         # UnoCSS 预设与主题快捷类
├── tsconfig.json         # TypeScript 编译选项
├── package.json          # 依赖与脚本
└── netlify.toml          # Netlify 部署配置
```

## 目录职责

**`src/pages`：**
- 目的：文件路由页面来源
- 内容：页面级 Vue 文件（如 `src/pages/index.vue`、`src/pages/[...all].vue`）
- 关键说明：目录结构即路由结构（`src/pages/README.md`）

**`src/components`：**
- 目的：可复用 UI 组件
- 内容：组件 Vue 文件（如 `src/components/TheFooter.vue`）
- 关键说明：组件可自动注册（`src/components/README.md`）

**`src/composables`：**
- 目的：跨组件共享逻辑
- 内容：组合式函数（如 `src/composables/dark.ts`）

**`src/styles`：**
- 目的：全局样式与基础重置
- 内容：`src/styles/main.css`

## 关键文件位置

**入口点：**
- `src/main.ts`：创建应用、注册路由、挂载到 `#app`
- `index.html`：模块脚本注入与初始暗黑模式脚本

**配置：**
- `vite.config.ts`：插件链和别名
- `tsconfig.json`：严格类型规则与路径别名
- `eslint.config.js`：代码质量规则
- `netlify.toml`：部署构建与 SPA 重写

**核心逻辑：**
- `src/App.vue`：根布局
- `src/composables/dark.ts`：主题切换

**测试相关：**
- `.github/workflows/test.yml`：CI 测试/校验流程
- 当前仓库未检测到 `*.test.*` 或 `*.spec.*` 文件

## 命名约定

**文件：**
- 页面：路由语义命名，如 `index.vue`、`[...all].vue`
- 组件：PascalCase，如 `TheFooter.vue`
- 组合式：小写语义文件名，如 `dark.ts`

**目录：**
- 源码主目录采用功能分层：`pages`、`components`、`composables`、`styles`

## 新增代码放置建议

**新增功能页面：**
- 页面实现：`src/pages/<feature>.vue`
- 路由参数页：`src/pages/[param].vue` 或子目录方式

**新增组件/模块：**
- 通用 UI：`src/components/<Name>.vue`
- 页面专属小组件：优先在页面旁新增并在规模扩大后再抽离

**新增工具或共享逻辑：**
- 组合式函数：`src/composables/<topic>.ts`
- 对外导出：在 `src/composables/index.ts` 汇总

**新增测试：**
- 建议与源码同层共置 `*.spec.ts`，并补充 `package.json` 的 `test` 脚本

## 特殊目录与文件

**`src/typed-router.d.ts`：**
- 作用：路由类型生成文件
- 生成：是（由路由插件生成）
- 提交：是（文件头注释建议提交）

**`auto-imports.d.ts` / `components.d.ts`：**
- 作用：自动导入与组件声明
- 生成：是
- 提交：当前仓库已提交

---

*结构分析：2026-05-25*
