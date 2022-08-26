---
title: VSCode终端提示Shell集成无法激活的解决方法
date: 2022-08-26 14:16:31
tags: [VSCode]
---

## 问题描述

![Shell 集成无法激活](2022-08-26-VSCode终端提示Shell集成无法激活的解决方法/2022-08-26-14-21-56.png)

## 解决方法

<!-- more -->
不同的终端设置方式不同。

首先设置 `settings.json` 文件，添加如下设置

```json
"terminal.integrated.shellIntegration.enabled":false,
```

### bash

Add the following to your `~/.bashrc` file. Run `code ~/.bashrc` in bash to open the file in VS Code.

```bash
[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"
```

重启终端，结果如下：

![bash已激活Shell集成](2022-08-26-VSCode终端提示Shell集成无法激活的解决方法/2022-08-26-14-28-00.png)

参考官方文档：[https://code.visualstudio.com/docs/terminal/shell-integration#_manual-installation](https://code.visualstudio.com/docs/terminal/shell-integration#_manual-installation)
