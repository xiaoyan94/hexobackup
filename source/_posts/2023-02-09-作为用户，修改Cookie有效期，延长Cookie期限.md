---
title: 作为用户，修改Cookie有效期，延长Cookie期限
date: 2023-02-09 11:21:12
tags: 
    - JavaScript
    - Cookie
---

## 浏览器中手动修改cookie的有效期

网站可以使用Cookie验证身份，从而可以实现关闭游客访问。

作为用户，若网站关闭了游客访问，且Cookie到期以后，就无法继续访问该网站。

可以在浏览器客户端手动设置Cookie的过期时间，从而延长登录有效期。

以Chrome浏览器为例，按`F12`打开开发者工具，找到网站Cookie手动修改过期时间。

![按`F12`打开开发者工具，找到网站Cookie手动修改过期时间。](2023-02-09-作为用户，修改Cookie有效期，延长Cookie期限/2023-02-09-12-19-19.png)

## 相关知识之会话cookie

<!-- more -->

HTTP响应标头 **`Set-Cookie`** 字段被用来由服务器端向用户代理发送 cookie，所以用户代理可在后续的请求中将其发送回服务器。

PS：服务器要发送多个 cookie，则应该在同一响应中发送多个 **`Set-Cookie`** 标头。

[HTTP响应头中设置Cookie的语法:](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie#%E8%AF%AD%E6%B3%95)

```http response header
Set-Cookie: <cookie-name>=<cookie-value>
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<number>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly

Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None; Secure

// Multiple attributes are also possible, for example:
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly
```

**Cookie有效期**相关属性的介绍：

* `Expires=<date>` *可选*

  * : cookie 的最长有效时间，形式为符合 HTTP-date 规范的时间戳。参见 [`Date`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Date) 可以获取详细信息。

    如果没有设置这个属性，那么表示这是一个**会话期 cookie**。一个会话结束于客户端被关闭时，这意味着会话期 cookie 在彼时会被移除。

    **警告：** 然而，很多 Web 浏览器支持会话恢复功能，这个功能可以使浏览器保留所有的 tab 标签，然后在重新打开浏览器的时候将其还原。与此同时，cookie 也会恢复，就跟从来没有关闭浏览器一样。

    如果设置了 `Expires` 属性，其截止时间与*客户端*相关，而非服务器的时间。
* `Max-Age=<number>` *可选*
  * : 在 cookie 失效之前需要经过的秒数。秒数为 0 或 -1 将会使 cookie 直接过期。假如 `Expires` 和 `Max-Age` 属性均存在，那么 `Max-Age` 的优先级更高。
