---
title: 使用Node.js后台读取串口数据并通过WebSocket实时显示在网页上
date: 2023-02-13 15:27:39
tags: [Node.js, Serial Port, WebSocket]
---

如果你使用 Node.js 后台读取串口数据并通过 WebSocket 实时显示在网页上，可以使用以下步骤：

1. 使用第三方库 serialport 读取串口数据
2. 安装 WebSocket 服务器，例如 ws 库
3. 创建 WebSocket 服务器，并监听客户端连接
4. 在每次读取到串口数据时，通过 WebSocket 发送数据到客户端
5. 在客户端，使用 JavaScript 更新 HTML 元素的属性值

以下是一个简单的示例：

```javascript
// Node.js 后台代码
const SerialPort = require('serialport');
const ReadLine = require('@serialport/parser-readline');
const WebSocket = require('ws');

// 创建一个串口解析器
const port = new SerialPort('COM3', { baudRate: 9600 });
const parser = port.pipe(new ReadLine({ delimiter: '\r\n' }));

// 创建 WebSocket 服务器
const server = new WebSocket.Server({ port: 8080 });

// 监听客户端连接
server.on('connection', (socket) => {
  // 在读取到串口数据时，发送数据到客户端
  parser.on('data', (data) => {
    // 解析读取到的数据
    const target = data.split('  ')[2];
    // 通过 WebSocket 发送数据到客户端
    socket.send(target);
  });
});

// 客户端 JavaScript 代码
const socket = new WebSocket('ws://localhost:8080');

// 监听 WebSocket 接收到的数据
socket.onmessage = (event) => {
  // 更新 HTML 元素的属性值
  document.getElementById('test').value = event.data;
};
```

注意：在这个示例代码中，我们假设“数据格式为文本字符，形如0  00   xxx  00，获取其中的xxx”
