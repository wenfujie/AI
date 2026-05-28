# AI

用于存放 AI 相关项目，一个文件夹一个项目。

## Demo 项目地图

- [`amount-count`](amount-count/README.md)：金额统计
- [`glm-4-flash-demo`](glm-4-flash-demo/README.md)：智谱免费文字模型接入示例
- [`deep-reading-mentor`](deep-reading-mentor/README.md)：深度阅读助手

## 笔记文档地图

- [`open-spec-study`](docs/open-spec-study/README.md)：openSpec学习文档
- [`codegraph-study`](docs/codegraph-study/README.md)：codegraph学习文档

## 部署

新子项目配置自动部署到 github pages。

修改 `.github/workflows/deploy.yml`

1. `on.push.paths` 中添加子项目路径
2. `jobs.build-projects.strategy.matrix` 中新增项目配置，目前支持静态html、打包构建两种部署方式，具体参考已有项目示例。
