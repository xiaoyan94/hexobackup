---
title: JavaScript 之函数
date: 2022-09-07 23:20:16
tags: [JavaScript]
---

## 参数传递

JavaScript 在传递参数时，其实是一个数组，其实**所有的参数都会被装载到函数内部一个叫作 `arguments` 的数组里面**。

代码示例：

```html
<html>

<body>
    <script>
        // window.alert('Hello World')
        function add() {
            if (arguments.length > 0) {
                console.log(arguments.length);
                // alert(arguments[0])
                var sum = 0;
                //   arguments.forEach(element => {
                //     sum+=element;
                //   });
                for (let index = 0; index < arguments.length; index++) {
                    const element = arguments[index];
                    // console.log(element);
                    sum += element;
                }
                console.log(sum);
            } else {
                alert("参数为空");
            }
        }
        add();
        // var a = [1, 2];
        add(1, 2, 3, 4, 5);
    </script>
</body>

</html>
```

如上所示，即使在定义函数 `add` 时，没有声明参数，在调用时传入任意参数都是会被装载到 `arguments` 数组的。

只是需要注意的是，只能使用 `for` 循环遍历 `arguments` ，不能在其上使用 `forEach` 遍历（会报错，不存在 `forEach` ）。

## 闭包

<!-- more -->

## 自执行函数

## “new”一个函数
