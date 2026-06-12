## 指令

### 开发指令

```bash
claude # 进入对话

claude -c # 继续上次对话（用于退出终端后重新打开）

```

### 进入交互后指令

```bash
/help          # 列出所有命令（必记）
/clear         # 清空上下文，开新话题
/compact       # 压缩历史，省 token（对话长了必用）
/model         # 切换模型：opus/sonnet/haiku
/cost          # 看当前会话费用、token 消耗
/diff          # 查看 Claude 改了哪些文件
/init          # 生成 CLAUDE.md（项目规则，非常推荐）
/status        # 看登录状态、账号信息
/exit          # 退出
```

### 查看信息指令

```bash

# 查看版本
claude -v

# 自检：网络、权限、API key 是否正常
claude doctor

# 查看安装位置
which claude

```

## 插件

```bash
/plugin marketplace list # 查看已安装的插件集合

# 安装插件
/plugin install <name>@claude-plugins-official

# 卸载插件
/plugin uninstall <name>

# 查看已安装插件
/plugin list

# 更新所有插件
/plugin update

# 查看插件详情/文档
/plugin help <name>
```

### commit-commands 自动提交代码

使用方式：

- /commit：只做 **本地 commit**（add + commit），**不 push、不 PR**
- /commit-push-pr：做 **commit → push → 新建 PR**，**默认会新建 / 切到 feature 分支**，不是直接在当前分支 pushClaude
- /clean_gone：清理已合并的远程分支

### code-review / pr-review-toolkit 代码评审

**核心功能**：多 Agent 并行评审，自动找 bug、安全问题、代码规范问题，比 `/review` 更深入

**使用方式**：

- `/review-pr`：代码质量全维度审查**，覆盖规范、测试、注释、类型、错误处理、可读性，本地开发常用
- `/code-review`：很少用，pull request 时使用，在线上运行
- `/security-review`：只做安全检查
- 支持指定评审维度（bugs/security/style/performance）

### `frontend-design`（前端代码质量控制）

- **核心功能**：专门优化前端开发，强制 UI 一致性、响应式规范、 accessibility 检查
- **使用方式**：让 Claude 写页面时，自动遵循预设的设计规范，避免 AI 生成的 “千篇一律” 样式
