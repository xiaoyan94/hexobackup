---
title: 一点关于WebSocket
date: 2021-02-23 18:51:41
tags: [WebSocket,HTTP]
---

HTTP协议本身不是为了长连接而开发的。所谓长连接，指的是TCP连接建立之后，长时间持续保持连接状态并进行通讯。

虽然HTTP协议后来引入的`Connection: keep-alive`机制有保持连接的效果，但设计初衷却是为了在几个连续的HTTP请求之间共享TCP连接以加快页面加载速度。

而在浏览器中实现类似于TCP长连接的需求，进行实时双向通讯，是有着诸多实际需要的。这催生了WebSocket的产生。

## WebSocket连接的建立

客户端向Web服务器发起HTTP请求，寻求Upgrade为WebSocket。

```makefile
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

```

如果服务器支持并允许这个WebSocket请求的话，返回一个类似于下面这样的HTTP相应：

```makefile
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

```

(以上示例来源于 [Writing WebSocket Servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers))

接下来，客户端和服务器端开始根据WebSocket协议进行数据传送和接收。

### 握手过程中的“口令”

上面的握手过程中，客户端通过"Sec-WebSocket-Key"发送了一个随机字符串。

服务器端返回的验证字段"Sec-WebSocket-Accept"的计算过程如下：

```tcl
set key    [web::request "Sec-WebSocket-Key"]
set magic  "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
set secret [::base64::encode [sha1::sha1 -bin "$key$magic"]]
web::response -set "Sec-WebSocket-Accept" $secret

```

## 浏览器里的WebSocket

浏览器里的WebSocket主要作为客户端。其接口本身倒并不复杂，主要是建立连接，监听处理4个事件，发送消息，和关闭连接这几个操作。

* `new WebSocket(url)` # 建立连接
* `onopen` # 连接建立时的回调函数
* `onmessage` # 收到消息时的回调函数
* `onclose` # 连接关闭时的回调函数
* `onerror` # 发生错误时的回调函数
* `send(message)` # 发送消息
* `close(code?, reason?)` # 关闭连接

相关文档可以参考 [WebSocket @ Mozilla Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

代码轮廓如下：

```js
var socket = new WebSocket('ws://some.host.com:8080/');

socket.onopen = function (event) {
    socket.send('Hello Server!');
};

socket.onmessage = function (event) {
    console.log('Message from server', event.data);
};

socket.onclose = function (event) {
    console.log('Good Bye Server!', event.data);
};

socket.onerror = function (event) {
    console.log('Oh! Some Error!', event.data);
};

socket.send("Message to server");

socket.close();

```

## 为什么不用HTTP的keep-alive机制

* Web服务器对于`keep-alive`很多时候有timeout限制。
* 每次HTTP请求“冗余”的头部信息也是一种传输负担。
* HTTP请求依赖于客户端的"Pull"。
* 服务器端的主动"Push"无法实现。需要客户端通过轮询（polling）来变通。

## 相关资源

* [rfc6455: The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
* [rfc2616: Hypertext Transfer Protocol -- HTTP/1.1](https://tools.ietf.org/html/rfc2616)
