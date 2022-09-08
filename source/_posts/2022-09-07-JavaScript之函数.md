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

在函数中用 `return` 语句返回另一个函数。

如下所示，返回的函数中可以一直保存捕获到的函数内的局部变量 `a` ，再次调用 `test()()` 的时候在任意地方都可以访问到变量 `a`。

之所以使用 `test()()` ，`test` 函数返回的结果是一个函数，既然是函数，不去调用的话就不会执行里面的代码，所以如果需要执行内部函数的函数体，就必须要这样。

```JavaScript
        function test() {
            var a = 0;
            return function f1() {
                console.log(a);
            }
        }
        test()(); // 输出 0
```

调试控制台：

```JavaScript
test
        ƒ test() {
            var a = 0;
             return function f1() {
                console.log(a);
             }
        }
test()
        ƒ f1() {
                console.log(a);
             }
test()()
        0
        undefined
```

第一个小括号是调用 `test` 函数，这个 `test` 函数中定义了一个局部变量 `a`，还返回了一个内部函数。因此，第一次调用的结果就是返回一个内部函数，而第二个圆括号才会调用那个内部函数。

正常情况下，我们调用一个函数，其里面的局部变量会在函数调用结束后销毁，这也是我们在全局作用域里面无法访问函数局部变量的原因。但是，如果你使用了**闭包**，那么就会让这个局部变量不随着原函数的销毁而销毁，而是继续存在。比如我反复调用这个内部函数，就会发现这个变量 `a` 一直存在，就好像是一个全局作用域里面的变量似的。

闭包函数的这种写法就相当于在全局作用域里面定义了一个变量 `a`， 然后在函数中操作全局变量。但是用这样的形式操作，也就是利用闭包操作可以减少很多不必要的全局变量。全局作用域是一块公共区域，如果为了某个单一的功能而定义一个全局变量，则会导致全局变量过多，代码就变得一团糟了。因此在这种情况下，还是要优先考虑使用闭包。

## 自执行函数

自执行函数的例子：

```JavaScript
        (
            function () {
                console.log('测试自执行函数')
            }
        )();
```

以上会立即执行函数输出语句。

定义一个自执行函数的语法是：`(定义一个没有名字的函数)();`

也可以给一个名字，但是没有必要，因为**自执行函数会立即执行且只会执行一次**。

自执行函数一般配合闭包使用，因为这样一来，就可以直接得到闭包环境下的内部函数了，外部函数只是为了产生闭包环境而临时定义的函数。正因为如此，所以根本没有必要给外部函数取一个名字。

因此，可以将[闭包](#闭包)中的例子改成如下：

```JavaScript
        var innertest = (
            function () {
                var a = 0;
                return function () {
                    console.log(a);
                }
            }
        )();
        innertest();
```

## “new”一个函数

看个🌰：

```JavaScript
        function hello() {
            console.log(this)
        }
        hello(); // Window
        new hello(); // Object

        var newObject = new hello();
        console.log(newObject);
```

`this` 也是 JavaScript 中的一个关键字，它是什么意思呢？其实很简单，**`this` 永远指向当前函数的调用者**。

因此 `hello();` 会打印出 `this` 所指向的 `window` 对象。而 `new hello();` 会打印出 `Object` 对象。

比如上面代码， `new` 一个函数，会返回函数的真实调用者即 `this` 所指向的对象，这个对象哪里来的呢？其实是**函数内部产生了一个新的对象，并且 `this` 指向了这个对象，然后函数默认返回了这个新的对象**。这种函数还有一个别称，叫作**构造函数**。

构造函数的函数名称首字母一般大写。

比如定义一个水果的构造函数：

```JavaScript
        function Fruit(name,smell,color) {
            this.name = name;
            this.smell = smell;
            this.color = color;
        }

        var redApple = new Fruit('苹果','苹果味','红色');
        console.log(redApple);
```

不仅可以有属性，还可以有方法：

```JavaScript
        function Fruit(name, smell, color) {
            this.name = name;
            this.smell = smell;
            this.color = color;

            this.eat = function () {
                console.log('吃'+this.name);
            }
        }

        var redApple = new Fruit('苹果', '苹果味', '红色');
        console.log(redApple);
        redApple.eat();
```

## 回调函数

所谓回调函数，就是指把一个函数的定义当作参数传递给另一个函数。

看个🌰：

```JavaScript
function test(data, callback) {
    callback(data);
}
```

以上代码，定义了一个函数 `test (data, callback)`，函数 `test` 有两个参数，一个 `data`，一个 `callback`，其中 `callback` 是一个函数的定义，可以在 `test` 函数中调用 `callback (data)` 方法，`data` 是参数。

回调函数与匿名函数结合起来就是：

```JavaScript
function test(data, callback) {
    callback(data);
}

test('world',function (data) {
    alert('hello,'+data);
});
```

更多关于回调函数，参考 [JavaScript回调函数 - CNode技术社区](https://cnodejs.org/topic/564dd2881ba2ef107f854e0b)

```JavaScript
        var obj = {
            sum: 0,
            add: function (num1, num2) {
                this.sum = num1 + num2;
                console.log(this, this.sum);
            }
        };

        add(1, 2, obj.add);
        console.log(obj.sum);   //=>0
        console.log(window.sum);  //=>3
```

上述代码调用回调函数的时候是在全局环境下，因此 `this` 指向的是 `window`，所以 `sum` 的值是赋值给 `window` 的。
