---
title: 一个后台线程断言异常如何杀掉整个插件功能：read-action线程模型踩坑实录
date: 2026-08-24 15:24:21
tags:
  - IntelliJ
  - 插件开发
  - 踩坑实录
  - 线程模型
categories:
  - 插件开发
---

## 一次自己修出来的线上事故

上一篇复盘了插件内存泄漏的修复。修完打包、安装、验证——一切正常。两天后用户反馈：**插件的 i18n Inlay 功能整体消失了**，一个都不剩。

更迷惑的是：功能是"全有或全无"式消失，不是部分失效。这种症状通常指向**初始化链路被拦腰截断**，而不是散点的功能 bug。

这篇文章复盘这次自己引入的事故：一个后台线程上的 read-action 断言异常，如何静默杀掉整个功能域——以及为什么这类异常在开发时根本看不见。

<!-- more -->

## 症状与第一直觉

先排除明显原因：插件装了吗？装了。禁用列表里吗？没有。日志里有报错吗？

翻 idea.log（注意轮转文件，当时活跃会话在 idea.1.log）——**整个会话里 0 条插件运行痕迹**，连项目打开必打的初始化日志都没有。插件明明加载了，却像从没运行过一样。

这个"沉默"本身就是最大的线索。

## 根因：一行代码引发的链式坍塌

异常栈在日志里躺得很明白：

```
RuntimeExceptionWithAttachments: Read access is allowed from inside read-action only
  at PsiManagerImpl.findFile(PsiManagerImpl.java:204)
  at MyApplicationService.hasCorrectModulesInPom(MyApplicationService.java:88)
  at MyApplicationService.isSpringCloudMesProject(MyApplicationService.java:83)
  at MyApplicationService.checkIsOldMesProject(MyApplicationService.java:30)
  at ProjectTypeChecker.isTraditionalJavaWebProject(ProjectTypeChecker.java:11)
  at I18nScanner.scanProject(I18nScanner.java:73)   ← 上一轮修复新加的调用
  at MyProjectActivity$1.run(MyProjectActivity.java:81)
```

事件链：

1. 上一轮修复里，我在启动扫描里加了一句"判断是否传统项目"；
2. 这个判断内部会 `PsiManager.findFile(pom.xml)` 读 PSI；
3. 调用发生在 `Task.Backgroundable` 的**后台线程**上——IntelliJ 平台要求 PSI/模型访问必须持有 read-action，新版平台用**线程断言**硬性检查；
4. 断言抛异常，`scanProject` 的后半段被截断。

致命的是被截断的那半段里有什么：

```java
private static void scanProject(...) {
    scanModuleResources(...);            // ✅ 已完成
    if (isTraditionalJavaWebProject(...)) {   // ❌ 这里抛异常
        scanProjectResourcesByIndex(...);
    }
    ApplicationManager.invokeLater(() -> {
        HtmlFoldingProjectService.getInstance(project);  // ← 永远执行不到
    });
}
```

`HtmlFoldingProjectService` 的构造函数里注册着 **fileOpened 监听**——它是整个 Inlay 创建链的守门人。链一断，所有新打开的文件都不再创建编辑器管理器，Inlay 全灭。用户看到的存量 Inlay 还是异常发生前创建的，之后开的所有文件一个都没有。

## 为什么开发时发现不了

三个因素叠加：

1. **异常被吞得很深**：`Task.Backgroundable` 的后台任务异常不打到前台，只在 idea.log 留一条栈（IDE 可能弹一次性错误气泡，点掉就没了）；
2. **我验证的沙箱项目恰好不触发**：判断逻辑要先检查项目根目录有没有特定结构，我的测试项目走进了另一个分支，异常代码路径根本没执行——**必现 bug 在特定项目结构下才必现**；
3. **异常点与症状点相距 5 层调用栈**：抛在"项目类型判断"，死的是"Inlay 创建"，中间隔着一个 invokeLater。不看栈根本连不起来。

## 修复：三处 read-action + 一处防御

### 在根上修：让方法自持 ReadAction

```java
public boolean checkIsOldMesProject(Project project, Module module) {
    ...
    if (isOldMesProject == null) {
        // 内部 PsiManager.findFile 要求 read-action；本方法会被后台线程调用，
        // 必须自持，不能依赖调用方的线程上下文
        isOldMesProject = ReadAction.compute(() -> !isSpringCloudMesProject(project));
        ...
    }
}
```

原则：**一个可能从后台线程进入的方法，PSI/模型访问要自己包 ReadAction**——`ReadAction.compute` 嵌套调用无害，包上是纯赚。

### 同类隐患排查：把一个点扩成一个面

顺着"后台线程 + PSI/模块查询"的口径全仓扫了一遍，又揪出三处同款：

- `ModuleUtilCore.findModuleForFile`（VFS 事件回调里调用）
- `ModuleRootManager.getSourceRoots`（模块归属判定里）
- `VirtualFile.isValid`（批量扫描入口）

全部包上 `ReadAction.compute`。

### 防御层：关键链路不许被可选逻辑阻断

即使 read-action 都修对了，仍加了一道保险——**启动链上的可选增强必须 try-catch 兜底**：

```java
try {
    if (ProjectTypeChecker.isTraditionalJavaWebProject(project, null)) {
        scanProjectResourcesByIndex(project, cacheManager);
    }
} catch (Throwable t) {
    Logger.getInstance(I18nScanner.class)
        .warn("Traditional project index scan failed, i18n cache may be incomplete", t);
}
// 无论上面成败，守门人初始化必定执行
HtmlFoldingProjectService.getInstance(project);
```

这次的教训具体化：抛的是线程断言，下次可能是索引不可用、模块未加载、任何我没预见的东西。**关键路径与增强路径之间要有隔离舱**。

## 排查方法论沉淀

这次能快速定位，靠的是两条：

1. **"插件功能整体消失"先查 idea.log 的异常栈**（`%LOCALAPPDATA%/JetBrains/IntelliJIdea<版本>/log/`，注意轮转到 idea.1.log），grep 插件包名——比读代码快一个数量级。日志里 0 条插件痕迹 = 初始化早期就死了；
2. **验证环境要覆盖目标项目结构**：我的沙箱项目不触发那条代码路径，等于没验证。事后把"在真实结构的项目上打开验证"写进了发布检查单。

## 小结

1. IntelliJ 平台线程模型是**硬约束**：后台线程/事件回调里裸调 `PsiManager.findFile`、`ModuleUtilCore.findModuleForFile`、`getSourceRoots` 都会撞断言——方法可能被谁调用，决定它要不要自持 read-action；
2. **初始化链是单点**：守门人 Service 的初始化放在任何可能失败的逻辑之后，等于把整个功能域押在那个逻辑的可靠性上——用 try-catch 做隔离舱；
3. 异常在后台线程死得很安静——**发布后翻一遍 idea.log 应该是标准动作**；
4. 测试环境与目标环境结构不一致时，"验证通过"四个字要打折扣。
