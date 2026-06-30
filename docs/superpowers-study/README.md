## 介绍

Superpowers 是一套标准化 AI 编码工作流，主要包含以下内容：

1. `需求澄清 brainstorm（头脑风暴）` 苏格拉底式一问一答，补齐 PRD 模糊点、边界条件、弹窗联动、表单校验、权限规则，把模糊需求转为结构化文档
2. `方案评审 spec‑document‑reviewer` 校验需求文档漏洞，输出接口清单、枚举、组件依赖
3. `任务拆分 write‑plan` 将模块拆成 2‑5 分钟可完成的最小任务，标注文件路径、开发顺序、依赖关系（对应你之前的 PRD 拆分步骤）
4. `开发隔离 using‑git‑worktrees` 自动创建独立 Git 分支 /worktree，开发不污染主分支，开发完成再合并
5. `编码实现 execute‑plan + TDD` 严格 TDD 测试驱动开发，先写测试用例，再实现业务代码；前端 Vue 则先写表单 / 交互用例，再写页面逻辑
6. `并行开发 dispatching‑parallel‑agents` 无耦合任务可并行开发（列表页、弹窗组件可分开开发）
7. `质量校验 verification‑before‑completion、code‑review` 执行 ESLint 校验、自测、代码评审，检查是否完全匹配 PRD 原型、有无类型报错（比如你之前的 Vue+TS defineProps 报错问题）

## 安装/卸载

### claude cli 中

```bash
# 进入claude
claude

# 安装插件
/plugin install superpowers@claude-plugins-official
```

验证是否安装成功：在claude中输入 `/superpowers` 会提示相关指令。

**卸载**

```bash
claude

/plugin uninstall superpowers@claude-plugins-official
```

## 开启和关闭

安装后自动会在 `~/.claude/settings.json` 写入

```json
{
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true
  }
}
```

将该配置调整为false即可针对所有项目关闭。

如仅需对单个项目开启可在单个项目的 `.claude/settings.json` 单独开启。

## 使用说明

### 自动模式

直接输入新需求功能，自动执行七步骤。

### 手动模式

显示输入 `/superpowers:xxx` 指令触发指定的阶段。该场景适用于已经有现成 PRD、原型，可分三段手动调用，自由度更高。

1. `/superpowers:brainstorm`: 粘贴你的 PRD、原型文字描述或提供相关文件地址，AI 澄清所有模糊项，输出标准化需求文档、TS 类型、接口清单。
2. `/superpowers:write‑plan`: 基于上一步的文档，自动拆分成最小开发任务清单，明确每个任务的文件路径、依赖顺序。
3. `/superpowers:execute‑plan`: 按照任务清单逐一生成代码、执行 TDD、ESLint 校验、自测。

**补充配套指令**

- `/superpowers:review‑code`：对已经写好的代码做代码审查，修复 ESLint、TS 类型、架构问题（用来修复你之前 Vue SFC 的 ts 编译报错）
- `/superpowers:debug`：标准化排查 Vite、ESLint、编译类报错（适配你之前 [@vue/compiler‑sfc] 类型解析报错场景）


### 不写前端单测

在 brainstorm 阶段开头加一句指令

```
本项目为 Vue3 前端管理后台，跳过 Jest 单元测试，仅做 ESLint 校验、TS 类型校验、表单交互自测。
```