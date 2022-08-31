---
title: JavaScript获取网页URL地址的查询参数(QueryString)的方法
date: 2022-08-31 21:27:39
tags: [JavaScript]
---

## 需求：获取 URL 查询参数

需求详情

请求URL: `http://example.com:80/method?id=1&name=xy`

获取请求参数id、name的值1、xy。

## 方法一：`URLSearchParams`

使用 `URLSearchParams` 对象的 `get` 方法。参考：

<!-- more -->

[URLSearchParams() - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams/URLSearchParams)

```javascript
var urlParams = new URLSearchParams(window.location.search);
console.log(urlParams.has('id')); // 打印是否包含QueryString：line
var id = urlParams.get('id'); // 1
```

## 方法二：正则表达式

方法如下（`getQueryString`）：

```JavaScript
        <script type="text/javascript">
            // 自定义获取URL查询参数QueryString
            // 函数参数 name：URL查询参数名称
            // 函数返回值：URL查询参数值或null（不存在的话）
            function getQueryString(name) {
                var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
                var r = window.location.search.substr(1).match(reg);
                if (r != null) {
                    return unescape(r[2]);
                }
                return null;
            }

            var line;
            try {
                // 360极速模式/Chromium/火狐内核支持 URLSearchParams
                var urlParams = new URLSearchParams(window.location.search);
                console.log(urlParams.has('line')); // 打印是否包含QueryString：line
                line = urlParams.get('line');
            } catch (e) {
                // IE/兼容模式：尝试使用自定义函数获取查询参数line
                line = getQueryString('line');
            }
            console.log(line);
            if (line == null) {
                console.error("未获取到line参数。");
                alert("页面查询参数错误！");
            }
            if (line == '1') {
                $(".specialDiv").show();
                console.log('show');
            } else {
                $(".specialDiv").hide();
                console.log("hide");
            }
        </script>
```
