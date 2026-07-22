# code-review-graph 代码图谱

Superpowers 经常用到这个东西，最好还是装一下

## 安装

```bash
# 普通电脑
brew install pipx
# or 苹果m1芯片
arch -arm64 brew install pipx

pipx ensurepath

# 比较慢，由于要安装多个依赖可能会失败，失败后多重试几次
pipx install code-review-graph

# 配置环境变量
pipx ensurepath

# 验证安装成功
code-review-graph --help
```

## 使用

```bash
# 构建图谱
code-review-graph build
# 仅更新代码改动图谱
code-review-graph update
# 监听代码改动自动更新图谱
code-review-graph watch
# 查看解析文件数量、函数 / 结构体数量
code-review-graph status
```

**让claude code能识别**

```bash
code-review-graph install --platform claude-code
```
