---
title: JavaScript使用 Web Serial API获取串行设备端口数据(地磅串口数据)
date: 2022-11-18 21:10:15
tags: [JavaScript]
---

* [前期准备](#前期准备)
* [资源链接](#资源链接)
* [代码示例](#代码示例)
  * [检查浏览器是否支持](#检查浏览器是否支持)
  * [打开串行端口](#打开串行端口)
* [完整代码](#完整代码)

<!-- more -->

## 前期准备

1. 学习 **Web Serial API**
2. 下载串口模拟工具 VSPD，用于建立虚拟串口对
3. 下载串口调试精灵，用于调试，包括打开、关闭串口，发送、接收数据等
4. 编写 js 代码，读取串口数据

## 资源链接

1. [VSPD](https://cn.bing.com/search?q=VSPD)
2. [串口调试精灵](https://cn.bing.com/search?q=串口调试精灵)
3. [Web Serial API](https://cn.bing.com/search?q=Chrome%20Web%20Serial%20API)

## 代码示例

### 检查浏览器是否支持

只有浏览器支持 **Web Serial API** 才能通过 JavaScript 代码访问串口设备。要检查是否支持 Web Serial API，请使用：

```JavaScript
if ("serial" in navigator) {
  // 支持 Web 串行 API。
}
```

### 打开串行端口

Web Serial API 在设计上是异步的。这可以防止网站 UI 在等待输入时阻塞。要打开串行端口，首先访问一个 SerialPort 对象。为此，可以通过调用 `navigator.serial.requestPort()` 以响应用户手势（例如触摸或鼠标单击）来提示用户选择单个串行端口，或者从返回的 `navigator.serial.getPorts()` 中选择一个网站已被授予访问权限的串行端口列表。

```JavaScript
document.querySelector('button').addEventListener('click', async () => {
  // 提示用户选择任意串口。
  const port = await navigator.serial.requestPort();
});
```

```JavaScript
// 获取用户之前授予网站访问权限的所有串行端口。
const ports = await navigator.serial.getPorts();
```

```JavaScript
// 提示用户选择任意串口。
const port = await navigator.serial.requestPort();

// 等待串口打开。波特率 9600
await port.open({ baudRate: 9600 });
```

还可以在打开串行端口时指定以下任何选项。这些选项是可选的，[查看默认值](https://wicg.github.io/serial/#serialoptions-dictionary)。

* `dataBits`: 每帧的数据位数（7 或 8）。
* `stopBits`: 帧末尾的停止位数（1 或 2）。
* `parity`: 奇偶校验模式（`"none"`, `"even"` 或者 `"odd"`）。
* `bufferSize`: 应创建的读写缓冲区的大小（必须小于 16MB）。
* `flowControl`：流量控制模式（`"none"` 或 `"hardware"`）。

## 完整代码
