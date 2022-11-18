---
title: 使用Github Actions CI / CD 自动化部署Hexo到Github/Gitee Pages
date: 2020-06-22 13:56:03
tags: [Github,hexo,Github Actions]
---

![流程图](2020-06-22-使用Github-Actions-CI-CD-自动化部署Hexo到Github-Gitee-Pages/流程图.png)

在当前仓库 `hexobackup` 配置以下工作流，实现向当前仓库提交更新时，触发 GitPages 自动编译。

```mermaid
graph TD;
    1(手动执行 hexo g 和 hexo d 部署命令)-->自动推送GiteePages仓库-->2(已推送至 Gitee Pages 仓库)-->官方自动部署GiteePages要钱;
    1-->自动推送GithubPages仓库-->已推送至GithubPages仓库-->官方自动部署GithubPages-->完成同步更新;
    2-->3;
    手动推送更新至hexobackup仓库触发Actions-->3(Actions等待工作流中配置的部署GiteePages作业被触发执行)-->自动部署GiteePages-->完成同步更新;
    完成_config.yml文件的deploy配置-->1;
```

Something about Continuously Integrity / Continuously Deploy...

Github Actions.

.github/workflows/main.yml文件代码：

```yml
name: Sync

on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build Gitee Pages
        uses: yanglbme/gitee-pages-action@main
        with:
          # 注意替换为你的 Gitee 用户名
          gitee-username: xy94
          # 注意在 Settings->Secrets 配置 GITEE_PASSWORD
          gitee-password: ${{ secrets.GITEE_PASSWORD }}
          # 注意替换为你的 Gitee 仓库，仓库名严格区分大小写，请准确填写，否则会出错
          gitee-repo: xy94/xy94
          # 要部署的分支，默认是 master，若是其他分支，则需要指定（指定的分支必须存在）
          branch: master
```

SSH

CI 持续集成
