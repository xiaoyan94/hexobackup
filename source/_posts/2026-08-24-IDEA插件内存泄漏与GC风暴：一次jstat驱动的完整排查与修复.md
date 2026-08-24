---
title: IDEA插件内存泄漏与GC风暴：一次jstat驱动的完整排查与修复
date: 2026-08-24 15:24:13
tags:
  - IntelliJ
  - 插件开发
  - JVM
  - GC
  - 排查实战
categories:
  - 性能排查
---

## 背景：装了插件的 IDEA 卡到不能用

团队自研的 IDEA 插件更新后，出现了一个很诡异的症状：**什么都没做，只是打开了几个文件，IDEA 就卡得不行**。CPU 风扇狂转、界面掉帧、时不时冻结几秒。

比"卡"更有价值的是手里的 GC 数据。连续抓了几轮 `jstat -gcutil`：

```
 S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT
 -  97.51  64.81  80.44  98.34  95.20     87    3.696     2    1.680    5.376
 -  97.51  80.00  81.08  98.34  95.20     87    3.696     2    1.680    5.376
 -  93.79  34.87  77.83  98.34  95.20     88    3.710     2    1.680    5.391
 -  96.33   6.67  77.70  98.34  95.18     92    3.781     3    2.320    6.101   ← FGC 2→3
```

只看数字就能拆出三层信号。这篇文章完整复盘这次排查：从 jstat 解读、到沿执行路径找代码证据、到三类修复的设计与验证。

<!-- more -->

## 第一步：读懂 jstat 在说什么

| 指标 | 数值 | 含义 |
|---|---|---|
| M / CCS | 98.3% / 95.2% 顶死 | Metaspace 近满，持续压迫 Full GC |
| O（老年代） | 77~91%，多次 YGC 后不降 | 有滞留对象——泄漏或重缓存特征 |
| FGC | 观察窗口内 2→3，单次 0.64s | 这一次 STW 就是用户体感的"卡死一下" |
| YGC / E | Eden 每几秒打满 | 高分配压力——海量短命对象正在被生产 |

**老年代降不下去 + Eden 秒满**的组合，指向"某处在持续制造大量短命对象，同时有一批对象长期滞留"。GC 日志只能告诉我们"有病"，病因要沿执行路径读代码。

顺带一提诊断纪律：**描述执行机制必须有 file:line 级证据**。下面每个结论都对应到具体代码行，而不是猜测。

## 第二步：沿触发链读代码

插件的触发链是：文件打开 → 监听器注册 → 为每个编辑器创建 Inlay 管理器。逐层检查后，三个问题浮出水面。

### 泄漏点：每开一个文件漏一份 Editor 对象图

管理器的构造函数里有这么一行：

```java
project.getMessageBus().connect().subscribe(VFS_CHANGES, new BulkFileListener() { ... });
```

两个致命细节：

1. `connect()` **没传 Disposable 父级**——这条连接活到 project 关闭为止，每个编辑器一份；
2. 监听器匿名类捕获了管理器 `this`，而管理器持有整个 `inlayMap`、`rendererMap`，乃至整个 `EditorImpl`（document、markup model、highlighter 全在里面）。

更糟的是，这个管理器类虽然实现了 `Disposable`，但**全工程 grep 不到任何 `Disposer.register` 调用它**——`dispose()` 永不执行。开 N 个文件 = 永久滞留 N 份编辑器对象图，**正好对应老年代 80%+ 不降**。

### 分配源：热路径上的索引兜底查询

真正制造"Eden 秒满"的是另一处。折叠构建器（foldingBuilder）在**每次** daemon 扫描时对文件的每个 i18n 标签求值：

```java
// 每个 Title/Field/column 标签都会走到这里
String value = MyPropertiesUtil.findDataGridValue(project, module, key);
```

而 `findDataGridValue` 的实现是"先查缓存，**缓存未命中就落索引兜底**"：

```java
if (cacheMiss) {
    // FilenameIndex 按文件名查 ×4 种语言
    // + FileTypeIndex 全项目 properties 文件扫描 + stream 过滤
    ...
}
```

一个大 Layout XML 有上百个字段标签 → **一次折叠计算 = 数百次索引查询 + 海量临时集合**。而且两个放大器：

- 所有 foldingBuilder 都 `isCollapsedByDefault() = true` → 文件一打开全部折叠 → 所有占位符立即求值；
- foldingBuilder 完全忽略 `quick` 参数——平台契约规定 editor 刚打开时（quick=true）不应做重计算，当前恰恰在这个时机做全量索引扫描。

这正是"打开几个文件就卡"的直接分配源：**Eden 几秒被打满，YGC 频率飙升，单次 14ms 的 YGC 本身不疼，疼的是它背后的 CPU 消耗和它前排队的索引查询**。

### 次要噪声：热路径 System.out.println

缓存未命中的分支里散布着 `System.out.println`——daemon 对每个元素求值时同步写控制台 + 字符串拼接，雪上加霜。

## 第三步：修复设计

### 修复一：堵泄漏（1 行 × 2 处）

```java
// MessageBus 连接绑定自身生命周期
project.getMessageBus().connect(this).subscribe(...);

// 注册到 editor 的 Disposer 树，editor 释放时级联清理
if (editor instanceof Disposable parentDisposable) {
    Disposer.register(parentDisposable, manager);
}
```

这里踩了个编译期的坑：**`Editor` 接口并不实现 `Disposable`**（实现类 `EditorImpl` 才实现），直接 `Disposer.register(editor, ...)` 编译不过，必须 `instanceof` 判定后转换。

### 修复二：热路径纯缓存化 + 启动全量灌入

核心决策：**热路径只查缓存，未命中返回 null（显示占位符），绝不回索引**。

但直接砍兜底会打断一类场景——老式项目的 i18n 文件不在标准目录下，原来就靠索引兜底覆盖。所以配套一条：**启动时一次性索引入缓存**：

```java
// 启动扫描的后台任务末尾，smart mode 下执行
if (isTraditionalJavaWebProject(project)) {
    scanProjectResourcesByIndex(project, cacheManager);  // 一次性灌满
}
// 之后热路径全部走内存缓存，未命中显示 ${key}
```

架构从"每次渲染都可能全项目扫"变成"启动扫一次 + 事件增量维护"。失效链路靠 VFS 事件监听：IDE 内保存毫秒级触发，外部修改在窗口聚焦 refresh 后同样走事件，每次项目打开另有全量重扫兜底——**不需要定时刷新**。

### 修复三：降噪与监听清理

- 热路径 println 全部删除；
- caret 监听改用带 Disposable 的重载注册（顺带修了原来 fileClosed 时"从新编辑器移除旧编辑器监听"的移错对象 bug）；
- Inlay diff 增加"译文变化"维度——否则 properties 改了，已存在的 Inlay 永远显示旧译文。

## 验证

修复后用两个手段验证：

```bash
# 1. 对象直方图：EditorImpl 计数应随开关文件保持稳定（修复前线性上涨）
jmap -histo:live <pid> | grep EditorImpl

# 2. Eden 填充速率：打开大 XML 后应明显放缓
jstat -gcutil <pid> 1000
```

同时留意 idea.log——这次排查后来还揪出一个**我自己在修复中引入的回归**（后台线程断言异常，见下一篇），教训是：修完必须真装上跑，log 里见不到异常才算完。

## 小结

1. **jstat 的分层信号**：M 顶死 / O 不降 / FGC 单次时长 / YGC 频率，各自指向不同性质的病因，先读懂数据再动代码；
2. **沿执行路径取证**：从入口（fileOpened）到注册（connect 无父级）到热路径（索引兜底），每一环都落到 file:line；
3. **IntelliJ 插件的三条铁律**：MessageBus 必须 `connect(disposable)`；daemon 热路径（folding/annotator/lineMarker）禁止索引查询；按 editor 注册的监听用带 Disposable 的重载；
4. **缓存化要连着"灌入"一起设计**：砍掉热路径兜底之前，先想清楚"谁负责把数据放进去"——启动全量 + 事件增量是最稳的组合；
5. `Editor` 不实现 `Disposable` 这类接口细节，编译器会替你把关——前提是别用 Object 强转绕过去。
